import OpenAI from 'openai'

export interface ImageGenerationOptions {
  prompt: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  n?: number
}

export interface GeneratedImage {
  url: string
  revisedPrompt?: string
}

export async function generateImage(
  apiKey: string,
  options: ImageGenerationOptions
): Promise<GeneratedImage[]> {
  const client = new OpenAI({ apiKey })

  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: options.prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      n: options.n || 1,
    })

    return response.data.map((img) => ({
      url: img.url || '',
      revisedPrompt: img.revised_prompt,
    }))
  } catch (error: any) {
    console.error('DALL-E generation error:', error)
    throw new Error(error.message || 'Failed to generate image')
  }
}

export function calculateImageCost(quality: 'standard' | 'hd', size: string): number {
  if (quality === 'hd') {
    if (size === '1024x1024') return 0.08
    return 0.12 // 1792x1024 or 1024x1792
  } else {
    if (size === '1024x1024') return 0.04
    return 0.08 // 1792x1024 or 1024x1792
  }
}
