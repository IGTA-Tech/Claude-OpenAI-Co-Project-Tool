import { Suspense } from 'react'
import { getApiKeys } from '@/lib/api-keys/actions'
import { ApiKeysList } from '@/components/settings/api-keys-list'
import { AddApiKeyDialog } from '@/components/settings/add-api-key-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Key, AlertCircle } from 'lucide-react'

export default async function ApiKeysPage() {
  const apiKeys = await getApiKeys()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your AI provider API keys
          </p>
        </div>
        <AddApiKeyDialog />
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your API keys are encrypted and stored securely. They are only used to make requests to AI providers on your behalf.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>OpenAI</CardTitle>
            </div>
            <CardDescription>
              Required for GPT-4, GPT-3.5, and DALL-E image generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              Format: sk-...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Anthropic Claude</CardTitle>
            </div>
            <CardDescription>
              Required for Claude 3 Opus, Sonnet, and Haiku models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Anthropic Console
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              Format: sk-ant-...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>RunwayML (Optional)</CardTitle>
            </div>
            <CardDescription>
              For video generation capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Get your API key from{' '}
              <a
                href="https://runwayml.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                RunwayML
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage and test your configured API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <ApiKeysList initialKeys={apiKeys} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
