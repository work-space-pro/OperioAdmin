import { formatDate } from '@/lib/formatDate'
import React from 'react'
import { CalendarDays, Filter, Plus, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const now = new Date()
  
  // Fetch Actions for this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const reminders = await prisma.action.findMany({
    where: {
      dueDate: { gte: startOfMonth, lte: endOfMonth }
    }
  })

  const documents = await prisma.document.findMany({
    where: {
      expiryDate: { gte: startOfMonth, lte: endOfMonth }
    }
  })

  // Basic calendar logic for current month
  const daysInMonth = endOfMonth.getDate()
  const firstDay = startOfMonth.getDay() // 0 = Sunday
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    if (day > 0 && day <= daysInMonth) {
      return {
        date: new Date(now.getFullYear(), now.getMonth(), day),
        isCurrentMonth: true,
        dayNum: day
      }
    }
    return {
      date: new Date(now.getFullYear(), now.getMonth(), day),
      isCurrentMonth: false,
      dayNum: new Date(now.getFullYear(), now.getMonth(), day).getDate()
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] font-sans px-8 py-8 space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Manage your schedule, reminders, and deadlines.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">{formatDate(now)}</h2>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-200 text-gray-600"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button className="px-4 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50">Today</button>
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center text-xs font-semibold text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span> Expiries</div>
            <div className="flex items-center text-xs font-semibold text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span> Reminders</div>
            <div className="flex items-center text-xs font-semibold text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span> Meetings</div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-0">{day}</div>
            ))}
          </div>
          
          <div className="flex-1 grid grid-cols-7 grid-rows-5">
            {calendarDays.slice(0,35).map((d, i) => {
              const dayReminders = reminders.filter((r: any) => r.dueDate.getDate() === d.dayNum && r.dueDate.getMonth() === d.date.getMonth())
              const dayDocs = documents.filter((doc: any) => doc.expiryDate?.getDate() === d.dayNum && doc.expiryDate?.getMonth() === d.date.getMonth())
              
              const isToday = d.date.toDateString() === now.toDateString()

              return (
                <div key={i} className={`border-r border-b border-gray-100 p-2 min-h-[100px] ${!d.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : d.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                      {d.dayNum}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {dayDocs.map((doc: any) => (
                      <div key={doc.id} className="bg-orange-50 border border-orange-100 px-2 py-1 rounded text-[10px] font-bold text-orange-700 truncate cursor-pointer hover:bg-orange-100">
                        Expiry: {doc.title}
                      </div>
                    ))}
                    {dayReminders.map((rem: any) => (
                      <div key={rem.id} className="bg-blue-50 border border-blue-100 px-2 py-1 rounded text-[10px] font-bold text-blue-700 truncate cursor-pointer hover:bg-blue-100">
                        {rem.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
