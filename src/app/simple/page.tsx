'use client'

import { useState } from 'react'
import { ResumeCoach } from '@/components/ResumeCoach'

export default function SimplePage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 1: Analyze resume
      const formData = new FormData()
      formData.append('file', file)

      const analyzeResponse = await fetch('/api/simple-analyze', {
        method: 'POST',
        body: formData
      })

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze resume')
      }

      const analyzeData = await analyzeResponse.json()
      setAnalysis(analyzeData.analysis)

      // Step 2: Search jobs
      const jobsResponse = await fetch('/api/simple-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: analyzeData.analysis.skills || [],
          experience: analyzeData.analysis.experience || [],
          location: 'United States'
        })
      })

      if (!jobsResponse.ok) {
        throw new Error('Failed to search jobs')
      }

      const jobsData = await jobsResponse.json()
      setJobs(jobsData.jobs || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Resume Analyzer
          </h1>
          <p className="mt-2 text-gray-400">Upload your resume and get AI-powered job recommendations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upload Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4">Upload Resume</h2>
          
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />

            <button
              onClick={handleUploadAndAnalyze}
              disabled={!file || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume & Find Jobs'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Resume Analysis */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
              <h2 className="text-2xl font-semibold text-gray-100 mb-6">Resume Analysis</h2>
              
              {/* Skills */}
              {analysis.skills && analysis.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-200 mb-3">Skills Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-900/50 border border-blue-700 text-blue-200 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {analysis.experience && analysis.experience.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-200 mb-3">Experience</h3>
                  {analysis.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-4 p-4 bg-gray-900/50 rounded-lg">
                      <p className="font-medium text-gray-100">{exp.title || exp.role}</p>
                      <p className="text-gray-400">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job Matches */}
            {jobs.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
                <h2 className="text-2xl font-semibold text-gray-100 mb-6">
                  Job Matches ({jobs.length})
                </h2>
                
                <div className="space-y-4">
                  {jobs.map((job: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-6 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-blue-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-100">{job.title}</h3>
                          <p className="text-gray-400">{job.company}</p>
                          <p className="text-sm text-gray-500">{job.location}</p>
                        </div>
                        {job.match_score && (
                          <span className="px-3 py-1 bg-green-900/50 border border-green-700 text-green-200 rounded-full text-sm">
                            {Math.round(job.match_score * 100)}% Match
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                          {job.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center">
                        {job.salary && (
                          <span className="text-sm text-gray-400">{job.salary}</span>
                        )}
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Apply Now →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resume Coach Chatbot */}
      {analysis && <ResumeCoach resumeData={analysis} />}
    </div>
  )
}

