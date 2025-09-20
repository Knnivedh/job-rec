// Real Resume AI System Test - Using K N Nivedh's Resume
// This test validates the entire AI pipeline with your actual resume

import fs from 'fs'
import path from 'path'

// Remove mocks for real file testing
jest.unmock('pdf-parse')
jest.unmock('groq-sdk')

import { parseResume } from '../lib/resume-parser'
import { generateJobRecommendations, analyzeSkillGap } from '../lib/groq'

// Mock job descriptions for testing
const sampleJobDescriptions = [
  // AI/ML Engineer Role
  `Senior AI/ML Engineer - TechCorp
  Location: Bangalore, India
  
  We are looking for a passionate AI/ML Engineer to join our team. 
  
  Required Skills:
  - Python programming with 3+ years experience
  - Machine Learning frameworks (TensorFlow, PyTorch, Scikit-learn)
  - Deep Learning and Neural Networks
  - Computer Vision and Image Processing
  - Data preprocessing and analysis (Pandas, NumPy)
  - Experience with cloud platforms (AWS, Google Cloud)
  - Strong mathematical background in statistics and linear algebra
  - Bachelor's degree in Computer Science, AI, or related field
  
  Responsibilities:
  - Develop and deploy ML models for production
  - Work with large datasets and implement data pipelines
  - Collaborate with cross-functional teams
  - Research and implement state-of-the-art AI techniques
  
  Experience: 2-4 years in AI/ML development`,

  // Software Developer Role  
  `Full Stack Software Developer - InnovateTech
  Location: Remote/Hybrid
  
  Join our dynamic development team working on cutting-edge web applications.
  
  Required Skills:
  - JavaScript/TypeScript proficiency
  - React.js and modern frontend frameworks
  - Node.js and backend development
  - Database design (SQL/NoSQL)
  - RESTful API development
  - Git version control
  - Agile development methodologies
  - Bachelor's degree in Computer Science
  
  Nice to have:
  - Python knowledge
  - Cloud deployment experience
  - Mobile app development
  - DevOps experience
  
  Experience: 1-3 years in software development`,

  // Data Scientist Role
  `Data Scientist - Analytics Pro
  Location: Mumbai, India
  
  We're seeking a Data Scientist to extract insights from complex datasets.
  
  Required Skills:
  - Python and R programming
  - Statistical analysis and modeling
  - Machine Learning algorithms
  - Data visualization (Matplotlib, Seaborn, Plotly)
  - SQL and database management
  - Jupyter notebooks and analytical tools
  - Strong problem-solving abilities
  - Masters/PhD in Statistics, Mathematics, or related field
  
  Responsibilities:
  - Analyze large datasets to identify trends and patterns
  - Build predictive models and recommendation systems
  - Create data visualizations and reports
  - Collaborate with business stakeholders
  
  Experience: 2-5 years in data science/analytics`
]

