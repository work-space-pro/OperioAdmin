'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import DeleteClientModal from '@/components/clients/DeleteClientModal'

export default function DeleteClientButton({ clientId, clientName }: { clientId: string, clientName?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5 mr-2" />
        Delete Client &amp; Data
      </button>

      <DeleteClientModal
        clientId={clientId}
        clientName={clientName || 'this client'}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
