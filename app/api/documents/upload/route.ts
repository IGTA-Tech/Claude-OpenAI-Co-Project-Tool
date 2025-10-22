import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractText } from '@/lib/documents/text-extraction'
import { chunkText } from '@/lib/documents/chunking'
import { generateEmbeddings } from '@/lib/documents/embeddings'
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'File and projectId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or CSV files.' },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        user_id: user.id,
        name: file.name,
        file_path: fileName,
        file_type: file.type,
        file_size: file.size,
        status: 'processing',
      })
      .select()
      .single()

    if (docError || !document) {
      console.error('Document creation error:', docError)
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Start processing in background (async)
    processDocument(document.id, fileBuffer, file.type, user.id).catch((error) => {
      console.error('Background processing error:', error)
    })

    return NextResponse.json({
      success: true,
      document,
      message: 'Document uploaded successfully. Processing in background...',
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processDocument(
  documentId: string,
  fileBuffer: Buffer,
  fileType: string,
  userId: string
) {
  const supabase = await createClient()

  try {
    // Extract text
    const extractedText = await extractText(fileBuffer, fileType)

    // Update document with extracted text
    await supabase
      .from('documents')
      .update({ extracted_text: extractedText })
      .eq('id', documentId)

    // Chunk the text
    const chunks = chunkText(extractedText, 500, 50)

    // Get OpenAI API key for embeddings
    const apiKeyData = await getApiKeyByProvider('openai')
    if (!apiKeyData) {
      throw new Error('OpenAI API key required for document processing')
    }

    const apiKey = decryptApiKey(apiKeyData.encrypted_key)

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map((c) => c.content)
    const embeddings = await generateEmbeddings(chunkTexts, apiKey)

    // Store chunks with embeddings
    const chunkRecords = chunks.map((chunk, index) => ({
      document_id: documentId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: embeddings[index],
      token_count: chunk.tokenCount,
    }))

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords)

    if (chunksError) {
      throw chunksError
    }

    // Update document status
    await supabase
      .from('documents')
      .update({
        status: 'completed',
        chunk_count: chunks.length,
      })
      .eq('id', documentId)

    console.log(`Document ${documentId} processed successfully. ${chunks.length} chunks created.`)
  } catch (error: any) {
    console.error('Document processing error:', error)

    // Update document status to error
    await supabase
      .from('documents')
      .update({ status: 'error' })
      .eq('id', documentId)

    throw error
  }
}
