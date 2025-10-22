'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface ImageGeneratorProps {
  projectId: string
  onImageGenerated?: () => void
}

const SIZES = [
  { value: '1024x1024', label: 'Square (1024x1024)' },
  { value: '1792x1024', label: 'Landscape (1792x1024)' },
  { value: '1024x1792', label: 'Portrait (1024x1792)' },
]

const QUALITIES = [
  { value: 'standard', label: 'Standard', cost: '$0.04-0.08' },
  { value: 'hd', label: 'HD', cost: '$0.08-0.12' },
]

export function ImageGenerator({ projectId, onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const [quality, setQuality] = useState('standard')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          projectId,
          size,
          quality,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()
      toast.success(`Image generated! Cost: $${data.cost.toFixed(4)}`)

      // Clear prompt and refresh gallery
      setPrompt('')
      onImageGenerated?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Image Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="A serene landscape with mountains and a lake at sunset..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={generating}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Describe the image you want to create. Be specific and detailed for best results.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Size</Label>
          <Select value={size} onValueChange={setSize} disabled={generating}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Quality</Label>
          <Select value={quality} onValueChange={setQuality} disabled={generating}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUALITIES.map((q) => (
                <SelectItem key={q.value} value={q.value}>
                  <div className="flex items-center justify-between w-full">
                    <span>{q.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{q.cost}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="w-full"
        size="lg"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Image
          </>
        )}
      </Button>
    </div>
  )
}
