import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Detect mode: SIMPLE (NVIDIA only) or FULL (Supabase + GROQ)
    const isSimpleMode = !!process.env.NVIDIA_API_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (isSimpleMode) {
      // SIMPLE MODE - No database, just NVIDIA AI
      const hasNvidiaKey = !!process.env.NVIDIA_API_KEY
      const hasRapidApiKey = !!process.env.RAPIDAPI_KEY
      
      return NextResponse.json({
        status: 'OK',
        mode: 'SIMPLE',
        message: 'AI Resume Analyzer - Simple Mode (No Database)',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        services: {
          nvidia_ai: hasNvidiaKey ? 'Configured' : 'Missing API Key',
          job_search: hasRapidApiKey ? 'Configured' : 'Missing API Key'
        },
        endpoints: {
          analyze: '/api/simple-analyze',
          jobs: '/api/simple-jobs'
        },
        features: [
          'AI Resume Analysis',
          'Real Job Search',
          'AI Career Coach',
          'ATS Scoring'
        ]
      })
    } else {
      // FULL MODE - With Supabase
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'GROQ_API_KEY'
      ]

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
      
      if (missingVars.length > 0) {
        return NextResponse.json({
          error: 'Missing environment variables',
          missing: missingVars
        }, { status: 500 })
      }

      // Test Supabase connection (only in full mode)
      let supabaseStatus = 'OK'
      let storageStatus = 'OK'
      
      try {
        const { supabaseAdmin } = await import('@/lib/supabase')
        
        // Test database
        const { data, error } = await supabaseAdmin
          .from('app_users')
          .select('count')
          .limit(1)
        
        if (error) {
          supabaseStatus = `Database Error: ${error.message}`
        }

        // Test storage
        const { data: storageData, error: storageError } = await supabaseAdmin.storage
          .from('resumes')
          .list('', { limit: 1 })
        
        if (storageError) {
          storageStatus = `Storage Error: ${storageError.message}`
        }
      } catch (dbError) {
        supabaseStatus = `Connection Failed: ${dbError}`
      }

      return NextResponse.json({
        status: 'OK',
        mode: 'FULL',
        message: 'AI Resume Matcher API is working',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        services: {
          database: supabaseStatus,
          storage: storageStatus
        },
        endpoints: {
          resumes: '/api/resumes',
          recommendations: '/api/recommendations',
          feedback: '/api/recommendations/feedback'
        }
      })
    }

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}