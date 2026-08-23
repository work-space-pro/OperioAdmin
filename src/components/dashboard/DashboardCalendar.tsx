'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDashboardCalendarEvents } from '@/lib/dashboard-services'

type Event = {
  id: string
  date: Date
  title: string
  type: string
  priority: string
  clientName?: string | null
  time?: string | null
}

export default function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      const data = await getDashboardCalendarEvents(currentYear, currentMonth)
      setEvents(data)
      setLoading(false)
    }
    loadEvents()
  }, [currentYear, currentMonth])

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  const calendarCells = []
  
  // Empty cells before start of month
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="py-1 text-transparent select-none text-[11px]">0</div>)
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateOfCell = new Date(currentYear, currentMonth, day)
    const isToday = new Date().toDateString() === dateOfCell.toDateString()
    
    // Find events for this day
    const dayEvents = events.filter(e => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === currentMonth)
    
    const hasHighPriority = dayEvents.some(e => e.priority === 'High' || e.type.includes('Expiry'))
    const hasNormalAction = dayEvents.some(e => e.type === 'Action' && e.priority !== 'High')
    const isSelected = selectedDate?.toDateString() === dateOfCell.toDateString()

    calendarCells.push(
      <div 
        key={day} 
        onClick={() => setSelectedDate(dateOfCell)}
        className={`py-0.5 px-0.5 relative cursor-pointer hover:bg-gray-50 rounded-lg transition-colors calendar-day flex flex-col items-center justify-center ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
      >
        <span className={`text-[11px] font-semibold flex items-center justify-center w-5 h-5 ${isToday ? 'bg-blue-600 text-white rounded-full shadow-sm font-bold' : 'text-gray-700'}`}>
          {day}
        </span>
        
        {/* Indicators */}
        {dayEvents.length > 0 && (
          <span className="flex space-x-0.5 mt-0.5">
             {hasHighPriority && <span className="w-1 h-1 bg-red-500 rounded-full"></span>}
             {hasNormalAction && <span className="w-1 h-1 bg-orange-500 rounded-full"></span>}
             {!hasHighPriority && !hasNormalAction && <span className="w-1 h-1 bg-blue-500 rounded-full"></span>}
          </span>
        )}
      </div>
    )
  }

  // Selected Date Events Panel
  const selectedEvents = selectedDate 
    ? events.filter(e => new Date(e.date).toDateString() === selectedDate.toDateString())
    : []

  return (
    <div className="dash-panel rounded-2xl flex flex-col justify-between relative h-full bg-white animate-fade-in-up delay-250 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
        <h3 className="text-sm font-bold text-gray-900 flex items-center">
          <CalendarDays className="w-4 h-4 text-blue-600 mr-2" />
          Calendar Overview
        </h3>
        <Link href="/calendar">
          <button className="text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-3 py-1 rounded-lg hover:bg-gray-50 transition-all btn-micro leading-tight">
            View Calendar
          </button>
        </Link>
      </div>
      
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-900">{monthName}</h4>
          <div className="flex items-center space-x-1">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button onClick={prevMonth} className="px-2 py-0.5 bg-white hover:bg-gray-50 border-r border-gray-200 text-gray-600"><ChevronLeft className="w-3 h-3" /></button>
              <button onClick={nextMonth} className="px-2 py-0.5 bg-white hover:bg-gray-50 text-gray-600"><ChevronRight className="w-3 h-3" /></button>
            </div>
            <button onClick={goToToday} className="px-2 py-0.5 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 transition-all leading-tight">Today</button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 text-center text-xs font-semibold relative">
          {loading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
          {calendarCells}
        </div>
      </div>

      {/* Selected Date Slide-up Panel */}
      {selectedDate && (
        <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all z-20 flex flex-col h-1/2 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl sticky top-0">
            <h4 className="text-xs font-bold text-gray-900">{selectedDate.toDateString()}</h4>
            <button onClick={() => setSelectedDate(null)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-800">Close</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 bg-white">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 font-medium">No activities scheduled for this date.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedEvents.map(e => (
                  <li key={e.id} className="flex flex-col p-2 rounded-lg border border-gray-100 bg-white hover:border-gray-200 shadow-sm transition-colors">
                     <div className="flex justify-between items-start">
                       <span className="text-xs font-bold text-gray-900">{e.title}</span>
                       {e.time && <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{e.time}</span>}
                     </div>
                     <div className="mt-1 flex items-center justify-between">
                       <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{e.type}</span>
                       {e.clientName && <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">{e.clientName}</span>}
                     </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
