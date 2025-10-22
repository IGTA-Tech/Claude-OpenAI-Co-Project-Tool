'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, Trash2, Loader2, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { deleteGeneratedImage } from '@/lib/images/actions'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type GeneratedImage = Database['public']['Tables']['generated_images']['Row']

interface ImageGalleryProps {
  images: GeneratedImage[]
  loading: boolean
  onDelete?: () => void
}

export function ImageGallery({ images, loading, onDelete }: ImageGalleryProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return

    setDeleting(id)
    try {
      await deleteGeneratedImage(id)
      toast.success('Image deleted')
      onDelete?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dalle-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No images generated yet</p>
        <p className="text-sm mt-2">Create your first image using the generator above</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
          >
            <Image
              src={image.image_url}
              alt={image.prompt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
              <div className="text-white text-sm line-clamp-3">{image.prompt}</div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setSelectedImage(image)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleDownload(image.image_url, image.prompt)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(image.id)}
                  disabled={deleting === image.id}
                >
                  {deleting === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Prompt:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedImage.prompt}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleDownload(selectedImage.image_url, selectedImage.prompt)
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
