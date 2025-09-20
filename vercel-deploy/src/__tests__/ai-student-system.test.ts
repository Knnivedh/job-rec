// Simplified Real Resume AI System Test - K N Nivedh
// Testing AI components with mock resume data based on actual profile

import { generateJobRecommendations, analyzeSkillGap } from '../lib/groq'

// Mock resume data representing K N Nivedh's profile (AI student)
const mockResumeData = {
  rawText: `
K N Nivedh
Student ID: 2sd22ai027
Artificial Intelligence & Machine Learning Student
Computer Science Engineering

Contact Information:
Email: nivedh.kn@example.com
Phone: +91-9876543210
Location: Bangalore, India

Education:
Bachelor of Engineering in Computer Science
Specialization: Artificial Intelligence and Machine Learning
Institution: Engineering College
Year: 2022-2026

Skills:
- Python Programming
- Machine Learning
- Deep Learning
- Data Analysis
- Computer Vision
- Natural Language Processing
- TensorFlow
- PyTorch
- Pandas
- NumPy
- Scikit-learn
- OpenCV
- Mathematics and Statistics
- Linear Algebra
- Data Structures and Algorithms
- Object-Oriented Programming

Projects:
1. Image Classification using CNN
   - Developed a convolutional neural network for image recognition
   - Technologies: Python, TensorFlow, OpenCV
   - Achieved 95% accuracy on test dataset

2. Sentiment Analysis System
   - Built NLP model to analyze text sentiment
   - Technologies: Python, NLTK, Scikit-learn
   - Processed over 10,000 text samples

3. Predictive Analytics Dashboard
   - Created data visualization dashboard for predictive modeling
   - Technologies: Python, Pandas, Matplotlib, Streamlit
   - Implemented multiple ML algorithms

Academic Performance:
- CGPA: 8.5/10
- Relevant Coursework: Machine Learning, Deep Learning, Computer Vision, 
  Natural Language Processing, Data Structures, Algorithms, Statistics

Interests:
- Artificial Intelligence Research
- Computer Vision Applications
- Natural Language Processing
- Data Science and Analytics
- Software Development
`,
  parsedData: {
    contact_info: {
      name: "K N Nivedh",
      email: "nivedh.kn@example.com",
      phone: "+91-9876543210",
      location: "Bangalore, India",
      linkedin: null,
      github: null
    },
    skills: [
      "Python Programming", "Machine Learning", "Deep Learning", "Data Analysis",
      "Computer Vision", "Natural Language Processing", "TensorFlow", "PyTorch",
      "Pandas", "NumPy", "Scikit-learn", "OpenCV", "Mathematics", "Statistics",
      "Linear Algebra", "Data Structures", "Algorithms", "Object-Oriented Programming"
    ],
    experience: [], // Student - no professional experience yet
    education: [
      {
        institution: "Engineering College",
        degree: "Bachelor of Engineering",
        field_of_study: "Computer Science - AI & ML",
        graduation_date: "2026"
      }
    ],
    summary: "AI & Machine Learning student with strong foundation in Python, deep learning, and computer vision. Experienced in developing ML projects including image classification and sentiment analysis systems."
  }
}

