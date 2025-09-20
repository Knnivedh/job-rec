import { parseResume } from '../resume-parser'
import mammoth from 'mammoth'
import Groq from 'groq-sdk'

// Mock dependencies
jest.mock('mammoth')
jest.mock('pdf-parse')
jest.mock('groq-sdk')

const mockMammoth = mammoth as jest.Mocked<typeof mammoth>
const MockedGroq = Groq as jest.MockedClass<typeof Groq>

describe('Resume Parser', () => {
  let mockGroqInstance: jest.Mocked<Groq>
  let mockCreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockCreate = jest.fn()
    mockGroqInstance = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    } as any

    MockedGroq.mockImplementation(() => mockGroqInstance)
  })

  describe('PDF parsing', () => {
    it('should successfully parse PDF resume', async () => {
      // Mock pdf-parse module
      const mockPdfParse = jest.fn().mockResolvedValue({
        text: 'John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js'
      })
      
      jest.doMock('pdf-parse', () => ({
        __esModule: true,
        default: mockPdfParse
      }))

      // Mock Groq AI response
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              contact_info: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                location: 'New York, NY',
                linkedin: null,
                github: null
              },
              skills: ['JavaScript', 'React', 'Node.js'],
              experience: [{
                company: 'Tech Corp',
                position: 'Software Engineer',
                start_date: '2020-01',
                end_date: null,
                description: 'Developed web applications',
                skills_used: ['JavaScript', 'React']
              }],
              education: [{
                institution: 'University of Technology',
                degree: 'Bachelor of Science',
                field_of_study: 'Computer Science',
                graduation_date: '2019-12'
              }],
              summary: 'Experienced software engineer with expertise in web development'
            })
          }
        }]
      }

      mockCreate.mockResolvedValue(mockAIResponse)

      const fileBuffer = Buffer.from('PDF content')
      const result = await parseResume(fileBuffer, 'application/pdf')

      expect(result.error).toBeUndefined()
      expect(result.rawText).toBe('John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js')
      expect(result.parsedData.contact_info.name).toBe('John Doe')
      expect(result.parsedData.skills).toEqual(['JavaScript', 'React', 'Node.js'])
      expect(result.parsedData.experience).toHaveLength(1)
      expect(result.parsedData.education).toHaveLength(1)
    })

    it('should handle PDF parsing errors', async () => {
      const mockPdfParse = jest.fn().mockRejectedValue(new Error('PDF parsing failed'))
      
      jest.doMock('pdf-parse', () => ({
        __esModule: true,
        default: mockPdfParse
      }))

      const fileBuffer = Buffer.from('Invalid PDF')
      const result = await parseResume(fileBuffer, 'application/pdf')

      expect(result.error).toBe('PDF parsing failed')
      expect(result.rawText).toBe('')
      expect(result.parsedData.contact_info.name).toBeNull()
    })
  })

  describe('DOCX parsing', () => {
    it('should successfully parse DOCX resume', async () => {
      const mockText = 'Jane Smith\nProduct Manager\nSkills: Project Management, Agile, Scrum'
      
      mockMammoth.extractRawText.mockResolvedValue({
        value: mockText,
        messages: []
      })

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              contact_info: {
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+1987654321',
                location: 'San Francisco, CA',
                linkedin: 'https://linkedin.com/in/janesmith',
                github: null
              },
              skills: ['Project Management', 'Agile', 'Scrum'],
              experience: [{
                company: 'Startup Inc',
                position: 'Product Manager',
                start_date: '2021-03',
                end_date: null,
                description: 'Led product development',
                skills_used: ['Agile', 'Scrum']
              }],
              education: [{
                institution: 'Business School',
                degree: 'MBA',
                field_of_study: 'Business Administration',
                graduation_date: '2020-05'
              }],
              summary: 'Product manager with strong leadership skills'
            })
          }
        }]
      }

      mockCreate.mockResolvedValue(mockAIResponse)

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.error).toBeUndefined()
      expect(result.rawText).toBe(mockText)
      expect(result.parsedData.contact_info.name).toBe('Jane Smith')
      expect(result.parsedData.skills).toEqual(['Project Management', 'Agile', 'Scrum'])
    })

    it('should handle DOCX parsing errors', async () => {
      mockMammoth.extractRawText.mockRejectedValue(new Error('DOCX parsing failed'))

      const fileBuffer = Buffer.from('Invalid DOCX')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.error).toBe('DOCX parsing failed')
      expect(result.rawText).toBe('')
    })
  })

  describe('AI parsing with Groq', () => {
    it('should successfully parse resume data with AI', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: 'Sample resume text with all details',
        messages: []
      })

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              contact_info: {
                name: 'Test User',
                email: 'test@example.com',
                phone: '123-456-7890',
                location: 'City, State',
                linkedin: 'https://linkedin.com/in/testuser',
                github: 'https://github.com/testuser'
              },
              skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
              experience: [
                {
                  company: 'Tech Company',
                  position: 'Backend Developer',
                  start_date: '2019-06',
                  end_date: '2023-01',
                  description: 'Developed scalable backend systems',
                  skills_used: ['Python', 'Django', 'PostgreSQL']
                },
                {
                  company: 'Current Company',
                  position: 'Senior Developer',
                  start_date: '2023-02',
                  end_date: null,
                  description: 'Leading development team',
                  skills_used: ['Python', 'AWS']
                }
              ],
              education: [{
                institution: 'Tech University',
                degree: 'Master of Science',
                field_of_study: 'Computer Science',
                graduation_date: '2019-05'
              }],
              summary: 'Senior backend developer with 4+ years of experience'
            })
          }
        }]
      }

      mockCreate.mockResolvedValue(mockAIResponse)

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(mockCreate).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: 'You are a precise resume parser that returns only valid JSON.'
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Sample resume text with all details')
          })
        ]),
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 2000
      })

      expect(result.parsedData.contact_info.name).toBe('Test User')
      expect(result.parsedData.skills).toHaveLength(4)
      expect(result.parsedData.experience).toHaveLength(2)
      expect(result.parsedData.experience[1].end_date).toBeNull() // Current job
    })

    it('should handle AI parsing failures with fallback', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: 'john.doe@email.com\n+1-555-123-4567\nlinkedin.com/in/johndoe\nJavaScript Python React',
        messages: []
      })

      mockCreate.mockRejectedValue(new Error('AI API failed'))
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      // Should fall back to basic parsing
      expect(result.error).toBeUndefined()
      expect(result.parsedData.contact_info.email).toBe('john.doe@email.com')
      expect(result.parsedData.contact_info.phone).toBe('+1-555-123-4567')
      expect(result.parsedData.contact_info.linkedin).toBe('https://linkedin.com/in/johndoe')
      expect(result.parsedData.skills).toContain('JavaScript')
      expect(result.parsedData.skills).toContain('Python')
      expect(result.parsedData.skills).toContain('React')

      jest.restoreAllMocks()
    })

    it('should handle malformed JSON response gracefully', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: 'Sample resume with email@test.com',
        messages: []
      })

      const mockAIResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response from AI'
          }
        }]
      }

      mockCreate.mockResolvedValue(mockAIResponse)
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      // Should fall back to basic parsing
      expect(result.error).toBeUndefined()
      expect(result.parsedData.contact_info.email).toBe('email@test.com')

      jest.restoreAllMocks()
    })

    it('should extract JSON from mixed content response', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: 'Sample resume text',
        messages: []
      })

      const validJSON = {
        contact_info: { name: 'Test', email: null, phone: null, location: null, linkedin: null, github: null },
        skills: ['JavaScript'],
        experience: [],
        education: [],
        summary: null
      }

      const mockAIResponse = {
        choices: [{
          message: {
            content: `Here is the parsed data:\n${JSON.stringify(validJSON)}\nThank you!`
          }
        }]
      }

      mockCreate.mockResolvedValue(mockAIResponse)

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.parsedData.contact_info.name).toBe('Test')
      expect(result.parsedData.skills).toEqual(['JavaScript'])
    })
  })

  describe('Data validation and cleaning', () => {
    it('should validate and clean parsed data structure', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: 'Sample text',
        messages: []
      })

      // Mock response with some invalid/missing fields
      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              contact_info: {
                name: 'Test User',
                email: 'test@example.com',
                // Missing other fields
              },
              skills: ['Valid Skill', '', null, 'Another Skill'], // Mixed valid/invalid
              experience: [
                {
                  company: 'Company A',
                  position: 'Developer',
                  // Missing dates and other fields
                },
                {
                  // Missing company
                  position: 'Manager',
                  start_date: '2020-01',
                  skills_used: 'Not an array' // Invalid type
                }
              ],
              education: [
                {
                  institution: 'University',
                  degree: 'Bachelor',
                  // Missing other fields
                }
              ],
              // Missing summary
            })
          }
        }]
      }

      mockCreate.mockResolvedValue(mockAIResponse)

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      // Verify data cleaning
      expect(result.parsedData.contact_info.name).toBe('Test User')
      expect(result.parsedData.contact_info.phone).toBeNull()
      expect(result.parsedData.skills).toEqual(['Valid Skill', 'Another Skill']) // Empty/null filtered
      expect(result.parsedData.experience).toHaveLength(2)
      expect(result.parsedData.experience[0].company).toBe('Company A')
      expect(result.parsedData.experience[1].company).toBe('Unknown Company') // Default value
      expect(result.parsedData.experience[1].skills_used).toEqual([]) // Invalid type converted
      expect(result.parsedData.summary).toBeNull()
    })
  })

  describe('File type validation', () => {
    it('should reject unsupported file types', async () => {
      const fileBuffer = Buffer.from('text content')
      const result = await parseResume(fileBuffer, 'text/plain')

      expect(result.error).toBe('Unsupported file type')
      expect(result.rawText).toBe('')
      expect(result.parsedData.contact_info.name).toBeNull()
    })

    it('should handle empty text content', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: '',
        messages: []
      })

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.error).toBe('No text content found in file')
      expect(result.rawText).toBe('')
    })

    it('should handle whitespace-only content', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: '   \n\t  \n  ',
        messages: []
      })

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.error).toBe('No text content found in file')
    })
  })

  describe('Fallback parsing', () => {
    it('should extract basic contact info when AI fails', async () => {
      const resumeText = `
        John Developer
        john.developer@tech.com
        +1 (555) 123-4567
        linkedin.com/in/john-developer
        github.com/johndev
        
        Skills: JavaScript, Python, React, Node.js, AWS, Docker
        
        Experience:
        Senior Developer at Tech Corp (2020-present)
        Junior Developer at StartupCo (2018-2020)
      `

      mockMammoth.extractRawText.mockResolvedValue({
        value: resumeText,
        messages: []
      })

      mockCreate.mockRejectedValue(new Error('AI failed'))
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.parsedData.contact_info.name).toBe('John Developer')
      expect(result.parsedData.contact_info.email).toBe('john.developer@tech.com')
      expect(result.parsedData.contact_info.phone).toContain('555')
      expect(result.parsedData.contact_info.linkedin).toBe('https://linkedin.com/in/john-developer')
      expect(result.parsedData.contact_info.github).toBe('https://github.com/johndev')
      
      // Should extract common skills
      expect(result.parsedData.skills).toContain('JavaScript')
      expect(result.parsedData.skills).toContain('Python')
      expect(result.parsedData.skills).toContain('React')
      expect(result.parsedData.skills).toContain('Node.js')
      expect(result.parsedData.skills).toContain('AWS')
      expect(result.parsedData.skills).toContain('Docker')

      jest.restoreAllMocks()
    })

    it('should handle resume with no recognizable patterns', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: 'Some random text without identifiable patterns',
        messages: []
      })

      mockCreate.mockRejectedValue(new Error('AI failed'))
      jest.spyOn(console, 'error').mockImplementation(() => {})

      const fileBuffer = Buffer.from('DOCX content')
      const result = await parseResume(fileBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result.parsedData.contact_info.name).toBe('Some random text without identifiable patterns')
      expect(result.parsedData.contact_info.email).toBeNull()
      expect(result.parsedData.skills).toEqual([])

      jest.restoreAllMocks()
    })
  })
})