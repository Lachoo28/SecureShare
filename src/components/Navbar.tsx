
import { Link } from 'react-router-dom'
import { Upload, Shield, Clock, FileText } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                97
              </span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Link>
            <a href="#features" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
              <Shield className="w-4 h-4 mr-1" />
              Features
            </a>
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
              <Clock className="w-4 h-4 mr-1" />
              How It Works
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
  