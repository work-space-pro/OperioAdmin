import { Users } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-transparent m-6">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full shadow-sm">
          <Users className="w-8 h-8" />
        </div>
      </div>
      <h2 className="text-lg font-bold text-slate-900 animate-pulse">Loading Clients...</h2>
    </div>
  )
}
