

import { useState, useEffect } from 'react'
import { Download, Lock, FileText, AlertTriangle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'

interface FileData {
  name: string;
  url: string;
  password?: string;
  expiry: string; // Supabase returns ISO string for timestamps
  size: number;
}

export default function FileAccess() {
  const { id } = useParams<{ id: string }>()
  const [password, setPassword] = useState('')
  const [accessGranted, setAccessGranted] = useState(false)
  const [error, setError] = useState('')
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const fetchFileData = async () => {
      if (!id) {
        setError('Invalid file link.')
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('id', id)
          .single()

        if (data && !error) {
          setFileData(data as FileData)

          const expiryDate = new Date(data.expiry)
          if (new Date() > expiryDate) {
            setIsExpired(true)
          } else if (!data.password) {
            setAccessGranted(true)
          }
        } else {
          setError('File not found. The link may be incorrect or the file has been deleted.')
        }
      } catch (err) {
        console.error("Error fetching file data: ", err)
        setError('An error occurred while trying to access the file.')
      } finally {
        setLoading(false)
      }
    }

    fetchFileData()
  }, [id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fileData && password === fileData.password) {
      setAccessGranted(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }
  
  const getRemainingTime = () => {
    if (!fileData) return ''
    const now = new Date().getTime()
    const expiryTime = new Date(fileData.expiry).getTime()
    const difference = expiryTime - now

    if (difference <= 0) {
      return 'Link has expired'
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    let remaining = ''
    if (days > 0) remaining += `${days} day${days > 1 ? 's' : ''} `
    if (hours > 0) remaining += `${hours} hour${hours > 1 ? 's' : ''} `
    if (days === 0 && minutes > 0) remaining += `${minutes} minute${minutes > 1 ? 's' : ''} `

    return `This link expires in ${remaining.trim()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Link Expired
          </h2>
          <p className="text-gray-600">This file sharing link has expired and is no longer available.</p>
        </div>
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            File Not Found
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {accessGranted ? 'File Ready to Download' : 'Enter Password to Access File'}
          </h2>
        </div>
        
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-100">
          {!accessGranted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter password"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Unlock File
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-lg p-4 w-full">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-lg">
                      <FileText className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{fileData.name}</p>
                      <p className="text-sm text-gray-500">{(fileData.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">{getRemainingTime()}</h3>
                  </div>
                </div>
              </div>

              <a
                href={fileData.url}
                download
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

  