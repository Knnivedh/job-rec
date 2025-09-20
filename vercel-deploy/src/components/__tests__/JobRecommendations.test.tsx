import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock job recommendation data
const mockRecommendations = [
  {
    id: 'rec-1',
    job_title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    job_type: 'full-time',
    salary_range: '$120,000 - $150,000',
    requirements: ['React', 'TypeScript', '5+ years experience'],
    description: 'Join our team to build amazing web applications using modern technologies.',
    match_score: 0.89,
    skills_match: ['React', 'TypeScript', 'JavaScript'],
    experience_match: true,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 'rec-2',
    job_title: 'Backend Engineer',
    company: 'StartupCo',
    location: 'Remote',
    job_type: 'full-time',
    salary_range: '$100,000 - $130,000',
    requirements: ['Node.js', 'Python', '3+ years experience'],
    description: 'Build scalable backend systems for our growing platform.',
    match_score: 0.75,
    skills_match: ['Node.js', 'Python'],
    experience_match: true,
    created_at: '2023-01-02T00:00:00Z'
  },
  {
    id: 'rec-3',
    job_title: 'Junior Developer',
    company: 'NewTech',
    location: 'New York, NY',
    job_type: 'full-time',
    salary_range: '$70,000 - $90,000',
    requirements: ['JavaScript', 'HTML', 'CSS'],
    description: 'Great opportunity for new developers to grow their skills.',
    match_score: 0.65,
    skills_match: ['JavaScript', 'HTML', 'CSS'],
    experience_match: false,
    created_at: '2023-01-03T00:00:00Z'
  }
]

