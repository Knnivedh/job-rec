import mammoth from 'mammoth'
import Groq from 'groq-sdk'
import { ParsedResumeData, ContactInfo, WorkExperience, Education } from './supabase'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
})

export interface ParseResult {
  rawText: string
  parsedData: ParsedResumeData
  error?: string
}

export async function parseResume(fileBuffer: Buffer, fileType: string): Promise<ParseResult> {
  try {
    let rawText: string

    // Extract text based on file type
    if (fileType === 'application/pdf') {
      // Dynamic import to avoid build-time issues
      const pdfParse = await import('pdf-parse')
      const pdfData = await pdfParse.default(fileBuffer)
      rawText = pdfData.text
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer })
      rawText = docxData.value
    } else {
      return {
        rawText: '',
        parsedData: getEmptyParsedData(),
        error: 'Unsupported file type'
      }
    }

    if (!rawText.trim()) {
      return {
        rawText: '',
        parsedData: getEmptyParsedData(),
        error: 'No text content found in file'
      }
    }

    // Parse structured data using OpenAI
    const parsedData = await parseResumeWithAI(rawText)

    return {
      rawText: rawText.trim(),
      parsedData,
    }

  } catch (error) {
    console.error('Resume parsing error:', error)
    return {
      rawText: '',
      parsedData: getEmptyParsedData(),
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    }
  }
}

async function parseResumeWithAI(rawText: string): Promise<ParsedResumeData> {
  try {
    const prompt = `
You are a resume parser. Parse the following resume text and extract structured information in JSON format.

Extract the following information:
1. contact_info: name, email, phone, location, linkedin, github
2. skills: array of technical and soft skills mentioned
3. experience: array of work experiences with company, position, start_date, end_date, description, skills_used
4. education: array of educational background with institution, degree, field_of_study, graduation_date
5. summary: brief professional summary or objective (if present)

Important guidelines:
- For dates, use formats like "2020-01", "2023-12", or "2023" if only year is available
- If a field is not found, use null or empty array as appropriate
- Extract skills mentioned throughout the resume, not just from a skills section
- For skills_used in experience, extract relevant technical skills for each role
- Keep descriptions concise but informative
- If current job, use null for end_date

Resume text:
${rawText}

Return only valid JSON in this exact format:
{
  "contact_info": {
    "name": "string or null",
    "email": "string or null", 
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null"
  },
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "string",
      "position": "string", 
      "start_date": "YYYY-MM or YYYY or null",
      "end_date": "YYYY-MM or YYYY or null",
      "description": "string or null",
      "skills_used": ["skill1", "skill2", ...]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field_of_study": "string or null", 
      "graduation_date": "YYYY-MM or YYYY or null"
    }
  ],
  "summary": "string or null"
}
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a precise resume parser that returns only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant", // Free model on Groq
      temperature: 0.1,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    if (!responseText) {
      throw new Error('No response from Groq')
    }

    // Try to parse JSON response
    let parsedData: ParsedResumeData
    try {
      parsedData = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      console.error('Raw response:', responseText)
      
      // Fallback: try to extract JSON from response if it contains other text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from AI parser')
      }
    }

    // Validate and clean the parsed data
    return validateAndCleanParsedData(parsedData)

  } catch (error) {
    console.error('AI parsing error:', error)
    
    // Fallback to basic parsing if AI fails
    return fallbackParsing(rawText)
  }
}

function validateAndCleanParsedData(data: any): ParsedResumeData {
  const result: ParsedResumeData = {
    contact_info: {
      name: data.contact_info?.name || null,
      email: data.contact_info?.email || null,
      phone: data.contact_info?.phone || null,
      location: data.contact_info?.location || null,
      linkedin: data.contact_info?.linkedin || null,
      github: data.contact_info?.github || null,
    },
    skills: Array.isArray(data.skills) ? data.skills.filter((skill: any) => typeof skill === 'string' && skill.trim()) : [],
    experience: Array.isArray(data.experience) ? data.experience.map((exp: any) => ({
      company: exp.company || 'Unknown Company',
      position: exp.position || 'Unknown Position',
      start_date: exp.start_date || null,
      end_date: exp.end_date || null,
      description: exp.description || null,
      skills_used: Array.isArray(exp.skills_used) ? exp.skills_used : []
    })) : [],
    education: Array.isArray(data.education) ? data.education.map((edu: any) => ({
      institution: edu.institution || 'Unknown Institution',
      degree: edu.degree || 'Unknown Degree',
      field_of_study: edu.field_of_study || null,
      graduation_date: edu.graduation_date || null,
    })) : [],
    summary: data.summary || null
  }

  return result
}

function fallbackParsing(rawText: string): ParsedResumeData {
  // Basic fallback parsing using regex patterns
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line)
  
  const result: ParsedResumeData = {
    contact_info: extractContactInfo(rawText),
    skills: extractSkillsBasic(rawText),
    experience: [],
    education: [],
    summary: null
  }

  return result
}

function extractContactInfo(text: string): ContactInfo {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  const phoneMatch = text.match(/[\+]?[1-9]?[\d\s\-\(\)\.]{10,15}/)
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w\-]+/)
  const githubMatch = text.match(/github\.com\/[\w\-]+/)
  
  // Try to find name (usually in the first few lines)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  const nameCandidate = lines[0] || null
  
  return {
    name: nameCandidate,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    location: null, // Hard to extract reliably with simple regex
    linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : null,
    github: githubMatch ? `https://${githubMatch[0]}` : null,
  }
}

function extractSkillsBasic(text: string): string[] {
  // Common programming languages and technologies
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Next.js',
    'HTML', 'CSS', 'SCSS', 'Tailwind',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Jenkins', 'Linux',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
  ]

  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  )

  return foundSkills
}

function getEmptyParsedData(): ParsedResumeData {
  return {
    contact_info: {
      name: null,
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
    },
    skills: [],
    experience: [],
    education: [],
    summary: null
  }
}