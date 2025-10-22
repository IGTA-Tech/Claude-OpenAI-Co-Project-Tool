import { Suspense } from 'react'
import { getProjects } from '@/lib/projects/actions'
import { ImagesManager } from '@/components/images/images-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Image as ImageIcon } from 'lucide-react'

export default async function ImagesPage() {
  const projects = await getProjects()

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>No Projects Yet</CardTitle>
            </div>
            <CardDescription>
              Create a project first to generate images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use DALL-E 3 to generate high-quality images from text descriptions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Image Generation</h1>
        <p className="text-muted-foreground">
          Create stunning images with DALL-E 3
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ImagesManager projects={projects} />
      </Suspense>
    </div>
  )
}