describe('Real Resume AI System Test - K N Nivedh', () => {
  let resumeFilePath: string
  let parsedResume: any
  
  beforeAll(async () => {
    // Set up environment
    process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-key'
    resumeFilePath = path.join(process.cwd(), 'resume', 'K N Nivedh (2sd22ai027)  (1).pdf')
    
    // Verify resume file exists
    if (!fs.existsSync(resumeFilePath)) {
      throw new Error(`Resume file not found at: ${resumeFilePath}`)
    }
  })

  describe('Resume Parsing Pipeline', () => {
    it('should successfully parse K N Nivedh resume from PDF', async () => {
      // Read the actual resume file
      const fileBuffer = fs.readFileSync(resumeFilePath)
      expect(fileBuffer.length).toBeGreaterThan(0)
      
      // Parse the resume
      const result = await parseResume(fileBuffer, 'application/pdf')
      parsedResume = result
      
      // Validate parsing results
      expect(result.error).toBeUndefined()
      expect(result.rawText).toBeDefined()
      expect(result.rawText.length).toBeGreaterThan(100) // Should have substantial content
      expect(result.parsedData).toBeDefined()
      
      console.log('📄 Parsed Resume Content:')
      console.log('Raw text length:', result.rawText.length)
      console.log('First 200 characters:', result.rawText.substring(0, 200))
    }, 30000) // 30 second timeout for AI processing

    it('should extract contact information correctly', async () => {
      expect(parsedResume).toBeDefined()
      const { contact_info } = parsedResume.parsedData
      
      // Validate contact info structure
      expect(contact_info).toBeDefined()
      expect(typeof contact_info.name).toBe('string')
      
      console.log('👤 Extracted Contact Info:')
      console.log('Name:', contact_info.name)
      console.log('Email:', contact_info.email)
      console.log('Phone:', contact_info.phone)
      console.log('Location:', contact_info.location)
      console.log('LinkedIn:', contact_info.linkedin)
      console.log('GitHub:', contact_info.github)
      
      // The name should contain 'Nivedh' or similar
      if (contact_info.name) {
        expect(contact_info.name.toLowerCase()).toMatch(/nivedh|k.*n/i)
      }
    })

    it('should extract skills from the resume', async () => {
      expect(parsedResume).toBeDefined()
      const { skills } = parsedResume.parsedData
      
      expect(Array.isArray(skills)).toBe(true)
      expect(skills.length).toBeGreaterThan(0)
      
      console.log('🛠️ Extracted Skills:')
      skills.forEach((skill: string, index: number) => {
        console.log(`${index + 1}. ${skill}`)
      })
      
      // Should contain technical skills for an AI student
      const skillsText = skills.join(' ').toLowerCase()
      const expectedSkillCategories = ['python', 'machine', 'learning', 'programming', 'computer']
      const foundCategories = expectedSkillCategories.filter(category => 
        skillsText.includes(category)
      )
      
      expect(foundCategories.length).toBeGreaterThan(0)
    })

    it('should extract education information', async () => {
      expect(parsedResume).toBeDefined()
      const { education } = parsedResume.parsedData
      
      expect(Array.isArray(education)).toBe(true)
      
      if (education.length > 0) {
        console.log('🎓 Education Information:')
        education.forEach((edu: any, index: number) => {
          console.log(`${index + 1}. ${edu.degree} in ${edu.field_of_study || 'N/A'}`)
          console.log(`   Institution: ${edu.institution}`)
          console.log(`   Graduation: ${edu.graduation_date || 'N/A'}`)
        })
        
        // Should have at least one education entry
        const firstEducation = education[0]
        expect(firstEducation.institution).toBeDefined()
        expect(firstEducation.degree).toBeDefined()
      }
    })
  })

  describe('Job Recommendation System', () => {
    it('should generate job recommendations for K N Nivedh profile', async () => {
      expect(parsedResume).toBeDefined()
      
      const recommendations = await generateJobRecommendations(
        parsedResume.rawText,
        sampleJobDescriptions
      )
      
      expect(recommendations.scores).toBeDefined()
      expect(recommendations.reasoning).toBeDefined()
      expect(recommendations.scores.length).toBe(sampleJobDescriptions.length)
      expect(recommendations.reasoning.length).toBe(sampleJobDescriptions.length)
      
      console.log('🎯 Job Recommendations for K N Nivedh:')
      recommendations.scores.forEach((score: number, index: number) => {
        const jobTitle = sampleJobDescriptions[index].split('\n')[0]
        console.log(`${index + 1}. ${jobTitle}`)
        console.log(`   Match Score: ${(score * 100).toFixed(1)}%`)
        console.log(`   Reasoning: ${recommendations.reasoning[index]}`)
        console.log('')
      })
      
      // All scores should be between 0 and 1
      recommendations.scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1)
      })
      
      // Find the best match
      const bestMatchIndex = recommendations.scores.indexOf(Math.max(...recommendations.scores))
      const bestScore = recommendations.scores[bestMatchIndex]
      
      console.log(`🏆 Best Job Match: ${sampleJobDescriptions[bestMatchIndex].split('\n')[0]}`)
      console.log(`📊 Best Score: ${(bestScore * 100).toFixed(1)}%`)
      
      expect(bestScore).toBeGreaterThan(0.3) // Should have reasonable match
    }, 45000) // 45 second timeout for AI processing

    it('should analyze skill gaps for career development', async () => {
      expect(parsedResume).toBeDefined()
      const userSkills = parsedResume.parsedData.skills
      
      // Extract skills from the best matching job (AI/ML Engineer)
      const jobRequirements = [
        'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Machine Learning',
        'Deep Learning', 'Computer Vision', 'Pandas', 'NumPy', 'AWS',
        'Statistics', 'Linear Algebra', 'Neural Networks'
      ]
      
      const skillGapAnalysis = await analyzeSkillGap(userSkills, jobRequirements)
      
      expect(skillGapAnalysis.missingSkills).toBeDefined()
      expect(skillGapAnalysis.skillImprovements).toBeDefined()
      expect(skillGapAnalysis.recommendedCourses).toBeDefined()
      
      console.log('📈 Skill Gap Analysis for K N Nivedh:')
      console.log('Current Skills:', userSkills.slice(0, 10).join(', '), '...')
      console.log('')
      
      if (skillGapAnalysis.missingSkills.length > 0) {
        console.log('❌ Missing Skills:')
        skillGapAnalysis.missingSkills.forEach((skill: string, index: number) => {
          console.log(`${index + 1}. ${skill}`)
        })
        console.log('')
      }
      
      if (skillGapAnalysis.skillImprovements.length > 0) {
        console.log('⚡ Skills to Improve:')
        skillGapAnalysis.skillImprovements.forEach((skill: string, index: number) => {
          console.log(`${index + 1}. ${skill}`)
        })
        console.log('')
      }
      
      if (skillGapAnalysis.recommendedCourses.length > 0) {
        console.log('📚 Recommended Learning Resources:')
        skillGapAnalysis.recommendedCourses.forEach((course: any, index: number) => {
          console.log(`${index + 1}. ${course.title}`)
          console.log(`   Description: ${course.description}`)
          if (course.url) {
            console.log(`   URL: ${course.url}`)
          }
          console.log('')
        })
      }
      
      // Should identify some missing skills for improvement
      expect(skillGapAnalysis.missingSkills.length + skillGapAnalysis.skillImprovements.length).toBeGreaterThan(0)
    }, 30000) // 30 second timeout for AI processing
  })

  describe('AI System Performance Validation', () => {
    it('should process resume within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const fileBuffer = fs.readFileSync(resumeFilePath)
      const result = await parseResume(fileBuffer, 'application/pdf')
      
      const processingTime = Date.now() - startTime
      
      console.log(`⏱️ Resume processing time: ${processingTime}ms`)
      
      expect(result.error).toBeUndefined()
      expect(processingTime).toBeLessThan(30000) // Should complete within 30 seconds
    }, 35000)

    it('should handle the complete workflow end-to-end', async () => {
      console.log('🔄 Testing Complete AI Workflow:')
      
      // Step 1: Parse Resume
      console.log('Step 1: Parsing resume...')
      const fileBuffer = fs.readFileSync(resumeFilePath)
      const parseResult = await parseResume(fileBuffer, 'application/pdf')
      expect(parseResult.error).toBeUndefined()
      
      // Step 2: Generate Job Recommendations
      console.log('Step 2: Generating job recommendations...')
      const recommendations = await generateJobRecommendations(
        parseResult.rawText,
        [sampleJobDescriptions[0]] // Test with one job for speed
      )
      expect(recommendations.scores.length).toBe(1)
      
      // Step 3: Analyze Skill Gap
      console.log('Step 3: Analyzing skill gaps...')
      const skillGap = await analyzeSkillGap(
        parseResult.parsedData.skills,
        ['Python', 'Machine Learning', 'TensorFlow']
      )
      expect(skillGap).toBeDefined()
      
      console.log('✅ Complete workflow executed successfully!')
      
      // Summary Report
      console.log('\n📋 AI System Test Summary for K N Nivedh:')
      console.log('- Resume parsing: ✅ Successful')
      console.log('- Skill extraction: ✅ Successful')
      console.log('- Job matching: ✅ Successful')
      console.log('- Skill gap analysis: ✅ Successful')
      console.log(`- Total skills identified: ${parseResult.parsedData.skills.length}`)
      console.log(`- Job match score: ${(recommendations.scores[0] * 100).toFixed(1)}%`)
      console.log(`- Skills to develop: ${skillGap.missingSkills.length}`)
    }, 60000) // 1 minute timeout for complete workflow
  })

  describe('Resume Content Validation', () => {
    it('should contain expected AI/ML student content', async () => {
      expect(parsedResume).toBeDefined()
      const fullText = parsedResume.rawText.toLowerCase()
      
      // Check for AI/ML related terms that should be in an AI student's resume
      const expectedTerms = [
        'artificial intelligence',
        'machine learning', 
        'python',
        'computer science',
        'engineering',
        'technology'
      ]
      
      console.log('🔍 Checking for AI/ML related content...')
      
      const foundTerms = expectedTerms.filter(term => fullText.includes(term))
      
      console.log('Found relevant terms:', foundTerms)
      
      // Should contain at least some AI/ML related content
      expect(foundTerms.length).toBeGreaterThan(0)
    })
  })
})