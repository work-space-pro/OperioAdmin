'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateActionModal from '@/components/dashboard/CreateActionModal'

type Client = {
  id: string
  fullName: string
}

export default function ActionsPageClient({ clients }: { clients: Client[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        New Action
      </button>

      <CreateActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clients={clients} 
      />
    </>
  )
}
