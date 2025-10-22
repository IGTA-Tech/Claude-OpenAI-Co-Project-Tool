'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { encryptApiKey, decryptApiKey, validateApiKey } from '@/lib/encryption/crypto'
import type { Database } from '@/types/database'

type ApiKey = Database['public']['Tables']['api_keys']['Row']
type Provider = 'openai' | 'anthropic' | 'runwayml' | 'dalle'

export async function getApiKeys() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, provider, is_valid, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getApiKeyByProvider(provider: Provider) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .eq('is_valid', true)
    .maybeSingle()

  if (error) throw error
  return data as ApiKey | null
}

export async function addApiKey(provider: Provider, apiKey: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Validate API key format
  if (!validateApiKey(provider, apiKey)) {
    throw new Error(`Invalid ${provider} API key format`)
  }

  // Encrypt the key
  const encryptedKey = encryptApiKey(apiKey)

  // Check if key already exists for this provider
  const { data: existing } = await supabase
    .from('api_keys')
    .select('id')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .maybeSingle()

  if (existing) {
    // Update existing key
    const { data, error } = await supabase
      .from('api_keys')
      .update({ encrypted_key: encryptedKey, is_valid: true })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/dashboard/settings/api-keys')
    return data
  } else {
    // Insert new key
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/dashboard/settings/api-keys')
    return data
  }
}

export async function testApiKey(provider: Provider, keyId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get the encrypted key
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('encrypted_key')
    .eq('id', keyId)
    .eq('user_id', user.id)
    .single()

  if (keyError || !keyData) {
    throw new Error('API key not found')
  }

  // Decrypt and test the key
  const apiKey = decryptApiKey(keyData.encrypted_key)

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      if (!response.ok) throw new Error('Invalid OpenAI API key')
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      })
      if (response.status === 401) throw new Error('Invalid Anthropic API key')
    }

    // Update key status
    await supabase
      .from('api_keys')
      .update({ is_valid: true })
      .eq('id', keyId)

    revalidatePath('/dashboard/settings/api-keys')
    return { success: true }
  } catch (error: any) {
    // Mark key as invalid
    await supabase
      .from('api_keys')
      .update({ is_valid: false })
      .eq('id', keyId)

    revalidatePath('/dashboard/settings/api-keys')
    throw error
  }
}

export async function deleteApiKey(keyId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/settings/api-keys')
}
