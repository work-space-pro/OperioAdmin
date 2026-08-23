'use client'

import React, { useState, useActionState, useTransition } from 'react'
import Link from 'next/link'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Plus, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Building2, 
  User, 
  Search, 
  Filter, 
  ArrowUpRight,
  PieChart,
  Layers,
  FileSpreadsheet,
  Wallet,
  Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { recordExpenseAction, deleteExpenseAction, updateServicePaymentAction } from './actions'

const EXPENSE_CATEGORIES = [
  'Government & Authority Fees',
  'Typing & Amer Centers',
  'PRO Processing & Courier',
  'Office Rent & Utilities',
  'Software & Cloud Tools',
  'Salaries & Professional Fees',
  'Miscellaneous Operations'
]

interface FinanceClientViewProps {
  stats: {
    grossRevenue: number
    realizedRevenue: number
    unpaidRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
  }
  categoryRevenues: {
    category: string
    count: number
    gross: number
    collected: number
    pending: number
  }[]
  expenseCategoryBreakdown: {
    category: string
    amount: number
    count: number
    percentage: number
  }[]
  services: {
    id: string
    name: string
    category: string
    clientName: string
    companyName: string
    price: number
    paymentStatus: string
    status: string
    targetCompletion: string
    createdAt: string
  }[]
  expenses: {
    id: string
    title: string
    category: string
    amount: number
    expenseDate: string
    paymentMethod: string | null
    vendorName: string | null
    receiptRef: string | null
    description: string | null
    status: string
  }[]
  monthlySummary: {
    month: string
    revenue: number
    expenses: number
    profit: number
  }[]
}

