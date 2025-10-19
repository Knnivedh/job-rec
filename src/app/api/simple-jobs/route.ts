import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { skills, experience, location } = await request.json()

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Skills array is required' },
        { status: 400 }
      )
    }

    // Search real jobs using RapidAPI
    const jobs = await searchRealJobs(skills, experience, location || 'United States')

    return NextResponse.json({
      success: true,
      jobs
    })

  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function searchRealJobs(skills: string[], experience: any, location: string) {
  const rapidApiKey = process.env.RAPIDAPI_KEY

  if (!rapidApiKey) {
    console.warn('RAPIDAPI_KEY not configured, returning mock data')
    return []
  }

  try {
    // Determine job role from skills
    const jobRole = skills[0] || 'Software Engineer'
    
    // JSearch API (Indeed, LinkedIn, Glassdoor aggregator)
    const jsearchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(jobRole + ' ' + location)}&page=1&num_pages=1`
    
    const response = await fetch(jsearchUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      throw new Error(`JSearch API failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.data && Array.isArray(data.data)) {
      return data.data.slice(0, 10).map((job: any) => ({
        title: job.job_title || 'Unknown Title',
        company: job.employer_name || 'Unknown Company',
        location: job.job_city && job.job_state 
          ? `${job.job_city}, ${job.job_state}` 
          : job.job_country || 'Remote',
        description: job.job_description || '',
        requirements: job.job_required_skills || [],
        salary: job.job_salary || null,
        type: job.job_employment_type || 'Full-time',
        url: job.job_apply_link || job.job_google_link || '#',
        posted: job.job_posted_at_datetime_utc || new Date().toISOString(),
        match_score: calculateMatchScore(skills, job.job_required_skills || [])
      }))
    }

    return []

  } catch (error) {
    console.error('Real job search failed:', error)
    return []
  }
}

function calculateMatchScore(userSkills: string[], jobSkills: string[]): number {
  if (!jobSkills || jobSkills.length === 0) return 0.5
  
  const userSkillsLower = userSkills.map((s: string) => s.toLowerCase())
  const jobSkillsLower = jobSkills.map((s: string) => s.toLowerCase())
  
  let matches = 0
  userSkillsLower.forEach((skill: string) => {
    if (jobSkillsLower.some((js: string) => js.includes(skill) || skill.includes(js))) {
      matches++
    }
  })
  
  return Math.min(matches / userSkills.length, 1)
}

