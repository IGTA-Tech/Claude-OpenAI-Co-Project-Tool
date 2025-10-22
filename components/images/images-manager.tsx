'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageGenerator } from '@/components/images/image-generator'
import { ImageGallery } from '@/components/images/image-gallery'
import { getGeneratedImages } from '@/lib/images/actions'
import type { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type GeneratedImage = Database['public']['Tables']['generated_images']['Row']

interface ImagesManagerProps {
  projects: Project[]
}

export function ImagesManager({ projects }: ImagesManagerProps) {
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0])
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadImages()
  }, [selectedProject])

  const loadImages = async () => {
    setLoading(true)
    try {
      const data = await getGeneratedImages(selectedProject.id)
      setImages(data)
    } catch (error) {
      console.error('Failed to load images:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
          <ImageGenerator
            projectId={selectedProject.id}
            onImageGenerated={loadImages}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageGallery
            images={images}
            loading={loading}
            onDelete={loadImages}
          />
        </CardContent>
      </Card>
    </div>
  )
}
