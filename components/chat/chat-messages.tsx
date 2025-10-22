'use client'

import { useEffect, useState, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bot, User } from 'lucide-react'
import { getMessages } from '@/lib/conversations/actions'
import { Skeleton } from '@/components/ui/skeleton'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

interface ChatMessagesProps {
  conversationId: string
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  // Function to be called from parent to add streaming message
  const addStreamingMessage = (content: string) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.id) {
        // Update streaming message
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + content },
        ]
      } else {
        // Create new streaming message
        return [
          ...prev,
          {
            id: '',
            conversation_id: conversationId,
            role: 'assistant',
            content,
            provider: null,
            model: null,
            tokens_used: null,
            cost: null,
            rag_chunks: null,
            created_at: new Date().toISOString(),
          } as Message,
        ]
      }
    })
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Start a conversation by sending a message</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`flex flex-col gap-2 max-w-[80%] ${
                message.role === 'user' ? 'items-end' : ''
              }`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'assistant' && (message.tokens_used || message.model) && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {message.model && <Badge variant="outline">{message.model}</Badge>}
                  {message.tokens_used && (
                    <Badge variant="outline">{message.tokens_used} tokens</Badge>
                  )}
                  {message.cost && (
                    <Badge variant="outline">${message.cost.toFixed(4)}</Badge>
                  )}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-muted">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
