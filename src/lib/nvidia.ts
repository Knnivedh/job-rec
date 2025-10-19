/**
 * NVIDIA AI Integration
 * Uses NVIDIA's API Catalog for Llama 3.1 models
 */

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || ''
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

export const NVIDIA_MODELS = {
  LLAMA_31_8B: 'meta/llama-3.1-8b-instruct',
  LLAMA_31_70B: 'meta/llama-3.1-70b-instruct',
  LLAMA_31_405B: 'meta/llama-3.1-405b-instruct'
}

interface NvidiaResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/**
 * General NVIDIA chat function
 */
export async function nvidiaChat(
  prompt: string,
  model: string = NVIDIA_MODELS.LLAMA_31_8B
): Promise<string> {
  try {
    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`NVIDIA API error: ${response.status} - ${error}`)
    }

    const data: NvidiaResponse = await response.json()
    return data.choices[0]?.message?.content || 'No response from AI'

  } catch (error) {
    console.error('NVIDIA chat error:', error)
    throw error
  }
}

/**
 * Parse resume with NVIDIA AI
 */
export async function parseResumeWithNvidia(
  buffer: Buffer,
  fileType: string
): Promise<any> {
  try {
    // First, extract text from the resume
    let text = ''
    
    if (fileType === 'application/pdf') {
      // Use pdf-parse library
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Use mammoth for DOCX
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      throw new Error('Unsupported file type')
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Could not extract text from resume')
    }

    // Parse with NVIDIA AI
    const prompt = `
You are an expert resume parser. Extract structured information from this resume.

Resume Text:
${text}

Extract and return ONLY a valid JSON object with this structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 - Present",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "2020"
    }
  ],
  "summary": "Professional summary",
  "rawText": "${text.substring(0, 500)}..."
}

Return ONLY the JSON, no other text.
`

    const response = await nvidiaChat(prompt)
    
    // Try to parse JSON from response
    let parsedData
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        parsedData = JSON.parse(response)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      // Return basic structure with raw text
      parsedData = {
        rawText: text,
        skills: extractSkillsBasic(text),
        experience: [],
        education: [],
        summary: text.substring(0, 200) + '...'
      }
    }

    // Ensure rawText is included
    if (!parsedData.rawText) {
      parsedData.rawText = text
    }

    return parsedData

  } catch (error) {
    console.error('Resume parsing error:', error)
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate job recommendations with NVIDIA AI
 */
export async function generateJobRecommendationsWithNvidia(
  resumeData: any,
  jobCount: number = 5
): Promise<any[]> {
  try {
    const skills = resumeData.skills?.join(', ') || 'general skills'
    const experience = resumeData.experience?.[0]?.title || 'professional'

    const prompt = `
Based on this resume profile:
- Skills: ${skills}
- Latest Position: ${experience}
- Experience: ${resumeData.experience?.length || 0} positions

Recommend ${jobCount} suitable job titles that match this profile.
Return as a simple comma-separated list of job titles, nothing else.
`

    const response = await nvidiaChat(prompt)
    const jobTitles = response.split(',').map((s: string) => s.trim()).filter((s: string) => s)

    return jobTitles.slice(0, jobCount).map((title: string, idx: number) => ({
      id: `job-${idx}`,
      title,
      company: 'Multiple Companies',
      match_score: 0.8 - (idx * 0.1),
      skills_match: resumeData.skills?.slice(0, 3) || [],
      description: `Position matching your profile as ${experience}`
    }))

  } catch (error) {
    console.error('Job recommendation error:', error)
    return []
  }
}

/**
 * Analyze skill gap with NVIDIA AI
 */
export async function analyzeSkillGapWithNvidia(
  userSkills: string[],
  jobRequirements: string[]
): Promise<any> {
  try {
    const prompt = `
User has these skills: ${userSkills.join(', ')}
Job requires: ${jobRequirements.join(', ')}

Analyze the skill gap. Return JSON:
{
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "recommendations": ["Learn X", "Improve Y"]
}

Return ONLY the JSON.
`

    const response = await nvidiaChat(prompt)
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(response)
    } catch {
      return {
        matching_skills: userSkills.filter((s: string) => 
          jobRequirements.some((r: string) => 
            r.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(r.toLowerCase())
          )
        ),
        missing_skills: jobRequirements.filter((r: string) =>
          !userSkills.some((s: string) =>
            s.toLowerCase().includes(r.toLowerCase()) ||
            r.toLowerCase().includes(s.toLowerCase())
          )
        ),
        recommendations: ['Review job requirements and enhance relevant skills']
      }
    }

  } catch (error) {
    console.error('Skill gap analysis error:', error)
    return {
      matching_skills: [],
      missing_skills: [],
      recommendations: []
    }
  }
}

/**
 * Check NVIDIA API health
 */
export async function checkNvidiaHealth(): Promise<boolean> {
  try {
    const response = await nvidiaChat('Hello', NVIDIA_MODELS.LLAMA_31_8B)
    return !!response
  } catch {
    return false
  }
}

/**
 * Basic skill extraction fallback
 */
function extractSkillsBasic(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'TypeScript', 'Angular', 'Vue', 'Django', 'Flask', 'Spring',
    'Machine Learning', 'AI', 'Data Science', 'DevOps',
    'Agile', 'Scrum', 'REST API', 'GraphQL', 'CI/CD'
  ]

  return commonSkills.filter((skill: string) =>
    text.toLowerCase().includes(skill.toLowerCase())
  )
}

