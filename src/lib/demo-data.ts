// Demo data for testing the job recommendation system
// This file contains sample jobs that would typically come from a job board API

export const demoJobs = [
  {
    id: '1',
    title: 'Junior AI/ML Engineer',
    company: 'TechCorp AI',
    location: 'Bangalore, India',
    job_type: 'full-time',
    experience_level: 'entry',
    salary_min: 600000,
    salary_max: 1200000,
    description: 'Join our AI team to build next-generation machine learning solutions. Work with cutting-edge technologies including TensorFlow, PyTorch, and cloud platforms. Perfect for fresh graduates with strong AI/ML foundation.',
    requirements: [
      'Bachelor\'s degree in Computer Science, AI, or related field',
      'Strong foundation in Python programming',
      'Understanding of machine learning concepts',
      'Familiarity with TensorFlow or PyTorch',
      'Knowledge of data analysis libraries (Pandas, NumPy)',
      'Basic understanding of statistics and linear algebra'
    ],
    preferred_skills: [
      'Computer Vision experience',
      'Natural Language Processing knowledge',
      'Cloud platform experience (AWS/GCP)',
      'Academic projects in AI/ML'
    ],
    required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    is_active: true
  },
  {
    id: '2',
    title: 'Data Science Intern',
    company: 'Analytics Pro',
    location: 'Remote',
    job_type: 'internship',
    experience_level: 'entry',
    salary_min: 25000,
    salary_max: 50000,
    description: 'Six-month internship program for aspiring data scientists. Work on real-world projects involving customer analytics, predictive modeling, and business intelligence.',
    requirements: [
      'Currently pursuing or completed degree in relevant field',
      'Python programming proficiency',
      'Understanding of statistics and mathematics',
      'Familiarity with Pandas, NumPy, Matplotlib',
      'Basic knowledge of machine learning algorithms',
      'SQL fundamentals'
    ],
    preferred_skills: [
      'Data visualization experience',
      'Business intelligence tools',
      'R programming',
      'Jupyter notebooks experience'
    ],
    required_skills: ['Python', 'Statistics', 'Data Analysis', 'SQL'],
    is_active: true
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartupTech',
    location: 'Mumbai, India',
    job_type: 'full-time',
    experience_level: 'entry',
    salary_min: 500000,
    salary_max: 900000,
    description: 'Join our dynamic startup to build scalable web applications. Work with modern technologies including React, Node.js, and cloud services. Great opportunity for CS graduates.',
    requirements: [
      'Bachelor\'s degree in Computer Science',
      'Proficiency in JavaScript/TypeScript',
      'Experience with React.js',
      'Node.js and backend development',
      'Database design (SQL/NoSQL)',
      'RESTful API development'
    ],
    preferred_skills: [
      'Python knowledge',
      'Cloud deployment experience',
      'Mobile app development',
      'DevOps experience'
    ],
    required_skills: ['JavaScript', 'React', 'Node.js', 'Database'],
    is_active: true
  },
  {
    id: '4',
    title: 'Computer Vision Engineer',
    company: 'VisionAI Labs',
    location: 'Hyderabad, India',
    job_type: 'full-time',
    experience_level: 'mid',
    salary_min: 800000,
    salary_max: 1500000,
    description: 'Develop cutting-edge computer vision solutions for autonomous systems. Work with image processing, deep learning, and real-time vision systems.',
    requirements: [
      'Master\'s degree in Computer Vision or related field',
      'Strong Python programming skills',
      'Deep learning experience (CNN, RNN)',
      'OpenCV and image processing',
      'TensorFlow/PyTorch expertise',
      '2+ years of CV experience'
    ],
    preferred_skills: [
      'CUDA programming',
      'Real-time systems',
      'Autonomous vehicle experience',
      'Research publication experience'
    ],
    required_skills: ['Computer Vision', 'Deep Learning', 'Python', 'OpenCV', 'TensorFlow'],
    is_active: true
  },
  {
    id: '5',
    title: 'Backend Python Developer',
    company: 'CloudSoft Solutions',
    location: 'Chennai, India',
    job_type: 'full-time',
    experience_level: 'entry',
    salary_min: 400000,
    salary_max: 800000,
    description: 'Build robust backend systems using Python and Django. Work with microservices, APIs, and cloud infrastructure. Great for Python enthusiasts.',
    requirements: [
      'Bachelor\'s degree in Computer Science',
      'Strong Python programming skills',
      'Django or Flask framework experience',
      'Database design and optimization',
      'RESTful API development',
      'Version control (Git)'
    ],
    preferred_skills: [
      'Docker containerization',
      'AWS/Azure cloud services',
      'Microservices architecture',
      'Testing frameworks'
    ],
    required_skills: ['Python', 'Django', 'API Development', 'Database'],
    is_active: true
  },
  {
    id: '6',
    title: 'Machine Learning Researcher',
    company: 'Research Institute',
    location: 'Delhi, India',
    job_type: 'full-time',
    experience_level: 'senior',
    salary_min: 1200000,
    salary_max: 2000000,
    description: 'Lead research in advanced machine learning techniques. Publish papers, develop novel algorithms, and mentor junior researchers.',
    requirements: [
      'PhD in Machine Learning or related field',
      'Strong research background',
      'Publication record in top-tier conferences',
      'Advanced mathematics and statistics',
      'Programming in Python/R',
      '5+ years research experience'
    ],
    preferred_skills: [
      'Grant writing experience',
      'Industry collaboration',
      'Teaching experience',
      'Open source contributions'
    ],
    required_skills: ['Machine Learning', 'Research', 'Mathematics', 'Python', 'Statistics'],
    is_active: true
  }
]

export const demoCompanies = [
  {
    id: '1',
    name: 'TechCorp AI',
    industry: 'Artificial Intelligence',
    size: '100-500',
    location: 'Bangalore, India'
  },
  {
    id: '2',
    name: 'Analytics Pro',
    industry: 'Data Analytics',
    size: '50-100',
    location: 'Multiple Locations'
  },
  {
    id: '3',
    name: 'StartupTech',
    industry: 'Technology',
    size: '10-50',
    location: 'Mumbai, India'
  },
  {
    id: '4',
    name: 'VisionAI Labs',
    industry: 'Computer Vision',
    size: '200-500',
    location: 'Hyderabad, India'
  },
  {
    id: '5',
    name: 'CloudSoft Solutions',
    industry: 'Cloud Computing',
    size: '500-1000',
    location: 'Chennai, India'
  },
  {
    id: '6',
    name: 'Research Institute',
    industry: 'Research & Development',
    size: '100-200',
    location: 'Delhi, India'
  }
]

// Function to seed demo data (for development/testing)
export async function seedDemoData() {
  console.log('Demo data available for development/testing')
  console.log(`${demoJobs.length} sample jobs`)
  console.log(`${demoCompanies.length} sample companies`)
  
  return {
    jobs: demoJobs,
    companies: demoCompanies
  }
}