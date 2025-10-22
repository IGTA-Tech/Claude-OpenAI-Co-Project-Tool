'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentUpload } from '@/components/documents/document-upload'
import { DocumentsList } from '@/components/documents/documents-list'
import { getDocuments } from '@/lib/documents/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import type { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Document = Database['public']['Tables']['documents']['Row']

interface DocumentsManagerProps {
  projects: Project[]
}

export function DocumentsManager({ projects }: DocumentsManagerProps) {
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [selectedProject])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const docs = await getDocuments(selectedProject.id)
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = () => {
    loadDocuments()
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Documents are automatically processed using RAG (Retrieval Augmented Generation). They will be chunked and embedded to provide relevant context in AI conversations.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Project</CardTitle>
            <Select
              value={selectedProject.id}
              onValueChange={(value) => {
                const project = projects.find((p) => p.id === value)
                if (project) setSelectedProject(project)
              }}
            >
              <SelectTrigger className="w-64">
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
          </div>
        </CardHeader>
        <CardContent>
          <DocumentUpload
            projectId={selectedProject.id}
            onUploadComplete={handleUploadComplete}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentsList
            documents={documents}
            loading={loading}
            onDelete={loadDocuments}
          />
        </CardContent>
      </Card>
    </div>
  )
}
