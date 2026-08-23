'use client'

import React from 'react'
import Link from 'next/link'
import { Eye, Trash2 } from 'lucide-react'
import { deleteCompany } from './actions'

export default function CompanyRowActions({ id }: { id: string }) {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company? This cannot be undone.')) {
      await deleteCompany(id)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Link 
        href={`/companies/${id}`} 
        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        title="View Company"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <button 
        onClick={handleDelete}
        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        title="Delete Company"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
