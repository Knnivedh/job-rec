import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(request: NextRequest) {
  try {
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