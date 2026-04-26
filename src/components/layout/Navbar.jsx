import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 bg-paper-50/80 backdrop-blur-md border-b border-ink-200/30">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/assets/logo.png" alt="搭映" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display text-lg font-bold text-ink-900 tracking-tight">
            搭映
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
