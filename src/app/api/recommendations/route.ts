import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check if we're in SIMPLE mode (no database)
  const isSimpleMode = !!process.env.NVIDIA_API_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (isSimpleMode) {
    return NextResponse.json(
      { 
        error: 'This feature requires database authentication',
        message: 'Recommendations API is not available in simple mode. Use /api/simple-analyze and /api/simple-jobs instead.'
      },
      { status: 503 }
    )
  }

  try {
    // Dynamic imports for FULL mode only
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { generateJobRecommendations, generateEmbedding } = await import('@/lib/groq')
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

    // Get user's most recent resume
    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('id, raw_text, parsed_data, embedding')
      .eq('user_id', appUser.id)
      .eq('is_active', true)
      .order('upload_date', { ascending: false })
      .limit(1)
      .single()

    if (!resume) {
      return NextResponse.json(
        { recommendations: [] },
        { status: 200 }
      )
    }

    // Check if we have recent recommendations
    const { data: existingRecommendations } = await supabaseAdmin
      .from('job_recommendations')
      .select(`
        id,
        job_id,
        match_score,
        skills_match,
        experience_match,
        reasoning,
        created_at,
        jobs!inner (
          id,
          title,
          description,
          requirements,
          preferred_skills,
          location,
          job_type,
          salary_min,
          salary_max,
          companies!inner (
            name
          )
        )
      `)
      .eq('user_id', appUser.id)
      .eq('resume_id', resume.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('match_score', { ascending: false })
      .limit(10)

    if (existingRecommendations && existingRecommendations.length > 0) {
      const formattedRecommendations = existingRecommendations.map((rec: any) => ({
        id: rec.id,
        job_title: rec.jobs?.title || 'Unknown Title',
        company: rec.jobs?.companies?.name || 'Unknown Company',
        location: rec.jobs?.location,
        job_type: rec.jobs?.job_type,
        salary_range: rec.jobs?.salary_min && rec.jobs?.salary_max 
          ? `$${rec.jobs.salary_min.toLocaleString()} - $${rec.jobs.salary_max.toLocaleString()}`
          : null,
        requirements: rec.jobs?.requirements || [],
        description: rec.jobs?.description || '',
        match_score: rec.match_score,
        skills_match: rec.skills_match || [],
        experience_match: rec.experience_match,
        created_at: rec.created_at
      }))

      return NextResponse.json({ recommendations: formattedRecommendations })
    }

    // Generate new recommendations
    await generateRecommendationsForUser(appUser.id, resume, supabaseAdmin, generateJobRecommendations)

    // Fetch the newly generated recommendations
    const { data: newRecommendations } = await supabaseAdmin
      .from('job_recommendations')
      .select(`
        id,
        job_id,
        match_score,
        skills_match,
        experience_match,
        reasoning,
        created_at,
        jobs!inner (
          id,
          title,
          description,
          requirements,
          preferred_skills,
          location,
          job_type,
          salary_min,
          salary_max,
          companies!inner (
            name
          )
        )
      `)
      .eq('user_id', appUser.id)
      .eq('resume_id', resume.id)
      .order('match_score', { ascending: false })
      .limit(10)

    const formattedRecommendations = (newRecommendations || []).map((rec: any) => ({
      id: rec.id,
      job_title: rec.jobs?.title || 'Unknown Title',
      company: rec.jobs?.companies?.name || 'Unknown Company',
      location: rec.jobs?.location,
      job_type: rec.jobs?.job_type,
      salary_range: rec.jobs?.salary_min && rec.jobs?.salary_max 
        ? `$${rec.jobs.salary_min.toLocaleString()} - $${rec.jobs.salary_max.toLocaleString()}`
        : null,
      requirements: rec.jobs?.requirements || [],
      description: rec.jobs?.description || '',
      match_score: rec.match_score,
      skills_match: rec.skills_match || [],
      experience_match: rec.experience_match,
      created_at: rec.created_at
    }))

    return NextResponse.json({ recommendations: formattedRecommendations })

  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateRecommendationsForUser(userId: string, resume: any, supabaseAdmin: any, generateJobRecommendations: any) {
  try {
    // Get available jobs
    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        description,
        requirements,
        preferred_skills,
        required_skills,
        location,
        job_type,
        salary_min,
        salary_max,
        experience_level,
        embedding,
        companies!inner (
          name
        )
      `)
      .eq('is_active', true)
      .limit(20) // Limit for initial recommendations

    if (!jobs || jobs.length === 0) {
      return
    }

    // Use vector similarity for initial filtering if embeddings exist
    let candidateJobs = jobs
    if (resume.embedding) {
      // Find jobs with similar embeddings (implement vector similarity search)
      candidateJobs = jobs.slice(0, 10) // For now, take first 10
    }

    // Get AI-powered recommendations
    const jobDescriptions = candidateJobs.map((job: any) => 
      `${job.title} at ${job.companies?.name}: ${job.description}`
    )

    const { scores, reasoning } = await generateJobRecommendations(
      resume.raw_text,
      jobDescriptions
    )

    // Save recommendations
    const recommendations = candidateJobs.map((job: any, index: number) => ({
      user_id: userId,
      resume_id: resume.id,
      job_id: job.id,
      match_score: scores[index] || 0.5,
      skills_match: getMatchingSkills(
        resume.parsed_data?.skills || [],
        [...(job.required_skills || []), ...(job.preferred_skills || [])]
      ),
      experience_match: checkExperienceMatch(
        resume.parsed_data,
        job.experience_level
      ),
      reasoning: reasoning[index] || 'AI-generated match'
    }))

    // Filter out low-scoring recommendations
    const goodRecommendations = recommendations.filter((rec: any) => rec.match_score >= 0.3)

    if (goodRecommendations.length > 0) {
      await supabaseAdmin
        .from('job_recommendations')
        .insert(goodRecommendations)
    }

  } catch (error) {
    console.error('Error generating recommendations:', error)
  }
}

function getMatchingSkills(userSkills: string[], jobSkills: string[]): string[] {
  const userSkillsLower = userSkills.map((skill: string) => skill.toLowerCase())
  const jobSkillsLower = jobSkills.map((skill: string) => skill.toLowerCase())
  
  return userSkills.filter((skill: string) => 
    jobSkillsLower.some((jobSkill: string) => 
      jobSkill.includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(jobSkill)
    )
  )
}

function checkExperienceMatch(parsedData: any, requiredLevel: string): boolean {
  if (!parsedData?.experience || !requiredLevel) return true
  
  const experienceYears = parsedData.experience.length
  
  switch (requiredLevel.toLowerCase()) {
    case 'entry':
      return experienceYears >= 0
    case 'mid':
      return experienceYears >= 2
    case 'senior':
      return experienceYears >= 5
    case 'executive':
      return experienceYears >= 10
    default:
      return true
  }
}