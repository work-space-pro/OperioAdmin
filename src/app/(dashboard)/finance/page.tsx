import React from 'react'
import prisma from '@/lib/db'
import FinanceClientView from './FinanceClientView'

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const [services, expenses] = await Promise.all([
    prisma.service.findMany({
      include: {
        client: true,
        company: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' }
    })
  ])

  // Revenue Inflows
  let grossRevenue = 0
  let realizedRevenue = 0
  let unpaidRevenue = 0

  services.forEach(s => {
    const price = s.price || 0
    grossRevenue += price
    if (s.paymentStatus === 'Paid') {
      realizedRevenue += price
    } else {
      unpaidRevenue += price
    }
  })

  // 5 Categories Breakdown
  const standardCategories = [
    'Business Setup',
    'Visa & Immigration',
    'Tax & Accounting',
    'PRO Services',
    'Legal & Advisory'
  ]

  const catRevenueMap: Record<string, { count: number; gross: number; collected: number; pending: number }> = {}
  standardCategories.forEach(cat => {
    catRevenueMap[cat] = { count: 0, gross: 0, collected: 0, pending: 0 }
  })

  services.forEach(s => {
    const rawCat = s.category || 'Business Setup'
    let mapped = standardCategories.find(c => c.toLowerCase() === rawCat.toLowerCase())
    if (!mapped) {
      if (rawCat.toLowerCase().includes('visa') || rawCat.toLowerCase().includes('immigration')) mapped = 'Visa & Immigration'
      else if (rawCat.toLowerCase().includes('tax') || rawCat.toLowerCase().includes('vat') || rawCat.toLowerCase().includes('account')) mapped = 'Tax & Accounting'
      else if (rawCat.toLowerCase().includes('pro')) mapped = 'PRO Services'
      else if (rawCat.toLowerCase().includes('legal')) mapped = 'Legal & Advisory'
      else mapped = 'Business Setup'
    }

    if (!catRevenueMap[mapped]) {
      catRevenueMap[mapped] = { count: 0, gross: 0, collected: 0, pending: 0 }
    }

    const price = s.price || 0
    catRevenueMap[mapped].count += 1
    catRevenueMap[mapped].gross += price
    if (s.paymentStatus === 'Paid') {
      catRevenueMap[mapped].collected += price
    } else {
      catRevenueMap[mapped].pending += price
    }
  })

  const categoryRevenues = standardCategories.map(cat => ({
    category: cat,
    count: catRevenueMap[cat]?.count || 0,
    gross: catRevenueMap[cat]?.gross || 0,
    collected: catRevenueMap[cat]?.collected || 0,
    pending: catRevenueMap[cat]?.pending || 0
  }))

  // Operating Expenses Breakdown
  let totalExpenses = 0
  const expCatMap: Record<string, { amount: number; count: number }> = {}

  expenses.forEach(e => {
    const cat = e.category || 'Miscellaneous Operations'
    totalExpenses += e.amount
    if (!expCatMap[cat]) {
      expCatMap[cat] = { amount: 0, count: 0 }
    }
    expCatMap[cat].amount += e.amount
    expCatMap[cat].count += 1
  })

  const expenseCategoryBreakdown = Object.entries(expCatMap).map(([category, val]) => ({
    category,
    amount: val.amount,
    count: val.count,
    percentage: totalExpenses > 0 ? Math.round((val.amount / totalExpenses) * 100) : 0
  }))

  // Net Profit (Based on Realized Collected Inflows - Total Expenses)
  const netProfit = realizedRevenue - totalExpenses
  const profitMargin = realizedRevenue > 0 ? Math.round((netProfit / realizedRevenue) * 100) : 0

  // Format Services
  const formattedServices = services.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category || 'Business Setup',
    clientName: s.client?.fullName || 'General Client',
    companyName: s.company?.legalName || '',
    price: s.price || 0,
    paymentStatus: s.paymentStatus || 'Unpaid',
    status: s.status || 'In progress',
    targetCompletion: s.targetCompletion ? new Date(s.targetCompletion).toISOString().split('T')[0] : '',
    createdAt: new Date(s.createdAt).toISOString().split('T')[0]
  }))

  // Format Expenses
  const formattedExpenses = expenses.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    amount: e.amount,
    expenseDate: new Date(e.expenseDate).toISOString().split('T')[0],
    paymentMethod: e.paymentMethod,
    vendorName: e.vendorName,
    receiptRef: e.receiptRef,
    description: e.description,
    status: e.status
  }))

  // Monthly summary
  const monthMap: Record<string, { revenue: number; expenses: number }> = {}

  services.forEach(s => {
    const m = new Date(s.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!monthMap[m]) monthMap[m] = { revenue: 0, expenses: 0 }
    if (s.paymentStatus === 'Paid') {
      monthMap[m].revenue += s.price || 0
    }
  })

  expenses.forEach(e => {
    const m = new Date(e.expenseDate).toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!monthMap[m]) monthMap[m] = { revenue: 0, expenses: 0 }
    monthMap[m].expenses += e.amount
  })

  const monthlySummary = Object.entries(monthMap).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    expenses: data.expenses,
    profit: data.revenue - data.expenses
  }))

  if (monthlySummary.length === 0) {
    const currentM = new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
    monthlySummary.push({
      month: currentM,
      revenue: realizedRevenue,
      expenses: totalExpenses,
      profit: netProfit
    })
  }

  const stats = {
    grossRevenue,
    realizedRevenue,
    unpaidRevenue,
    totalExpenses,
    netProfit,
    profitMargin
  }

  return (
    <div className="max-w-7xl mx-auto py-2">
      <FinanceClientView 
        stats={stats}
        categoryRevenues={categoryRevenues}
        expenseCategoryBreakdown={expenseCategoryBreakdown}
        services={formattedServices}
        expenses={formattedExpenses}
        monthlySummary={monthlySummary}
      />
    </div>
  )
}
