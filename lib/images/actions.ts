'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type GeneratedImage = Database['public']['Tables']['generated_images']['Row']

export async function getGeneratedImages(projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as GeneratedImage[]
}

export async function deleteGeneratedImage(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get image to delete from storage
  const { data: image } = await supabase
    .from('generated_images')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (image) {
    // Extract filename from URL and delete from storage
    // Note: DALL-E returns temporary URLs, so storage deletion may not be needed
  }

  // Delete record
  const { error } = await supabase
    .from('generated_images')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/images')
}
