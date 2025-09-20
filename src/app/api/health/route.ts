import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables
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

    // Test Supabase connection
    let supabaseStatus = 'OK'
    try {
      const { data, error } = await supabaseAdmin
        .from('app_users')
        .select('count')
        .limit(1)
      
      if (error) {
        supabaseStatus = `Database Error: ${error.message}`
      }
    } catch (dbError) {
      supabaseStatus = `Database Connection Failed: ${dbError}`
    }

    // Test storage bucket
    let storageStatus = 'OK'
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('resumes')
        .list('', { limit: 1 })
      
      if (error) {
        storageStatus = `Storage Error: ${error.message}`
      }
    } catch (storageError) {
      storageStatus = `Storage Connection Failed: ${storageError}`
    }

    // Test basic functionality
    return NextResponse.json({
      status: 'OK',
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

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}