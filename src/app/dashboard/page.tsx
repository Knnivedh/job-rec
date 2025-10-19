'use client'

import { useState, useEffect } from 'react'
import { User, FileText, Briefcase, TrendingUp, Settings, LogOut } from 'lucide-react'
import ResumeUpload from '@/components/ResumeUpload'
import JobRecommendations from '@/components/JobRecommendations'
import SystemStatus from '@/components/SystemStatus'
import { useRouter } from 'next/navigation'

interface UserProfile {
  name?: string
  email?: string
  resumeCount: number
  recommendationsCount: number
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'recommendations' | 'profile'>('upload')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [supabase, setSupabase] = useState<any>(null)
  
  const router = useRouter()

  useEffect(() => {
    // Check if we're in SIMPLE mode
    const isSimpleMode = !process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (isSimpleMode) {
      router.push('/simple')
      return
    }

    // In FULL mode, initialize supabase
    const initDashboard = async () => {
      try {
        const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
        const supabaseClient = createClientComponentClient()
        setSupabase(supabaseClient)
        fetchUserProfile(supabaseClient)
      } catch (error) {
        console.error('Dashboard initialization error:', error)
        router.push('/simple')
      }
    }
    
    initDashboard()
  }, [])

  const fetchUserProfile = async (supabaseClient: any) => {
    if (!supabaseClient) return
    
    try {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Get user resumes count
      const { data: resumes, count: resumeCount } = await supabaseClient
        .from('resumes')
        .select('id', { count: 'exact' })
        .eq('is_active', true)

      // Get recommendations count
      const { data: recommendations, count: recommendationsCount } = await supabaseClient
        .from('job_recommendations')
        .select('id', { count: 'exact' })

      setUserProfile({
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        resumeCount: resumeCount || 0,
        recommendationsCount: recommendationsCount || 0
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleResumeUploaded = () => {
    // Refresh recommendations when a new resume is uploaded
    setRefreshKey(prev => prev + 1)
    setActiveTab('recommendations')
    fetchUserProfile()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Resume Matcher</h1>
                <p className="text-sm text-gray-500">Find your perfect job match</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            {/* Stats Cards */}
            <div className="space-y-4">
              {/* System Status */}
              <SystemStatus />
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Resumes</p>
                    <p className="text-2xl font-semibold text-gray-900">{userProfile?.resumeCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Job Matches</p>
                    <p className="text-2xl font-semibold text-gray-900">{userProfile?.recommendationsCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 mr-3" />
                Upload Resume
              </button>
              
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'recommendations'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-3" />
                Job Recommendations
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {activeTab === 'upload' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Resume</h2>
                    <p className="text-gray-600">
                      Upload your resume to get AI-powered job recommendations tailored to your skills and experience.
                    </p>
                  </div>
                  <ResumeUpload />
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Recommendations</h2>
                    <p className="text-gray-600">
                      Discover jobs that match your skills and experience. Our AI analyzes your resume to find the best opportunities.
                    </p>
                  </div>
                  <JobRecommendations key={refreshKey} />
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Settings</h2>
                    <p className="text-gray-600">
                      Manage your account settings and preferences.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Account Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Name:</span>
                          <span className="text-sm text-gray-900">{userProfile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Email:</span>
                          <span className="text-sm text-gray-900">{userProfile?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Resumes Uploaded:</span>
                          <span className="text-sm text-gray-900">{userProfile?.resumeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Job Recommendations:</span>
                          <span className="text-sm text-gray-900">{userProfile?.recommendationsCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <button
                        onClick={handleSignOut}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}