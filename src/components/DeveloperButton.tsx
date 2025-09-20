'use client'

import { ExternalLink, User } from 'lucide-react'

export default function DeveloperButton() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://knnivedh.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">Developed by K N Nivedh</span>
        <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      </a>
    </div>
  )
}