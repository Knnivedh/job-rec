import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Check if we're in SIMPLE mode (no database)
  const isSimpleMode = !!process.env.NVIDIA_API_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (isSimpleMode) {
    return NextResponse.json(
      { 
        error: 'This feature requires database authentication',
        message: 'Feedback system is not available in simple mode'
      },
      { status: 503 }
    )
  }

  try {
    // Dynamic imports for FULL mode only
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { cookies } = await import('next/headers')
    const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
    
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's app_user record
    const { data: appUser } = await supabaseAdmin
      .from('app_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!appUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const { recommendation_id, feedback_type, feedback_reason } = await request.json()

    if (!recommendation_id || !feedback_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate feedback type
    const validFeedbackTypes = ['like', 'dislike', 'applied', 'not_interested', 'saved']
    if (!validFeedbackTypes.includes(feedback_type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      )
    }

    // Save feedback
    const { data, error } = await supabaseAdmin
      .from('recommendation_feedback')
      .insert({
        user_id: appUser.id,
        recommendation_id,
        feedback_type,
        feedback_reason: feedback_reason || null
      })
      .select()
      .single()

    if (error) {
      console.error('Feedback save error:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Feedback saved successfully',
      feedback: data
    })

  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}