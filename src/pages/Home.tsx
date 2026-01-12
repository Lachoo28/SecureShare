
import { useState, useCallback, useEffect } from 'react'
import { Upload, Shield, Clock, FileText } from 'lucide-react'
import { supabase } from '../supabase'
import UploadCard from '../components/UploadCard'
import FeatureCard from '../components/FeatureCard'

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [expiry, setExpiry] = useState('3')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState("Securely Share Your Files")

  useEffect(() => {
    const fetchGreeting = async () => {
      // Optional: Fetch greeting from Supabase if you have a table for it
      // const { data } = await supabase.from('greetings').select('message').single();
      // if (data?.message) setGreeting(data.message);
    };

    fetchGreeting();
  }, [])

  const handleFileChange = useCallback((file: File) => {
    setUploadedFile(file)
    setUploadError(null)
  }, [])

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
  }, [])

  const handleGenerateLink = useCallback(async () => {
    if (!uploadedFile) return;
    setIsGenerating(true);
    setUploadError(null);
    setUploadProgress(0);
    // Fake progress for UX since simple upload doesn't stream progress
    setUploadProgress(50);

    try {
      const fileName = `${Date.now()}_${uploadedFile.name}`;
      
      // 1. Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, uploadedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiry));

      // 3. Insert metadata into Supabase Database
      const { data: insertData, error: insertError } = await supabase
        .from('files')
        .insert({
          name: uploadedFile.name,
          size: uploadedFile.size,
          url: publicUrl,
          password: password,
          expiry: expiryDate,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setUploadProgress(100);
      const link = `${window.location.origin}/file/${insertData.id}`;
      setGeneratedLink(link);
    } catch (error: any) {
      console.error("Error during link generation: ", error);
      setUploadError(error.message || 'Link generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedFile, password, expiry]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedLink])

  const features = [
    {
      icon: <Shield className="w-6 h-6 text-secondary-600" />,
      title: "Password Protected",
      description: "Secure your files with strong password protection"
    },
    {
      icon: <Clock className="w-6 h-6 text-secondary-600" />,
      title: "3-Day Auto Expiry",
      description: "Links automatically expire after 3 days"
    },
    {
      icon: <FileText className="w-6 h-6 text-secondary-600" />,
      title: "Full Quality Files",
      description: "Files are stored in original quality"
    },
    {
      icon: <Upload className="w-6 h-6 text-secondary-600" />,
      title: "Download Tracking",
      description: "Get notified when your file is downloaded"
    }
  ]

  return (
    <div className="py-12">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {greeting}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Send photos, videos, and documents with password protection and 3-day link expiry
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="mt-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <UploadCard
          onFileChange={handleFileChange}
          onRemoveFile={handleRemoveFile}
          uploadedFile={uploadedFile}
          password={password}
          setPassword={setPassword}
          expiry={expiry}
          setExpiry={setExpiry}
          onGenerateLink={handleGenerateLink}
          generatedLink={generatedLink}
          copyToClipboard={copyToClipboard}
          copied={copied}
          isGenerating={isGenerating}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
        />
      </div>

      {/* Features */}
      <div id="features" className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Secure File Sharing Features</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload File</h3>
            <p className="text-gray-500">Drag and drop or select your file to upload</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Set Password</h3>
            <p className="text-gray-500">Protect your file with a secure password</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Share Link</h3>
            <p className="text-gray-500">Copy and send the secure link to recipients</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4">
              <span className="text-xl font-bold">4</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Track Downloads</h3>
            <p className="text-gray-500">Get notified when your file is accessed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
  
