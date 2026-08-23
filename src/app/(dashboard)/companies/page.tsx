import Link from 'next/link'
import { Plus, Search, MoreVertical, Building2, User } from 'lucide-react'
import { getCompanies } from './actions'
import CompanyRowActions from './CompanyRowActions'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all registered companies and their statuses.</p>
        </div>
        <Link 
          href="/companies/new" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Company
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="w-full sm:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-colors"
            placeholder="Search companies..."
          />
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select className="block w-full sm:w-auto pl-4 pr-10 py-2.5 bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700 rounded-xl transition-colors">
            <option>All Zones</option>
            <option>Mainland</option>
            <option>Free Zone</option>
          </select>
          <select className="block w-full sm:w-auto pl-4 pr-10 py-2.5 bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-slate-700 rounded-xl transition-colors">
            <option>Active</option>
            <option>Under Formation</option>
            <option>Renewal Due</option>
            <option>Expired</option>
          </select>
        </div>
      </div>

      {/* Premium Card Grid */}
      {companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-bold text-slate-900">No companies found</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Click "Add Company" to get started.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-indigo-100 transition-all group flex flex-col relative overflow-hidden p-5">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shadow-indigo-200 uppercase">
                  {company.legalName.substring(0, 2)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    company.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    company.status === 'Under Formation' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                    company.status === 'Renewal Due' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    <span className={`w-1 h-1 rounded-full mr-1.5 ${
                      company.status === 'Active' ? 'bg-emerald-500' :
                      company.status === 'Under Formation' ? 'bg-blue-500' : 
                      company.status === 'Renewal Due' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}></span>
                    {company.status}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <Link href={`/companies/${company.id}`} className="text-[15px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">
                  {company.legalName}
                </Link>
                <div className="flex items-center text-[12px] font-semibold text-slate-500 mt-1.5 line-clamp-1">
                  <User className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  {company.client.fullName}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">{company.zoneType || 'No Zone'}</div>
                  <div className="text-[11px] font-medium text-slate-500 line-clamp-1">{company.freeZoneName || company.registeredEmirate || 'N/A'}</div>
                </div>
                <div className="ml-2">
                  <CompanyRowActions id={company.id} />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
