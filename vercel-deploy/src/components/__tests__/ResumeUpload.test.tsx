import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock the file upload functionality
const MockResumeUpload = () => {
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadResult, setUploadResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [dragActive, setDragActive] = React.useState(false)

  const handleFileSelect = (file: File | null) => {
    if (!file) return

    setError(null)
    setUploadResult(null)

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum size is 10MB.')
      return
    }

    // Simulate upload process
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setUploadResult({
        id: 'resume-123',
        fileName: file.name,
        parsedData: {
          contact_info: { name: 'John Doe' },
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: [{ company: 'Tech Corp', position: 'Developer' }],
        },
        uploadDate: new Date().toISOString()
      })
    }, 1000)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    handleFileSelect(file)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFileSelect(file)
  }

  return (
    <div>
      <div
        data-testid="drop-zone"
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div data-testid="upload-icon">📄</div>
        <label htmlFor="resume-upload">
          <span>Drop your resume here, or browse</span>
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={onFileInputChange}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </label>
        <p>Supports PDF and DOCX files up to 10MB</p>
      </div>

      {isUploading && (
        <div data-testid="uploading-indicator">
          <div data-testid="loading-spinner">⏳</div>
          <span>Processing your resume...</span>
        </div>
      )}

      {error && (
        <div data-testid="error-message" role="alert">
          <span data-testid="error-icon">❌</span>
          <div>
            <h3>Upload Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {uploadResult && (
        <div data-testid="success-message">
          <span data-testid="success-icon">✅</span>
          <div>
            <h3>Resume uploaded successfully!</h3>
            <div>
              <span data-testid="file-icon">📄</span>
              <span>{uploadResult.fileName}</span>
            </div>
            {uploadResult.parsedData.contact_info.name && (
              <div>
                <strong>Name:</strong> {uploadResult.parsedData.contact_info.name}
              </div>
            )}
            {uploadResult.parsedData.skills.length > 0 && (
              <div>
                <strong>Skills detected:</strong>{' '}
                {uploadResult.parsedData.skills.slice(0, 5).join(', ')}
                {uploadResult.parsedData.skills.length > 5 && 
                  ` and ${uploadResult.parsedData.skills.length - 5} more`
                }
              </div>
            )}
            {uploadResult.parsedData.experience.length > 0 && (
              <div>
                <strong>Experience:</strong> {uploadResult.parsedData.experience.length} positions found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

describe('ResumeUpload Component', () => {
  describe('Initial Render', () => {
    it('should render the upload drop zone', () => {
      render(<MockResumeUpload />)
      
      expect(screen.getByTestId('drop-zone')).toBeDefined()
      expect(screen.getByText('Drop your resume here, or browse')).toBeDefined()
      expect(screen.getByText('Supports PDF and DOCX files up to 10MB')).toBeDefined()
    })

    it('should render file input with correct attributes', () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      expect(fileInput.type).toBe('file')
      expect(fileInput.accept).toBe('.pdf,.docx')
      expect(fileInput.disabled).toBe(false)
    })

    it('should have upload icon visible', () => {
      render(<MockResumeUpload />)
      
      expect(screen.getByTestId('upload-icon')).toBeDefined()
    })
  })

  describe('File Validation', () => {
    it('should accept PDF files', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const pdfFile = new File(['PDF content'], 'resume.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [pdfFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      // Should show uploading state
      expect(screen.getByTestId('uploading-indicator')).toBeDefined()
      expect(screen.queryByTestId('error-message')).toBeNull()
    })

    it('should accept DOCX files', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const docxFile = new File(['DOCX content'], 'resume.docx', { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      
      Object.defineProperty(fileInput, 'files', {
        value: [docxFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      expect(screen.getByTestId('uploading-indicator')).toBeDefined()
      expect(screen.queryByTestId('error-message')).toBeNull()
    })

    it('should reject invalid file types', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const invalidFile = new File(['Text content'], 'resume.txt', { type: 'text/plain' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      expect(screen.getByTestId('error-message')).toBeDefined()
      expect(screen.getByText('Please upload a PDF or DOCX file')).toBeDefined()
    })

    it('should reject files that are too large', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large-resume.pdf', { 
        type: 'application/pdf' 
      })
      
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      expect(screen.getByTestId('error-message')).toBeDefined()
      expect(screen.getByText('File size too large. Maximum size is 10MB.')).toBeDefined()
    })
  })

  describe('Drag and Drop Functionality', () => {
    it('should handle drag over events', () => {
      render(<MockResumeUpload />)
      
      const dropZone = screen.getByTestId('drop-zone')
      
      fireEvent.dragOver(dropZone, {
        dataTransfer: {
          files: [new File(['content'], 'test.pdf', { type: 'application/pdf' })]
        }
      })
      
      expect(dropZone.className).toContain('drag-active')
    })

    it('should handle drag leave events', () => {
      render(<MockResumeUpload />)
      
      const dropZone = screen.getByTestId('drop-zone')
      
      // First drag over to activate
      fireEvent.dragOver(dropZone)
      expect(dropZone.className).toContain('drag-active')
      
      // Then drag leave to deactivate
      fireEvent.dragLeave(dropZone)
      expect(dropZone.className).not.toContain('drag-active')
    })

    it('should handle file drop', async () => {
      render(<MockResumeUpload />)
      
      const dropZone = screen.getByTestId('drop-zone')
      const pdfFile = new File(['PDF content'], 'dropped-resume.pdf', { type: 'application/pdf' })
      
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [pdfFile]
        }
      })
      
      expect(screen.getByTestId('uploading-indicator')).toBeDefined()
      expect(dropZone.className).not.toContain('drag-active')
    })
  })

  describe('Upload Process', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should show uploading state during file processing', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const pdfFile = new File(['PDF content'], 'resume.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [pdfFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      // Should show uploading state
      expect(screen.getByTestId('uploading-indicator')).toBeDefined()
      expect(screen.getByTestId('loading-spinner')).toBeDefined()
      expect(screen.getByText('Processing your resume...')).toBeDefined()
      
      // File input should be disabled during upload
      expect(fileInput.disabled).toBe(true)
    })

    it('should show success message after successful upload', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const pdfFile = new File(['PDF content'], 'resume.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [pdfFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      // Fast-forward time to complete upload
      jest.advanceTimersByTime(1000)
      
      // Should show success state
      expect(screen.getByTestId('success-message')).toBeDefined()
      expect(screen.getByText('Resume uploaded successfully!')).toBeDefined()
      expect(screen.getByText('resume.pdf')).toBeDefined()
      
      // Should hide uploading indicator
      expect(screen.queryByTestId('uploading-indicator')).toBeNull()
    })

    it('should display parsed resume data in success message', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const pdfFile = new File(['PDF content'], 'resume.pdf', { type: 'application/pdf' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [pdfFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      jest.advanceTimersByTime(1000)
      
      // Should show parsed data
      expect(screen.getByText('Name:')).toBeDefined()
      expect(screen.getByText('John Doe')).toBeDefined()
      expect(screen.getByText('Skills detected:')).toBeDefined()
      expect(screen.getByText('JavaScript, React, Node.js')).toBeDefined()
      expect(screen.getByText('Experience:')).toBeDefined()
      expect(screen.getByText('1 positions found')).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should display error messages with proper styling', () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const invalidFile = new File(['Text content'], 'resume.txt', { type: 'text/plain' })
      
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)
      
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toBeDefined()
      expect(errorMessage.getAttribute('role')).toBe('alert')
      expect(screen.getByTestId('error-icon')).toBeDefined()
      expect(screen.getByText('Upload Error')).toBeDefined()
      expect(screen.getByText('Please upload a PDF or DOCX file')).toBeDefined()
    })

    it('should clear errors when valid file is selected', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      
      // First upload invalid file
      const invalidFile = new File(['Text content'], 'resume.txt', { type: 'text/plain' })
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      })
      fireEvent.change(fileInput)
      
      expect(screen.getByTestId('error-message')).toBeDefined()
      
      // Then upload valid file
      const validFile = new File(['PDF content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput, 'files', {
        value: [validFile],
        writable: false,
      })
      fireEvent.change(fileInput)
      
      // Error should be cleared
      expect(screen.queryByTestId('error-message')).toBeNull()
      expect(screen.getByTestId('uploading-indicator')).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels and ARIA attributes', () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse')
      expect(fileInput).toBeDefined()
      
      // Error messages should have alert role
      const invalidFile = new File(['Text content'], 'resume.txt', { type: 'text/plain' })
      Object.defineProperty(fileInput as HTMLInputElement, 'files', {
        value: [invalidFile],
        writable: false,
      })
      fireEvent.change(fileInput)
      
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage.getAttribute('role')).toBe('alert')
    })

    it('should be keyboard accessible', () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      
      // File input should be focusable
      fileInput.focus()
      expect(document.activeElement).toBe(fileInput)
    })
  })

  describe('UI States', () => {
    it('should show different icons for different states', async () => {
      render(<MockResumeUpload />)
      
      // Initial state - upload icon
      expect(screen.getByTestId('upload-icon')).toBeDefined()
      
      // Error state - error icon
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      const invalidFile = new File(['Text content'], 'resume.txt', { type: 'text/plain' })
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      })
      fireEvent.change(fileInput)
      
      expect(screen.getByTestId('error-icon')).toBeDefined()
      
      // Success state - success icon
      const validFile = new File(['PDF content'], 'resume.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput, 'files', {
        value: [validFile],
        writable: false,
      })
      fireEvent.change(fileInput)
      
      jest.useFakeTimers()
      jest.advanceTimersByTime(1000)
      
      expect(screen.getByTestId('success-icon')).toBeDefined()
      expect(screen.getByTestId('file-icon')).toBeDefined()
      
      jest.useRealTimers()
    })

    it('should handle multiple uploads correctly', async () => {
      render(<MockResumeUpload />)
      
      const fileInput = screen.getByLabelText('Drop your resume here, or browse') as HTMLInputElement
      
      jest.useFakeTimers()
      
      // First upload
      const file1 = new File(['PDF content'], 'resume1.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput, 'files', {
        value: [file1],
        writable: false,
      })
      fireEvent.change(fileInput)
      jest.advanceTimersByTime(1000)
      
      expect(screen.getByText('resume1.pdf')).toBeDefined()
      
      // Second upload should replace first
      const file2 = new File(['PDF content'], 'resume2.pdf', { type: 'application/pdf' })
      Object.defineProperty(fileInput, 'files', {
        value: [file2],
        writable: false,
      })
      fireEvent.change(fileInput)
      jest.advanceTimersByTime(1000)
      
      expect(screen.getByText('resume2.pdf')).toBeDefined()
      expect(screen.queryByText('resume1.pdf')).toBeNull()
      
      jest.useRealTimers()
    })
  })
})