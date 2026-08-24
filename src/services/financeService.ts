import prisma from '@/lib/db'

export async function getFinanceSummary() {
  const [expenses, services] = await Promise.all([
    prisma.expense.findMany(),
    prisma.service.findMany(),
  ])

  const totalRevenue = services.reduce((acc: number, s: any) => acc + (Number(s.price) || 0), 0)
  const totalPaidRevenue = services
    .filter((s: any) => s.paymentStatus === 'Paid')
    .reduce((acc: number, s: any) => acc + (Number(s.price) || 0), 0)

  const totalExpenses = expenses.reduce((acc: number, exp: any) => acc + (Number(exp.amount) || 0), 0)
  const netProfit = totalRevenue - totalExpenses

  return {
    totalRevenue,
    totalPaidRevenue,
    totalExpenses,
    netProfit,
    servicesCount: services.length,
    expensesCount: expenses.length,
  }
}

export async function getAllExpenses(options?: {
  clientId?: string
  companyId?: string
  status?: string
}) {
  const whereClause: any = {}
  if (options?.clientId) whereClause.clientId = options.clientId
  if (options?.companyId) whereClause.companyId = options.companyId
  if (options?.status && options.status !== 'All') whereClause.status = options.status

  return prisma.expense.findMany({
    where: whereClause,
    orderBy: { expenseDate: 'desc' },
  })
}
