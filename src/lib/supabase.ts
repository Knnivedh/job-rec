import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database Types
export interface AppUser {
  id: string
  auth_user_id?: string
  email?: string
  full_name?: string
  created_at: string
}

export interface Resume {
  id: string
  user_id: string
  file_name: string
  file_type: string
  file_size: number
  raw_text: string
  parsed_data: ParsedResumeData
  upload_date: string
}

export interface ParsedResumeData {
  contact_info: ContactInfo
  skills: string[]
  experience: WorkExperience[]
  education: Education[]
  summary?: string | null
}

export interface ContactInfo {
  name?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  linkedin?: string | null
  github?: string | null
}

export interface WorkExperience {
  company: string
  position: string
  start_date?: string
  end_date?: string
  description?: string
  skills_used?: string[]
}

export interface Education {
  institution: string
  degree: string
  field_of_study?: string
  graduation_date?: string
  gpa?: string
}

export interface JobRecommendation {
  id: string
  user_id: string
  resume_id: string
  job_title: string
  company: string
  location?: string
  job_type?: string
  salary_range?: string
  requirements: string[]
  description: string
  match_score: number
  skills_match: string[]
  experience_match: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  preferred_job_types: string[]
  preferred_locations: string[]
  salary_expectations?: string
  career_level: string
  skills_to_improve: string[]
  created_at: string
  updated_at: string
}