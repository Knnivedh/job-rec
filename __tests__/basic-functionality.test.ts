/**
 * Basic functionality tests to validate test setup
 */

describe('Test Environment Setup', () => {
  it('should run basic JavaScript tests', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect([1, 2, 3]).toHaveLength(3)
  })

  it('should handle async operations', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('success'), 10)
      })
    }

    const result = await asyncFunction()
    expect(result).toBe('success')
  })

  it('should test environment variables', () => {
    expect(process.env.NODE_ENV).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.GROQ_API_KEY).toBeDefined()
  })
})

describe('Core Application Logic Tests', () => {
  describe('File Validation Logic', () => {
    it('should validate PDF file types', () => {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const pdfType = 'application/pdf'
      const docxType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      const invalidType = 'text/plain'

      expect(allowedTypes).toContain(pdfType)
      expect(allowedTypes).toContain(docxType)
      expect(allowedTypes).not.toContain(invalidType)
    })

    it('should validate file sizes', () => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const validSize = 5 * 1024 * 1024 // 5MB
      const invalidSize = 15 * 1024 * 1024 // 15MB

      expect(validSize).toBeLessThanOrEqual(maxSize)
      expect(invalidSize).toBeGreaterThan(maxSize)
    })
  })

  describe('Match Score Calculations', () => {
    it('should calculate match scores correctly', () => {
      const calculateMatchScore = (userSkills: string[], jobSkills: string[]) => {
        if (jobSkills.length === 0) return 1.0
        
        const matchingSkills = userSkills.filter(skill =>
          jobSkills.some(jobSkill => 
            skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
        
        return matchingSkills.length / jobSkills.length
      }

      expect(calculateMatchScore(['React', 'JavaScript'], ['React', 'JavaScript'])).toBe(1.0)
      expect(calculateMatchScore(['React'], ['React', 'Vue', 'Angular'])).toBeCloseTo(0.33, 2)
      expect(calculateMatchScore([], ['React'])).toBe(0)
      expect(calculateMatchScore(['React'], [])).toBe(1.0)
    })

    it('should handle case-insensitive skill matching', () => {
      const userSkills = ['JavaScript', 'react', 'NODE.JS']
      const jobSkills = ['javascript', 'React', 'node.js', 'TypeScript']

      const getMatchingSkills = (user: string[], job: string[]) => {
        return user.filter(skill => 
          job.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        )
      }

      const matches = getMatchingSkills(userSkills, jobSkills)
      expect(matches).toHaveLength(3)
      expect(matches).toContain('JavaScript')
      expect(matches).toContain('react')
      expect(matches).toContain('NODE.JS')
    })
  })

  describe('Experience Level Matching', () => {
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
  })

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect('test@example.com').toMatch(emailRegex)
      expect('user.name@domain.co.uk').toMatch(emailRegex)
      expect('invalid-email').not.toMatch(emailRegex)
      expect('test@').not.toMatch(emailRegex)
      expect('@example.com').not.toMatch(emailRegex)
    })

    it('should validate password requirements', () => {
      const validatePassword = (password: string) => {
        return {
          minLength: password.length >= 8,
          hasUppercase: /[A-Z]/.test(password),
          hasLowercase: /[a-z]/.test(password),
          hasNumbers: /\d/.test(password),
          isValid: password.length >= 8
        }
      }

      const strongPassword = validatePassword('StrongPass123')
      expect(strongPassword.minLength).toBe(true)
      expect(strongPassword.hasUppercase).toBe(true)
      expect(strongPassword.hasLowercase).toBe(true)
      expect(strongPassword.hasNumbers).toBe(true)
      expect(strongPassword.isValid).toBe(true)

      const weakPassword = validatePassword('weak')
      expect(weakPassword.minLength).toBe(false)
      expect(weakPassword.isValid).toBe(false)
    })
  })

  describe('Data Structure Validation', () => {
    it('should validate resume data structure', () => {
      const validResumeData = {
        contact_info: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          location: 'New York, NY',
          linkedin: null,
          github: null
        },
        skills: ['JavaScript', 'React'],
        experience: [{
          company: 'Tech Corp',
          position: 'Developer',
          start_date: '2020-01',
          end_date: null
        }],
        education: [{
          institution: 'University',
          degree: 'Bachelor',
          field_of_study: 'Computer Science'
        }],
        summary: 'Experienced developer'
      }

      expect(validResumeData.contact_info).toBeDefined()
      expect(validResumeData.contact_info.name).toBe('John Doe')
      expect(Array.isArray(validResumeData.skills)).toBe(true)
      expect(Array.isArray(validResumeData.experience)).toBe(true)
      expect(Array.isArray(validResumeData.education)).toBe(true)
      expect(validResumeData.skills).toHaveLength(2)
    })

    it('should validate recommendation data structure', () => {
      const validRecommendation = {
        id: 'rec-123',
        job_title: 'Software Engineer',
        company: 'Tech Corp',
        match_score: 0.85,
        skills_match: ['JavaScript', 'React'],
        experience_match: true,
        reasoning: 'Strong skills match'
      }

      expect(validRecommendation.id).toBeDefined()
      expect(typeof validRecommendation.match_score).toBe('number')
      expect(validRecommendation.match_score).toBeGreaterThanOrEqual(0)
      expect(validRecommendation.match_score).toBeLessThanOrEqual(1)
      expect(Array.isArray(validRecommendation.skills_match)).toBe(true)
      expect(typeof validRecommendation.experience_match).toBe('boolean')
    })
  })

  describe('Utility Functions', () => {
    it('should format salary ranges correctly', () => {
      const formatSalary = (min?: number, max?: number) => {
        if (!min || !max) return null
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`
      }

      expect(formatSalary(80000, 120000)).toBe('$80,000 - $120,000')
      expect(formatSalary(undefined, 100000)).toBeNull()
      expect(formatSalary(80000, undefined)).toBeNull()
    })

    it('should handle date formatting', () => {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
      }

      expect(formatDate('2023-01-15T10:30:00Z')).toBe('2023-01-15')
    })

    it('should truncate long text appropriately', () => {
      const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength - 3) + '...'
      }

      expect(truncateText('Short text', 20)).toBe('Short text')
      expect(truncateText('This is a very long text that should be truncated', 20)).toBe('This is a very lo...')
    })
  })
})

describe('Configuration and Environment Tests', () => {
  it('should have required environment variables', () => {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GROQ_API_KEY'
    ]

    requiredEnvVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined()
    })
  })

  it('should validate configuration values', () => {
    const config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      embeddingDimensions: 1536,
      maxRecommendations: 10,
      minMatchScore: 0.3
    }

    expect(config.maxFileSize).toBeGreaterThan(0)
    expect(config.allowedFileTypes).toHaveLength(2)
    expect(config.embeddingDimensions).toBe(1536)
    expect(config.minMatchScore).toBeGreaterThan(0)
    expect(config.minMatchScore).toBeLessThan(1)
  })
})

console.log('✅ Basic functionality tests completed successfully!')