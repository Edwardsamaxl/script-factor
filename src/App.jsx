import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import TabBar from './components/layout/TabBar'
import HomePage from './pages/HomePage'
import PersonaCreatePage from './pages/PersonaCreatePage'
import PersonaSquarePage from './pages/PersonaSquarePage'
import PersonaDetailPage from './pages/PersonaDetailPage'
import ScriptCreatePage from './pages/ScriptCreatePage'
import ScriptDetailPage from './pages/ScriptDetailPage'
import AICreatePage from './pages/AICreatePage'
import AIHubPage from './pages/AIHubPage'
import ProfilePage from './pages/ProfilePage'
import MyPersonasPage from './pages/MyPersonasPage'
import MyScriptsPage from './pages/MyScriptsPage'
import { PersonaProvider } from './context/PersonaContext'
import { ScriptProvider } from './context/ScriptContext'
import { UserProvider } from './context/UserContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <UserProvider>
      <PersonaProvider>
        <ScriptProvider>
          <div className="min-h-screen bg-paper-100 pb-16 md:pb-0">
            <Navbar />
            <main className="max-w-lg mx-auto px-4 py-4">
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/persona/create" element={<PersonaCreatePage />} />
                <Route path="/persona/square" element={<PersonaSquarePage />} />
                <Route path="/persona/:id" element={<PersonaDetailPage />} />
                <Route path="/script/create" element={<ScriptCreatePage />} />
                <Route path="/script/:id" element={<ScriptDetailPage />} />
                <Route path="/ai/create/:scriptId" element={<AICreatePage />} />
                <Route path="/ai/hub" element={<AIHubPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/my/personas" element={<MyPersonasPage />} />
                <Route path="/my/scripts" element={<MyScriptsPage />} />
              </Routes>
            </main>
            <TabBar />
          </div>
        </ScriptProvider>
      </PersonaProvider>
    </UserProvider>
  )
}
