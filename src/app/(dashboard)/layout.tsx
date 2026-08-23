import { ClientLayout } from '@/components/layout/ClientLayout'

export const metadata = {
  title: 'Operio CRM',
  description: 'Manage your business clients and individuals.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
