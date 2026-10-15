import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { utilizator, tip, logout } = useAuth()
  const navigate = useNavigate()
  const [categorii, setCategorii] = useState([])
  const [necitite, setNecitite] = useState(0)

  useEffect(() => {
    api.get('/categorii/').then(res => setCategorii(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (tip !== 'admin') return
    const fetch = () => api.get('/admin/mesaje', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setNecitite(res.data.filter(m => m.citit === false).length)).catch(() => {})
    fetch()
    const interval = setInterval(fetch, 30000)
    window.addEventListener('mesaj-citit', fetch)
    return () => { clearInterval(interval); window.removeEventListener('mesaj-citit', fetch) }
  }, [tip])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src={logo} alt="logo" style={{ width: '32px', height: '32px' }} />
          CraftManager
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-1 me-3">
            {tip !== 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/ateliere">Ateliere</Link>
              </li>
            )}

            {tip !== 'admin' && <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Categorii
              </a>
              <ul className="dropdown-menu dropdown-menu-custom">
                <li>
                  <Link className="dropdown-item" to="/ateliere">
                    Toate categoriile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                {categorii.length === 0 ? (
                  <li>
                    <span className="dropdown-item text-muted small">
                      Nu exista categorii
                    </span>
                  </li>
                ) : (
                  categorii.map(cat => (
                    <li key={cat.idcategorie}>
                      <Link
                        className="dropdown-item"
                        to={`/ateliere?categorie=${cat.idcategorie}`}
                      >
                        {cat.denumire}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </li>}

            {tip !== 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/despre">Despre</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">Contact</Link>
                </li>
              </>
            )}
            {utilizator && tip === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-1" to="/admin">
                  Administrare
                  {necitite > 0 && <span className="badge bg-danger">{necitite}</span>}
                </Link>
              </li>
            )}
            {utilizator && tip === 'instructor' && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
            )}
            {utilizator && tip === 'participant' && (
              <li className="nav-item">
                <Link className="nav-link" to="/inscrierile-mele">Inscrierile mele</Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-center gap-2">
            {utilizator ? (
              <>
                <li className="nav-item">
                  {tip === 'admin' ? (
                    <span className="tag">Admin</span>
                  ) : (
                    <Link className="tag" to="/contul-meu" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                      {tip === 'instructor' ? 'Instructor' : 'Participant'}
                    </Link>
                  )}
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm" to="/register">
                    Inregistrare
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}