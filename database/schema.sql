-- Resume Job Recommendation System Database Schema
-- This schema is designed for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- Users table (extends Supabase auth.users)
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills master table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- e.g., 'programming', 'soft_skills', 'tools', 'languages'
    embedding VECTOR(1536), -- OpenAI embedding vector
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- 'pdf', 'docx'
    file_size INTEGER NOT NULL,
    file_url TEXT, -- Supabase storage URL
    raw_text TEXT,
    parsed_data JSONB, -- Structured resume data
    embedding VECTOR(1536), -- OpenAI embedding of full resume
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- User profiles for preferences
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    preferred_job_types TEXT[], -- e.g., ['full-time', 'remote', 'contract']
    preferred_locations TEXT[],
    preferred_industries TEXT[],
    salary_min INTEGER,
    salary_max INTEGER,
    career_level VARCHAR(20), -- 'entry', 'mid', 'senior', 'executive'
    skills_to_improve TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(20), -- 'startup', 'small', 'medium', 'large', 'enterprise'
    location VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    preferred_skills TEXT[],
    required_skills TEXT[],
    location VARCHAR(255),
    job_type VARCHAR(20), -- 'full-time', 'part-time', 'contract', 'freelance'
    work_arrangement VARCHAR(20), -- 'remote', 'hybrid', 'on-site'
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level VARCHAR(20), -- 'entry', 'mid', 'senior', 'executive'
    industry VARCHAR(100),
    embedding VECTOR(1536), -- OpenAI embedding of job description
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    external_url TEXT, -- Link to original job posting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job recommendations
CREATE TABLE job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    match_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    skills_match JSONB, -- Detailed skills matching info
    experience_match JSONB, -- Experience level matching
    education_match JSONB, -- Education requirements matching
    location_match BOOLEAN DEFAULT FALSE,
    salary_match BOOLEAN DEFAULT FALSE,
    reasoning TEXT, -- AI explanation of why this job was recommended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feedback on recommendations
CREATE TABLE recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES job_recommendations(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL, -- 'like', 'dislike', 'applied', 'not_interested', 'saved'
    feedback_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skill assessments (for tracking skill improvements)
CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id),
    proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_of_experience DECIMAL(3,1),
    last_used_date DATE,
    source VARCHAR(50), -- 'resume', 'self_reported', 'assessment'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application tracking
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    recommendation_id UUID REFERENCES job_recommendations(id),
    application_status VARCHAR(20), -- 'applied', 'interview', 'rejected', 'offer', 'accepted'
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill gap analysis results
CREATE TABLE skill_gap_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    target_job_id UUID REFERENCES jobs(id),
    missing_skills TEXT[],
    skill_improvements TEXT[],
    recommended_courses JSONB, -- Course recommendations with links
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_active ON resumes(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_jobs_active ON jobs(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_job_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX idx_job_recommendations_match_score ON job_recommendations(match_score DESC);
CREATE INDEX idx_recommendation_feedback_type ON recommendation_feedback(feedback_type);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);

-- Vector similarity search indexes (for semantic search)
CREATE INDEX idx_resumes_embedding ON resumes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_jobs_embedding ON jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_skills_embedding ON skills USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) policies
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_users
CREATE POLICY "Users can view their own data" ON app_users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own data" ON app_users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- RLS Policies for resumes
CREATE POLICY "Users can manage their own resumes" ON resumes
    FOR ALL USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for user_profiles
CREATE POLICY "Users can manage their own profiles" ON user_profiles
    FOR ALL USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for job_recommendations
CREATE POLICY "Users can view their own recommendations" ON job_recommendations
    FOR SELECT USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for recommendation_feedback
CREATE POLICY "Users can manage their own feedback" ON recommendation_feedback
    FOR ALL USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for user_skills
CREATE POLICY "Users can manage their own skills" ON user_skills
    FOR ALL USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for job_applications
CREATE POLICY "Users can manage their own applications" ON job_applications
    FOR ALL USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for skill_gap_analysis
CREATE POLICY "Users can view their own skill gap analysis" ON skill_gap_analysis
    FOR SELECT USING (user_id IN (SELECT id FROM app_users WHERE auth_user_id = auth.uid()));

-- Public read access for jobs, companies, and skills (with some restrictions)
CREATE POLICY "Jobs are viewable by authenticated users" ON jobs
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

CREATE POLICY "Companies are viewable by authenticated users" ON companies
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Skills are viewable by authenticated users" ON skills
    FOR SELECT USING (auth.role() = 'authenticated');

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_id_from_auth()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM app_users WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate cosine similarity between vectors
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS FLOAT AS $$
BEGIN
    RETURN (a <#> b) * -1; -- pgvector uses negative inner product for cosine distance
END;
$$ LANGUAGE plpgsql;

-- Function to find similar jobs based on resume
CREATE OR REPLACE FUNCTION find_similar_jobs(resume_embedding vector, limit_count int DEFAULT 10)
RETURNS TABLE(job_id uuid, similarity_score float) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        cosine_similarity(resume_embedding, j.embedding) as score
    FROM jobs j
    WHERE j.is_active = TRUE
        AND j.embedding IS NOT NULL
    ORDER BY j.embedding <#> resume_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some initial skill categories
INSERT INTO skills (name, category) VALUES
    -- Programming Languages
    ('JavaScript', 'programming'),
    ('Python', 'programming'),
    ('Java', 'programming'),
    ('TypeScript', 'programming'),
    ('C++', 'programming'),
    ('C#', 'programming'),
    ('Go', 'programming'),
    ('Rust', 'programming'),
    ('PHP', 'programming'),
    ('Ruby', 'programming'),
    
    -- Web Technologies
    ('React', 'web_development'),
    ('Angular', 'web_development'),
    ('Vue.js', 'web_development'),
    ('Node.js', 'web_development'),
    ('Express.js', 'web_development'),
    ('Next.js', 'web_development'),
    ('HTML', 'web_development'),
    ('CSS', 'web_development'),
    
    -- Databases
    ('PostgreSQL', 'database'),
    ('MySQL', 'database'),
    ('MongoDB', 'database'),
    ('Redis', 'database'),
    ('SQLite', 'database'),
    ('Oracle', 'database'),
    
    -- Cloud & DevOps
    ('AWS', 'cloud'),
    ('Google Cloud', 'cloud'),
    ('Azure', 'cloud'),
    ('Docker', 'devops'),
    ('Kubernetes', 'devops'),
    ('CI/CD', 'devops'),
    ('Jenkins', 'devops'),
    
    -- Data Science & ML
    ('Machine Learning', 'data_science'),
    ('Deep Learning', 'data_science'),
    ('TensorFlow', 'data_science'),
    ('PyTorch', 'data_science'),
    ('Pandas', 'data_science'),
    ('NumPy', 'data_science'),
    ('Scikit-learn', 'data_science'),
    
    -- Soft Skills
    ('Leadership', 'soft_skills'),
    ('Communication', 'soft_skills'),
    ('Problem Solving', 'soft_skills'),
    ('Teamwork', 'soft_skills'),
    ('Project Management', 'soft_skills'),
    ('Agile', 'methodology'),
    ('Scrum', 'methodology');