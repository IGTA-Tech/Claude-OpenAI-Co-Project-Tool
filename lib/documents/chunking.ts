import { countTokens } from '@/lib/ai/openai'

export interface TextChunk {
  content: string
  index: number
  tokenCount: number
}

export function chunkText(
  text: string,
  maxTokens: number = 500,
  overlap: number = 50
): TextChunk[] {
  const chunks: TextChunk[] = []

  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)

  let currentChunk = ''
  let currentTokens = 0
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    const paragraphTokens = countTokens(paragraph)

    // If single paragraph exceeds max tokens, split by sentences
    if (paragraphTokens > maxTokens) {
      // Save current chunk if not empty
      if (currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunkIndex++,
          tokenCount: currentTokens,
        })
        currentChunk = ''
        currentTokens = 0
      }

      // Split large paragraph by sentences
      const sentences = paragraph.split(/[.!?]+/).filter((s) => s.trim().length > 0)

      for (const sentence of sentences) {
        const sentenceTokens = countTokens(sentence)

        if (currentTokens + sentenceTokens > maxTokens) {
          if (currentChunk) {
            chunks.push({
              content: currentChunk.trim(),
              index: chunkIndex++,
              tokenCount: currentTokens,
            })
          }
          currentChunk = sentence
          currentTokens = sentenceTokens
        } else {
          currentChunk += (currentChunk ? '. ' : '') + sentence
          currentTokens += sentenceTokens
        }
      }
    } else {
      // Check if adding this paragraph exceeds limit
      if (currentTokens + paragraphTokens > maxTokens) {
        // Save current chunk
        if (currentChunk) {
          chunks.push({
            content: currentChunk.trim(),
            index: chunkIndex++,
            tokenCount: currentTokens,
          })
        }
        // Start new chunk with overlap
        currentChunk = paragraph
        currentTokens = paragraphTokens
      } else {
        // Add to current chunk
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph
        currentTokens += paragraphTokens
      }
    }
  }

  // Add final chunk
  if (currentChunk) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
      tokenCount: currentTokens,
    })
  }

  return chunks
}
