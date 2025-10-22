'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings } from 'lucide-react'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { ConversationList } from '@/components/chat/conversation-list'
import { createConversation, getConversations } from '@/lib/conversations/actions'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']

interface ChatInterfaceProps {
  projects: Project[]
}

const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
  },
  anthropic: {
    name: 'Claude',
    models: [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
  },
}

export function ChatInterface({ projects }: ChatInterfaceProps) {
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const [model, setModel] = useState<string>('gpt-4')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [selectedProject])

  const loadConversations = async () => {
    try {
      const data = await getConversations(selectedProject.id)
      setConversations(data)
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleNewConversation = async () => {
    setLoading(true)
    try {
      const conversation = await createConversation(selectedProject.id)
      setConversations([conversation, ...conversations])
      setSelectedConversation(conversation)
      toast.success('New conversation created')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (value: 'openai' | 'anthropic') => {
    setProvider(value)
    setModel(AI_PROVIDERS[value].models[0])
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Sidebar with conversations */}
      <Card className="w-64 flex flex-col">
        <div className="p-4 border-b space-y-3">
          <Select
            value={selectedProject.id}
            onValueChange={(value) => {
              const project = projects.find((p) => p.id === value)
              if (project) {
                setSelectedProject(project)
                setSelectedConversation(null)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleNewConversation}
            disabled={loading}
            className="w-full"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={setSelectedConversation}
          onDelete={async (id) => {
            setConversations(conversations.filter((c) => c.id !== id))
            if (selectedConversation?.id === id) {
              setSelectedConversation(null)
            }
          }}
        />
      </Card>

      {/* Main chat area */}
      <Card className="flex-1 flex flex-col">
        {/* Header with AI provider/model selection */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Claude</SelectItem>
              </SelectContent>
            </Select>

            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS[provider].models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProject.custom_instructions && (
              <Badge variant="secondary">Custom Instructions</Badge>
            )}
          </div>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          {selectedConversation ? (
            <>
              <ChatMessages conversationId={selectedConversation.id} />
              <ChatInput
                conversationId={selectedConversation.id}
                projectId={selectedProject.id}
                provider={provider}
                model={model}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select or create a conversation to start chatting</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
