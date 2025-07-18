'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'
import { FaPen, FaRegNewspaper, FaHome, FaGraduationCap } from 'react-icons/fa'

const navItems = [
  { label: 'Home', icon: <FaHome />, href: '/' },
  { label: 'Write Post', icon: <FaPen />, href: '/upload' },
  { label: 'Posts', icon: <FaRegNewspaper />, href: '/posts' },
  { label: 'Help', icon: <FaGraduationCap />, href: '/advocate-search' },
  { label: 'Profile', icon: <User />, href: '/profile' }
]

const buttonClass =
  'border border-white text-white hover:border-red-500 hover:text-red-500 px-3 py-1 rounded-lg flex items-center space-x-2 transition-colors duration-200'

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/djyk287ep/image/upload/v1752266605/logoipsum-359_st42rg.png"
              alt="Voice Chain Logo"
              className="w-8 h-8 mr-3"
            />
            <span className="text-2xl font-bold text-white">Voice Chain</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item, idx) => (
              <Link key={idx} href={item.href} className={buttonClass}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            {/* <WalletButton /> */}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/95 px-4 pb-4">
          <div className="border-t border-gray-800 pt-4 space-y-3">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={buttonClass + ' w-full justify-center'}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar