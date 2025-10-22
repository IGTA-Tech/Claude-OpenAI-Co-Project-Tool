import { Suspense } from 'react'
import { getProjects } from '@/lib/projects/actions'
import { ChatInterface } from '@/components/chat/chat-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default async function ChatPage() {
  const projects = await getProjects()

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <CardTitle>No Projects Yet</CardTitle>
            </div>
            <CardDescription>
              Create a project first to start chatting with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Projects allow you to organize conversations and add custom instructions
              that will be included in every chat.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatInterface projects={projects} />
      </Suspense>
    </div>
  )
}
