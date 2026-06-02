import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function RootPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  if (session.role === 'MEMBER') redirect('/member')
  if (session.role === 'MENTOR') redirect('/mentor')
  if (session.role === 'TM' || session.role === 'ADMIN') redirect('/tm')

  redirect('/login')
}
