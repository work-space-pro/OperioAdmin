'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import { createAction } from '@/app/actions/action-actions'
import { useFormStatus } from 'react-dom'

type Client = {
  id: string
  fullName: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Saving...' : 'Save Action'}
    </button>
  )
}

export default function CreateActionModal({ 
  isOpen, 
  onClose,
  clients,
  defaultClientId
}: { 
  isOpen: boolean, 
  onClose: () => void,
  clients: Client[],
  defaultClientId?: string
}) {
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) setError('')
  }, [isOpen])

  if (!isOpen) return null

  async function actionHandler(formData: FormData) {
    const res = await createAction(formData)
    if (res.error) {
      setError(res.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">New Action</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form action={actionHandler} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 text-sm"
                placeholder="e.g. Call client regarding VAT return"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="actionType" className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                <select 
                  id="actionType" 
                  name="actionType" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 text-sm"
                >
                  <option value="Task">Task</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Document Renewal">Document Renewal</option>
                  <option value="Tax Filing">Tax Filing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                <select 
                  id="priority" 
                  name="priority" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-bold text-gray-700 mb-1">Related Client (Optional)</label>
              <select 
                id="clientId" 
                name="clientId" 
                defaultValue={defaultClientId || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 text-sm"
              >
                <option value="">None</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="date" 
                    id="dueDate" 
                    name="dueDate" 
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="dueTime" className="block text-sm font-bold text-gray-700 mb-1">Time (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="time" 
                    id="dueTime" 
                    name="dueTime" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
              <textarea 
                id="description" 
                name="description" 
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 text-sm resize-none"
                placeholder="Add any extra details..."
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
