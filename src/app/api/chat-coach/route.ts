import { NextRequest, NextResponse } from 'next/server'
import { nvidiaChat } from '@/lib/nvidia'

export async function POST(request: NextRequest) {
  try {
    const { message, resumeData } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build context from resume data
    const context = `
Resume Analysis:
- Skills: ${resumeData?.skills?.join(', ') || 'None'}
- Experience: ${resumeData?.experience?.length || 0} positions
- Education: ${resumeData?.education?.length || 0} degrees

User Question: ${message}

Please provide helpful, specific advice based on this resume data.
`

    // Get response from NVIDIA AI
    const response = await nvidiaChat(context)

    // Calculate ATS score if requested
    let atsScore = null
    if (message.toLowerCase().includes('ats') || message.toLowerCase().includes('score')) {
      atsScore = calculateATSScore(resumeData)
    }

    return NextResponse.json({
      success: true,
      response,
      atsScore
    })

  } catch (error) {
    console.error('Chat coach error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function calculateATSScore(resumeData: any): number {
  let score = 0
  const maxScore = 100

  // Contact info (10 points)
  if (resumeData?.contact?.email) score += 5
  if (resumeData?.contact?.phone) score += 5

  // Skills (25 points)
  const skillCount = resumeData?.skills?.length || 0
  score += Math.min(skillCount * 2.5, 25)

  // Experience (25 points)
  const expCount = resumeData?.experience?.length || 0
  score += Math.min(expCount * 12.5, 25)

  // Education (15 points)
  const eduCount = resumeData?.education?.length || 0
  score += Math.min(eduCount * 7.5, 15)

  // Keywords (15 points)
  const textLength = JSON.stringify(resumeData).length
  if (textLength > 500) score += 7.5
  if (textLength > 1000) score += 7.5

  // Summary/Objective (10 points)
  if (resumeData?.summary || resumeData?.objective) score += 10

  return Math.round(Math.min(score, maxScore))
}

