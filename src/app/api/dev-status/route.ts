import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'OK',
    message: 'Local development mode - Database setup required',
    instructions: 'Please apply the database schema from /database/schema.sql to your Supabase project',
    setup_guide: '/DATABASE_SETUP_REQUIRED.md',
    next_steps: [
      '1. Go to your Supabase dashboard',
      '2. Open SQL Editor',
      '3. Copy and paste the content from database/schema.sql',
      '4. Run the SQL to create all tables',
      '5. Create a storage bucket named "resumes"',
      '6. Refresh this page to test the setup'
    ]
  })
}

export async function POST(request: NextRequest) {
  try {
    // Mock response for development without database
    return NextResponse.json({
      error: 'Database setup required',
      message: 'Please apply the database schema first',
      setup_guide: '/DATABASE_SETUP_REQUIRED.md'
    }, { status: 503 })
  } catch (error) {
    return NextResponse.json({
      error: 'Development mode - Database not configured',
      details: 'Apply schema.sql to enable full functionality'
    }, { status: 503 })
  }
}