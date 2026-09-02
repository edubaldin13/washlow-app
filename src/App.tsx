import { useMemo, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, type RegisterData } from './pages/LoginPage'
import { MachinesPage } from './pages/MachinesPage'
import { MachineDetailPage } from './pages/MachineDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { Layout } from './components/Layout'
import { ToastContainer } from './components/ToastContainer'
import { ServiceService } from './services/ServiceService'
import { UserService, type UserResponse } from './services/UserService'
import { ToastService } from './services/ToastService'
import { ApiError } from './services/ApiService'
import { saveUser, getUser, clearUser, type StoredUser } from './utils/userCookie'
import { API_BASE_URL } from './config/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const serviceService = useMemo(() => new ServiceService(API_BASE_URL), [])
  const userService = useMemo(() => new UserService(API_BASE_URL), [])

  useEffect(() => {
    const syncUser = async () => {
      const storedUser = getUser()
      if (storedUser) {
        try {
          const apiUser = await userService.getUserById(storedUser.id)
          const updatedUser: StoredUser = {
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone,
            address: apiUser.address,
            role: apiUser.role,
          }
          saveUser(updatedUser)
          setUser(updatedUser)
          setIsAuthenticated(true)
        } catch {
          clearUser()
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setIsInitializing(false)
    }

    syncUser()
  }, [userService])

  const handleAuthSuccess = (apiUser: UserResponse) => {
    const storedUser: StoredUser = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      phone: apiUser.phone,
      address: apiUser.address,
      role: apiUser.role,
    }
    saveUser(storedUser)
    setUser(storedUser)
    setIsAuthenticated(true)
  }

  const handleLogin = async (email: string) => {
    setIsLoading(true)

    try {
      const apiUser = await userService.login({ email })
      handleAuthSuccess(apiUser)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        ToastService.error('Usuário não encontrado na nossa base.')
        return
      }

      const message = error instanceof Error ? error.message : 'Erro ao entrar no sistema.'
      ToastService.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true)

    try {
      const apiUser = await userService.register(data)
      handleAuthSuccess(apiUser)
      ToastService.success('Conta criada com sucesso!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário.'
      ToastService.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearUser()
    setUser(null)
    setIsAuthenticated(false)
  }

  const handleUserUpdated = (updatedUser: StoredUser) => {
    setUser(updatedUser)
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Carregando...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <div className="mb-4 text-sm text-slate-500">
                  Logado como {user?.name} • {user?.email}
                </div>
                <MachinesPage serviceService={serviceService} user={user} />
              </Layout>
            ) : (
              <LoginPage onLogin={handleLogin} onRegister={handleRegister} isLoading={isLoading} />
            )
          }
        />
        <Route
          path="/machines/:id"
          element={
            isAuthenticated ? (
              <MachineDetailPage serviceService={serviceService} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <ProfilePage userService={userService} user={user} onUserUpdated={handleUserUpdated} />
              </Layout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