// Sample job descriptions relevant to AI students
const sampleJobDescriptions = [
  // Entry Level AI/ML Role
  `Junior AI/ML Engineer - TechnovateAI
  Location: Bangalore, India
  Experience: 0-2 years (Freshers welcome)
  
  We are looking for passionate AI/ML enthusiasts to join our team.
  
  Required Skills:
  - Strong foundation in Python programming
  - Understanding of Machine Learning concepts
  - Familiarity with TensorFlow or PyTorch
  - Knowledge of data analysis libraries (Pandas, NumPy)
  - Basic understanding of statistics and linear algebra
  - Bachelor's degree in Computer Science, AI, or related field
  - Strong problem-solving skills
  
  Nice to have:
  - Computer Vision experience
  - Natural Language Processing knowledge
  - Experience with cloud platforms
  - Academic projects in AI/ML
  
  Responsibilities:
  - Assist in developing ML models
  - Data preprocessing and analysis
  - Model training and evaluation
  - Documentation and testing
  
  This is an excellent opportunity for fresh graduates to start their AI career.`,

  // Data Science Internship
  `Data Science Intern - Analytics Pro
  Location: Remote/Bangalore
  Duration: 6 months (Full-time)
  
  Join our data science team as an intern and gain hands-on experience.
  
  Required Skills:
  - Python programming proficiency
  - Understanding of statistics and mathematics
  - Familiarity with Pandas, NumPy, Matplotlib
  - Basic knowledge of machine learning algorithms
  - SQL fundamentals
  - Currently pursuing or completed degree in relevant field
  
  What you'll learn:
  - Real-world data analysis techniques
  - Business intelligence and reporting
  - Advanced machine learning methods
  - Data visualization best practices
  - Industry-standard tools and processes
  
  Projects you'll work on:
  - Customer behavior analysis
  - Predictive modeling for business metrics
  - Data pipeline development
  - Automated reporting systems`,

  // Software Development Role
  `Junior Software Developer - InnovateTech
  Location: Hybrid (Bangalore)
  Experience: 0-1 years
  
  We're seeking talented developers to join our growing tech team.
  
  Required Skills:
  - Proficiency in at least one programming language (Python/Java/JavaScript)
  - Understanding of object-oriented programming
  - Basic knowledge of data structures and algorithms
  - Familiarity with version control (Git)
  - Problem-solving and analytical skills
  - Bachelor's degree in Computer Science or related field
  
  Technologies we use:
  - Python/Django for backend
  - React.js for frontend
  - PostgreSQL database
  - AWS cloud services
  - RESTful API development
  
  Growth opportunities:
  - Mentorship from senior developers
  - Training in modern development practices
  - Exposure to AI/ML projects
  - Certification support
  
  Perfect role for CS graduates looking to build their development career.`
]

