import { Suspense } from 'react'
import { getProjects } from '@/lib/projects/actions'
import { DocumentsManager } from '@/components/documents/documents-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default async function DocumentsPage() {
  const projects = await getProjects()

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle>No Projects Yet</CardTitle>
            </div>
            <CardDescription>
              Create a project first to upload documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documents are organized within projects and can be used to provide context to AI conversations through RAG (Retrieval Augmented Generation).
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Upload documents to enhance AI conversations with RAG
        </p>
      </div>

      <Suspense fallback={<div>Loading documents...</div>}>
        <DocumentsManager projects={projects} />
      </Suspense>
    </div>
  )
}
