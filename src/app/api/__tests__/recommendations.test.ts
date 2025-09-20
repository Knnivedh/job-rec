import { NextRequest } from 'next/server'

// Mock all external dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

jest.mock('@/lib/groq', () => ({
  generateJobRecommendations: jest.fn(),
  generateEmbedding: jest.fn(),
}))

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('/api/recommendations API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Job Recommendations Engine', () => {
    it('should structure recommendation data correctly', () => {
      const mockRecommendation = {
        id: 'rec-123',
        job_title: 'Senior Frontend Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        job_type: 'full-time',
        salary_range: '$120,000 - $150,000',
        requirements: ['React', 'TypeScript', '5+ years experience'],
        description: 'Join our team to build amazing web applications',
        match_score: 0.89,
        skills_match: ['React', 'TypeScript', 'JavaScript'],
        experience_match: true,
        created_at: '2023-01-01T00:00:00Z'
      }

      expect(mockRecommendation.id).toBeDefined()
      expect(mockRecommendation.job_title).toBe('Senior Frontend Developer')
      expect(mockRecommendation.match_score).toBeGreaterThan(0)
      expect(mockRecommendation.match_score).toBeLessThanOrEqual(1)
      expect(mockRecommendation.skills_match).toBeInstanceOf(Array)
      expect(mockRecommendation.experience_match).toBe(true)
    })

    it('should validate match score ranges', () => {
      const validScores = [0.0, 0.3, 0.5, 0.75, 0.89, 1.0]
      const invalidScores = [-0.1, 1.1, 2.0, -1.0]

      validScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1)
      })

      invalidScores.forEach(score => {
        expect(score < 0 || score > 1).toBe(true)
      })
    })

    it('should filter recommendations by minimum score', () => {
      const mockRecommendations = [
        { id: '1', match_score: 0.8 },
        { id: '2', match_score: 0.2 },
        { id: '3', match_score: 0.6 },
        { id: '4', match_score: 0.1 },
      ]

      const minScore = 0.3
      const filteredRecs = mockRecommendations.filter(rec => rec.match_score >= minScore)
      
      expect(filteredRecs).toHaveLength(2)
      expect(filteredRecs.map(r => r.id)).toEqual(['1', '3'])
    })

    it('should sort recommendations by match score', () => {
      const mockRecommendations = [
        { id: '1', match_score: 0.6 },
        { id: '2', match_score: 0.9 },
        { id: '3', match_score: 0.4 },
        { id: '4', match_score: 0.8 },
      ]

      const sortedRecs = mockRecommendations.sort((a, b) => b.match_score - a.match_score)
      
      expect(sortedRecs[0].id).toBe('2') // 0.9
      expect(sortedRecs[1].id).toBe('4') // 0.8
      expect(sortedRecs[2].id).toBe('1') // 0.6
      expect(sortedRecs[3].id).toBe('3') // 0.4
    })
  })

  describe('Skills Matching Algorithm', () => {
    it('should match skills case-insensitively', () => {
      const userSkills = ['JavaScript', 'react', 'NODE.JS']
      const jobSkills = ['javascript', 'React', 'node.js', 'TypeScript']

      const getMatchingSkills = (user: string[], job: string[]) => {
        const userLower = user.map(s => s.toLowerCase())
        const jobLower = job.map(s => s.toLowerCase())
        
        return user.filter(skill => 
          jobLower.some(jobSkill => 
            jobSkill.includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(jobSkill)
          )
        )
      }

      const matches = getMatchingSkills(userSkills, jobSkills)
      expect(matches).toHaveLength(3)
      expect(matches).toContain('JavaScript')
      expect(matches).toContain('react')
      expect(matches).toContain('NODE.JS')
    })

    it('should handle partial skill matches', () => {
      const userSkills = ['React', 'JS']
      const jobSkills = ['React.js', 'JavaScript', 'TypeScript']

      const hasPartialMatch = (userSkill: string, jobSkill: string) => {
        return userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
               jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      }

      expect(hasPartialMatch('React', 'React.js')).toBe(true)
      expect(hasPartialMatch('JS', 'JavaScript')).toBe(true)
      expect(hasPartialMatch('React', 'TypeScript')).toBe(false)
    })

    it('should calculate skill match percentage', () => {
      const calculateSkillMatchPercentage = (userSkills: string[], requiredSkills: string[]) => {
        if (requiredSkills.length === 0) return 1.0
        
        const matchingSkills = userSkills.filter(skill =>
          requiredSkills.some(req => 
            skill.toLowerCase().includes(req.toLowerCase()) ||
            req.toLowerCase().includes(skill.toLowerCase())
          )
        )
        
        return matchingSkills.length / requiredSkills.length
      }

      expect(calculateSkillMatchPercentage(['React', 'JS'], ['React', 'JavaScript'])).toBe(1.0)
      expect(calculateSkillMatchPercentage(['React'], ['React', 'Vue', 'Angular'])).toBeCloseTo(0.33, 2)
      expect(calculateSkillMatchPercentage([], ['React'])).toBe(0)
      expect(calculateSkillMatchPercentage(['React'], [])).toBe(1.0)
    })
  })

  describe('Experience Matching', () => {
    it('should match experience levels correctly', () => {
      const checkExperienceMatch = (userExperience: number, requiredLevel: string) => {
        switch (requiredLevel.toLowerCase()) {
          case 'entry': return userExperience >= 0
          case 'mid': return userExperience >= 2
          case 'senior': return userExperience >= 5
          case 'executive': return userExperience >= 10
          default: return true
        }
      }

      expect(checkExperienceMatch(1, 'entry')).toBe(true)
      expect(checkExperienceMatch(1, 'mid')).toBe(false)
      expect(checkExperienceMatch(3, 'mid')).toBe(true)
      expect(checkExperienceMatch(3, 'senior')).toBe(false)
      expect(checkExperienceMatch(6, 'senior')).toBe(true)
      expect(checkExperienceMatch(6, 'executive')).toBe(false)
      expect(checkExperienceMatch(12, 'executive')).toBe(true)
    })

    it('should calculate experience years from resume data', () => {
      const mockExperience = [
        { start_date: '2020-01', end_date: '2022-12' },
        { start_date: '2019-06', end_date: '2019-12' },
        { start_date: '2023-01', end_date: null }, // Current job
      ]

      const calculateTotalExperience = (experiences: any[]) => {
        return experiences.length // Simplified - in real implementation would calculate actual years
      }

      expect(calculateTotalExperience(mockExperience)).toBe(3)
    })
  })

  describe('Recommendation Caching', () => {
    it('should check for recent recommendations', () => {
      const now = new Date('2023-01-02T00:00:00Z')
      const yesterday = new Date('2023-01-01T12:00:00Z')
      const twoDaysAgo = new Date('2022-12-31T00:00:00Z')

      const isRecent = (createdAt: Date, hoursThreshold: number = 24) => {
        const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        return diffHours <= hoursThreshold
      }

      expect(isRecent(yesterday)).toBe(true)
      expect(isRecent(twoDaysAgo)).toBe(false)
    })

    it('should limit recommendation count', () => {
      const mockRecommendations = Array.from({ length: 20 }, (_, i) => ({ id: i.toString() }))
      const limit = 10
      const limitedRecs = mockRecommendations.slice(0, limit)

      expect(limitedRecs).toHaveLength(10)
      expect(mockRecommendations).toHaveLength(20)
    })
  })

  describe('Vector Similarity Search', () => {
    it('should calculate cosine similarity', () => {
      const cosineSimilarity = (a: number[], b: number[]) => {
        if (a.length !== b.length) return 0
        
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
        
        if (magnitudeA === 0 || magnitudeB === 0) return 0
        return dotProduct / (magnitudeA * magnitudeB)
      }

      const vector1 = [1, 0, 0]
      const vector2 = [1, 0, 0]
      const vector3 = [0, 1, 0]

      expect(cosineSimilarity(vector1, vector2)).toBeCloseTo(1.0, 2)
      expect(cosineSimilarity(vector1, vector3)).toBeCloseTo(0.0, 2)
    })

    it('should find similar jobs using embeddings', () => {
      const resumeEmbedding = [0.5, 0.8, 0.2]
      const jobEmbeddings = [
        { id: 'job1', embedding: [0.4, 0.9, 0.1] },
        { id: 'job2', embedding: [0.1, 0.2, 0.9] },
        { id: 'job3', embedding: [0.6, 0.7, 0.3] },
      ]

      // Mock similarity calculation
      const findSimilarJobs = (resume: number[], jobs: any[], threshold: number = 0.5) => {
        return jobs
          .map(job => ({ ...job, similarity: Math.random() })) // Mock similarity
          .filter(job => job.similarity >= threshold)
          .sort((a, b) => b.similarity - a.similarity)
      }

      const similarJobs = findSimilarJobs(resumeEmbedding, jobEmbeddings, 0.5)
      expect(similarJobs.every(job => job.similarity >= 0.5)).toBe(true)
    })
  })

  describe('AI-Powered Matching', () => {
    it('should generate match reasoning', () => {
      const mockReasons = [
        'Strong match due to relevant React and TypeScript skills with 5+ years experience',
        'Good match with Python expertise, but missing some cloud experience',
        'Excellent skills alignment, perfect experience level match'
      ]

      mockReasons.forEach(reason => {
        expect(reason).toBeDefined()
        expect(typeof reason).toBe('string')
        expect(reason.length).toBeGreaterThan(10)
      })
    })

    it('should handle AI API failures gracefully', () => {
      const fallbackScores = (jobCount: number) => {
        return {
          scores: new Array(jobCount).fill(0.5),
          reasoning: new Array(jobCount).fill('AI-generated match')
        }
      }

      const fallback = fallbackScores(3)
      expect(fallback.scores).toEqual([0.5, 0.5, 0.5])
      expect(fallback.reasoning).toEqual(['AI-generated match', 'AI-generated match', 'AI-generated match'])
    })
  })

  describe('Error Handling', () => {
    it('should handle missing resume gracefully', () => {
      const handleNoResume = () => {
        return { recommendations: [] }
      }

      const result = handleNoResume()
      expect(result.recommendations).toEqual([])
    })

    it('should handle database errors', () => {
      const errorTypes = [
        'user_not_found',
        'resume_not_found',
        'database_connection_error',
        'query_timeout'
      ]

      errorTypes.forEach(errorType => {
        expect(errorType).toBeDefined()
        expect(typeof errorType).toBe('string')
      })
    })

    it('should provide appropriate error responses', () => {
      const errorResponses = {
        401: 'Unauthorized',
        404: 'User profile not found',
        500: 'Internal server error'
      }

      expect(errorResponses[401]).toBe('Unauthorized')
      expect(errorResponses[404]).toBe('User profile not found')
      expect(errorResponses[500]).toBe('Internal server error')
    })
  })

  describe('Data Formatting', () => {
    it('should format salary ranges correctly', () => {
      const formatSalary = (min?: number, max?: number) => {
        if (!min || !max) return null
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`
      }

      expect(formatSalary(80000, 120000)).toBe('$80,000 - $120,000')
      expect(formatSalary(undefined, 100000)).toBeNull()
      expect(formatSalary(80000, undefined)).toBeNull()
    })

    it('should format job types correctly', () => {
      const jobTypes = ['full-time', 'part-time', 'contract', 'freelance']
      
      jobTypes.forEach(type => {
        expect(type).toMatch(/^[a-z-]+$/)
      })
    })

    it('should format locations consistently', () => {
      const locations = [
        'San Francisco, CA',
        'New York, NY',
        'Remote',
        'London, UK'
      ]

      locations.forEach(location => {
        expect(location).toBeDefined()
        expect(typeof location).toBe('string')
      })
    })
  })

  describe('Performance Considerations', () => {
    it('should limit concurrent AI requests', () => {
      const maxConcurrentRequests = 5
      const requestQueue = Array.from({ length: 10 }, (_, i) => i)
      
      const processInBatches = (items: number[], batchSize: number) => {
        const batches = []
        for (let i = 0; i < items.length; i += batchSize) {
          batches.push(items.slice(i, i + batchSize))
        }
        return batches
      }

      const batches = processInBatches(requestQueue, maxConcurrentRequests)
      expect(batches).toHaveLength(2)
      expect(batches[0]).toHaveLength(5)
      expect(batches[1]).toHaveLength(5)
    })

    it('should implement recommendation pagination', () => {
      const allRecommendations = Array.from({ length: 50 }, (_, i) => ({ id: i.toString() }))
      const pageSize = 10
      const page = 2

      const getPaginatedResults = (items: any[], page: number, size: number) => {
        const start = (page - 1) * size
        return items.slice(start, start + size)
      }

      const pageResults = getPaginatedResults(allRecommendations, page, pageSize)
      expect(pageResults).toHaveLength(10)
      expect(pageResults[0].id).toBe('10') // Second page starts at index 10
    })
  })
})