describe('Real Resume AI System Test - K N Nivedh (AI Student)', () => {
  
  beforeAll(() => {
    // Set up environment for AI testing
    process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-key'
  })

  describe('AI Profile Analysis', () => {
    it('should validate the AI student profile structure', () => {
      const { contact_info, skills, education, summary } = mockResumeData.parsedData
      
      // Validate contact information
      expect(contact_info.name).toBe("K N Nivedh")
      expect(contact_info.email).toContain("nivedh")
      expect(contact_info.location).toBe("Bangalore, India")
      
      // Validate skills array
      expect(Array.isArray(skills)).toBe(true)
      expect(skills.length).toBeGreaterThan(10)
      
      // Check for essential AI/ML skills
      const aiSkills = skills.filter(skill => 
        skill.toLowerCase().includes('machine learning') ||
        skill.toLowerCase().includes('deep learning') ||
        skill.toLowerCase().includes('python') ||
        skill.toLowerCase().includes('tensorflow') ||
        skill.toLowerCase().includes('computer vision')
      )
      expect(aiSkills.length).toBeGreaterThan(3)
      
      // Validate education
      expect(education[0].field_of_study).toContain("AI")
      
      console.log('👤 Profile Analysis for K N Nivedh:')
      console.log('Name:', contact_info.name)
      console.log('Field of Study:', education[0].field_of_study)
      console.log('Total Skills:', skills.length)
      console.log('AI-related Skills:', aiSkills.length)
    })
  })

  describe('Job Recommendation System for AI Student', () => {
    it('should generate relevant job recommendations for AI student profile', async () => {
      const recommendations = await generateJobRecommendations(
        mockResumeData.rawText,
        sampleJobDescriptions
      )
      
      expect(recommendations.scores).toBeDefined()
      expect(recommendations.reasoning).toBeDefined()
      expect(recommendations.scores.length).toBe(sampleJobDescriptions.length)
      
      console.log('🎯 Job Recommendations for K N Nivedh (AI Student):')
      console.log('')
      
      recommendations.scores.forEach((score: number, index: number) => {
        const jobTitle = sampleJobDescriptions[index].split('\\n')[0]
        console.log(`${index + 1}. ${jobTitle}`)
        console.log(`   Match Score: ${(score * 100).toFixed(1)}%`)
        console.log(`   Reasoning: ${recommendations.reasoning[index]}`)
        console.log('')
      })
      
      // Find the best match for an AI student
      const bestMatchIndex = recommendations.scores.indexOf(Math.max(...recommendations.scores))
      const bestScore = recommendations.scores[bestMatchIndex]
      const bestJob = sampleJobDescriptions[bestMatchIndex].split('\\n')[0]
      
      console.log(`🏆 Best Job Match for AI Student: ${bestJob}`)
      console.log(`📊 Match Score: ${(bestScore * 100).toFixed(1)}%`)
      
      // AI student should have good match with AI/ML roles
      expect(bestScore).toBeGreaterThan(0.4) // At least 40% match
      
      // The best match should likely be the AI/ML role (index 0)
      expect(bestMatchIndex).toBeLessThanOrEqual(1) // Either AI role or Data Science internship
      
    }, 45000) // 45 second timeout

    it('should analyze skill gaps and provide career guidance for AI student', async () => {
      const userSkills = mockResumeData.parsedData.skills
      
      // Job requirements for a junior AI/ML role
      const jobRequirements = [
        'Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
        'Computer Vision', 'Natural Language Processing', 'Data Analysis',
        'Statistics', 'Linear Algebra', 'Cloud Computing', 'Docker',
        'Kubernetes', 'MLOps', 'Model Deployment', 'Big Data', 'Spark'
      ]
      
      const skillGapAnalysis = await analyzeSkillGap(userSkills, jobRequirements)
      
      expect(skillGapAnalysis.missingSkills).toBeDefined()
      expect(skillGapAnalysis.skillImprovements).toBeDefined()
      expect(skillGapAnalysis.recommendedCourses).toBeDefined()
      
      console.log('📈 Career Development Analysis for K N Nivedh:')
      console.log('')
      console.log('Current AI/ML Skills:')
      userSkills.slice(0, 8).forEach((skill, index) => {
        console.log(`  ${index + 1}. ${skill}`)
      })
      console.log('  ... and more\\n')
      
      if (skillGapAnalysis.missingSkills.length > 0) {
        console.log('🎯 Skills to Learn for Industry Readiness:')
        skillGapAnalysis.missingSkills.slice(0, 5).forEach((skill: string, index: number) => {
          console.log(`  ${index + 1}. ${skill}`)
        })
        console.log('')
      }
      
      if (skillGapAnalysis.skillImprovements.length > 0) {
        console.log('⚡ Skills to Strengthen:')
        skillGapAnalysis.skillImprovements.slice(0, 3).forEach((skill: string, index: number) => {
          console.log(`  ${index + 1}. ${skill}`)
        })
        console.log('')
      }
      
      if (skillGapAnalysis.recommendedCourses.length > 0) {
        console.log('📚 Recommended Learning Path:')
        skillGapAnalysis.recommendedCourses.slice(0, 3).forEach((course: any, index: number) => {
          console.log(`  ${index + 1}. ${course.title}`)
          console.log(`     ${course.description}`)
          console.log('')
        })
      }
      
      // Student should have some skills to develop for industry readiness
      expect(skillGapAnalysis.missingSkills.length).toBeGreaterThan(0)
      
    }, 30000) // 30 second timeout
  })

  describe('Career Path Analysis for AI Student', () => {
    it('should identify the most suitable career progression', async () => {
      const studentSkills = mockResumeData.parsedData.skills
      
      // Different career paths for AI students
      const careerPaths = {
        'AI/ML Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
        'Data Scientist': ['Python', 'Statistics', 'Data Analysis', 'Pandas', 'Machine Learning'],
        'Computer Vision Engineer': ['Computer Vision', 'OpenCV', 'Deep Learning', 'Python', 'TensorFlow'],
        'NLP Engineer': ['Natural Language Processing', 'Python', 'Deep Learning', 'TensorFlow'],
        'Software Developer': ['Python', 'Programming', 'Data Structures', 'Algorithms', 'Object-Oriented Programming']
      }
      
      console.log('🚀 Career Path Analysis for K N Nivedh:')
      console.log('')
      
      for (const [careerPath, requiredSkills] of Object.entries(careerPaths)) {
        const matchingSkills = studentSkills.filter(skill =>
          requiredSkills.some(req => 
            skill.toLowerCase().includes(req.toLowerCase()) ||
            req.toLowerCase().includes(skill.toLowerCase())
          )
        )
        
        const matchPercentage = (matchingSkills.length / requiredSkills.length) * 100
        
        console.log(`${careerPath}: ${matchPercentage.toFixed(1)}% match`)
        console.log(`  Matching skills: ${matchingSkills.slice(0, 3).join(', ')}${matchingSkills.length > 3 ? '...' : ''}`)
        console.log('')
      }
      
      // Should have strong match with AI/ML related paths
      const aiMlSkills = studentSkills.filter(skill =>
        ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'computer vision', 'nlp'].some(ai =>
          skill.toLowerCase().includes(ai)
        )
      )
      
      expect(aiMlSkills.length).toBeGreaterThan(4)
    })
  })

  describe('Academic to Industry Transition', () => {
    it('should provide guidance for transitioning from academics to industry', () => {
      const academicSkills = mockResumeData.parsedData.skills
      const industryRequirements = [
        'Version Control (Git)', 'Cloud Platforms', 'Model Deployment',
        'MLOps', 'Docker', 'API Development', 'Database Management',
        'Agile Methodology', 'Code Review', 'Production Systems'
      ]
      
      const readyForIndustry = academicSkills.filter(skill =>
        industryRequirements.some(req => 
          skill.toLowerCase().includes(req.toLowerCase().split(' ')[0])
        )
      )
      
      const skillsToLearn = industryRequirements.filter(req =>
        !academicSkills.some(skill => 
          skill.toLowerCase().includes(req.toLowerCase().split(' ')[0])
        )
      )
      
      console.log('🏭 Industry Readiness Assessment:')
      console.log('')
      console.log('✅ Industry-ready skills:')
      readyForIndustry.forEach((skill, index) => {
        console.log(`  ${index + 1}. ${skill}`)
      })
      
      console.log('')
      console.log('📚 Skills to develop for industry:')
      skillsToLearn.slice(0, 5).forEach((skill, index) => {
        console.log(`  ${index + 1}. ${skill}`)
      })
      
      console.log('')
      console.log('🎯 Recommendation: Focus on practical implementation and deployment skills')
      console.log('   Consider internships, open-source contributions, and hands-on projects')
      
      // Academic profile should have more skills to learn for industry
      expect(skillsToLearn.length).toBeGreaterThan(readyForIndustry.length)
    })
  })

  describe('Project Portfolio Analysis', () => {
    it('should analyze the strength of AI project portfolio', () => {
      const rawText = mockResumeData.rawText.toLowerCase()
      
      // Check for different types of AI projects
      const projectTypes = {
        'Computer Vision': ['image', 'cnn', 'classification', 'opencv', 'vision'],
        'Natural Language Processing': ['sentiment', 'nlp', 'text', 'language'],
        'Data Analytics': ['dashboard', 'visualization', 'analytics', 'data'],
        'Machine Learning': ['ml', 'machine learning', 'model', 'algorithm']
      }
      
      console.log('💼 Project Portfolio Analysis:')
      console.log('')
      
      for (const [projectType, keywords] of Object.entries(projectTypes)) {
        const hasProject = keywords.some(keyword => rawText.includes(keyword))
        console.log(`${hasProject ? '✅' : '❌'} ${projectType} Projects`)
      }
      
      // Check project impact and metrics
      const hasMetrics = rawText.includes('accuracy') || rawText.includes('performance') || rawText.includes('%')
      const hasTechnologies = rawText.includes('technologies:') || rawText.includes('tech stack')
      
      console.log('')
      console.log('Project Quality Indicators:')
      console.log(`${hasMetrics ? '✅' : '❌'} Quantifiable Results/Metrics`)
      console.log(`${hasTechnologies ? '✅' : '❌'} Technology Stack Mentioned`)
      
      // Should have diverse project portfolio
      const projectCount = Object.values(projectTypes).filter(keywords =>
        keywords.some(keyword => rawText.includes(keyword))
      ).length
      
      expect(projectCount).toBeGreaterThan(2) // Should have projects in multiple areas
    })
  })
})