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
    <div className="space-y-6">
      {/* 主操作入口 */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/persona/create">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white h-full">
            <div className="text-2xl mb-1">👤</div>
            <div className="font-semibold">创建人设</div>
            <div className="text-xs text-blue-100 mt-1">成为一级创作者</div>
          </div>
        </Link>
        <Link to="/script/create">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white h-full">
            <div className="text-2xl mb-1">✍️</div>
            <div className="font-semibold">创作剧本</div>
            <div className="text-xs text-purple-100 mt-1">成为二级创作者</div>
          </div>
        </Link>
      </div>

      {/* 最近剧本 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">📝 最近剧本</h2>
          {scripts.length > 3 && (
            <Link to="/profile" className="text-sm text-blue-500">查看全部</Link>
          )}
        </div>
        {recentScripts.length > 0 ? (
          <div className="space-y-3">
            {recentScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 mb-3">还没有剧本，创作你的第一个吧</p>
            <Link to="/script/create">
              <Button variant="primary" size="sm">开始创作</Button>
            </Link>
          </div>
        )}
      </section>

      {/* 我的人设 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">👤 我的人设</h2>
          {myPersonas.length > 0 && (
            <Link to="/persona/create">
              <Button variant="outline" size="sm">+ 新建</Button>
            </Link>
          )}
        </div>
        {myPersonas.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {myPersonas.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} showActions={false} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-gray-500 mb-3">还没有人设，创建你的人设资产</p>
            <Link to="/persona/create">
              <Button variant="primary" size="sm">创建人设</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
