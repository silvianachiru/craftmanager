import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ContulMeu() {
  const { utilizator, tip, seIncarca } = useAuth()
  const navigate = useNavigate()
  const [date, setDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eroare, setEroare] = useState('')
  const [raport, setRaport] = useState(null)
  const [loadingRaport, setLoadingRaport] = useState(false)
  const [showDetalii, setShowDetalii] = useState(false)

  useEffect(() => {
    if (seIncarca) return
    if (!utilizator) { navigate('/login'); return }
    api.get('/auth/me')
      .then(res => setDate(res.data))
      .catch(() => setEroare('Nu s-au putut incarca datele contului.'))
      .finally(() => setLoading(false))
  }, [utilizator])

  useEffect(() => {
    if (tip === 'instructor') {
      setLoadingRaport(true)
      api.get('/materiale/raport-financiar')
        .then(res => setRaport(res.data))
        .catch(() => {})
        .finally(() => setLoadingRaport(false))
    }
  }, [tip])

  if (loading) return (
    <div className="container text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--roz)' }} />
    </div>
  )

  if (eroare) return (
    <div className="container py-5">
      <div className="alert alert-danger">{eroare}</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crem)' }}>
      <div className="page-header-sm">
        <div className="container">
          <h1 style={{ color: 'var(--text-principal)', marginBottom: '4px' }}>Contul meu</h1>
          <p style={{ color: 'var(--text-secundar)', margin: 0 }}>Informatiile tale personale</p>
        </div>
      </div>

      <div className="container py-5" style={{ maxWidth: '700px' }}>
        <div className="mb-4">
          <span className="tag">{tip === 'instructor' ? 'Instructor' : 'Participant'}</span>
        </div>

        {/* Date personale */}
        <div className="card p-4 mb-4">
          <h5 style={{ marginBottom: '20px' }}>Date personale</h5>
          <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Nume complet</span>
              <span style={{ fontWeight: 500 }}>{date.prenume} {date.nume}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Email</span>
              <span style={{ fontWeight: 500 }}>{date.email}</span>
            </div>
            {date.nrtelefon && (
              <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Telefon</span>
                <span style={{ fontWeight: 500 }}>{date.nrtelefon}</span>
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Membru din</span>
              <span style={{ fontWeight: 500 }}>
                {new Date(date.datacrearii).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Participant */}
        {tip === 'participant' && (
          <div className="card p-4 mb-4">
            <h5 style={{ marginBottom: '20px' }}>Detalii cont participant</h5>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Varsta</span>
              <span style={{ fontWeight: 500 }}>{date.varsta} ani</span>
            </div>
          </div>
        )}

        {/* Instructor info */}
        {tip === 'instructor' && (
          <div className="card p-4 mb-4">
            <h5 style={{ marginBottom: '20px' }}>Detalii cont instructor</h5>
            <div className="d-flex flex-column gap-3">
              {date.specializare && (
                <div className="d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Specializare</span>
                  <span style={{ fontWeight: 500 }}>{date.specializare}</span>
                </div>
              )}
              {date.bio && (
                <div>
                  <span style={{ color: 'var(--text-secundar)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Bio</span>
                  <p style={{ margin: 0, fontWeight: 500 }}>{date.bio}</p>
                </div>
              )}
              {!date.specializare && !date.bio && (
                <p style={{ color: 'var(--text-secundar)', margin: 0, fontSize: '0.9rem' }}>Nu ai adaugat inca informatii de profil.</p>
              )}
            </div>
          </div>
        )}

        {/* Raport financiar instructor */}
        {tip === 'instructor' && (
          <div className="card p-4">
            <h5 style={{ marginBottom: '4px' }}>Raport financiar</h5>
            <p style={{ color: 'var(--text-secundar)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Sumar venituri si cheltuieli din atelierele tale
            </p>

            {loadingRaport ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm" style={{ color: 'var(--roz)' }} />
              </div>
            ) : raport ? (
              <>
                {/* Carduri sumar */}
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '4px', fontWeight: 500 }}>Total castigat</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534' }}>{raport.total_castigat.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#166534' }}>RON</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px', fontWeight: 500 }}>Total cheltuit</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#991b1b' }}>{raport.total_cheltuit.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>RON</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div style={{
                      background: raport.profit_net >= 0 ? '#eff6ff' : '#fef2f2',
                      border: `1px solid ${raport.profit_net >= 0 ? '#bfdbfe' : '#fecaca'}`,
                      borderRadius: '12px', padding: '16px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: raport.profit_net >= 0 ? '#1e40af' : '#991b1b', marginBottom: '4px', fontWeight: 500 }}>Profit net</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: raport.profit_net >= 0 ? '#1e40af' : '#991b1b' }}>
                        {raport.profit_net >= 0 ? '+' : ''}{raport.profit_net.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: raport.profit_net >= 0 ? '#1e40af' : '#991b1b' }}>RON</div>
                    </div>
                  </div>
                </div>

                {/* Detalii per atelier */}
                {raport.ateliere.length > 0 && (
                  <>
                    <button type="button"
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--roz)', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '12px' }}
                      onClick={() => setShowDetalii(p => !p)}>
                      {showDetalii ? '▲ Ascunde detalii per atelier' : '▼ Vezi detalii per atelier'}
                    </button>

                    {showDetalii && (
                      <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-secundar)', fontWeight: 500 }}>
                            <td style={{ paddingBottom: '6px' }}>Atelier</td>
                            <td style={{ textAlign: 'center', paddingBottom: '6px' }}>Data</td>
                            <td style={{ textAlign: 'right', paddingBottom: '6px' }}>Castigat</td>
                            <td style={{ textAlign: 'right', paddingBottom: '6px' }}>Cheltuit</td>
                            <td style={{ textAlign: 'right', paddingBottom: '6px' }}>Profit</td>
                          </tr>
                        </thead>
                        <tbody>
                          {raport.ateliere.map(a => (
                            <tr key={a.idatelier} style={{ borderTop: '1px solid var(--border)' }}>
                              <td style={{ padding: '7px 0', fontWeight: 500 }}>{a.denumire}</td>
                              <td style={{ textAlign: 'center', padding: '7px 0', color: 'var(--text-secundar)' }}>
                                {new Date(a.data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ textAlign: 'right', padding: '7px 0', color: '#166534' }}>{a.castigat.toFixed(2)} RON</td>
                              <td style={{ textAlign: 'right', padding: '7px 0', color: '#991b1b' }}>{a.cheltuit.toFixed(2)} RON</td>
                              <td style={{ textAlign: 'right', padding: '7px 0', fontWeight: 600, color: a.profit >= 0 ? '#1e40af' : '#991b1b' }}>
                                {a.profit >= 0 ? '+' : ''}{a.profit.toFixed(2)} RON
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ borderTop: '2px solid var(--border)' }}>
                            <td colSpan={2} style={{ paddingTop: '8px', fontWeight: 600 }}>Total</td>
                            <td style={{ textAlign: 'right', paddingTop: '8px', fontWeight: 700, color: '#166534' }}>{raport.total_castigat.toFixed(2)} RON</td>
                            <td style={{ textAlign: 'right', paddingTop: '8px', fontWeight: 700, color: '#991b1b' }}>{raport.total_cheltuit.toFixed(2)} RON</td>
                            <td style={{ textAlign: 'right', paddingTop: '8px', fontWeight: 700, color: raport.profit_net >= 0 ? '#1e40af' : '#991b1b' }}>
                              {raport.profit_net >= 0 ? '+' : ''}{raport.profit_net.toFixed(2)} RON
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Nu exista date financiare inca.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