export default function FinanceClientView({
  stats,
  categoryRevenues,
  expenseCategoryBreakdown,
  services,
  expenses,
  monthlySummary
}: FinanceClientViewProps) {
  const [activeTab, setActiveTab] = useState<'pnl' | 'revenue' | 'expenses' | 'monthly'>('pnl')
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [expenseSearch, setExpenseSearch] = useState('')
  const [serviceSearch, setServiceSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const [formState, formAction, isSubmittingExpense] = useActionState(recordExpenseAction, null)

  // Filtered Services
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.clientName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  // Filtered Expenses
  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(expenseSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(expenseSearch.toLowerCase()) ||
    (e.vendorName && e.vendorName.toLowerCase().includes(expenseSearch.toLowerCase()))
  )

  // Handle Payment Status Toggle
  const handleTogglePaymentStatus = (serviceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Unpaid' : currentStatus === 'Unpaid' ? 'Partial' : 'Paid'
    startTransition(async () => {
      await updateServicePaymentAction(serviceId, nextStatus)
    })
  }

  // Handle Delete Expense
  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense record?')) {
      startTransition(async () => {
        await deleteExpenseAction(id)
      })
    }
  }

  // Export P&L CSV
  const handleExportCSV = () => {
    const headers = ['Type', 'Item / Title', 'Category', 'Party / Vendor', 'Amount (AED)', 'Date', 'Status']
    const rows: string[][] = []

    // Revenue rows
    services.forEach(s => {
      rows.push([
        'Revenue (Inflow)',
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.category}"`,
        `"${s.clientName.replace(/"/g, '""')}"`,
        (s.price || 0).toString(),
        `"${s.createdAt}"`,
        `"${s.paymentStatus}"`
      ])
    })

    // Expense rows
    expenses.forEach(e => {
      rows.push([
        'Expense (Outflow)',
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.category}"`,
        `"${(e.vendorName || '').replace(/"/g, '""')}"`,
        e.amount.toString(),
        `"${e.expenseDate}"`,
        `"${e.status}"`
      ])
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Operio_Finance_PnL_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col font-sans space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-[#5B21B6]" />
            Finance — Profit &amp; Loss (P&amp;L)
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Financial ledger tracking client fee revenues, government disbursements, operating overheads, and net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.print()}
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200/90 text-slate-700 rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print P&amp;L
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center px-3.5 py-2 bg-white border border-slate-200/90 text-slate-700 rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export CSV
          </button>

          <button 
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Expense
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Realized Inflow */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Collected Inflow</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              AED {stats.realizedRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Pipeline: <span className="font-bold text-slate-700">AED {stats.grossRevenue.toLocaleString()}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Operating Expenses (Outflows) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Outflows (COGS)</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              AED {stats.totalExpenses.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {expenses.length} Expense Vouchers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Operating Profit</span>
            <div className={cn(
              "text-2xl font-black mt-1",
              stats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            )}>
              AED {stats.netProfit.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Margin: <span className="font-bold text-[#5B21B6]">{stats.profitMargin}%</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5B21B6] flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Accounts Receivable</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              AED {stats.unpaidRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Pending client collections
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('pnl')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'pnl'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <FileSpreadsheet className="w-4 h-4" />
          P&amp;L Statement
        </button>

        <button 
          onClick={() => setActiveTab('revenue')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'revenue'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Coins className="w-4 h-4" />
          Revenue Inflows ({services.length})
        </button>

        <button 
          onClick={() => setActiveTab('expenses')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'expenses'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Receipt className="w-4 h-4" />
          Operating Expenses ({expenses.length})
        </button>

        <button 
          onClick={() => setActiveTab('monthly')}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'monthly'
              ? "bg-[#5B21B6] text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
          )}
        >
          <Calendar className="w-4 h-4" />
          Monthly Financial Trajectory
        </button>
      </div>

      {/* ================= TAB 1: P&L STATEMENT ================= */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Profit &amp; Loss Financial Statement (AED)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit of operating revenues and cost disbursements</p>
              </div>
              <span className="text-xs font-bold text-[#5B21B6] bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                Operating Year 2026
              </span>
            </div>

            <div className="p-6 space-y-8">
              
              {/* SECTION A: REVENUE INFLOWS */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    1. Operating Revenue &amp; Package Inflows
                  </h4>
                  <span className="text-xs font-bold text-emerald-700">Gross / Collected (AED)</span>
                </div>

                <div className="divide-y divide-slate-100 mt-2 text-xs">
                  {categoryRevenues.map(cat => (
                    <div key={cat.category} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{cat.category} Packages</span>
                        <span className="text-slate-400 ml-2 text-[11px]">({cat.count} Active)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">AED {cat.gross.toLocaleString()}</span>
                        <span className="text-emerald-600 ml-2 font-semibold">
                          (AED {cat.collected.toLocaleString()} collected)
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="py-3 flex items-center justify-between bg-emerald-50/40 px-3 rounded-xl mt-2 font-black text-xs">
                    <span className="text-emerald-950">TOTAL GROSS REVENUE</span>
                    <span className="text-emerald-700 text-sm">AED {stats.grossRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: OPERATING EXPENSES */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-rose-500">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    2. Cost of Operations &amp; Direct Disbursements
                  </h4>
                  <span className="text-xs font-bold text-rose-700">Total Outflow (AED)</span>
                </div>

                <div className="divide-y divide-slate-100 mt-2 text-xs">
                  {expenseCategoryBreakdown.length === 0 ? (
                    <div className="py-4 text-center text-slate-400">
                      No expenses logged yet. Click "Record Expense" to track government fees and overheads.
                    </div>
                  ) : (
                    expenseCategoryBreakdown.map(exp => (
                      <div key={exp.category} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{exp.category}</span>
                          <span className="text-slate-400 ml-2 text-[11px]">({exp.count} Vouchers)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-700">AED {exp.amount.toLocaleString()}</span>
                          <span className="text-slate-400 ml-2 font-semibold">({exp.percentage}%)</span>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="py-3 flex items-center justify-between bg-rose-50/40 px-3 rounded-xl mt-2 font-black text-xs">
                    <span className="text-rose-950">TOTAL OPERATING EXPENSES</span>
                    <span className="text-rose-700 text-sm">AED {stats.totalExpenses.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* SECTION C: NET OPERATING PROFIT */}
              <div className="p-5 bg-gradient-to-r from-purple-50 via-purple-50/60 to-slate-50 rounded-2xl border-2 border-purple-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#5B21B6]">
                      3. Net Operating Profit (EBITDA)
                    </span>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      AED {stats.netProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Calculated as: Collected Realized Revenue (AED {stats.realizedRevenue.toLocaleString()}) − Total Expenses (AED {stats.totalExpenses.toLocaleString()})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl border border-purple-200 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Profit Margin</div>
                      <div className="text-lg font-black text-[#5B21B6]">{stats.profitMargin}%</div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-purple-200 text-center">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Receivable</div>
                      <div className="text-lg font-black text-amber-600">AED {stats.unpaidRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: REVENUE INFLOWS ================= */}
      {activeTab === 'revenue' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Client Service Package Inflows</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click payment status badges to toggle between Paid, Partial, and Unpaid</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search package, client..." 
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#5B21B6] w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Package / Service</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Client / Entity</th>
                  <th className="py-3 px-5">Agreed Fee (AED)</th>
                  <th className="py-3 px-5">Payment Status</th>
                  <th className="py-3 px-5">Workflow Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredServices.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-[#5B21B6] border border-purple-100 font-bold text-[11px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      <div>{s.clientName}</div>
                      {s.companyName && <div className="text-[11px] text-slate-400">{s.companyName}</div>}
                    </td>
                    <td className="py-3.5 px-5 font-black text-slate-900">
                      AED {(s.price || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5">
                      <button
                        onClick={() => handleTogglePaymentStatus(s.id, s.paymentStatus)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1",
                          s.paymentStatus === 'Paid' ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                          s.paymentStatus === 'Partial' ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" :
                          "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        )}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {s.paymentStatus} (Click to change)
                      </button>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-bold",
                        s.status === 'Completed' ? "bg-emerald-100 text-emerald-800" :
                        s.status === 'In progress' ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                      )}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link 
                        href={`/clients`} 
                        className="text-xs font-bold text-[#5B21B6] hover:underline"
                      >
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: OPERATING EXPENSES ================= */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Operating Expenses &amp; Direct Disbursements</h3>
              <p className="text-xs text-slate-500 mt-0.5">Government fee receipts, typing charges, PRO vouchers, and general overheads</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Search expense, vendor..." 
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#5B21B6] w-52"
                />
              </div>

              <button 
                onClick={() => setShowAddExpenseModal(true)}
                className="flex items-center px-3.5 py-1.5 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </button>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No expense records found</p>
              <p className="text-slate-400 mt-0.5">Click "+ Record Expense" to log authority fees, typing charges, or overheads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-5">Expense Title / Reason</th>
                    <th className="py-3 px-5">Expense Category</th>
                    <th className="py-3 px-5">Vendor / Authority</th>
                    <th className="py-3 px-5">Amount (AED)</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Payment Method</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{e.title}</div>
                        {e.description && <div className="text-[11px] text-slate-400">{e.description}</div>}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 font-bold text-[11px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {e.vendorName || '--'}
                      </td>
                      <td className="py-3.5 px-5 font-black text-rose-600">
                        AED {e.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-600">
                        {e.expenseDate}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-500">
                        {e.paymentMethod || 'Bank Transfer'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button 
                          onClick={() => handleDeleteExpense(e.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: MONTHLY TRAJECTORY ================= */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900">Monthly Profitability Trend</h3>
            <p className="text-xs text-slate-500 mt-0.5">Month-by-month financial performance trajectory</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Period Month</th>
                  <th className="py-3 px-5">Total Revenue (AED)</th>
                  <th className="py-3 px-5">Total Expenses (AED)</th>
                  <th className="py-3 px-5">Net Profit (AED)</th>
                  <th className="py-3 px-5 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {monthlySummary.map(m => (
                  <tr key={m.month} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {m.month}
                    </td>
                    <td className="py-3.5 px-5 font-black text-emerald-600">
                      AED {m.revenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 font-black text-rose-600">
                      AED {m.expenses.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 font-black text-slate-900">
                      AED {m.profit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#5B21B6]">
                      {m.revenue > 0 ? Math.round((m.profit / m.revenue) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD EXPENSE ================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#5B21B6]" />
                Record New Operating Expense Voucher
              </h3>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {formState?.error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formState.error}</span>
              </div>
            )}

            {formState?.success && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formState.message}</span>
              </div>
            )}

            <form action={async (fd) => {
              await formAction(fd)
              setShowAddExpenseModal(false)
            }} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Expense Title / Purpose *
                </label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g. DED Initial Approval Fee, Amer Typing Voucher" 
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#5B21B6]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Expense Category *
                  </label>
                  <select 
                    name="category" 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 cursor-pointer"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Amount (AED) *
                  </label>
                  <input 
                    type="number" 
                    name="amount" 
                    step="0.01" 
                    min="0" 
                    required 
                    placeholder="0.00" 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-[#5B21B6]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Expense Date
                  </label>
                  <input 
                    type="date" 
                    name="expenseDate" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Payment Method
                  </label>
                  <select 
                    name="paymentMethod" 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 cursor-pointer"
                  >
                    <option value="Bank Transfer">Bank Transfer / Online</option>
                    <option value="Corporate Credit Card">Corporate Credit Card</option>
                    <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                    <option value="PRO Reimbursement">PRO Reimbursement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Vendor / Authority Name
                  </label>
                  <input 
                    type="text" 
                    name="vendorName" 
                    placeholder="e.g. Dubai Economy, MOHRE, Amer" 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Receipt / Transaction Ref
                  </label>
                  <input 
                    type="text" 
                    name="receiptRef" 
                    placeholder="e.g. REC-98234" 
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Additional Notes
                </label>
                <input 
                  type="text" 
                  name="description" 
                  placeholder="Optional details or linked client reference..." 
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800" 
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingExpense}
                  className="px-5 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmittingExpense ? 'Recording...' : 'Save Expense Voucher'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
