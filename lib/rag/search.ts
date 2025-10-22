'use server'

import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/documents/embeddings'
import { getApiKeyByProvider } from '@/lib/api-keys/actions'
import { decryptApiKey } from '@/lib/encryption/crypto'

export interface SearchResult {
  id: string
  document_id: string
  document_name: string
  content: string
  similarity: number
}

export async function searchDocuments(
  query: string,
  projectId: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get OpenAI API key for query embedding
    const apiKeyData = await getApiKeyByProvider('openai')
    if (!apiKeyData) {
      throw new Error('OpenAI API key required for semantic search')
    }

    const apiKey = decryptApiKey(apiKeyData.encrypted_key)

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query, apiKey)

    // Get all documents in the project
    const { data: projectDocs } = await supabase
      .from('documents')
      .select('id, name')
      .eq('project_id', projectId)
      .eq('status', 'completed')

    if (!projectDocs || projectDocs.length === 0) {
      return []
    }

    const documentIds = projectDocs.map((d) => d.id)

    // Use Supabase RPC function for vector similarity search
    const { data: chunks, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error('Vector search error:', error)
      throw error
    }

    // Filter chunks by project documents and add document names
    const results: SearchResult[] = (chunks || [])
      .filter((chunk: any) => documentIds.includes(chunk.document_id))
      .map((chunk: any) => {
        const doc = projectDocs.find((d) => d.id === chunk.document_id)
        return {
          id: chunk.id,
          document_id: chunk.document_id,
          document_name: doc?.name || 'Unknown Document',
          content: chunk.content,
          similarity: chunk.similarity,
        }
      })

    return results
  } catch (error) {
    console.error('Search documents error:', error)
    throw error
  }
}

export async function getRelevantContext(
  query: string,
  projectId: string,
  maxChunks: number = 3
): Promise<string> {
  const results = await searchDocuments(query, projectId, maxChunks, 0.7)

  if (results.length === 0) {
    return ''
  }

  // Format context for AI
  const context = results
    .map((result, index) => {
      return `[Document ${index + 1}: ${result.document_name}]\n${result.content}`
    })
    .join('\n\n---\n\n')

  return `Based on the following documents:\n\n${context}\n\n---\n\n`
}
