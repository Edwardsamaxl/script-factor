import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import TabBar from './components/layout/TabBar'
import HomePage from './pages/HomePage'
import PersonaCreatePage from './pages/PersonaCreatePage'
import PersonaSquarePage from './pages/PersonaSquarePage'
import ScriptCreatePage from './pages/ScriptCreatePage'
import ScriptDetailPage from './pages/ScriptDetailPage'
import AICreatePage from './pages/AICreatePage'
import AIHubPage from './pages/AIHubPage'
import ProfilePage from './pages/ProfilePage'
import { PersonaProvider } from './context/PersonaContext'
import { ScriptProvider } from './context/ScriptContext'
import { UserProvider } from './context/UserContext'

export default function App() {
  return (
    <UserProvider>
      <PersonaProvider>
        <ScriptProvider>
          <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
            <Navbar />
            <main className="max-w-lg mx-auto px-4 py-4">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/persona/create" element={<PersonaCreatePage />} />
                <Route path="/persona/square" element={<PersonaSquarePage />} />
                <Route path="/persona/:id" element={<PersonaCreatePage />} />
                <Route path="/script/create" element={<ScriptCreatePage />} />
                <Route path="/script/:id" element={<ScriptDetailPage />} />
                <Route path="/ai/create/:scriptId" element={<AICreatePage />} />
                <Route path="/ai/hub" element={<AIHubPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <TabBar />
          </div>
        </ScriptProvider>
      </PersonaProvider>
    </UserProvider>
  )
}
