'use client'

import { MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { deleteConversation } from '@/lib/conversations/actions'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conversation: Conversation) => void
  onDelete: (id: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return

    try {
      await deleteConversation(id)
      onDelete(id)
      toast.success('Conversation deleted')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
        <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
        <p>No conversations yet</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              selectedId === conversation.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            }`}
            onClick={() => onSelect(conversation)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{conversation.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDelete(e, conversation.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