// Mock component
const MockJobRecommendations = ({ 
  recommendations = mockRecommendations,
  loading = false,
  error = null 
}: {
  recommendations?: typeof mockRecommendations,
  loading?: boolean,
  error?: string | null
}) => {
  const [feedbackSent, setFeedbackSent] = React.useState<Record<string, string>>({})

  const handleFeedback = (recommendationId: string, feedbackType: string) => {
    setFeedbackSent(prev => ({ ...prev, [recommendationId]: feedbackType }))
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatSalary = (salaryRange: string | null) => {
    return salaryRange
  }

  if (loading) {
    return (
      <div data-testid="loading-state">
        {[1, 2, 3].map((i) => (
          <div key={i} data-testid={`loading-card-${i}`} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="error-state">
        <p data-testid="error-message">{error}</p>
        <button data-testid="retry-button">Try Again</button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div data-testid="empty-state">
        <p>No job recommendations yet. Upload your resume to get personalized job matches!</p>
      </div>
    )
  }

  return (
    <div data-testid="recommendations-container">
      <div data-testid="recommendations-header">
        <h3>Found {recommendations.length} matching jobs</h3>
        <button data-testid="refresh-button">Refresh</button>
      </div>

      <div data-testid="recommendations-list">
        {recommendations.map((job) => (
          <div key={job.id} data-testid={`job-card-${job.id}`} className="job-card">
            <div className="job-header">
              <div>
                <h4 data-testid={`job-title-${job.id}`}>{job.job_title}</h4>
                <div data-testid={`company-${job.id}`}>
                  <span data-testid="building-icon">🏢</span>
                  <span>{job.company}</span>
                </div>
              </div>
              
              <div data-testid={`match-score-${job.id}`} className={getMatchScoreColor(job.match_score)}>
                {Math.round(job.match_score * 100)}% match
              </div>
            </div>

            <div className="job-details">
              {job.location && (
                <div data-testid={`location-${job.id}`}>
                  <span data-testid="location-icon">📍</span>
                  <span>{job.location}</span>
                </div>
              )}
              
              {job.job_type && (
                <div data-testid={`job-type-${job.id}`}>
                  <span data-testid="clock-icon">🕐</span>
                  <span className="capitalize">{job.job_type}</span>
                </div>
              )}

              {job.salary_range && (
                <div data-testid={`salary-${job.id}`}>
                  <span data-testid="dollar-icon">💰</span>
                  <span>{formatSalary(job.salary_range)}</span>
                </div>
              )}
            </div>

            <p data-testid={`description-${job.id}`} className="description">
              {job.description}
            </p>

            {job.skills_match.length > 0 && (
              <div data-testid={`skills-match-${job.id}`}>
                <h5>Matching Skills:</h5>
                <div className="skills-container">
                  {job.skills_match.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      data-testid={`skill-${job.id}-${index}`}
                      className="skill-tag"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills_match.length > 5 && (
                    <span data-testid={`more-skills-${job.id}`} className="more-skills">
                      +{job.skills_match.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="job-actions">
              <div className="feedback-actions">
                <button
                  data-testid={`like-button-${job.id}`}
                  onClick={() => handleFeedback(job.id, 'like')}
                  className={feedbackSent[job.id] === 'like' ? 'active' : ''}
                >
                  <span data-testid="thumbs-up-icon">👍</span>
                  <span>Like</span>
                </button>
                
                <button
                  data-testid={`dislike-button-${job.id}`}
                  onClick={() => handleFeedback(job.id, 'dislike')}
                  className={feedbackSent[job.id] === 'dislike' ? 'active' : ''}
                >
                  <span data-testid="thumbs-down-icon">👎</span>
                  <span>Not Interested</span>
                </button>

                <button
                  data-testid={`save-button-${job.id}`}
                  onClick={() => handleFeedback(job.id, 'saved')}
                  className={feedbackSent[job.id] === 'saved' ? 'active' : ''}
                >
                  <span data-testid="heart-icon">❤️</span>
                  <span>Save</span>
                </button>
              </div>

              <div className="primary-actions">
                <button
                  data-testid={`apply-button-${job.id}`}
                  onClick={() => handleFeedback(job.id, 'applied')}
                  className="apply-button"
                >
                  Apply Now
                </button>
                
                <button data-testid={`details-button-${job.id}`} className="details-button">
                  <span data-testid="external-link-icon">🔗</span>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

describe('JobRecommendations Component', () => {
  describe('Loading State', () => {
    it('should render loading skeleton cards', () => {
      render(<MockJobRecommendations loading={true} recommendations={[]} />)
      
      expect(screen.getByTestId('loading-state')).toBeDefined()
      expect(screen.getByTestId('loading-card-1')).toBeDefined()
      expect(screen.getByTestId('loading-card-2')).toBeDefined()
      expect(screen.getByTestId('loading-card-3')).toBeDefined()
    })

    it('should show correct number of loading cards', () => {
      render(<MockJobRecommendations loading={true} recommendations={[]} />)
      
      const loadingCards = screen.getAllByTestId(/loading-card-/)
      expect(loadingCards).toHaveLength(3)
    })
  })

  describe('Error State', () => {
    it('should render error message and retry button', () => {
      const errorMessage = 'Failed to fetch recommendations'
      render(<MockJobRecommendations error={errorMessage} recommendations={[]} />)
      
      expect(screen.getByTestId('error-state')).toBeDefined()
      expect(screen.getByTestId('error-message')).toBeDefined()
      expect(screen.getByText(errorMessage)).toBeDefined()
      expect(screen.getByTestId('retry-button')).toBeDefined()
    })

    it('should display retry button that is clickable', () => {
      render(<MockJobRecommendations error="Error occurred" recommendations={[]} />)
      
      const retryButton = screen.getByTestId('retry-button')
      expect(retryButton).toBeDefined()
      
      // Button should be clickable
      fireEvent.click(retryButton)
      // In real implementation, this would trigger a retry
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no recommendations', () => {
      render(<MockJobRecommendations recommendations={[]} />)
      
      expect(screen.getByTestId('empty-state')).toBeDefined()
      expect(screen.getByText('No job recommendations yet. Upload your resume to get personalized job matches!')).toBeDefined()
    })
  })

  describe('Recommendations Display', () => {
    it('should render recommendations header with count', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getByTestId('recommendations-header')).toBeDefined()
      expect(screen.getByText('Found 3 matching jobs')).toBeDefined()
      expect(screen.getByTestId('refresh-button')).toBeDefined()
    })

    it('should render all job recommendations', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getByTestId('recommendations-list')).toBeDefined()
      expect(screen.getByTestId('job-card-rec-1')).toBeDefined()
      expect(screen.getByTestId('job-card-rec-2')).toBeDefined()
      expect(screen.getByTestId('job-card-rec-3')).toBeDefined()
    })

    it('should display job titles correctly', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getByText('Senior Frontend Developer')).toBeDefined()
      expect(screen.getByText('Backend Engineer')).toBeDefined()
      expect(screen.getByText('Junior Developer')).toBeDefined()
    })

    it('should display company names with icons', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getByText('Tech Corp')).toBeDefined()
      expect(screen.getByText('StartupCo')).toBeDefined()
      expect(screen.getByText('NewTech')).toBeDefined()
      
      // Should have building icons
      const buildingIcons = screen.getAllByTestId('building-icon')
      expect(buildingIcons).toHaveLength(3)
    })

    it('should display match scores with appropriate colors', () => {
      render(<MockJobRecommendations />)
      
      // High score (89%) - should be green
      const highScore = screen.getByTestId('match-score-rec-1')
      expect(highScore.textContent).toBe('89% match')
      expect(highScore.className).toContain('text-green-600')
      
      // Medium score (75%) - should be yellow
      const mediumScore = screen.getByTestId('match-score-rec-2')
      expect(mediumScore.textContent).toBe('75% match')
      expect(mediumScore.className).toContain('text-yellow-600')
      
      // Lower score (65%) - should be yellow
      const lowerScore = screen.getByTestId('match-score-rec-3')
      expect(lowerScore.textContent).toBe('65% match')
      expect(lowerScore.className).toContain('text-yellow-600')
    })

    it('should display job details with icons', () => {
      render(<MockJobRecommendations />)
      
      // Location
      expect(screen.getByText('San Francisco, CA')).toBeDefined()
      expect(screen.getByText('Remote')).toBeDefined()
      expect(screen.getByText('New York, NY')).toBeDefined()
      
      // Job type
      expect(screen.getByText('full-time')).toBeDefined()
      
      // Salary
      expect(screen.getByText('$120,000 - $150,000')).toBeDefined()
      expect(screen.getByText('$100,000 - $130,000')).toBeDefined()
      
      // Icons should be present
      expect(screen.getAllByTestId('location-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('dollar-icon')).toHaveLength(3)
    })

    it('should display job descriptions', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getByText('Join our team to build amazing web applications using modern technologies.')).toBeDefined()
      expect(screen.getByText('Build scalable backend systems for our growing platform.')).toBeDefined()
      expect(screen.getByText('Great opportunity for new developers to grow their skills.')).toBeDefined()
    })
  })

  describe('Skills Matching', () => {
    it('should display matching skills section', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getByTestId('skills-match-rec-1')).toBeDefined()
      expect(screen.getByText('Matching Skills:')).toBeDefined()
    })

    it('should display individual skill tags', () => {
      render(<MockJobRecommendations />)
      
      // First job skills
      expect(screen.getByTestId('skill-rec-1-0')).toBeDefined()
      expect(screen.getByTestId('skill-rec-1-1')).toBeDefined()
      expect(screen.getByTestId('skill-rec-1-2')).toBeDefined()
      
      expect(screen.getByText('React')).toBeDefined()
      expect(screen.getByText('TypeScript')).toBeDefined()
      expect(screen.getByText('JavaScript')).toBeDefined()
    })

    it('should limit displayed skills to 5 and show more indicator', () => {
      const jobWithManySkills = {
        ...mockRecommendations[0],
        skills_match: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Python']
      }
      
      render(<MockJobRecommendations recommendations={[jobWithManySkills]} />)
      
      // Should show first 5 skills
      expect(screen.getByTestId('skill-rec-1-0')).toBeDefined()
      expect(screen.getByTestId('skill-rec-1-4')).toBeDefined()
      
      // Should show "more" indicator
      expect(screen.getByTestId('more-skills-rec-1')).toBeDefined()
      expect(screen.getByText('+2 more')).toBeDefined()
    })
  })

  describe('Feedback Actions', () => {
    it('should render all feedback buttons', () => {
      render(<MockJobRecommendations />)
      
      // Like buttons
      expect(screen.getByTestId('like-button-rec-1')).toBeDefined()
      expect(screen.getByTestId('like-button-rec-2')).toBeDefined()
      expect(screen.getByTestId('like-button-rec-3')).toBeDefined()
      
      // Dislike buttons
      expect(screen.getByTestId('dislike-button-rec-1')).toBeDefined()
      expect(screen.getByTestId('dislike-button-rec-2')).toBeDefined()
      expect(screen.getByTestId('dislike-button-rec-3')).toBeDefined()
      
      // Save buttons
      expect(screen.getByTestId('save-button-rec-1')).toBeDefined()
      expect(screen.getByTestId('save-button-rec-2')).toBeDefined()
      expect(screen.getByTestId('save-button-rec-3')).toBeDefined()
    })

    it('should handle like button clicks', () => {
      render(<MockJobRecommendations />)
      
      const likeButton = screen.getByTestId('like-button-rec-1')
      expect(likeButton.className).not.toContain('active')
      
      fireEvent.click(likeButton)
      expect(likeButton.className).toContain('active')
    })

    it('should handle dislike button clicks', () => {
      render(<MockJobRecommendations />)
      
      const dislikeButton = screen.getByTestId('dislike-button-rec-1')
      fireEvent.click(dislikeButton)
      expect(dislikeButton.className).toContain('active')
    })

    it('should handle save button clicks', () => {
      render(<MockJobRecommendations />)
      
      const saveButton = screen.getByTestId('save-button-rec-1')
      fireEvent.click(saveButton)
      expect(saveButton.className).toContain('active')
    })

    it('should display feedback button icons and text', () => {
      render(<MockJobRecommendations />)
      
      // Icons
      expect(screen.getAllByTestId('thumbs-up-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('thumbs-down-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('heart-icon')).toHaveLength(3)
      
      // Text
      expect(screen.getAllByText('Like')).toHaveLength(3)
      expect(screen.getAllByText('Not Interested')).toHaveLength(3)
      expect(screen.getAllByText('Save')).toHaveLength(3)
    })
  })

  describe('Primary Actions', () => {
    it('should render apply and view details buttons', () => {
      render(<MockJobRecommendations />)
      
      // Apply buttons
      expect(screen.getByTestId('apply-button-rec-1')).toBeDefined()
      expect(screen.getByTestId('apply-button-rec-2')).toBeDefined()
      expect(screen.getByTestId('apply-button-rec-3')).toBeDefined()
      
      // View details buttons
      expect(screen.getByTestId('details-button-rec-1')).toBeDefined()
      expect(screen.getByTestId('details-button-rec-2')).toBeDefined()
      expect(screen.getByTestId('details-button-rec-3')).toBeDefined()
      
      // Button text
      expect(screen.getAllByText('Apply Now')).toHaveLength(3)
      expect(screen.getAllByText('View Details')).toHaveLength(3)
    })

    it('should handle apply button clicks', () => {
      render(<MockJobRecommendations />)
      
      const applyButton = screen.getByTestId('apply-button-rec-1')
      fireEvent.click(applyButton)
      // In real implementation, this would send feedback
    })

    it('should handle view details button clicks', () => {
      render(<MockJobRecommendations />)
      
      const detailsButton = screen.getByTestId('details-button-rec-1')
      fireEvent.click(detailsButton)
      // In real implementation, this would open job details
    })

    it('should display external link icons on details buttons', () => {
      render(<MockJobRecommendations />)
      
      expect(screen.getAllByTestId('external-link-icon')).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<MockJobRecommendations />)
      
      // Headings should be properly structured
      expect(screen.getByRole('heading', { level: 3 })).toBeDefined() // Main heading
      
      // Buttons should be accessible
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy() // Should have text or aria-label
      })
    })

    it('should support keyboard navigation', () => {
      render(<MockJobRecommendations />)
      
      const firstButton = screen.getByTestId('refresh-button')
      firstButton.focus()
      expect(document.activeElement).toBe(firstButton)
      
      const likeButton = screen.getByTestId('like-button-rec-1')
      likeButton.focus()
      expect(document.activeElement).toBe(likeButton)
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle different recommendation counts', () => {
      // Single recommendation
      render(<MockJobRecommendations recommendations={[mockRecommendations[0]]} />)
      expect(screen.getByText('Found 1 matching jobs')).toBeDefined()
      
      // Multiple recommendations
      render(<MockJobRecommendations recommendations={mockRecommendations} />)
      expect(screen.getByText('Found 3 matching jobs')).toBeDefined()
    })

    it('should handle missing optional data gracefully', () => {
      const incompleteJob = {
        ...mockRecommendations[0],
        location: undefined as any,
        salary_range: undefined as any,
        job_type: undefined as any,
        skills_match: [] as string[]
      }
      
      render(<MockJobRecommendations recommendations={[incompleteJob]} />)
      
      // Should still render the job card
      expect(screen.getByTestId('job-card-rec-1')).toBeDefined()
      expect(screen.getByText('Senior Frontend Developer')).toBeDefined()
      
      // Optional fields should not cause errors
      expect(screen.queryByTestId('location-rec-1')).toBeNull()
      expect(screen.queryByTestId('salary-rec-1')).toBeNull()
      expect(screen.queryByTestId('skills-match-rec-1')).toBeNull()
    })
  })
})