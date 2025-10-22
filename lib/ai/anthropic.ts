import Anthropic from '@anthropic-ai/sdk'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamChunk {
  content: string
  done: boolean
  tokens?: {
    input: number
    output: number
    total: number
  }
  cost?: number
}

const MODEL_PRICING = {
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 }, // per 1K tokens
  'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
}

export function createAnthropicClient(apiKey: string) {
  return new Anthropic({ apiKey })
}

export function countTokens(text: string): number {
  // Claude uses similar tokenization to GPT
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: keyof typeof MODEL_PRICING
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['claude-3-sonnet-20240229']
  const inputCost = (inputTokens / 1000) * pricing.input
  const outputCost = (outputTokens / 1000) * pricing.output
  return inputCost + outputCost
}

export async function* streamChatCompletion(
  client: Anthropic,
  messages: ChatMessage[],
  systemPrompt: string = '',
  model: string = 'claude-3-5-sonnet-20241022',
  temperature: number = 0.7,
  maxTokens: number = 4096
): AsyncGenerator<StreamChunk> {
  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages,
  })

  let fullContent = ''
  let inputTokens = 0
  let outputTokens = 0

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const content = event.delta.type === 'text_delta' ? event.delta.text : ''
      if (content) {
        fullContent += content
        yield {
          content,
          done: false,
        }
      }
    }

    if (event.type === 'message_start') {
      inputTokens = event.message.usage.input_tokens
    }

    if (event.type === 'message_delta') {
      outputTokens = event.usage.output_tokens
    }
  }

  // Final chunk with token info
  const totalTokens = inputTokens + outputTokens
  const cost = calculateCost(
    inputTokens,
    outputTokens,
    model as keyof typeof MODEL_PRICING
  )

  yield {
    content: '',
    done: true,
    tokens: {
      input: inputTokens,
      output: outputTokens,
      total: totalTokens,
    },
    cost,
  }
}
