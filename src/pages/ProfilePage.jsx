import { useNavigate, Link } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import { useScripts } from '../hooks/useScripts'
import PersonaCard from '../components/persona/PersonaCard'
import ScriptCard from '../components/script/ScriptCard'
import Button from '../components/common/Button'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { personas } = usePersonas()
  const { scripts } = useScripts()

  const myPersonas = personas
  const myScripts = scripts

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">我的</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{myPersonas.length}</div>
          <div className="text-xs text-blue-600">人设</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{myScripts.length}</div>
          <div className="text-xs text-purple-600">剧本</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {myScripts.reduce((acc, s) => acc + (s.totalLines || 0), 0)}
          </div>
          <div className="text-xs text-green-600">对话轮</div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button variant="primary" onClick={() => navigate('/persona/create')}>
          + 创建人设
        </Button>
        <Button variant="secondary" onClick={() => navigate('/script/create')}>
          ✍️ 创作剧本
        </Button>
      </div>

      {/* 我的人设 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">👤 我的人设</h2>
        </div>
        {myPersonas.length > 0 ? (
          <div className="space-y-3">
            {myPersonas.map((persona) => (
              <Link key={persona.id} to={`/persona/${persona.id}`}>
                <PersonaCard persona={persona} showActions={false} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-gray-500 mb-3">还没有人设</p>
            <Button variant="outline" onClick={() => navigate('/persona/create')}>
              创建人设
            </Button>
          </div>
        )}
      </section>

      {/* 我的剧本 */}
      <section id="scripts">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">📝 我的剧本</h2>
        </div>
        {myScripts.length > 0 ? (
          <div className="space-y-3">
            {myScripts.map((script) => (
              <ScriptCard key={script.id} script={script} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 mb-3">还没有剧本</p>
            <Button variant="outline" onClick={() => navigate('/script/create')}>
              创作剧本
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
