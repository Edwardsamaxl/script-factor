import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/persona/square', icon: '👥', label: '广场' },
  { path: '/script/create', icon: '✍️', label: '创作' },
  { path: '/ai/hub', icon: '🎨', label: 'AI' },
  { path: '/profile', icon: '👤', label: '我的' },
]

export default function TabBar() {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 md:hidden">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path))
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-2 px-3 min-w-[60px] ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-0.5">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
