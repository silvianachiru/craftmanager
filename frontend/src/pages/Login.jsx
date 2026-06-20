import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { emailValid } from '../utils/validare'

export default function Login() {
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [eroare, setEroare] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEroare('')
    if (!emailValid(email)) {
      setEroare('Adresa de email nu este valida (ex: adresa@email.com).')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', parola)
      const res = await api.post('/auth/login', formData)
      const tip = res.data.tip
      login(res.data.access_token, tip)
      if (tip === 'admin') navigate('/admin')
      else if (tip === 'instructor') navigate('/dashboard')
      else navigate('/')
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Email sau parola incorecte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crem)' }} className="d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="text-center mb-4">
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-principal)' }}>
                Bine ai revenit
              </h2>
              <p style={{ color: 'var(--text-secundar)' }}>Autentifică-te în contul tău</p>
            </div>
            <div className="card p-4">
              {eroare && <div className="alert alert-danger">{eroare}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-500" style={{ color: 'var(--text-principal)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="adresa@email.com"
                    value={email}
                    maxLength={200}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ color: 'var(--text-principal)' }}>
                    Parolă
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Parola ta"
                    value={parola}
                    maxLength={200}
                    onChange={(e) => setParola(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Se încarcă...' : 'Autentificare'}
                </button>
              </form>
              <p className="text-center mt-3 mb-0" style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>
                Nu ai cont?{' '}
                <Link to="/register" style={{ color: 'var(--roz)', textDecoration: 'none', fontWeight: 500 }}>
                  Înregistrează-te
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}