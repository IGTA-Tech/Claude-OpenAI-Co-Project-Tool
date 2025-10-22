import OpenAI from 'openai'
import { encoding_for_model } from 'tiktoken'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamChunk {
  content: string
  done: boolean
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  cost?: number
}

const MODEL_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
}

export function createOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey })
}

export function countTokens(text: string, model: string = 'gpt-4'): number {
  try {
    const encoding = encoding_for_model(model as any)
    const tokens = encoding.encode(text)
    encoding.free()
    return tokens.length
  } catch (error) {
    // Fallback: rough estimate (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4)
  }
}

export function calculateCost(
  promptTokens: number,
  completionTokens: number,
  model: keyof typeof MODEL_PRICING
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4']
  const promptCost = (promptTokens / 1000) * pricing.input
  const completionCost = (completionTokens / 1000) * pricing.output
  return promptCost + completionCost
}

export async function* streamChatCompletion(
  client: OpenAI,
  messages: ChatMessage[],
  model: string = 'gpt-4',
  temperature: number = 0.7
): AsyncGenerator<StreamChunk> {
  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
  })

  let fullContent = ''
  let promptTokens = 0
  let completionTokens = 0

  // Calculate prompt tokens
  const promptText = messages.map((m) => m.content).join('\n')
  promptTokens = countTokens(promptText, model)

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || ''
    if (content) {
      fullContent += content
      completionTokens = countTokens(fullContent, model)

      yield {
        content,
        done: false,
      }
    }
  }

  // Final chunk with token info
  const totalTokens = promptTokens + completionTokens
  const cost = calculateCost(
    promptTokens,
    completionTokens,
    model as keyof typeof MODEL_PRICING
  )

  yield {
    content: '',
    done: true,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: totalTokens,
    },
    cost,
  }
}
