import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', icon: 'home', label: '首页' },
  { path: '/persona/square', icon: 'users', label: '广场' },
  { path: '/script/create', icon: 'pen', label: '创作' },
  { path: '/ai/hub', icon: 'sparkle', label: 'AI' },
  { path: '/profile', icon: 'user', label: '我的' },
]

const TabIcon = ({ type, active }) => {
  const color = active ? 'text-accent' : 'text-ink-400'
  const icons = {
    home: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={color}>
        <path d="M3 8.5L10 3l7 5.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 18v-5h6v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    users: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={color}>
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M19 17c0-2.21-1.343-4-3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    pen: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={color}>
        <path d="M3 17h14M14 4l3 3-9 9H5v-3L14 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      </svg>
    ),
    sparkle: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={color}>
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.93 4.93l2.12 2.12M12.95 12.95l2.12 2.12M4.93 15.07l2.12-2.12M12.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    user: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={color}>
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  }
  return icons[type] || null
}

export default function TabBar() {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-paper-50/95 backdrop-blur-md border-t border-ink-200/30 z-40 md:hidden">
      <div className="max-w-lg mx-auto flex justify-between px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path + '/'))
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`relative flex flex-col items-center py-2.5 px-2 min-w-[60px] transition-colors ${
                isActive ? 'text-accent' : 'text-ink-400'
              }`}
            >
              <TabIcon type={tab.icon} active={isActive} />
              <span className="text-2xs mt-1 font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
