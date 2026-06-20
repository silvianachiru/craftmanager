import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { telefonValid, numeValid } from '../utils/validare'

export default function ContulMeu() {
  const { utilizator, tip, seIncarca, logout } = useAuth()
  const navigate = useNavigate()
  const [date, setDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eroare, setEroare] = useState('')
  const [raport, setRaport] = useState(null)
  const [loadingRaport, setLoadingRaport] = useState(false)
  const [showDetalii, setShowDetalii] = useState(false)

  // Editare profil
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [savingProfil, setSavingProfil] = useState(false)
  const [mesajProfil, setMesajProfil] = useState('')

  // Schimbare parola
  const [parolaForm, setParolaForm] = useState({ veche: '', noua: '', confirma: '' })
  const [savingParola, setSavingParola] = useState(false)
  const [mesajParola, setMesajParola] = useState('')
  const [eroareParola, setEroareParola] = useState('')

  // Stergere cont
  const [showModalStergere, setShowModalStergere] = useState(false)
  const [stergeInCurs, setStergeInCurs] = useState(false)
  const [eroareStergere, setEroareStergere] = useState('')

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

  const incepeEditare = () => {
    setForm({
      prenume: date.prenume || '',
      nume: date.nume || '',
      nrtelefon: date.nrtelefon || '',
      varsta: date.varsta || '',
      specializare: date.specializare || '',
      bio: date.bio || '',
    })
    setMesajProfil('')
    setEditMode(true)
  }

  const salveazaProfil = async () => {
    if (!numeValid(form.prenume) || !numeValid(form.nume)) {
      setMesajProfil('Numele si prenumele pot contine doar litere.')
      return
    }
    if (form.nrtelefon && !telefonValid(form.nrtelefon)) {
      setMesajProfil('Numarul de telefon trebuie sa fie un numar de mobil valid: 07 sau +407 urmat de 8 cifre (ex: 0712345678).')
      return
    }
    setMesajProfil('')
    setSavingProfil(true)
    try {
      await api.put('/auth/me', {
        prenume: form.prenume,
        nume: form.nume,
        nrtelefon: form.nrtelefon || null,
        varsta: tip === 'participant' && form.varsta ? parseInt(form.varsta) : undefined,
        specializare: tip === 'instructor' ? form.specializare : undefined,
        bio: tip === 'instructor' ? form.bio : undefined,
      })
      const res = await api.get('/auth/me')
      setDate(res.data)
      setEditMode(false)
      setMesajProfil('Profil actualizat cu succes.')
    } catch (err) {
      setMesajProfil(err.response?.data?.detail || 'Nu s-a putut salva profilul.')
    } finally {
      setSavingProfil(false)
    }
  }

  const salveazaParola = async () => {
    setMesajParola('')
    setEroareParola('')
    if (parolaForm.noua !== parolaForm.confirma) {
      setEroareParola('Parolele noi nu coincid.')
      return
    }
    setSavingParola(true)
    try {
      await api.put('/auth/me/parola', {
        parola_veche: parolaForm.veche,
        parola_noua: parolaForm.noua,
      })
      setParolaForm({ veche: '', noua: '', confirma: '' })
      setMesajParola('Parola schimbata cu succes.')
    } catch (err) {
      setEroareParola(err.response?.data?.detail || 'Nu s-a putut schimba parola.')
    } finally {
      setSavingParola(false)
    }
  }

  const stergeCont = async () => {
    setStergeInCurs(true)
    setEroareStergere('')
    try {
      await api.delete('/auth/me')
      logout()
      navigate('/')
    } catch (err) {
      setEroareStergere(err.response?.data?.detail || 'Nu s-a putut sterge contul. Incearca din nou.')
      setStergeInCurs(false)
    }
  }

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

  const labelStil = { color: 'var(--text-secundar)', fontSize: '0.9rem' }
  const randStil = { borderBottom: '1px solid var(--border)', paddingBottom: '12px' }

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

        {mesajProfil && !editMode && (
          <div className="alert alert-success py-2 mb-4">{mesajProfil}</div>
        )}

        {/* Date personale */}
        <div className="card p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: 0 }}>Date personale</h5>
            {!editMode && (
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={incepeEditare}>
                Editeaza
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center" style={randStil}>
                <span style={labelStil}>Nume complet</span>
                <span style={{ fontWeight: 500 }}>{date.prenume} {date.nume}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={randStil}>
                <span style={labelStil}>Email</span>
                <span style={{ fontWeight: 500 }}>{date.email}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center" style={date.nrtelefon ? randStil : {}}>
                <span style={labelStil}>Telefon</span>
                <span style={{ fontWeight: 500 }}>{date.nrtelefon || '—'}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={labelStil}>Membru din</span>
                <span style={{ fontWeight: 500 }}>
                  {new Date(date.datacrearii).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" style={labelStil}>Prenume</label>
                  <input className="form-control" value={form.prenume}
                    onChange={e => setForm({ ...form, prenume: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={labelStil}>Nume</label>
                  <input className="form-control" value={form.nume}
                    onChange={e => setForm({ ...form, nume: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label" style={labelStil}>Telefon</label>
                <input className="form-control" value={form.nrtelefon}
                  placeholder="0712345678"
                  onChange={e => setForm({ ...form, nrtelefon: e.target.value.replace(/[^0-9+]/g, '').slice(0, 12) })} />
                <small style={{ color: 'var(--text-secundar)' }}>Numar de mobil: 07… sau +407… (10 cifre).</small>
              </div>
              <div>
                <label className="form-label" style={labelStil}>Email</label>
                <input className="form-control" value={date.email} disabled />
                <small style={{ color: 'var(--text-secundar)' }}>Emailul nu poate fi modificat.</small>
              </div>

              {tip === 'participant' && (
                <div>
                  <label className="form-label" style={labelStil}>Varsta</label>
                  <input type="number" min="1" max="120" className="form-control" value={form.varsta}
                    onChange={e => setForm({ ...form, varsta: e.target.value })} />
                </div>
              )}

              {tip === 'instructor' && (
                <>
                  <div>
                    <label className="form-label" style={labelStil}>Specializare</label>
                    <input className="form-control" value={form.specializare}
                      placeholder="ex: Pictura, Ceramica..."
                      onChange={e => setForm({ ...form, specializare: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={labelStil}>Bio</label>
                    <textarea className="form-control" rows="3" value={form.bio}
                      placeholder="Cateva cuvinte despre tine..."
                      onChange={e => setForm({ ...form, bio: e.target.value })} />
                  </div>
                </>
              )}

              {mesajProfil && <div className="alert alert-danger py-2 mb-0">{mesajProfil}</div>}

              <div className="d-flex gap-2 mt-2">
                <button type="button" className="btn btn-primary" disabled={savingProfil} onClick={salveazaProfil}>
                  {savingProfil ? 'Se salveaza...' : 'Salveaza'}
                </button>
                <button type="button" className="btn btn-outline-secondary" disabled={savingProfil}
                  onClick={() => { setEditMode(false); setMesajProfil('') }}>
                  Renunta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Participant (doar vizualizare; editarea e in cardul de mai sus) */}
        {tip === 'participant' && !editMode && (
          <div className="card p-4 mb-4">
            <h5 style={{ marginBottom: '20px' }}>Detalii cont participant</h5>
            <div className="d-flex justify-content-between align-items-center">
              <span style={labelStil}>Varsta</span>
              <span style={{ fontWeight: 500 }}>{date.varsta} ani</span>
            </div>
          </div>
        )}

        {/* Instructor info (doar vizualizare) */}
        {tip === 'instructor' && !editMode && (
          <div className="card p-4 mb-4">
            <h5 style={{ marginBottom: '20px' }}>Detalii cont instructor</h5>
            <div className="d-flex flex-column gap-3">
              {date.specializare && (
                <div className="d-flex justify-content-between align-items-center" style={randStil}>
                  <span style={labelStil}>Specializare</span>
                  <span style={{ fontWeight: 500 }}>{date.specializare}</span>
                </div>
              )}
              {date.bio && (
                <div>
                  <span style={{ ...labelStil, display: 'block', marginBottom: '8px' }}>Bio</span>
                  <p style={{ margin: 0, fontWeight: 500 }}>{date.bio}</p>
                </div>
              )}
              {!date.specializare && !date.bio && (
                <p style={{ ...labelStil, margin: 0 }}>Nu ai adaugat inca informatii de profil.</p>
              )}
            </div>
          </div>
        )}

        {/* Schimbare parola */}
        <div className="card p-4 mb-4">
          <h5 style={{ marginBottom: '4px' }}>Schimba parola</h5>
          <p style={{ ...labelStil, marginBottom: '20px' }}>Foloseste o parola de minim 6 caractere.</p>
          <div className="d-flex flex-column gap-3">
            <div>
              <label className="form-label" style={labelStil}>Parola actuala</label>
              <input type="password" className="form-control" value={parolaForm.veche}
                onChange={e => setParolaForm({ ...parolaForm, veche: e.target.value })} />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" style={labelStil}>Parola noua</label>
                <input type="password" className="form-control" value={parolaForm.noua}
                  onChange={e => setParolaForm({ ...parolaForm, noua: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={labelStil}>Confirma parola noua</label>
                <input type="password" className="form-control" value={parolaForm.confirma}
                  onChange={e => setParolaForm({ ...parolaForm, confirma: e.target.value })} />
              </div>
            </div>

            {mesajParola && <div className="alert alert-success py-2 mb-0">{mesajParola}</div>}
            {eroareParola && <div className="alert alert-danger py-2 mb-0">{eroareParola}</div>}

            <div>
              <button type="button" className="btn btn-primary" disabled={savingParola || !parolaForm.veche || !parolaForm.noua}
                onClick={salveazaParola}>
                {savingParola ? 'Se salveaza...' : 'Schimba parola'}
              </button>
            </div>
          </div>
        </div>

        {/* Stergere cont */}
        <div className="card p-4 mb-4" style={{ border: '1px solid #fecaca' }}>
          <h5 style={{ marginBottom: '4px', color: '#991b1b' }}>Sterge contul</h5>
          <p style={{ ...labelStil, marginBottom: '16px' }}>
            La stergere, datele tale personale (nume, email, telefon) sunt eliminate definitiv, iar contul nu se mai poate autentifica.
            Recenziile pe care le-ai lasat si atelierele raman pe platforma, afisate anonim ca „Utilizator sters".
            {tip === 'instructor'
              ? ' Nu iti poti sterge contul cat timp ai ateliere viitoare programate.'
              : ' Nu iti poti sterge contul cat timp ai inscrieri active la ateliere viitoare.'}
          </p>
          <button type="button" className="btn"
            style={{ background: '#dc2626', color: '#fff', alignSelf: 'flex-start' }}
            onClick={() => { setEroareStergere(''); setShowModalStergere(true) }}>
            Sterge contul
          </button>
        </div>

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

      {/* Modal confirmare stergere */}
      {showModalStergere && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '16px'
        }}>
          <div className="card p-4" style={{ maxWidth: '460px', width: '100%' }}>
            <h5 style={{ marginBottom: '12px', color: '#991b1b' }}>Esti sigur?</h5>
            <p style={{ color: 'var(--text-secundar)', fontSize: '0.92rem', marginBottom: '16px' }}>
              Datele tale personale vor fi eliminate definitiv si nu te vei mai putea autentifica.
              Recenziile si atelierele raman pe platforma, afisate ca „Utilizator sters". Aceasta actiune nu poate fi anulata.
            </p>

            {eroareStergere && <div className="alert alert-danger py-2 mb-3">{eroareStergere}</div>}

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary"
                disabled={stergeInCurs}
                onClick={() => setShowModalStergere(false)}>
                Renunta
              </button>
              <button type="button" className="btn"
                style={{ background: '#dc2626', color: '#fff' }}
                disabled={stergeInCurs}
                onClick={stergeCont}>
                {stergeInCurs ? 'Se sterge...' : 'Da, sterge contul'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
