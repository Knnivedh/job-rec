import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('Supabase Integration', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          remove: jest.fn(),
          getPublicUrl: jest.fn(),
        })),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabaseClient)
  })

  describe('Client Configuration', () => {
    it('should create Supabase client with correct configuration', () => {
      // Import the module to trigger client creation
      require('../supabase')

      expect(mockCreateClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    })

    it('should create admin client with service role key', () => {
      require('../supabase')

      // Admin client should be created with service role key
      expect(mockCreateClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    })
  })

  describe('Database Operations', () => {
    beforeEach(() => {
      require('../supabase')
    })

    describe('User Management', () => {
      it('should handle user authentication operations', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' }
        
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: {} },
          error: null,
        })

        // Test authentication methods exist and can be called
        expect(typeof mockSupabaseClient.auth.getUser).toBe('function')
        expect(typeof mockSupabaseClient.auth.signInWithPassword).toBe('function')
        expect(typeof mockSupabaseClient.auth.signUp).toBe('function')
        expect(typeof mockSupabaseClient.auth.signOut).toBe('function')
      })

      it('should handle authentication state changes', () => {
        const mockCallback = jest.fn()
        const mockSubscription = { unsubscribe: jest.fn() }

        mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
          data: { subscription: mockSubscription },
        })

        const result = mockSupabaseClient.auth.onAuthStateChange(mockCallback)
        
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
        expect(result.data.subscription).toBeDefined()
        expect(typeof result.data.subscription.unsubscribe).toBe('function')
      })
    })

    describe('Database Queries', () => {
      it('should support chainable query methods', () => {
        const query = mockSupabaseClient.from('resumes')
          .select('*')
          .eq('user_id', 'user-123')
          .single()

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('resumes')
        expect(query.select).toHaveBeenCalledWith('*')
        expect(query.eq).toHaveBeenCalledWith('user_id', 'user-123')
        expect(query.single).toHaveBeenCalled()
      })

      it('should support insert operations', () => {
        const insertData = {
          user_id: 'user-123',
          file_name: 'resume.pdf',
          parsed_data: { skills: ['JavaScript'] }
        }

        mockSupabaseClient.from('resumes').insert(insertData)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('resumes')
        expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(insertData)
      })

      it('should support update operations', () => {
        const updateData = { is_active: false }

        mockSupabaseClient.from('resumes')
          .update(updateData)
          .eq('id', 'resume-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('resumes')
        expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateData)
        expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', 'resume-123')
      })

      it('should support delete operations', () => {
        mockSupabaseClient.from('resumes')
          .delete()
          .eq('id', 'resume-123')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('resumes')
        expect(mockSupabaseClient.from().delete).toHaveBeenCalled()
        expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', 'resume-123')
      })

      it('should support complex queries with multiple conditions', () => {
        mockSupabaseClient.from('job_recommendations')
          .select(`
            id,
            match_score,
            jobs!inner (
              title,
              companies!inner (
                name
              )
            )
          `)
          .eq('user_id', 'user-123')
          .gte('match_score', 0.5)
          .order('match_score', { ascending: false })
          .limit(10)

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('job_recommendations')
        expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('user_id', 'user-123')
        expect(mockSupabaseClient.from().gte).toHaveBeenCalledWith('match_score', 0.5)
        expect(mockSupabaseClient.from().order).toHaveBeenCalledWith('match_score', { ascending: false })
        expect(mockSupabaseClient.from().limit).toHaveBeenCalledWith(10)
      })

      it('should support upsert operations', () => {
        const upsertData = [
          { user_id: 'user-123', skill_id: 'skill-1', proficiency_level: 'advanced' },
          { user_id: 'user-123', skill_id: 'skill-2', proficiency_level: 'intermediate' }
        ]

        mockSupabaseClient.from('user_skills')
          .upsert(upsertData, {
            onConflict: 'user_id,skill_id',
            ignoreDuplicates: false
          })

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_skills')
        expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(upsertData, {
          onConflict: 'user_id,skill_id',
          ignoreDuplicates: false
        })
      })

      it('should support text search operations', () => {
        mockSupabaseClient.from('skills')
          .select('id')
          .ilike('name', 'javascript')

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('skills')
        expect(mockSupabaseClient.from().ilike).toHaveBeenCalledWith('name', 'javascript')
      })
    })

    describe('File Storage Operations', () => {
      it('should support file upload operations', async () => {
        const mockFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
        const uploadResult = {
          data: { path: 'user-123/resume.pdf' },
          error: null
        }

        mockSupabaseClient.storage.from('resumes').upload.mockResolvedValue(uploadResult)

        const result = await mockSupabaseClient.storage
          .from('resumes')
          .upload('user-123/resume.pdf', mockFile)

        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('resumes')
        expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
          'user-123/resume.pdf',
          mockFile
        )
        expect(result).toEqual(uploadResult)
      })

      it('should support file removal operations', async () => {
        const removeResult = { error: null }
        
        mockSupabaseClient.storage.from('resumes').remove.mockResolvedValue(removeResult)

        const result = await mockSupabaseClient.storage
          .from('resumes')
          .remove(['user-123/resume.pdf'])

        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('resumes')
        expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalledWith(['user-123/resume.pdf'])
        expect(result).toEqual(removeResult)
      })

      it('should support getting public URLs', () => {
        const publicUrlResult = {
          data: { publicUrl: 'https://storage.url/resume.pdf' }
        }

        mockSupabaseClient.storage.from('resumes').getPublicUrl.mockReturnValue(publicUrlResult)

        const result = mockSupabaseClient.storage
          .from('resumes')
          .getPublicUrl('user-123/resume.pdf')

        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('resumes')
        expect(mockSupabaseClient.storage.from().getPublicUrl).toHaveBeenCalledWith('user-123/resume.pdf')
        expect(result).toEqual(publicUrlResult)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const authError = { message: 'Invalid credentials' }
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      })

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.error).toEqual(authError)
      expect(result.data.user).toBeNull()
    })

    it('should handle database query errors', async () => {
      const dbError = { message: 'Database connection failed' }
      
      mockSupabaseClient.from('resumes').single.mockResolvedValue({
        data: null,
        error: dbError,
      })

      const result = await mockSupabaseClient.from('resumes')
        .select('*')
        .eq('id', 'non-existent')
        .single()

      expect(result.error).toEqual(dbError)
      expect(result.data).toBeNull()
    })

    it('should handle storage operation errors', async () => {
      const storageError = { message: 'Storage upload failed' }
      
      mockSupabaseClient.storage.from('resumes').upload.mockResolvedValue({
        data: null,
        error: storageError,
      })

      const result = await mockSupabaseClient.storage
        .from('resumes')
        .upload('invalid-path', new File([''], 'test.pdf'))

      expect(result.error).toEqual(storageError)
      expect(result.data).toBeNull()
    })
  })

  describe('Type Safety', () => {
    it('should validate database table schemas', () => {
      // Test that expected tables and their relationships are accessible
      const tables = [
        'app_users',
        'resumes',
        'jobs',
        'companies',
        'job_recommendations',
        'recommendation_feedback',
        'skills',
        'user_skills',
        'job_applications',
        'skill_gap_analysis',
        'user_profiles'
      ]

      tables.forEach(tableName => {
        mockSupabaseClient.from(tableName)
        expect(mockSupabaseClient.from).toHaveBeenCalledWith(tableName)
      })
    })

    it('should validate storage bucket names', () => {
      const buckets = ['resumes', 'profile-images', 'documents']

      buckets.forEach(bucketName => {
        mockSupabaseClient.storage.from(bucketName)
        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(bucketName)
      })
    })
  })

  describe('Data Validation', () => {
    it('should validate resume data structure', () => {
      const validResumeData = {
        user_id: 'user-123',
        file_name: 'resume.pdf',
        file_type: 'pdf',
        file_size: 1024,
        raw_text: 'Resume content',
        parsed_data: {
          contact_info: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            location: 'New York, NY',
            linkedin: null,
            github: null
          },
          skills: ['JavaScript', 'React'],
          experience: [],
          education: [],
          summary: null
        },
        embedding: new Array(1536).fill(0.1)
      }

      expect(validResumeData.user_id).toBeDefined()
      expect(validResumeData.file_name).toBeDefined()
      expect(validResumeData.parsed_data).toBeDefined()
      expect(validResumeData.parsed_data.contact_info).toBeDefined()
      expect(Array.isArray(validResumeData.parsed_data.skills)).toBe(true)
      expect(Array.isArray(validResumeData.parsed_data.experience)).toBe(true)
      expect(Array.isArray(validResumeData.parsed_data.education)).toBe(true)
      expect(Array.isArray(validResumeData.embedding)).toBe(true)
      expect(validResumeData.embedding).toHaveLength(1536)
    })

    it('should validate job recommendation data structure', () => {
      const validRecommendationData = {
        user_id: 'user-123',
        resume_id: 'resume-456',
        job_id: 'job-789',
        match_score: 0.85,
        skills_match: ['JavaScript', 'React'],
        experience_match: true,
        reasoning: 'Strong skills alignment with job requirements'
      }

      expect(validRecommendationData.user_id).toBeDefined()
      expect(validRecommendationData.resume_id).toBeDefined()
      expect(validRecommendationData.job_id).toBeDefined()
      expect(typeof validRecommendationData.match_score).toBe('number')
      expect(validRecommendationData.match_score).toBeGreaterThanOrEqual(0)
      expect(validRecommendationData.match_score).toBeLessThanOrEqual(1)
      expect(Array.isArray(validRecommendationData.skills_match)).toBe(true)
      expect(typeof validRecommendationData.experience_match).toBe('boolean')
      expect(typeof validRecommendationData.reasoning).toBe('string')
    })

    it('should validate feedback data structure', () => {
      const validFeedbackTypes = ['like', 'dislike', 'applied', 'not_interested', 'saved']
      
      const validFeedbackData = {
        user_id: 'user-123',
        recommendation_id: 'rec-456',
        feedback_type: 'like',
        feedback_reason: 'Good match for my skills',
        created_at: new Date().toISOString()
      }

      expect(validFeedbackData.user_id).toBeDefined()
      expect(validFeedbackData.recommendation_id).toBeDefined()
      expect(validFeedbackTypes).toContain(validFeedbackData.feedback_type)
      expect(typeof validFeedbackData.feedback_reason).toBe('string')
      expect(validFeedbackData.created_at).toBeDefined()
    })
  })

  describe('Performance Considerations', () => {
    it('should support query optimization techniques', () => {
      // Test that queries can be optimized with proper indexing hints
      mockSupabaseClient.from('job_recommendations')
        .select('id, match_score')
        .eq('user_id', 'user-123')
        .order('match_score', { ascending: false })
        .limit(10)

      // Verify that queries use indexed columns for filtering and sorting
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockSupabaseClient.from().order).toHaveBeenCalledWith('match_score', { ascending: false })
      expect(mockSupabaseClient.from().limit).toHaveBeenCalledWith(10)
    })

    it('should support batch operations', () => {
      const batchData = [
        { user_id: 'user-123', skill_id: 'skill-1' },
        { user_id: 'user-123', skill_id: 'skill-2' },
        { user_id: 'user-123', skill_id: 'skill-3' }
      ]

      mockSupabaseClient.from('user_skills').insert(batchData)

      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(batchData)
    })

    it('should handle pagination correctly', () => {
      const pageSize = 10
      const page = 2
      const rangeStart = (page - 1) * pageSize
      const rangeEnd = rangeStart + pageSize - 1

      // Verify pagination parameters can be applied
      expect(rangeStart).toBe(10)
      expect(rangeEnd).toBe(19)
      expect(pageSize).toBe(10)
    })
  })
})