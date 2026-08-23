import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm m-6">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Client Not Found</h2>
      <p className="text-slate-500 mb-6 max-w-md">
        The client you are looking for does not exist or may have been removed.
      </p>
      <Link href="/clients">
        <Button variant="default">Return to Clients</Button>
      </Link>
    </div>
  )
}
