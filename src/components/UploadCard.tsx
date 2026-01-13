
import { useState, useCallback } from 'react'
import { Upload, Copy, Check, FileText, X, Loader2 } from 'lucide-react'


  uploadedFiles,
  password,
  setPassword,
  expiry,
  setExpiry,
  onGenerateLink,
  generatedLink,
  copyToClipboard,
  copied,
  isGenerating,
  uploadProgress,
  uploadError
}: UploadCardProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(Array.from(e.dataTransfer.files))
    }
  }, [onFileChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(Array.from(e.target.files))
    }
  }, [onFileChange])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        {!generatedLink ? (
          <>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">Max file size: 50MB</p>
                </div>
              </label>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                multiple
                onChange={handleChange}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="p-3 bg-primary-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-md">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Set Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter a password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Expiry
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1', '3', '7'].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setExpiry(days)}
                      className={`py-2 px-4 rounded-md text-sm font-medium ${expiry === days ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {days} Day{days !== '1' ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onGenerateLink}
                disabled={!password || uploadedFiles.length === 0 || isGenerating}
                className={`w-full mt-4 py-3 px-4 rounded-md text-white font-medium flex items-center justify-center relative overflow-hidden transition-colors ${password && uploadedFiles.length > 0 && !isGenerating ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {isGenerating ? (
                  <>
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-150" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span className="relative z-10 flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Generating...'}
                    </span>
                  </>
                ) : (
                  'Generate Secure Link'
                )}
              </button>
              {uploadError && (
                <p className="mt-2 text-sm text-red-600 text-center">{uploadError}</p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Your secure link is ready!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>This link will expire in {expiry} day{expiry !== '1' ? 's' : ''}.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secure Link
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full mt-4 py-3 px-4 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700"
            >
              Upload Another File
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
