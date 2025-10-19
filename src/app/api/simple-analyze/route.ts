import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithNvidia } from '@/lib/nvidia'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse resume with NVIDIA AI
    const analysis = await parseResumeWithNvidia(buffer, file.type)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Resume analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

