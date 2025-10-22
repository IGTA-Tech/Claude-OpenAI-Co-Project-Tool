'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { deleteApiKey, testApiKey } from '@/lib/api-keys/actions'

interface ApiKey {
  id: string
  provider: string
  is_valid: boolean
  created_at: string
  updated_at: string
}

interface ApiKeysListProps {
  initialKeys: ApiKey[]
}

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  runwayml: 'RunwayML',
  dalle: 'DALL-E',
}

export function ApiKeysList({ initialKeys }: ApiKeysListProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [testing, setTesting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleTest = async (keyId: string, provider: string) => {
    setTesting(keyId)
    try {
      await testApiKey(provider as any, keyId)
      toast.success('API key is valid!')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'API key is invalid')
    } finally {
      setTesting(null)
    }
  }

  const handleDelete = async (keyId: string, provider: string) => {
    if (!confirm(`Delete ${PROVIDER_LABELS[provider]} API key?`)) return

    setDeleting(keyId)
    try {
      await deleteApiKey(keyId)
      setKeys(keys.filter((k) => k.id !== keyId))
      toast.success('API key deleted')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete API key')
    } finally {
      setDeleting(null)
    }
  }

  if (keys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No API keys configured yet</p>
        <p className="text-sm mt-2">Click "Add API Key" to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => (
        <div
          key={key.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{PROVIDER_LABELS[key.provider] || key.provider}</p>
                {key.is_valid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Added {new Date(key.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={key.is_valid ? 'default' : 'destructive'}>
              {key.is_valid ? 'Valid' : 'Invalid'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTest(key.id, key.provider)}
              disabled={testing === key.id}
            >
              {testing === key.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Test'
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(key.id, key.provider)}
              disabled={deleting === key.id}
            >
              {deleting === key.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
