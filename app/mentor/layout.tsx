import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!['MENTOR', 'ADMIN'].includes(session.role)) redirect('/')

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MENTOR" userName={session.name} />
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  )
}
