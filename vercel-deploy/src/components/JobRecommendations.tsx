'use client'

import { useState, useEffect } from 'react'
import { MapPin, Building, DollarSign, Clock, ExternalLink, Heart, ThumbsUp, ThumbsDown } from 'lucide-react'

interface JobRecommendation {
  id: string
  job_title: string
  company: string
  location?: string | null
  job_type?: string | null
  salary_range?: string | null
  requirements: string[]
  description: string
  match_score: number
  skills_match: string[]
  experience_match: boolean
  created_at: string
}

export default function JobRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (recommendationId: string, feedbackType: string) => {
    try {
      await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          feedback_type: feedbackType,
        }),
      })
    } catch (err) {
      console.error('Failed to send feedback:', err)
    }
  }

  const formatSalary = (salaryRange: string | null) => {
    if (!salaryRange) return null
    return salaryRange
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          No job recommendations yet. Upload your resume to get personalized job matches!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Found {recommendations.length} matching jobs
        </h3>
        <button
          onClick={fetchRecommendations}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {job.job_title}
                </h4>
                <div className="flex items-center text-gray-600 mb-2">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{job.company}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(job.match_score)}`}>
                  {Math.round(job.match_score * 100)}% match
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {job.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
              )}
              
              {job.job_type && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="capitalize">{job.job_type}</span>
                </div>
              )}

              {job.salary_range && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{formatSalary(job.salary_range)}</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">
              {job.description}
            </p>

            {job.skills_match.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Matching Skills:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {job.skills_match.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills_match.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{job.skills_match.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFeedback(job.id, 'like')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Like</span>
                </button>
                
                <button
                  onClick={() => handleFeedback(job.id, 'dislike')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Not Interested</span>
                </button>

                <button
                  onClick={() => handleFeedback(job.id, 'saved')}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleFeedback(job.id, 'applied')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Apply Now
                </button>
                
                <button className="flex items-center text-gray-600 hover:text-gray-700 text-sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}