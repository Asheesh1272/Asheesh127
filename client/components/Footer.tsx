import { MessageCircle } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        {/* Logo + Title */}
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-red-600" />
          <span className="text-white text-lg font-semibold">Voice Chain</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 text-center md:text-left">
          © 2025 Voice Chain. Powered by Team Tech Janta Party.
        </p>
      </div>
    </footer>
  )
}

export default Footer