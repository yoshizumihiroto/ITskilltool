import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function TMLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['TM', 'ADMIN'].includes(session.role)) redirect('/')

  return (
    <div className="flex min-h-screen">
      <Sidebar role="TM" userName={session.name} />
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8 min-w-0">{children}</main>
    </div>
  )
}
