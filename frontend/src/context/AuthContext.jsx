import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [utilizator, setUtilizator] = useState(null)
  const [tip, setTip] = useState(null)
  const [seIncarca, setSeIncarca] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const tipSalvat = localStorage.getItem('tip')
    if (token) {
      setUtilizator(token)
      setTip(tipSalvat)
    }
    setSeIncarca(false)
  }, [])

  const login = (token, tipUtilizator) => {
    localStorage.setItem('token', token)
    localStorage.setItem('tip', tipUtilizator)
    setUtilizator(token)
    setTip(tipUtilizator)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('tip')
    setUtilizator(null)
    setTip(null)
  }

  return (
    <AuthContext.Provider value={{ utilizator, tip, login, logout, seIncarca }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
