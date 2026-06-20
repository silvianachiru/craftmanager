import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import calendarIcon from '../assets/calendar.png'
import clockIcon from '../assets/clock.png'
import locationIcon from '../assets/location.png'
import tagIcon from '../assets/tag.png'
import starIcon from '../assets/star.png'
import warningIcon from '../assets/warning.png'

const getAtelierDateTime = (atelier) => {
  if (!atelier?.data) return null

  const timeValue = atelier.ora?.slice?.(0, 5) || '00:00'
  return new Date(`${atelier.data}T${timeValue}:00`)
}

export default function InscrierileMele() {
  const { utilizator, tip, seIncarca } = useAuth()
  const navigate = useNavigate()
  const [inregistrari, setInregistrari] = useState([])
  const [loading, setLoading] = useState(true)
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')
  const [anulareId, setAnulareId] = useState(null)
  const [recenzieModal, setRecenzieModal] = useState(null) // idinregistrare
  const [rating, setRating] = useState(5)
  const [comentariu, setComentariu] = useState('')
  const [recenziiAdaugate, setRecenziiAdaugate] = useState(new Set())
  const [tabActiv, setTabActiv] = useState('active')

  const iconStyle = {
    width: '14px', height: '14px',
    filter: 'invert(60%) sepia(40%) saturate(400%) hue-rotate(300deg)',
    marginRight: '4px'
  }

  useEffect(() => {
    if (utilizator === null && tip === null) return
    if (!utilizator || tip !== 'participant') { navigate('/'); return }
    Promise.all([
      api.get('/inregistrari/ale-mele'),
      api.get('/recenzii/ale-mele')
    ]).then(([inrRes, recRes]) => {
      setInregistrari(inrRes.data)
      setRecenziiAdaugate(new Set(recRes.data.map(r => r.idinregistrare)))
    }).finally(() => setLoading(false))
  }, [utilizator, tip])

  const handleAnulare = async () => {
    try {
      await api.delete(`/inregistrari/${anulareId}`)
      setInregistrari(inregistrari.map(i =>
        i.idinregistrare === anulareId ? { ...i, status: 'Anulare' } : i
      ))
      setAnulareId(null)
      setMesaj('Inscrierea a fost anulata.')
      setTimeout(() => setMesaj(''), 3000)
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la anulare')
      setAnulareId(null)
      setTimeout(() => setEroare(''), 3000)
    }
  }

  const handleAdaugaRecenzie = async () => {
    try {
      await api.post('/recenzii/', {
        idinregistrare: recenzieModal,
        rating,
        comentariu: comentariu || null
      })
      setRecenziiAdaugate(prev => new Set([...prev, recenzieModal]))
      setRecenzieModal(null)
      setRating(5)
      setComentariu('')
      setMesaj('Recenzia a fost adaugata!')
      setTimeout(() => setMesaj(''), 3000)
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la adaugarea recenziei')
      setTimeout(() => setEroare(''), 3000)
    }
  }

  const statusColor = (status) => {
    if (status === 'Inscriere') return { bg: '#e8f5e9', color: '#2e7d32' }
    if (status === 'Participare') return { bg: '#e3f2fd', color: '#1565c0' }
    if (status === 'Anulare') return { bg: '#fde8ee', color: '#c0566e' }
    return { bg: '#f5f5f5', color: '#666' }
  }

  const inscrieriActive = inregistrari
    .filter(inr => {
      const atelierDateTime = getAtelierDateTime(inr.atelier)
      return atelierDateTime ? atelierDateTime >= new Date() : false
    })
    .sort((a, b) => getAtelierDateTime(a.atelier) - getAtelierDateTime(b.atelier))

  const inscrieriTrecute = inregistrari
    .filter(inr => {
      const atelierDateTime = getAtelierDateTime(inr.atelier)
      return atelierDateTime ? atelierDateTime < new Date() : true
    })
    .sort((a, b) => getAtelierDateTime(b.atelier) - getAtelierDateTime(a.atelier))

  if (loading) return (
    <div className="container text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--roz)' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crem)' }}>

      {/* MODAL ANULARE */}
      {anulareId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(61,44,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card p-4" style={{ maxWidth: '420px', width: '90%', borderRadius: '20px' }}>
            <div className="text-center mb-3" style={{ fontSize: '2.5rem' }}>📋</div>
            <h5 style={{ textAlign: 'center', marginBottom: '12px' }}>Anulezi inscrierea?</h5>
            <p style={{ color: 'var(--text-secundar)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '16px' }}>
              Esti sigur ca vrei sa anulezi inscrierea la acest atelier?
            </p>
            <p style={{ color: 'var(--text-secundar)', textAlign: 'center', fontSize: '0.82rem', marginBottom: '24px', background: '#fef9ec', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <img src={warningIcon} alt="atentie" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              Anularea este posibila doar cu cel putin 10 zile inainte de data atelierului.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button type="button" className="btn btn-outline-primary px-4" onClick={() => setAnulareId(null)}>Nu, pastreaza</button>
              <button type="button" className="btn px-4" style={{ background: '#e890a6', color: 'white', border: 'none', borderRadius: '50px' }} onClick={handleAnulare}>
                Da, anuleaza
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECENZIE */}
      {recenzieModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(61,44,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card p-4" style={{ maxWidth: '480px', width: '90%', borderRadius: '20px' }}>
            <div className="text-center mb-3"><img src={starIcon} alt="star" style={{ width: '48px', height: '48px', }} /></div>
            <h5 style={{ textAlign: 'center', marginBottom: '4px' }}>Adauga o recenzie</h5>
            <p style={{ color: 'var(--text-secundar)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
              Spune-ne cum a fost experienta ta
            </p>

            <div className="mb-3">
              <label className="form-label">Rating</label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map(stea => (
                  <button
                    key={stea}
                    type="button"
                    onClick={() => setRating(stea)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                  >
                    <img src={starIcon} alt={stea} style={{ width: '28px', height: '28px', opacity: stea <= rating ? 1 : 0.25, transition: 'opacity 0.15s' }} />
                  </button>
                ))}
              </div>
              <small style={{ color: 'var(--text-secundar)' }}>{rating} din 5 stele</small>
            </div>

            <div className="mb-4">
              <label className="form-label">Comentariu (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Scrie parerea ta despre atelier..."
                value={comentariu}
                onChange={e => setComentariu(e.target.value)}
              />
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <button type="button" className="btn btn-outline-primary px-4" onClick={() => { setRecenzieModal(null); setRating(5); setComentariu('') }}>
                Anuleaza
              </button>
              <button type="button" className="btn btn-primary px-4" onClick={handleAdaugaRecenzie}>
                Trimite recenzia
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-sm">
        <div className="container">
          <h1 style={{ color: 'var(--text-principal)', marginBottom: '4px' }}>Inscrierile mele</h1>
          <p style={{ color: 'var(--text-secundar)', margin: 0 }}>Toate atelierele la care te-ai inscris</p>
        </div>
      </div>

      <div className="container py-5">
        {mesaj && <div className="alert alert-success mb-4">{mesaj}</div>}
        {eroare && <div className="alert alert-danger mb-4">{eroare}</div>}

        {inregistrari.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎨</div>
            <h5 style={{ marginBottom: '8px' }}>Nu te-ai inscris la niciun atelier inca</h5>
            <p style={{ color: 'var(--text-secundar)', marginBottom: '24px' }}>Descopera atelierele disponibile si inscrie-te la cel care te inspira</p>
            <Link to="/ateliere" className="btn btn-primary px-5">Exploreaza atelierele</Link>
          </div>
        ) : (
          <>
            {/* TABS */}
            <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '32px', display: 'flex', gap: '4px' }}>
              {[
                { key: 'active', label: 'Inscrieri active', count: inscrieriActive.length },
                { key: 'trecute', label: 'Ateliere trecute', count: inscrieriTrecute.length },
              ].map(tab => (
                <button key={tab.key} type="button" onClick={() => setTabActiv(tab.key)}
                  style={{
                    background: 'none', border: 'none', padding: '10px 18px', cursor: 'pointer',
                    fontSize: '0.95rem', fontWeight: tabActiv === tab.key ? 600 : 400,
                    color: tabActiv === tab.key ? 'var(--text-principal)' : 'var(--text-secundar)',
                    borderBottom: tabActiv === tab.key ? '2px solid var(--text-principal)' : '2px solid transparent',
                    marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      background: tabActiv === tab.key ? '#4b3a44' : '#888',
                      color: 'white', borderRadius: '20px', padding: '1px 8px',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* INSCRIERI ACTIVE */}
            {tabActiv === 'active' && (inscrieriActive.length === 0 ? (
              <div className="card p-4">
                <p style={{ color: 'var(--text-secundar)', margin: 0 }}>Nu ai inscrieri active in acest moment.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div style={{ background: '#fef9ec', border: '1px solid #f5e4a0', borderRadius: '12px', padding: '10px 16px', fontSize: '0.85rem', color: '#7a6430', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src={warningIcon} alt="atentie" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  Inscrierea poate fi anulata cu cel putin <strong>10 zile</strong> inainte de data atelierului.
                </div>
                {inscrieriActive.map(inr => {
                    const colors = statusColor(inr.status)
                    const areRecenzie = recenziiAdaugate.has(inr.idinregistrare)

                    return (
                      <div key={inr.idinregistrare} className="card p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="grow">
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <h5 style={{ margin: 0 }}>{inr.atelier?.denumire || `Atelier #${inr.idatelier}`}</h5>
                              <span style={{ background: colors.bg, color: colors.color, borderRadius: '50px', padding: '3px 12px', fontSize: '0.78rem', fontWeight: 500 }}>
                                {inr.status}
                              </span>
                            </div>
                            <div className="d-flex flex-wrap gap-3 mb-2">
                              {inr.atelier?.data && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={calendarIcon} alt="data" style={iconStyle} />
                                  {new Date(inr.atelier.data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </small>
                              )}
                              {inr.atelier?.ora && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={clockIcon} alt="ora" style={iconStyle} />
                                  {inr.atelier.ora?.slice(0, 5)}
                                </small>
                              )}
                              {inr.atelier?.locatie && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={locationIcon} alt="locatie" style={iconStyle} />
                                  {inr.atelier.locatie.nume}, {inr.atelier.locatie.oras}
                                </small>
                              )}
                              {inr.atelier?.pret && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={tagIcon} alt="pret" style={iconStyle} />
                                  {inr.atelier.pret} RON
                                </small>
                              )}
                            </div>
                            <small style={{ color: 'var(--text-secundar)' }}>
                              Inscris pe: {new Date(inr.datainscriere).toLocaleDateString('ro-RO')}
                            </small>
                          </div>

                          <div className="d-flex gap-2 ms-3 flex-wrap justify-content-end">
                            <Link to={`/ateliere/${inr.idatelier}`} state={{ from: 'inscrieri' }} className="btn btn-outline-primary btn-sm">
                              Vezi atelier
                            </Link>
                            {inr.status === 'Inscriere' && (
                              <button type="button" className="btn btn-sm"
                                style={{ border: '1px solid #e890a6', color: '#c0566e', borderRadius: '50px' }}
                                onClick={() => setAnulareId(inr.idinregistrare)}>
                                Anuleaza
                              </button>
                            )}
                            {inr.status === 'Participare' && !areRecenzie && (
                              <button type="button" className="btn btn-sm btn-primary"
                                onClick={() => setRecenzieModal(inr.idinregistrare)}>
                                Recenzie
                              </button>
                            )}
                            {inr.status === 'Participare' && areRecenzie && (
                              <span style={{ color: 'var(--text-secundar)', fontSize: '0.85rem', padding: '4px 8px' }}>
                                Recenzie trimisa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                })}
              </div>
            ))}

            {/* ATELIERE TRECUTE */}
            {tabActiv === 'trecute' && (inscrieriTrecute.length === 0 ? (
              <div className="card p-4">
                <p style={{ color: 'var(--text-secundar)', margin: 0 }}>Nu ai inca ateliere trecute.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {inscrieriTrecute.map(inr => {
                    const colors = statusColor(inr.status)
                    const areRecenzie = recenziiAdaugate.has(inr.idinregistrare)

                    return (
                      <div key={inr.idinregistrare} className="card p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="grow">
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <h5 style={{ margin: 0 }}>{inr.atelier?.denumire || `Atelier #${inr.idatelier}`}</h5>
                              <span style={{ background: colors.bg, color: colors.color, borderRadius: '50px', padding: '3px 12px', fontSize: '0.78rem', fontWeight: 500 }}>
                                {inr.status}
                              </span>
                            </div>
                            <div className="d-flex flex-wrap gap-3 mb-2">
                              {inr.atelier?.data && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={calendarIcon} alt="data" style={iconStyle} />
                                  {new Date(inr.atelier.data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </small>
                              )}
                              {inr.atelier?.ora && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={clockIcon} alt="ora" style={iconStyle} />
                                  {inr.atelier.ora?.slice(0, 5)}
                                </small>
                              )}
                              {inr.atelier?.locatie && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={locationIcon} alt="locatie" style={iconStyle} />
                                  {inr.atelier.locatie.nume}, {inr.atelier.locatie.oras}
                                </small>
                              )}
                              {inr.atelier?.pret && (
                                <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                                  <img src={tagIcon} alt="pret" style={iconStyle} />
                                  {inr.atelier.pret} RON
                                </small>
                              )}
                            </div>
                            <small style={{ color: 'var(--text-secundar)' }}>
                              Inscris pe: {new Date(inr.datainscriere).toLocaleDateString('ro-RO')}
                            </small>
                          </div>

                          <div className="d-flex gap-2 ms-3 flex-wrap justify-content-end">
                            <Link to={`/ateliere/${inr.idatelier}`} state={{ from: 'inscrieri' }} className="btn btn-outline-primary btn-sm">
                              Vezi atelier
                            </Link>
                            {inr.status === 'Participare' && !areRecenzie && (
                              <button type="button" className="btn btn-sm btn-primary"
                                onClick={() => setRecenzieModal(inr.idinregistrare)}>
                                Recenzie
                              </button>
                            )}
                            {inr.status === 'Participare' && areRecenzie && (
                              <span style={{ color: 'var(--text-secundar)', fontSize: '0.85rem', padding: '4px 8px' }}>
                                Recenzie trimisa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
