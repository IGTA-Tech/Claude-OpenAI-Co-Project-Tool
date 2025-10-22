import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'

export async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const client = new OpenAI({ apiKey })

  try {
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', error)
    throw new Error('Failed to generate embedding')
  }
}

export async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const client = new OpenAI({ apiKey })

  try {
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    })

    return response.data.map((item) => item.embedding)
  } catch (error) {
    console.error('Batch embedding generation error:', error)
    throw new Error('Failed to generate embeddings')
  }
}

export async function searchSimilarChunks(
  queryEmbedding: number[],
  documentId?: string,
  limit: number = 5,
  threshold: number = 0.7
) {
  // This will be called from server actions
  // Implementation uses Supabase RPC function
  return null
}
