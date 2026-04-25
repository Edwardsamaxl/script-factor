import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 bg-paper-50/80 backdrop-blur-md border-b border-ink-200/30">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          {/* 电影胶片图标 */}
          <div className="w-8 h-8 rounded-lg bg-ink-900 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-paper-100">
              <path d="M2 3h2v2H2V3zm0 4h2v2H2V7zm0 4h2v2H2v-2zM6 3h2v2H6V3zm0 4h2v2H6V7zm0 4h2v2H6v-2zM10 3h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z" fill="currentColor"/>
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-ink-900 tracking-tight">
            剧本工坊
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/persona/square"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/persona/square'
                ? 'bg-ink-900 text-paper-100'
                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
            }`}
          >
            广场
          </Link>
          <Link
            to="/profile"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-ink-900 text-paper-100'
                : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
            }`}
          >
            我的
          </Link>
        </div>
      </div>
    </nav>
  )
}
