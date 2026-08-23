import { formatDate } from '@/lib/formatDate'
import Link from 'next/link'
import { Plus, Users, UserSquare2 } from 'lucide-react'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: { company: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees & Visas</h1>
          <p className="mt-1 text-sm text-gray-500">Manage company employees, visa statuses, and HR compliances.</p>
        </div>
        <Link href="/employees/new" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Employee
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Expiry</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">No employees registered yet</p>
                      <p className="text-sm mt-1">Click the add button to onboard a new employee or partner.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="px-6 py-4">{emp.fullName}</td>
                    <td className="px-6 py-4">{emp.company.legalName}</td>
                    <td className="px-6 py-4">{emp.visaType}</td>
                    <td className="px-6 py-4">{emp.visaExpiryDate ? formatDate(emp.visaExpiryDate) : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
