'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
  role: string
  userName: string
}

const memberNav = [
  { href: '/member', label: 'ダッシュボード', icon: '🏠' },
  { href: '/member/assessment', label: 'スキルアセスメント', icon: '📊' },
  { href: '/member/training', label: '研修コンテンツ', icon: '📚' },
  { href: '/member/plan', label: '学習プラン', icon: '🎯' },
  { href: '/member/log', label: '学習ログ', icon: '📝' },
]

const mentorNav = [
  { href: '/mentor', label: 'メンバー一覧', icon: '👥' },
  { href: '/mentor/improvement', label: '改善プロセス', icon: '🔄' },
]

const tmNav = [
  { href: '/tm', label: 'チームダッシュボード', icon: '📈' },
  { href: '/tm/training', label: 'コンテンツ管理 (AI)', icon: '🤖' },
]

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const nav = role === 'MEMBER' ? memberNav : role === 'MENTOR' ? mentorNav : tmNav

  const roleLabel = role === 'MEMBER' ? 'メンバー' : role === 'MENTOR' ? 'メンター' : role === 'TM' ? 'チームマネージャー' : '管理者'

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white">ITスキル向上ツール</h1>
        <p className="text-slate-400 text-sm mt-1">社内IT研修プラットフォーム</p>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {userName[0]}
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== '/member' && href !== '/mentor' && href !== '/tm' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  )
}
