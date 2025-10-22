'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface DocumentUploadProps {
  projectId: string
  onUploadComplete?: () => void
}

export function DocumentUpload({ projectId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload PDF, DOCX, TXT, or CSV files.')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.')
      return
    }

    setUploading(true)
    setStatus('uploading')
    setProgress(30)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(60)
      setStatus('processing')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()

      setProgress(100)
      setStatus('success')
      toast.success(data.message || 'Document uploaded successfully!')

      // Reset after 2 seconds
      setTimeout(() => {
        setStatus('idle')
        setProgress(0)
        onUploadComplete?.()
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      toast.error(error.message || 'Failed to upload document')
      setTimeout(() => {
        setStatus('idle')
        setProgress(0)
      }, 3000)
    } finally {
      setUploading(false)
    }
  }, [projectId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {status === 'idle' && (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-sm text-primary font-medium">Drop the file here...</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drag & drop a document here, or click to select</p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOCX, TXT, CSV (Max 10MB)
                  </p>
                </>
              )}
            </>
          )}

          {(status === 'uploading' || status === 'processing') && (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm font-medium">
                {status === 'uploading' ? 'Uploading...' : 'Processing document...'}
              </p>
              <Progress value={progress} className="w-full max-w-xs" />
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-green-600">Document uploaded successfully!</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-600">Upload failed. Please try again.</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <File className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">How it works:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Your document is uploaded securely to Supabase Storage</li>
            <li>Text is extracted and chunked into 500-token segments</li>
            <li>Each chunk is embedded using OpenAI's embedding model</li>
            <li>Relevant chunks are automatically injected into AI conversations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
