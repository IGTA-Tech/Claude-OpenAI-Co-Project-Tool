'use client'

import { useState } from 'react'
import { FileText, Trash2, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteDocument } from '@/lib/documents/actions'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Document = Database['public']['Tables']['documents']['Row']

interface DocumentsListProps {
  documents: Document[]
  loading: boolean
  onDelete?: () => void
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  processing: { label: 'Processing', icon: Loader2, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
  error: { label: 'Error', icon: XCircle, color: 'text-red-500' },
}

export function DocumentsList({ documents, loading, onDelete }: DocumentsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return

    setDeleting(id)
    try {
      await deleteDocument(id)
      toast.success('Document deleted successfully')
      onDelete?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No documents uploaded yet</p>
        <p className="text-sm mt-2">Upload your first document to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const statusConfig = STATUS_CONFIG[doc.status]
        const StatusIcon = statusConfig.icon

        return (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(doc.file_size)}</span>
                  {doc.chunk_count > 0 && <span>• {doc.chunk_count} chunks</span>}
                  <span>• {new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StatusIcon
                  className={`h-4 w-4 ${statusConfig.color} ${
                    doc.status === 'processing' ? 'animate-spin' : ''
                  }`}
                />
                <Badge
                  variant={doc.status === 'completed' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {statusConfig.label}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(doc.id, doc.name)}
                disabled={deleting === doc.id}
              >
                {deleting === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
