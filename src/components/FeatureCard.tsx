
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}
  