'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Document = Database['public']['Tables']['documents']['Row']

export async function getDocuments(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Document[]
}

export async function getDocumentById(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data as Document
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get document to delete file from storage
  const { data: document } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (document) {
    // Delete file from storage
    await supabase.storage.from('documents').remove([document.file_path])
  }

  // Delete document record (will cascade to chunks)
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/documents')
}

export async function updateDocumentStatus(
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'error'
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('documents')
    .update({ status })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/documents')
}
