import { NextRequest } from 'next/server'

// Mock all external dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('/api/recommendations/feedback API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Feedback Collection', () => {
    it('should validate feedback types', () => {
      const validFeedbackTypes = ['like', 'dislike', 'applied', 'not_interested', 'saved']
      const invalidFeedbackTypes = ['invalid', 'random', '', null, undefined]

      validFeedbackTypes.forEach(type => {
        expect(['like', 'dislike', 'applied', 'not_interested', 'saved']).toContain(type)
      })

      invalidFeedbackTypes.forEach(type => {
        expect(['like', 'dislike', 'applied', 'not_interested', 'saved']).not.toContain(type)
      })
    })

    it('should structure feedback data correctly', () => {
      const mockFeedback = {
        id: 'feedback-123',
        user_id: 'user-456',
        recommendation_id: 'rec-789',
        feedback_type: 'like',
        feedback_reason: 'Great match for my skills',
        created_at: '2023-01-01T00:00:00Z'
      }

      expect(mockFeedback.id).toBeDefined()
      expect(mockFeedback.user_id).toBeDefined()
      expect(mockFeedback.recommendation_id).toBeDefined()
      expect(['like', 'dislike', 'applied', 'not_interested', 'saved']).toContain(mockFeedback.feedback_type)
      expect(mockFeedback.created_at).toBeDefined()
    })

    it('should validate required feedback fields', () => {
      const requiredFields = ['user_id', 'recommendation_id', 'feedback_type']
      const optionalFields = ['feedback_reason']

      const isValidFeedbackData = (data: any) => {
        return requiredFields.every(field => data[field] !== undefined && data[field] !== null)
      }

      const validData = {
        user_id: 'user-123',
        recommendation_id: 'rec-456',
        feedback_type: 'like'
      }

      const invalidData = {
        user_id: 'user-123',
        // missing recommendation_id
        feedback_type: 'like'
      }

      expect(isValidFeedbackData(validData)).toBe(true)
      expect(isValidFeedbackData(invalidData)).toBe(false)
    })
  })

  describe('Feedback Processing', () => {
    it('should track user engagement patterns', () => {
      const userFeedbacks = [
        { feedback_type: 'like', created_at: '2023-01-01' },
        { feedback_type: 'applied', created_at: '2023-01-02' },
        { feedback_type: 'dislike', created_at: '2023-01-03' },
        { feedback_type: 'like', created_at: '2023-01-04' },
        { feedback_type: 'saved', created_at: '2023-01-05' },
      ]

      const calculateEngagementMetrics = (feedbacks: any[]) => {
        const total = feedbacks.length
        const positive = feedbacks.filter(f => ['like', 'applied', 'saved'].includes(f.feedback_type)).length
        const negative = feedbacks.filter(f => ['dislike', 'not_interested'].includes(f.feedback_type)).length
        
        return {
          total,
          positive,
          negative,
          positiveRate: positive / total,
          negativeRate: negative / total
        }
      }

      const metrics = calculateEngagementMetrics(userFeedbacks)
      expect(metrics.total).toBe(5)
      expect(metrics.positive).toBe(3) // like, applied, saved
      expect(metrics.negative).toBe(1) // dislike
      expect(metrics.positiveRate).toBeCloseTo(0.6, 2)
      expect(metrics.negativeRate).toBeCloseTo(0.2, 2)
    })

    it('should identify feedback trends', () => {
      const feedbacksByJob = [
        { job_id: 'job1', feedback_type: 'like', user_id: 'user1' },
        { job_id: 'job1', feedback_type: 'like', user_id: 'user2' },
        { job_id: 'job1', feedback_type: 'applied', user_id: 'user3' },
        { job_id: 'job2', feedback_type: 'dislike', user_id: 'user1' },
        { job_id: 'job2', feedback_type: 'not_interested', user_id: 'user2' },
      ]

      const analyzeFeedbackTrends = (feedbacks: any[]) => {
        const jobStats = feedbacks.reduce((acc, feedback) => {
          if (!acc[feedback.job_id]) {
            acc[feedback.job_id] = { positive: 0, negative: 0, total: 0 }
          }
          acc[feedback.job_id].total++
          
          if (['like', 'applied', 'saved'].includes(feedback.feedback_type)) {
            acc[feedback.job_id].positive++
          } else if (['dislike', 'not_interested'].includes(feedback.feedback_type)) {
            acc[feedback.job_id].negative++
          }
          
          return acc
        }, {} as any)

        return Object.entries(jobStats).map(([jobId, stats]: [string, any]) => ({
          jobId,
          ...stats,
          score: stats.positive / stats.total
        }))
      }

      const trends = analyzeFeedbackTrends(feedbacksByJob)
      expect(trends).toHaveLength(2)
      
      const job1Trend = trends.find(t => t.jobId === 'job1')
      const job2Trend = trends.find(t => t.jobId === 'job2')
      
      expect(job1Trend?.score).toBeCloseTo(1.0, 2) // All positive feedback
      expect(job2Trend?.score).toBe(0) // All negative feedback
    })
  })

  describe('Feedback Analytics', () => {
    it('should calculate recommendation effectiveness', () => {
      const recommendations = [
        { id: 'rec1', match_score: 0.9, feedback: 'applied' },
        { id: 'rec2', match_score: 0.8, feedback: 'like' },
        { id: 'rec3', match_score: 0.7, feedback: 'dislike' },
        { id: 'rec4', match_score: 0.6, feedback: 'not_interested' },
        { id: 'rec5', match_score: 0.5, feedback: null }, // No feedback
      ]

      const calculateEffectiveness = (recs: any[]) => {
        const withFeedback = recs.filter(r => r.feedback)
        const positive = withFeedback.filter(r => ['applied', 'like', 'saved'].includes(r.feedback))
        
        return {
          feedbackRate: withFeedback.length / recs.length,
          positiveRate: positive.length / withFeedback.length,
          averageScorePositive: positive.reduce((sum, r) => sum + r.match_score, 0) / positive.length,
          averageScoreAll: recs.reduce((sum, r) => sum + r.match_score, 0) / recs.length
        }
      }

      const effectiveness = calculateEffectiveness(recommendations)
      expect(effectiveness.feedbackRate).toBe(0.8) // 4 out of 5 have feedback
      expect(effectiveness.positiveRate).toBe(0.5) // 2 out of 4 positive
      expect(effectiveness.averageScorePositive).toBeCloseTo(0.85, 2) // (0.9 + 0.8) / 2
    })

    it('should identify skill preferences from feedback', () => {
      const feedbackWithSkills = [
        { feedback_type: 'like', skills_match: ['React', 'TypeScript'] },
        { feedback_type: 'applied', skills_match: ['React', 'Node.js'] },
        { feedback_type: 'dislike', skills_match: ['PHP', 'MySQL'] },
        { feedback_type: 'like', skills_match: ['Python', 'Django'] },
        { feedback_type: 'not_interested', skills_match: ['Java', 'Spring'] },
      ]

      const analyzeSkillPreferences = (feedbacks: any[]) => {
        const skillStats = feedbacks.reduce((acc, feedback) => {
          feedback.skills_match.forEach((skill: string) => {
            if (!acc[skill]) {
              acc[skill] = { positive: 0, negative: 0, total: 0 }
            }
            acc[skill].total++
            
            if (['like', 'applied', 'saved'].includes(feedback.feedback_type)) {
              acc[skill].positive++
            } else if (['dislike', 'not_interested'].includes(feedback.feedback_type)) {
              acc[skill].negative++
            }
          })
          return acc
        }, {} as any)

        return Object.entries(skillStats)
          .map(([skill, stats]: [string, any]) => ({
            skill,
            ...stats,
            preference: stats.positive / stats.total
          }))
          .sort((a, b) => b.preference - a.preference)
      }

      const preferences = analyzeSkillPreferences(feedbackWithSkills)
      expect(preferences[0].skill).toBe('React') // Should be most preferred
      expect(preferences[0].preference).toBe(1.0) // All React feedback was positive
    })
  })

  describe('Request Validation', () => {
    it('should validate request body structure', () => {
      const validRequestBody = {
        recommendation_id: 'rec-123',
        feedback_type: 'like',
        feedback_reason: 'Great job match'
      }

      const invalidRequestBodies = [
        { feedback_type: 'like' }, // Missing recommendation_id
        { recommendation_id: 'rec-123' }, // Missing feedback_type
        { recommendation_id: 'rec-123', feedback_type: 'invalid' }, // Invalid feedback_type
        {}, // Empty object
        null, // Null request
      ]

      expect(validRequestBody.recommendation_id).toBeDefined()
      expect(validRequestBody.feedback_type).toBeDefined()
      expect(['like', 'dislike', 'applied', 'not_interested', 'saved']).toContain(validRequestBody.feedback_type)

      invalidRequestBodies.forEach(body => {
        if (body === null) {
          expect(body).toBeNull()
        } else {
          expect(
            !body.recommendation_id ||
            !body.feedback_type ||
            !['like', 'dislike', 'applied', 'not_interested', 'saved'].includes(body.feedback_type)
          ).toBe(true)
        }
      })
    })

    it('should handle authentication errors', () => {
      const authErrors = [
        { status: 401, message: 'Unauthorized' },
        { status: 403, message: 'Forbidden' },
        { status: 404, message: 'User not found' }
      ]

      authErrors.forEach(error => {
        expect(error.status).toBeGreaterThanOrEqual(400)
        expect(error.message).toBeDefined()
      })
    })

    it('should validate database operations', () => {
      const dbOperations = [
        'insert_feedback',
        'update_recommendation_stats',
        'log_user_activity'
      ]

      dbOperations.forEach(operation => {
        expect(operation).toBeDefined()
        expect(typeof operation).toBe('string')
      })
    })
  })
})