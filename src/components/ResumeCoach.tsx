'use client'

import { useState, useEffect } from 'react'

interface ResumeCoachProps {
  resumeData: any
}

export function ResumeCoach({ resumeData }: ResumeCoachProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [atsScore, setAtsScore] = useState<number | null>(null)

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your AI Resume Coach powered by NVIDIA AI. I've analyzed your resume and I'm here to help you improve it. Ask me anything about ATS optimization, resume improvements, or career advice!`
      }])
    }
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev: any[]) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          resumeData
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      setMessages((prev: any[]) => [...prev, {
        role: 'assistant',
        content: data.response
      }])

      if (data.atsScore !== undefined) {
        setAtsScore(data.atsScore)
      }

    } catch (error) {
      setMessages((prev: any[]) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: '📊 ATS Score', action: 'What is my ATS score?' },
    { label: '💡 Improve Resume', action: 'How can I improve my resume?' },
    { label: '🎯 Add Skills', action: 'What skills should I add?' },
    { label: '💼 Interview Tips', action: 'Give me interview tips' }
  ]

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
        aria-label="AI Resume Coach"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-white">AI Resume Coach</h3>
              {atsScore !== null && (
                <p className="text-xs text-blue-100">ATS: {atsScore}/100</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t border-gray-700 flex flex-wrap gap-2">
            {quickActions.map((qa: any, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(qa.action)
                  setTimeout(() => sendMessage(), 100)
                }}
                className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

