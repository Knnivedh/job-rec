import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Check if we're in SIMPLE mode (no database)
  const isSimpleMode = !!process.env.NVIDIA_API_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (isSimpleMode) {
    return NextResponse.json(
      { 
        error: 'This feature requires database',
        message: 'Seed data API is not available in simple mode'
      },
      { status: 503 }
    )
  }

  try {
    // Dynamic imports for FULL mode only
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { generateEmbedding } = await import('@/lib/groq')
    
    // This is a development-only endpoint to seed sample data
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not available in production' },
        { status: 403 }
      )
    }

    // First create sample companies
    const companies = [
      {
        name: 'TechCorp Solutions',
        description: 'Leading technology company specializing in web development and cloud solutions',
        industry: 'Technology',
        company_size: 'large',
        location: 'San Francisco, CA',
        website: 'https://techcorp.com'
      },
      {
        name: 'DataMind Analytics',
        description: 'Data analytics and machine learning company helping businesses make data-driven decisions',
        industry: 'Data Analytics',
        company_size: 'medium',
        location: 'New York, NY',
        website: 'https://datamind.com'
      },
      {
        name: 'StartupHub Inc',
        description: 'Fast-growing fintech startup revolutionizing digital payments',
        industry: 'Financial Technology',
        company_size: 'startup',
        location: 'Austin, TX',
        website: 'https://startuphub.com'
      }
    ]

    // Insert companies
    const { data: insertedCompanies } = await supabaseAdmin
      .from('companies')
      .upsert(companies, { onConflict: 'name', ignoreDuplicates: false })
      .select()

    if (!insertedCompanies || insertedCompanies.length === 0) {
      throw new Error('Failed to insert companies')
    }

    // Create sample jobs
    const jobs = [
      {
        company_id: insertedCompanies[0].id,
        title: 'Senior Full Stack Developer',
        description: `We are seeking a Senior Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies like React, Node.js, and TypeScript.

Key Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Implement best practices for code quality and testing
- Mentor junior developers

We offer competitive salary, flexible work arrangements, and excellent benefits including health insurance, 401k matching, and professional development opportunities.`,
        requirements: [
          '5+ years of web development experience',
          'Strong problem-solving skills',
          'Experience with agile methodologies',
          'Bachelor\'s degree in Computer Science or equivalent'
        ],
        preferred_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
        required_skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
        location: 'San Francisco, CA',
        job_type: 'full-time',
        work_arrangement: 'remote',
        salary_min: 120000,
        salary_max: 180000,
        experience_level: 'senior',
        industry: 'Technology',
        is_active: true
      },
      {
        company_id: insertedCompanies[1].id,
        title: 'Machine Learning Engineer',
        description: `Join our ML team to build and deploy machine learning models that power our data analytics platform. You'll work with large datasets and cutting-edge ML technologies.

Key Responsibilities:
- Develop and deploy ML models in production
- Work with data scientists to implement algorithms
- Optimize model performance and scalability
- Build ML pipelines and infrastructure

This is an excellent opportunity to work with real-world data at scale and make a significant impact on our product.`,
        requirements: [
          '3+ years of ML experience',
          'Strong Python programming skills',
          'Experience with ML frameworks like TensorFlow or PyTorch',
          'Understanding of statistical methods'
        ],
        preferred_skills: ['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Docker', 'Kubernetes'],
        required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'Statistics'],
        location: 'New York, NY',
        job_type: 'full-time',
        work_arrangement: 'hybrid',
        salary_min: 110000,
        salary_max: 160000,
        experience_level: 'mid',
        industry: 'Data Analytics',
        is_active: true
      },
      {
        company_id: insertedCompanies[2].id,
        title: 'Frontend Developer',
        description: `Looking for a passionate frontend developer to help build the next generation of fintech applications. You'll work on user-facing features that millions of users will interact with daily.

Key Responsibilities:
- Build responsive and interactive user interfaces
- Collaborate with designers and backend developers
- Optimize applications for performance and accessibility
- Write clean, maintainable code

Join our fast-growing startup and help shape the future of digital payments!`,
        requirements: [
          '2+ years of frontend development experience',
          'Strong JavaScript and React skills',
          'Experience with responsive design',
          'Understanding of web performance optimization'
        ],
        preferred_skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Git'],
        required_skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        location: 'Austin, TX',
        job_type: 'full-time',
        work_arrangement: 'on-site',
        salary_min: 80000,
        salary_max: 120000,
        experience_level: 'mid',
        industry: 'Financial Technology',
        is_active: true
      },
      {
        company_id: insertedCompanies[0].id,
        title: 'DevOps Engineer',
        description: `We're looking for a DevOps Engineer to help us scale our infrastructure and improve our deployment processes. You'll work with cloud technologies and automation tools.

Key Responsibilities:
- Manage cloud infrastructure on AWS
- Implement CI/CD pipelines
- Monitor system performance and reliability
- Automate deployment processes

This role is perfect for someone who loves working with cutting-edge cloud technologies and wants to make a big impact on our engineering team.`,
        requirements: [
          '3+ years of DevOps or Infrastructure experience',
          'Experience with cloud platforms (AWS, GCP, or Azure)',
          'Knowledge of containerization technologies',
          'Strong scripting skills'
        ],
        preferred_skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python'],
        required_skills: ['AWS', 'Docker', 'CI/CD', 'Linux'],
        location: 'San Francisco, CA',
        job_type: 'full-time',
        work_arrangement: 'remote',
        salary_min: 100000,
        salary_max: 150000,
        experience_level: 'mid',
        industry: 'Technology',
        is_active: true
      },
      {
        company_id: insertedCompanies[1].id,
        title: 'Data Scientist',
        description: `Join our data science team to extract insights from large datasets and help drive business decisions. You'll work on exciting projects involving predictive modeling and statistical analysis.

Key Responsibilities:
- Analyze large datasets to identify trends and patterns
- Build predictive models and statistical analyses
- Communicate findings to stakeholders
- Collaborate with ML engineers to deploy models

This is a great opportunity to work with diverse datasets and make data-driven recommendations that impact the business.`,
        requirements: [
          'Master\'s degree in Statistics, Math, or related field',
          '2+ years of data science experience',
          'Strong analytical and statistical skills',
          'Experience with data visualization tools'
        ],
        preferred_skills: ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Matplotlib', 'Tableau'],
        required_skills: ['Python', 'SQL', 'Statistics', 'Data Analysis'],
        location: 'New York, NY',
        job_type: 'full-time',
        work_arrangement: 'hybrid',
        salary_min: 95000,
        salary_max: 140000,
        experience_level: 'mid',
        industry: 'Data Analytics',
        is_active: true
      }
    ]

    // Generate embeddings for each job
    const jobsWithEmbeddings = []
    for (let job of jobs) {
      try {
        const jobText = `${job.title} ${job.description} ${job.required_skills.join(' ')} ${job.preferred_skills.join(' ')}`
        const embedding = await generateEmbedding(jobText)
        jobsWithEmbeddings.push({ ...job, embedding })
      } catch (error) {
        console.error('Error generating embedding for job:', job.title, error)
        // Continue without embedding if OpenAI fails
        jobsWithEmbeddings.push(job)
      }
    }

    // Insert jobs
    const { data: insertedJobs, error: jobError } = await supabaseAdmin
      .from('jobs')
      .upsert(jobsWithEmbeddings, { onConflict: 'title,company_id', ignoreDuplicates: false })
      .select()

    if (jobError) {
      console.error('Job insertion error:', jobError)
      throw new Error('Failed to insert jobs')
    }

    return NextResponse.json({
      message: 'Sample data seeded successfully',
      companies: insertedCompanies.length,
      jobs: insertedJobs?.length || 0
    })

  } catch (error) {
    console.error('Seed data error:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}