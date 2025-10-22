import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, FolderKanban, FileText, Image as ImageIcon } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: 'Projects',
      value: '0',
      description: 'Active projects',
      icon: FolderKanban,
    },
    {
      title: 'Conversations',
      value: '0',
      description: 'Total conversations',
      icon: MessageSquare,
    },
    {
      title: 'Documents',
      value: '0',
      description: 'Uploaded documents',
      icon: FileText,
    },
    {
      title: 'Images',
      value: '0',
      description: 'Generated images',
      icon: ImageIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI Platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with your first project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Create a new project
            </p>
            <p className="text-sm text-muted-foreground">
              2. Upload documents for context
            </p>
            <p className="text-sm text-muted-foreground">
              3. Start chatting with AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Setup</CardTitle>
            <CardDescription>
              Configure your AI providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Add your API keys in Settings to enable:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>OpenAI (GPT-4, DALL-E)</li>
              <li>Anthropic (Claude)</li>
              <li>RunwayML (Video)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              What you can do with this platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>RAG-powered chat</li>
              <li>Multi-provider AI</li>
              <li>Decision comparison</li>
              <li>Image generation</li>
              <li>n8n automation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
