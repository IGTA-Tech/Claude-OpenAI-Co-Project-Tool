import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage, calculateImageCost } from '@/lib/images/dalle'
import { getApiKeyByProvider } from '@/lib/api-keys/actions'
import { decryptApiKey } from '@/lib/encryption/crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, projectId, size = '1024x1024', quality = 'standard', conversationId } = body

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: 'Prompt and projectId are required' },
        { status: 400 }
      )
    }

    // Get OpenAI API key
    const apiKeyData = await getApiKeyByProvider('openai')
    if (!apiKeyData) {
      return NextResponse.json(
        { error: 'OpenAI API key required. Please add one in Settings.' },
        { status: 400 }
      )
    }

    const apiKey = decryptApiKey(apiKeyData.encrypted_key)

    // Generate image
    const images = await generateImage(apiKey, {
      prompt,
      size: size as any,
      quality: quality as any,
      n: 1,
    })

    if (images.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    const generatedImage = images[0]

    // Calculate cost
    const cost = calculateImageCost(quality, size)

    // Save to database
    const { data: savedImage, error } = await supabase
      .from('generated_images')
      .insert({
        project_id: projectId,
        user_id: user.id,
        conversation_id: conversationId || null,
        prompt: generatedImage.revisedPrompt || prompt,
        image_url: generatedImage.url,
        model: 'dall-e-3',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save image:', error)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      project_id: projectId,
      action_type: 'image_generation',
      provider: 'openai',
      cost,
    })

    return NextResponse.json({
      success: true,
      image: savedImage,
      cost,
    })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
