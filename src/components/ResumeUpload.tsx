'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface ParsedData {
  contact_info: {
    name?: string | null
    email?: string | null
    phone?: string | null
    location?: string | null
  }
  skills: string[]
  experience: Array<{
    company: string
    position: string
    start_date?: string | null
    end_date?: string | null
  }>
  education: Array<{
    institution: string
    degree: string
    field_of_study?: string | null
  }>
  summary?: string | null
}

interface ResumeData {
  id: string
  fileName: string
  parsedData: ParsedData
  uploadDate: string
}

export default function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<ResumeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setUploadResult(null)

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadResult(data.resume)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      handleUpload(file)
    } else {
      setError('Please upload a PDF or DOCX file')
    }
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div>
          <label htmlFor="resume-upload" className="cursor-pointer">
            <span className="text-lg font-medium text-gray-900">
              Drop your resume here, or{' '}
              <span className="text-blue-600 underline">browse</span>
            </span>
            <input
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={onFileSelect}
              disabled={isUploading}
            />
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Supports PDF and DOCX files up to 10MB
        </p>
      </div>

      {isUploading && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-600 font-medium">
              Processing your resume...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes('table') || error.includes('database') || error.includes('profile') ? (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 font-medium">🔧 Database Setup Required</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    The database schema needs to be applied to your Supabase project.
                  </p>
                  <div className="mt-2">
                    <a 
                      href="/DATABASE_SETUP_REQUIRED.md"
                      target="_blank"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      📋 View Setup Instructions
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {uploadResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Resume uploaded successfully!
              </h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-700">
                    {uploadResult.fileName}
                  </span>
                </div>
                
                {uploadResult.parsedData.contact_info.name && (
                  <div className="text-sm text-green-700">
                    <strong>Name:</strong> {uploadResult.parsedData.contact_info.name}
                  </div>
                )}
                
                {uploadResult.parsedData.skills.length > 0 && (
                  <div className="text-sm text-green-700">
                    <strong>Skills detected:</strong>{' '}
                    {uploadResult.parsedData.skills.slice(0, 5).join(', ')}
                    {uploadResult.parsedData.skills.length > 5 && ` and ${uploadResult.parsedData.skills.length - 5} more`}
                  </div>
                )}

                {uploadResult.parsedData.experience.length > 0 && (
                  <div className="text-sm text-green-700">
                    <strong>Experience:</strong> {uploadResult.parsedData.experience.length} positions found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}