'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'

interface SystemStatus {
  status: string
  database: string
  storage: string
  timestamp: string
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
        setError(null)
      } else {
        setError(data.error || 'System check failed')
      }
    } catch (err) {
      setError('Unable to check system status')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-blue-400 mr-3 animate-spin" />
          <span className="text-sm text-blue-700">Checking system status...</span>
        </div>
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">⚙️ System Setup Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Database configuration needed for full functionality
            </p>
            <div className="mt-3 space-y-2">
              <div className="text-xs text-yellow-600">
                <strong>Quick Setup:</strong>
              </div>
              <ol className="text-xs text-yellow-600 space-y-1 ml-4">
                <li>1. Go to your Supabase dashboard</li>
                <li>2. Open SQL Editor</li>
                <li>3. Apply the schema from database/schema.sql</li>
                <li>4. Create a storage bucket named "resumes"</li>
              </ol>
              <div className="flex space-x-3 mt-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Supabase Dashboard
                </a>
                <button
                  onClick={checkSystemStatus}
                  className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                >
                  Recheck Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isFullyReady = status.database === 'OK' && status.storage === 'OK'

  return (
    <div className={`border rounded-lg p-4 ${
      isFullyReady 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start">
        {isFullyReady ? (
          <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${
            isFullyReady ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {isFullyReady ? '✅ System Ready' : '⚙️ Setup Required'}
          </h3>
          <div className="mt-2 space-y-1">
            <div className={`text-xs ${
              status.database === 'OK' ? 'text-green-600' : 'text-red-600'
            }`}>
              Database: {status.database}
            </div>
            <div className={`text-xs ${
              status.storage === 'OK' ? 'text-green-600' : 'text-red-600'
            }`}>
              Storage: {status.storage}
            </div>
          </div>
          {!isFullyReady && (
            <div className="mt-3">
              <a
                href="/DATABASE_SETUP_REQUIRED.md"
                target="_blank"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                📋 View Setup Instructions
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}