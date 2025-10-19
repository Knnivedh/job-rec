import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Check if we're in SIMPLE mode (no database)
  const isSimpleMode = !!process.env.NVIDIA_API_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (isSimpleMode) {
    return NextResponse.json(
      { 
        error: 'This feature requires database authentication',
        message: 'Resumes API is not available in simple mode. Use /api/simple-analyze instead.'
      },
      { status: 503 }
    )
  }

  try {
    // Dynamic imports for FULL mode only
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { parseResume } = await import('@/lib/resume-parser')
    const { generateEmbedding } = await import('@/lib/groq')
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

    // Get or create user's app_user record
    let { data: appUser } = await supabaseAdmin
      .from('app_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    // If user profile doesn't exist, create it
    if (!appUser) {
      const { data: newAppUser, error: createError } = await supabaseAdmin
        .from('app_users')
        .insert({
          auth_user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        console.error('User data:', {
          auth_user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        })
        return NextResponse.json(
          { error: `Failed to create user profile: ${createError.message}` },
          { status: 500 }
        )
      }

      appUser = newAppUser
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX files are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get file buffer for parsing
    const fileBuffer = await file.arrayBuffer()
    
    // Parse resume content
    const { rawText, parsedData, error: parseError } = await parseResume(
      Buffer.from(fileBuffer),
      file.type
    )

    if (parseError) {
      // Clean up uploaded file if parsing failed
      await supabaseAdmin.storage.from('resumes').remove([fileName])
      
      return NextResponse.json(
        { error: `Failed to parse resume: ${parseError}` },
        { status: 400 }
      )
    }

    // Generate embedding for the resume
    const embedding = await generateEmbedding(
      `${parsedData.summary || ''} ${rawText}`.substring(0, 8000) // Limit text for embedding
    )

    // Get file URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('resumes')
      .getPublicUrl(fileName)

    // Save resume data to database
    const { data: resumeData, error: dbError } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id: appUser.id,
        file_name: file.name,
        file_type: file.type === 'application/pdf' ? 'pdf' : 'docx',
        file_size: file.size,
        file_url: publicUrl,
        raw_text: rawText,
        parsed_data: parsedData,
        embedding: embedding
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file if database save failed
      await supabaseAdmin.storage.from('resumes').remove([fileName])
      
      return NextResponse.json(
        { error: 'Failed to save resume data' },
        { status: 500 }
      )
    }

    // Extract and save user skills
    if (parsedData.skills && parsedData.skills.length > 0) {
      await saveUserSkills(appUser.id, parsedData.skills, resumeData.id, supabaseAdmin)
    }

    return NextResponse.json({
      message: 'Resume uploaded and processed successfully',
      resume: {
        id: resumeData.id,
        fileName: resumeData.file_name,
        parsedData: resumeData.parsed_data,
        uploadDate: resumeData.upload_date
      }
    })

  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function saveUserSkills(userId: string, skills: string[], resumeId: string, supabaseAdmin: any) {
  try {
    // First, get or create skill records
    const skillPromises = skills.map(async (skillName) => {
      const { data: existingSkill } = await supabaseAdmin
        .from('skills')
        .select('id')
        .ilike('name', skillName)
        .single()

      if (existingSkill) {
        return existingSkill.id
      }

      // Create new skill if it doesn't exist
      const { data: newSkill } = await supabaseAdmin
        .from('skills')
        .insert({
          name: skillName,
          category: 'other' // Will be categorized later
        })
        .select('id')
        .single()

      return newSkill?.id
    })

    const skillIds = await Promise.all(skillPromises)
    const validSkillIds = skillIds.filter(id => id)

    // Save user skills
    const userSkillsData = validSkillIds.map(skillId => ({
      user_id: userId,
      skill_id: skillId,
      proficiency_level: 'intermediate', // Default level, can be improved later
      source: 'resume'
    }))

    if (userSkillsData.length > 0) {
      await supabaseAdmin
        .from('user_skills')
        .upsert(userSkillsData, {
          onConflict: 'user_id,skill_id',
          ignoreDuplicates: false
        })
    }

  } catch (error) {
    console.error('Error saving user skills:', error)
    // Don't throw error as this is not critical for resume upload
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's resumes
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select(`
        id,
        file_name,
        file_type,
        file_size,
        parsed_data,
        upload_date,
        is_active
      `)
      .eq('is_active', true)
      .order('upload_date', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch resumes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ resumes })

  } catch (error) {
    console.error('Get resumes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}