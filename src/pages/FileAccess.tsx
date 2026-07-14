

import { useState, useEffect, useMemo } from 'react'
import { Download, Lock, FileText, AlertTriangle, Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'

interface FileData {
  name: string;
  url: string;
  password?: string;
  expiry: string; // Supabase returns ISO string for timestamps
  size: number;
}

interface FileItem {
  name: string;
  size: number;
  url: string;
}

export default function FileAccess() {
  const { id } = useParams<{ id: string }>()
  const [password, setPassword] = useState('')
  const [accessGranted, setAccessGranted] = useState(false)
  const [error, setError] = useState('')
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)

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

  const files = useMemo((): FileItem[] => {
    if (!fileData) return [];

    try {
      const parsed = JSON.parse(fileData.url);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      console.error('Invalid file data: parsed URL is not an array.');
      return [];
    } catch (e) {
      // This handles single-file uploads where `fileData.url` is a direct URL.
      return [{ name: fileData.name, size: fileData.size, url: fileData.url }];
    }
  }, [fileData]);

  const downloadFile = async (file: FileItem) => {
    try {
      // The path is the last part of the public URL
      const filePath = file.url.substring(file.url.lastIndexOf('/') + 1);

      const { data, error } = await supabase.storage
        .from('uploads')
        .download(filePath);

      if (error) {
        throw error;
      }

      const blob = data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (downloadError: any) {
      console.error('Error downloading file:', file.name, downloadError);
      setError(`Failed to download ${file.name}. ${downloadError.message}`);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError('');

    const filesToDownload = isMultiFile ? files.filter((_, i) => selectedIndices.has(i)) : files;

    if (filesToDownload.length === 0) {
        setIsDownloading(false);
        return;
    }

    for (const file of filesToDownload) {
      await downloadFile(file);
      if (filesToDownload.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsDownloading(false);
  };

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

  const isMultiFile = files.length > 1;

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  }

  const toggleSelectAll = () => {
    if (selectedIndices.size === files.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(files.map((_, i) => i)));
    }
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
              {isMultiFile && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedIndices.size === files.length && files.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>Select All ({files.length})</span>
                  </label>
                  <span className="text-sm text-gray-500">{selectedIndices.size} selected</span>
                </div>
              )}

              {files.map((file, index) => (
                <div key={index} className="flex justify-center">
                  <div className={`bg-gray-100 rounded-lg p-4 w-full transition-colors ${selectedIndices.has(index) ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
                    <div className="flex items-center space-x-4 relative">
                      {isMultiFile && (
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedIndices.has(index)}
                            onChange={() => toggleSelection(index)}
                            className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </div>
                      )}
                      <div className="p-3 bg-white rounded-lg">
                        <FileText className="w-8 h-8 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">{getRemainingTime()}</h3>
                  </div>
                </div>
              </div>

              {isMultiFile ? (
                <button
                  onClick={handleDownload}
                  disabled={selectedIndices.size === 0 || isDownloading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                    selectedIndices.size > 0 && !isDownloading
                      ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                  {isDownloading ? 'Downloading...' : `Download Selected (${selectedIndices.size})`}
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors mb-2 ${
                    !isDownloading
                      ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                  {isDownloading ? 'Downloading...' : 'Download File'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

  
