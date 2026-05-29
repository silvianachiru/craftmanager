import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import participantIcon from '../assets/participant.png'
import letterIcon from '../assets/letter.png'
import phoneIcon from '../assets/phone-call.png'
import ageIcon from '../assets/age-group.png'
import pencilIcon from '../assets/pencil.png'
import presentationIcon from '../assets/presentation.png'
import cherryIcon from '../assets/cherry-blossom.png'
import artIcon from '../assets/art.png'

const iconStyle = { width: '16px', height: '16px', marginRight: '6px', filter: 'invert(50%) sepia(30%) saturate(400%) hue-rotate(300deg)' }

function validare(form) {
  if (!/^[a-zA-Z\u0103\u00e2\u00ee\u015f\u0163\u0102\u00c2\u00ce\u015e\u0162\s-]+$/.test(form.nume.trim()))
    return 'Numele poate contine doar litere.'
  if (!/^[a-zA-Z\u0103\u00e2\u00ee\u015f\u0163\u0102\u00c2\u00ce\u015e\u0162\s-]+$/.test(form.prenume.trim()))
    return 'Prenumele poate contine doar litere.'
  if (form.parola.length < 6)
    return 'Parola trebuie sa aiba cel putin 6 caractere.'
  if (form.nrtelefon && !/^[+]?[0-9]{7,15}$/.test(form.nrtelefon.replace(/\s/g, '')))
    return 'Numarul de telefon este invalid (7-15 cifre, optional +).'
  if (form.tip === 'participant') {
    const v = parseInt(form.varsta)
    if (!form.varsta || isNaN(v) || v < 1 || v > 120)
      return 'Varsta trebuie sa fie intre 1 si 120 de ani.'
  }
  if (form.tip === 'instructor') {
    if (form.bio && form.bio.length > 500)
      return 'Bio-ul nu poate depasi 500 de caractere.'
    if (form.specializare && form.specializare.length > 200)
      return 'Specializarea nu poate depasi 200 de caractere.'
  }
  return null
}

export default function Register() {
  const [form, setForm] = useState({
    nume: '', prenume: '', email: '', parola: '',
    nrtelefon: '', tip: 'participant', varsta: '', bio: '', specializare: ''
  })
  const [eroare, setEroare] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'nrtelefon') {
      setForm({ ...form, nrtelefon: value.replace(/[^0-9+\s]/g, '').slice(0, 15) })
      return
    }
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEroare('')
    const err = validare(form)
    if (err) { setEroare(err); return }
    setLoading(true)
    try {
      const payload = { ...form }
      if (form.tip === 'participant') payload.varsta = parseInt(form.varsta)
      await api.post('/auth/register', payload)
      setSuccess('Cont creat cu succes!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la inregistrare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crem)' }} className="d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="text-center mb-4">
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-principal)' }}>
                Creeaza un cont
              </h2>
              <p style={{ color: 'var(--text-secundar)' }}>Alatura-te comunitatii CraftManager</p>
            </div>
            <div className="card p-4">
              {eroare && <div className="alert alert-danger">{eroare}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                      <img src={participantIcon} alt="" style={iconStyle} />Nume
                    </label>
                    <input name="nume" className="form-control" placeholder="Popescu"
                      value={form.nume} onChange={handleChange} maxLength={200} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                      <img src={participantIcon} alt="" style={iconStyle} />Prenume
                    </label>
                    <input name="prenume" className="form-control" placeholder="Maria"
                      value={form.prenume} onChange={handleChange} maxLength={200} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                    <img src={letterIcon} alt="" style={iconStyle} />Email
                  </label>
                  <input name="email" type="email" className="form-control" placeholder="adresa@email.com"
                    value={form.email} onChange={handleChange} maxLength={200} required />
                </div>
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                    <img src={pencilIcon} alt="" style={iconStyle} />Parola
                  </label>
                  <input name="parola" type="password" className="form-control" placeholder="Minim 6 caractere"
                    value={form.parola} onChange={handleChange} minLength={6} maxLength={200} required />
                </div>
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                    <img src={phoneIcon} alt="" style={iconStyle} />Nr. Telefon
                    <span style={{ color: 'var(--text-secundar)', fontSize: '0.85rem', marginLeft: '6px' }}>(optional)</span>
                  </label>
                  <input name="nrtelefon" type="tel" className="form-control" placeholder="07xxxxxxxx"
                    value={form.nrtelefon} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ color: 'var(--text-principal)' }}>Tip cont</label>
                  <div className="d-flex gap-3">
                    <div className={"tip-card " + (form.tip === 'participant' ? 'tip-card-active' : '')}
                      onClick={() => setForm({ ...form, tip: 'participant' })}>
                      <div className="tip-icon">
                        <img src={cherryIcon} alt="" style={{ width: '32px', height: '32px' }} />
                      </div>
                      <div className="tip-label">Participant</div>
                    </div>
                    <div className={"tip-card " + (form.tip === 'instructor' ? 'tip-card-active' : '')}
                      onClick={() => setForm({ ...form, tip: 'instructor' })}>
                      <div className="tip-icon">
                        <img src={artIcon} alt="" style={{ width: '32px', height: '32px', filter: 'invert(50%) sepia(30%) saturate(400%) hue-rotate(300deg)' }} />
                      </div>
                      <div className="tip-label">Instructor</div>
                    </div>
                  </div>
                </div>
                {form.tip === 'participant' && (
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                      <img src={ageIcon} alt="" style={iconStyle} />Varsta
                    </label>
                    <input name="varsta" type="number" className="form-control" placeholder="25"
                      value={form.varsta} onChange={handleChange} min={1} max={120} required />
                    <div className="form-text">Intre 1 si 120 de ani.</div>
                  </div>
                )}
                {form.tip === 'instructor' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                        <img src={pencilIcon} alt="" style={iconStyle} />Bio
                      </label>
                      <textarea name="bio" className="form-control" placeholder="Spune-ne despre tine..."
                        value={form.bio} onChange={handleChange} rows={3} maxLength={500} />
                      <div className="form-text text-end">{form.bio.length}/500</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center" style={{ color: 'var(--text-principal)' }}>
                        <img src={presentationIcon} alt="" style={iconStyle} />Specializare
                      </label>
                      <input name="specializare" className="form-control" placeholder="ex: Pictura, Ceramica..."
                        value={form.specializare} onChange={handleChange} maxLength={200} />
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
                  {loading ? 'Se creeaza contul...' : 'Creeaza cont'}
                </button>
              </form>
              <p className="text-center mt-3 mb-0" style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>
                Ai deja cont?{' '}
                <Link to="/login" style={{ color: 'var(--roz)', textDecoration: 'none', fontWeight: 500 }}>
                  Autentifica-te
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
