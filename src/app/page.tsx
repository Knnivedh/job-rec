'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Briefcase, 
  Upload, 
  Brain, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Users,
  TrendingUp,
  Shield
} from 'lucide-react'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGetStarted = () => {
    router.push('/auth')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Resume Matcher
                </h1>
                <p className="text-xs text-gray-500">Powered by AI</p>
              </div>
            </div>
            
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your Dream Job with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Resume Matching
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your resume and let our advanced AI analyze your skills to find perfectly matched job opportunities. 
              Get personalized recommendations in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <span>Start Matching Jobs</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Free to use • No credit card required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <div className="bg-blue-200 rounded-full p-4">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <div className="bg-purple-200 rounded-full p-4">
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to find your perfect job match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 mb-6 group-hover:shadow-lg transition-all duration-300">
                <Upload className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Upload Resume</h3>
              <p className="text-gray-600">
                Simply upload your resume in PDF or DOCX format. Our AI will instantly parse and analyze your skills, experience, and qualifications.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 group-hover:shadow-lg transition-all duration-300">
                <Brain className="h-12 w-12 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI powered by Groq analyzes your profile and matches it against thousands of job opportunities using semantic understanding.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6 group-hover:shadow-lg transition-all duration-300">
                <Target className="h-12 w-12 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Get Matched</h3>
              <p className="text-gray-600">
                Receive personalized job recommendations with match scores, skill analysis, and career development suggestions tailored to your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to accelerate your job search
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms analyze your resume and match you with the most relevant opportunities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Gap Analysis</h3>
              <p className="text-gray-600">
                Identify skills you need to develop and get personalized learning recommendations to advance your career.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Match Scoring</h3>
              <p className="text-gray-600">
                Get detailed match scores for each job opportunity to focus on the best-fitting positions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-yellow-100 rounded-lg p-3 w-fit mb-4">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Focused</h3>
              <p className="text-gray-600">
                Your resume data is securely processed and never shared with third parties without your consent.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-red-100 rounded-lg p-3 w-fit mb-4">
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">
                Receive intelligent job suggestions that improve over time based on your preferences and feedback.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 rounded-lg p-3 w-fit mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Guidance</h3>
              <p className="text-gray-600">
                Get personalized career development advice and insights to help you make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have found their perfect match with our AI-powered platform.
          </p>
          
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 inline-flex items-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <div className="flex items-center justify-center space-x-6 mt-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>No signup required to try</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>100% Free to use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">AI Resume Matcher</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering careers with AI-driven job matching technology
            </p>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-gray-500">
                © 2024 AI Resume Matcher. Built with Next.js, Supabase, and Groq AI.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Developed by</span>
                <a
                  href="https://knnivedh.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  K N Nivedh
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}