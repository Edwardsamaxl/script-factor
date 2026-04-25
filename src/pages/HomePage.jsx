import { Link } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import { useScripts } from '../hooks/useScripts'
import PersonaCard from '../components/persona/PersonaCard'
import ScriptCard from '../components/script/ScriptCard'
import Button from '../components/common/Button'

export default function HomePage() {
  const { personas } = usePersonas()
  const { scripts } = useScripts()

  const myPersonas = personas.slice(0, 3)
  const recentScripts = scripts.slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 主操作入口 - 电影剧本感 */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/persona/create" className="group">
          <div className="card-elevated p-5 h-full transition-all duration-300 group-hover:shadow-lifted group-hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-paper-100">
                <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="heading-3 text-ink-900 mb-1">创建人设</div>
            <p className="body-small text-ink-500">塑造独特的角色</p>
          </div>
        </Link>
        <Link to="/script/create" className="group">
          <div className="card-elevated p-5 h-full bg-accent/5 border-accent/20 transition-all duration-300 group-hover:shadow-lifted group-hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-paper-100">
                <path d="M4 4h12v12H4V4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="heading-3 text-ink-900 mb-1">创作剧本</div>
            <p className="body-small text-ink-500">编写精彩对话</p>
          </div>
        </Link>
      </div>

      {/* 最近剧本 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            <h2 className="heading-2">最近剧本</h2>
          </div>
          {scripts.length > 3 && (
            <Link to="/profile" className="text-sm text-accent hover:text-accent-dark font-medium">
              查看全部
            </Link>
          )}
        </div>
        {recentScripts.length > 0 ? (
          <div className="space-y-3">
            {recentScripts.map((script, index) => (
              <div key={script.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ScriptCard script={script} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8">
            <div className="empty-state">
              <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4 mx-auto">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink-400">
                  <path d="M6 6h16v16H6V6z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 11h8M10 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="empty-state-title">还没有剧本</p>
              <p className="empty-state-desc">创作你的第一个剧本吧</p>
              <Link to="/script/create">
                <Button variant="primary" size="sm">开始创作</Button>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 我的人设 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-ink-400 rounded-full" />
            <h2 className="heading-2">我的人设</h2>
          </div>
          {myPersonas.length > 0 && (
            <Link to="/persona/create">
              <Button variant="outline" size="sm">+ 新建</Button>
            </Link>
          )}
        </div>
        {myPersonas.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {myPersonas.map((persona, index) => (
              <div key={persona.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <Link to={`/persona/${persona.id}`} className="block">
                  <PersonaCard persona={persona} showActions={false} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8">
            <div className="empty-state">
              <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4 mx-auto">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink-400">
                  <circle cx="14" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="empty-state-title">还没有人设</p>
              <p className="empty-state-desc">创建你的人设资产</p>
              <Link to="/persona/create">
                <Button variant="primary" size="sm">创建人设</Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
