import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenAIClient, streamChatCompletion as streamOpenAI } from '@/lib/ai/openai'
import { createAnthropicClient, streamChatCompletion as streamAnthropic } from '@/lib/ai/anthropic'
import { getRelevantContext } from '@/lib/rag/search'

export const runtime = 'edge'

interface ChatRequest {
  conversationId: string
  projectId: string
  message: string
  provider: 'openai' | 'anthropic'
  model: string
  temperature?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body: ChatRequest = await request.json()
    const { conversationId, projectId, message, provider, model, temperature = 0.7 } = body

    // Get project details for custom instructions
    const { data: project } = await supabase
      .from('projects')
      .select('custom_instructions')
      .eq('id', projectId)
      .single()

    // Get conversation history
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    // Get API key for the provider
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .eq('is_valid', true)
      .maybeSingle()

    if (!apiKeyData) {
      return new Response(
        JSON.stringify({ error: `No ${provider} API key found. Please add one in Settings.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build message history
    const conversationMessages = messages || []
    let systemPrompt = project?.custom_instructions || ''

    // Get relevant context from documents (RAG)
    let ragContext = ''
    let relevantChunks: any[] = []
    try {
      ragContext = await getRelevantContext(message, projectId, 3)
      if (ragContext) {
        systemPrompt = systemPrompt
          ? `${systemPrompt}\n\n${ragContext}`
          : ragContext
      }
    } catch (error) {
      console.error('RAG context fetch failed:', error)
      // Continue without RAG if it fails
    }

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Save user message
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message,
          })

          let fullResponse = ''
          let tokenUsage: any = null
          let cost: number = 0

          if (provider === 'openai') {
            const client = createOpenAIClient(apiKeyData.encrypted_key)
            const chatMessages = [
              ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
              ...conversationMessages.map((m: any) => ({
                role: m.role as 'system' | 'user' | 'assistant',
                content: m.content,
              })),
              { role: 'user' as const, content: message },
            ]

            for await (const chunk of streamOpenAI(client, chatMessages, model, temperature)) {
              if (chunk.done) {
                tokenUsage = chunk.tokens
                cost = chunk.cost || 0
              } else {
                fullResponse += chunk.content
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
                )
              }
            }
          } else if (provider === 'anthropic') {
            const client = createAnthropicClient(apiKeyData.encrypted_key)
            const chatMessages = [
              ...conversationMessages
                .filter((m: any) => m.role !== 'system')
                .map((m: any) => ({
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                })),
              { role: 'user' as const, content: message },
            ]

            for await (const chunk of streamAnthropic(
              client,
              chatMessages,
              systemPrompt,
              model,
              temperature
            )) {
              if (chunk.done) {
                tokenUsage = chunk.tokens
                cost = chunk.cost || 0
              } else {
                fullResponse += chunk.content
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
                )
              }
            }
          }

          // Save assistant message
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
            provider,
            model,
            tokens_used: tokenUsage?.total || 0,
            cost,
          })

          // Log usage
          await supabase.from('usage_logs').insert({
            user_id: user.id,
            project_id: projectId,
            action_type: 'chat_completion',
            provider,
            tokens_used: tokenUsage?.total || 0,
            cost,
          })

          // Send final event with metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                tokens: tokenUsage,
                cost,
              })}\n\n`
            )
          )

          controller.close()
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message || 'An error occurred' })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
