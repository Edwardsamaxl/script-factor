import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🎬</span>
          <span className="font-bold text-gray-900">剧本工坊</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/persona/square"
            className={`text-sm font-medium ${location.pathname === '/persona/square' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-900'}`}
          >
            广场
          </Link>
          <Link
            to="/profile"
            className={`text-sm font-medium ${location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-900'}`}
          >
            我的
          </Link>
        </div>
      </div>
    </nav>
  )
}
