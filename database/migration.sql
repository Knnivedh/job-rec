-- Supabase Migration Script
-- Run this in your Supabase SQL Editor

-- First, ensure the vector extension is installed
-- Go to Database > Extensions in Supabase Dashboard and enable "vector"

-- Then run the main schema
-- Copy and paste the content from schema.sql into the SQL editor

-- After running schema.sql, you can run these additional setup queries:

-- Create a function to automatically create app_user record when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.app_users (auth_user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create app_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for resume files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for resume uploads
CREATE POLICY "Users can upload their own resumes" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own resumes" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own resumes" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'resumes' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Enable real-time subscriptions for job_recommendations (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE job_recommendations;

-- Create some sample companies for testing
INSERT INTO companies (name, description, industry, company_size, location) VALUES
    ('TechCorp', 'Leading technology company specializing in web development', 'Technology', 'large', 'San Francisco, CA'),
    ('DataSolutions Inc', 'Data analytics and machine learning company', 'Data Analytics', 'medium', 'New York, NY'),
    ('StartupHub', 'Fast-growing startup in the fintech space', 'Financial Technology', 'startup', 'Austin, TX'),
    ('GlobalSoft', 'Enterprise software solutions provider', 'Software', 'enterprise', 'Seattle, WA'),
    ('CloudFirst', 'Cloud infrastructure and services', 'Cloud Computing', 'medium', 'Denver, CO');

-- Create some sample jobs for testing
INSERT INTO jobs (company_id, title, description, requirements, preferred_skills, required_skills, location, job_type, work_arrangement, salary_min, salary_max, experience_level, industry) VALUES
    (
        (SELECT id FROM companies WHERE name = 'TechCorp' LIMIT 1),
        'Senior Full Stack Developer',
        'We are seeking a Senior Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.',
        ARRAY['5+ years of web development experience', 'Strong problem-solving skills', 'Experience with agile methodologies'],
        ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        ARRAY['JavaScript', 'React', 'Node.js'],
        'San Francisco, CA',
        'full-time',
        'remote',
        120000,
        180000,
        'senior',
        'Technology'
    ),
    (
        (SELECT id FROM companies WHERE name = 'DataSolutions Inc' LIMIT 1),
        'Machine Learning Engineer',
        'Join our ML team to build and deploy machine learning models that power our data analytics platform.',
        ARRAY['3+ years of ML experience', 'Strong Python skills', 'Experience with ML frameworks'],
        ARRAY['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Docker'],
        ARRAY['Python', 'Machine Learning', 'TensorFlow'],
        'New York, NY',
        'full-time',
        'hybrid',
        110000,
        160000,
        'mid',
        'Data Analytics'
    ),
    (
        (SELECT id FROM companies WHERE name = 'StartupHub' LIMIT 1),
        'Frontend Developer',
        'Looking for a passionate frontend developer to help build the next generation of fintech applications.',
        ARRAY['2+ years of frontend experience', 'Strong JavaScript skills', 'Experience with React'],
        ARRAY['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
        ARRAY['React', 'JavaScript', 'HTML', 'CSS'],
        'Austin, TX',
        'full-time',
        'on-site',
        80000,
        120000,
        'mid',
        'Financial Technology'
    );

COMMENT ON TABLE app_users IS 'Extended user profiles linked to Supabase auth.users';
COMMENT ON TABLE resumes IS 'Stores uploaded resume files and parsed content';
COMMENT ON TABLE jobs IS 'Job postings with embedded vectors for AI matching';
COMMENT ON TABLE job_recommendations IS 'AI-generated job recommendations for users';
COMMENT ON TABLE skills IS 'Master list of skills with categories and embeddings';
COMMENT ON COLUMN resumes.embedding IS 'OpenAI embedding vector for semantic search';
COMMENT ON COLUMN jobs.embedding IS 'OpenAI embedding vector for job matching';
COMMENT ON COLUMN job_recommendations.match_score IS 'AI-calculated match score between 0 and 1';