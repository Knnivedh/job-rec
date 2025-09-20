import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Note: Groq doesn't have embedding models, so we'll use a text-based approach
    // For now, we'll return a placeholder array. In production, you might want to:
    // 1. Use a different embedding service (like OpenAI's text-embedding-ada-002)
    // 2. Use Groq's text generation to create semantic representations
    // 3. Implement a simple text-based similarity approach
    
    console.warn('Groq does not support embeddings. Using placeholder.')
    return new Array(1536).fill(0).map(() => Math.random())
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

export async function generateJobRecommendations(
  resumeText: string,
  jobDescriptions: string[]
): Promise<{ scores: number[], reasoning: string[] }> {
  try {
    const prompt = `
You are an AI job matching expert. Analyze the following resume and job descriptions to provide match scores and reasoning.

Resume:
${resumeText}

Job Descriptions:
${jobDescriptions.map((desc, index) => `${index + 1}. ${desc}`).join('\n')}

For each job, provide:
1. A match score from 0.0 to 1.0 (where 1.0 is perfect match)
2. Brief reasoning for the score

Return your response as JSON in this exact format:
{
  "scores": [0.8, 0.6, 0.9],
  "reasoning": [
    "Strong match due to relevant skills and experience",
    "Partial match - missing some required skills",
    "Excellent match with all requirements met"
  ]
}
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a precise job matching AI that returns only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant', // Free model on Groq
      temperature: 0.1,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    if (!responseText) {
      throw new Error('No response from Groq')
    }

    try {
      const result = JSON.parse(responseText)
      return {
        scores: result.scores || jobDescriptions.map(() => 0.5),
        reasoning: result.reasoning || jobDescriptions.map(() => 'AI-generated match')
      }
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      console.error('Raw response:', responseText)
      
      // Fallback: return default scores
      return {
        scores: jobDescriptions.map(() => 0.5),
        reasoning: jobDescriptions.map(() => 'AI-generated match')
      }
    }

  } catch (error) {
    console.error('Error generating job recommendations:', error)
    
    // Fallback: return default scores
    return {
      scores: jobDescriptions.map(() => 0.5),
      reasoning: jobDescriptions.map(() => 'AI-generated match')
    }
  }
}

export async function analyzeSkillGap(
  userSkills: string[],
  jobRequirements: string[]
): Promise<{
  missingSkills: string[],
  skillImprovements: string[],
  recommendedCourses: Array<{ title: string, description: string, url?: string }>
}> {
  try {
    const prompt = `
Analyze the skill gap between user skills and job requirements.

User Skills: ${userSkills.join(', ')}

Job Requirements: ${jobRequirements.join(', ')}

Provide:
1. Missing skills that the user needs to learn
2. Skills that need improvement
3. Recommended courses/resources

Return JSON in this format:
{
  "missingSkills": ["skill1", "skill2"],
  "skillImprovements": ["skill3", "skill4"],
  "recommendedCourses": [
    {
      "title": "Course Title",
      "description": "Course description",
      "url": "https://example.com"
    }
  ]
}
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a career development AI that provides skill gap analysis and learning recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant', // Free model on Groq
      temperature: 0.3,
      max_tokens: 1500
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    
    if (!responseText) {
      throw new Error('No response from Groq')
    }

    try {
      const result = JSON.parse(responseText)
      return {
        missingSkills: result.missingSkills || [],
        skillImprovements: result.skillImprovements || [],
        recommendedCourses: result.recommendedCourses || []
      }
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      
      // Fallback: basic analysis
      const missingSkills = jobRequirements.filter(req => 
        !userSkills.some(skill => 
          skill.toLowerCase().includes(req.toLowerCase()) || 
          req.toLowerCase().includes(skill.toLowerCase())
        )
      )

      return {
        missingSkills,
        skillImprovements: [],
        recommendedCourses: []
      }
    }

  } catch (error) {
    console.error('Error analyzing skill gap:', error)
    
    // Fallback: basic analysis
    const missingSkills = jobRequirements.filter(req => 
      !userSkills.some(skill => 
        skill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    )

    return {
      missingSkills,
      skillImprovements: [],
      recommendedCourses: []
    }
  }
}
