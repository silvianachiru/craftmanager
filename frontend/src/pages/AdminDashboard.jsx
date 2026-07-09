import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { extrageEroare } from '../utils/validare'
import starIcon from '../assets/star.png'
import trashIcon from '../assets/trash-bin.png'

function ModalConfirmare({ text, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(61,44,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card p-4" style={{ maxWidth: '420px', width: '90%', borderRadius: '20px' }}>
        <div className="text-center mb-3">
          <img src={trashIcon} alt="sterge" style={{ width: '48px', height: '48px' }} />
        </div>
        <h5 style={{ textAlign: 'center', marginBottom: '12px' }}>Confirmare stergere</h5>
        <p style={{ color: 'var(--text-secundar)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
          {text}
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <button type="button" className="btn btn-outline-primary px-4" onClick={onCancel}>Nu, anuleaza</button>
          <button type="button" className="btn px-4" style={{ background: '#e890a6', color: 'white', border: 'none', borderRadius: '50px' }} onClick={onConfirm}>
            Da, sterge
          </button>
        </div>
      </div>
    </div>
  )
}

const API = 'http://localhost:8000'

export default function AdminDashboard() {
  const { utilizator, tip, seIncarca } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(() => window.location.hash.replace('#', '') || 'categorii')
  const [mesaje, setMesaje] = useState([])
  const [utilizatori, setUtilizatori] = useState([])
  const [ateliere, setAteliere] = useState([])
  const [categorii, setCategorii] = useState([])
  const [nouaCategorie, setNouaCategorie] = useState('')
  const [nouaTema, setNouaTema] = useState({ denumire: '', idcategorie: '' })
  const [notificare, setNotificare] = useState('')
  const [eroare, setEroare] = useState('')
  const [modal, setModal] = useState(null)
  const [searchUtilizatori, setSearchUtilizatori] = useState('')
  const [filtruInstructor, setFiltruInstructor] = useState('')
  const [statistici, setStatistici] = useState(null)

  useEffect(() => {
    if (seIncarca) return
    if (!utilizator || tip !== 'admin') { navigate('/'); return }
    incarcaDate()
  }, [utilizator, tip])

  const token = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

  const incarcaDate = async () => {
    try {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        axios.get(`${API}/admin/mesaje`, token()),
        axios.get(`${API}/admin/utilizatori`, token()),
        axios.get(`${API}/admin/ateliere`, token()),
        axios.get(`${API}/admin/categorii`, token()),
        axios.get(`${API}/admin/statistici`, token()),
      ])
      setMesaje(r1.data)
      setUtilizatori(r2.data.sort((a, b) => new Date(b.datacrearii) - new Date(a.datacrearii)))
      setAteliere(r3.data.sort((a, b) => new Date(a.data) - new Date(b.data)))
      setCategorii(r4.data)
      setStatistici(r5.data)
    } catch { navigate('/') }
  }

  const schimbaTab = (t) => { setTab(t); window.location.hash = t }

  const notif = (ok, text) => {
    ok ? setNotificare(text) : setEroare(text)
    setTimeout(() => { setNotificare(''); setEroare('') }, 3000)
  }

  const confirma = (text, onConfirm) => setModal({ text, onConfirm })

  const marcheazaCitit = async (id) => {
    await axios.patch(`${API}/admin/mesaje/${id}/citit`, {}, token())
    setMesaje(prev => prev.map(m => m.idmesaj === id ? { ...m, citit: true } : m))
    window.dispatchEvent(new Event('mesaj-citit'))
  }

  const stergeMesaj = (id) => confirma('Esti sigur ca vrei sa stergi acest mesaj?', async () => {
    setModal(null)
    try {
      await axios.delete(`${API}/admin/mesaje/${id}`, token())
      setMesaje(prev => prev.filter(m => m.idmesaj !== id))
      window.dispatchEvent(new Event('mesaj-citit'))
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  })

  const stergeUtilizator = (id) => confirma('Esti sigur ca vrei sa stergi acest utilizator? Actiunea este ireversibila.', async () => {
    setModal(null)
    try {
      await axios.delete(`${API}/admin/utilizatori/${id}`, token())
      setUtilizatori(prev => prev.filter(u => u.idutilizator !== id))
      notif(true, 'Utilizator sters.')
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  })

  const stergeAtelier = (id) => confirma('Esti sigur ca vrei sa stergi acest atelier?', async () => {
    setModal(null)
    try {
      await axios.delete(`${API}/admin/ateliere/${id}`, token())
      setAteliere(prev => prev.filter(a => a.idatelier !== id))
      notif(true, 'Atelier sters.')
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  })

  const adaugaCategorie = async (e) => {
    e.preventDefault()
    if (!nouaCategorie.trim()) { notif(false, 'Introdu denumirea categoriei.'); return }
    try {
      await axios.post(`${API}/admin/categorii`, { denumire: nouaCategorie }, token())
      setNouaCategorie('')
      const r = await axios.get(`${API}/admin/categorii`, token())
      setCategorii(r.data)
      notif(true, 'Categorie adaugata.')
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  }

  const stergeCategorie = (id) => confirma('Esti sigur ca vrei sa stergi aceasta categorie?', async () => {
    setModal(null)
    try {
      await axios.delete(`${API}/admin/categorii/${id}`, token())
      setCategorii(prev => prev.filter(c => c.idcategorie !== id))
      notif(true, 'Categorie stearsa.')
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  })

  const adaugaTema = async (e) => {
    e.preventDefault()
    if (!nouaTema.denumire.trim() || !nouaTema.idcategorie) { notif(false, 'Completeaza denumirea temei si alege categoria.'); return }
    try {
      await axios.post(`${API}/admin/teme`, { denumire: nouaTema.denumire, idcategorie: parseInt(nouaTema.idcategorie) }, token())
      setNouaTema({ denumire: '', idcategorie: '' })
      const r = await axios.get(`${API}/admin/categorii`, token())
      setCategorii(r.data)
      notif(true, 'Tema adaugata.')
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  }

  const stergeTema = (id) => confirma('Esti sigur ca vrei sa stergi aceasta tema?', async () => {
    setModal(null)
    try {
      await axios.delete(`${API}/admin/teme/${id}`, token())
      const r = await axios.get(`${API}/admin/categorii`, token())
      setCategorii(r.data)
      notif(true, 'Tema stearsa.')
    } catch (e) { notif(false, extrageEroare(e, 'Eroare.')) }
  })

  const necitite = mesaje.filter(m => m.citit === false).length

  return (
    <>
      <div className="container py-5">
        <h2 className="section-heading-lg mb-1">Panou administrare</h2>
        <p className="section-text mb-4">Gestioneaza categoriile, utilizatorii, atelierele si mesajele platformei.</p>

        {notificare && <div className="alert alert-success py-2 mb-3">{notificare}</div>}
        {eroare && <div className="alert alert-danger py-2 mb-3">{eroare}</div>}

        <ul className="nav nav-tabs mb-4">
          {[
            { key: 'categorii', label: 'Categorii', badge: null },
            { key: 'mesaje', label: 'Mesaje', badge: necitite > 0 ? necitite : null, badgeColor: 'bg-danger' },
            { key: 'utilizatori', label: 'Utilizatori', badge: utilizatori.length, badgeColor: 'bg-secondary' },
            { key: 'ateliere', label: 'Ateliere', badge: ateliere.length, badgeColor: 'bg-secondary' },
            { key: 'statistici', label: 'Statistici', badge: null },
          ].map(t => (
            <li key={t.key} className="nav-item">
              <button className={`nav-link ${tab === t.key ? 'active' : ''}`} onClick={() => schimbaTab(t.key)}>
                {t.label}
                {t.badge != null && <span className={`badge ${t.badgeColor} ms-1`}>{t.badge}</span>}
              </button>
            </li>
          ))}
        </ul>

        {tab === 'categorii' && (
          <div className="row g-4">
            <div className="col-md-5">
              <div className="card p-4 mb-4">
                <h5 className="section-heading-sm mb-3">Adauga categorie</h5>
                <form onSubmit={adaugaCategorie} className="d-flex gap-2" noValidate>
                  <input className="form-control" placeholder="Denumire categorie" value={nouaCategorie}
                    onChange={e => setNouaCategorie(e.target.value)} maxLength={200} required />
                  <button className="btn btn-primary" type="submit">Adauga</button>
                </form>
              </div>
              <div className="card p-4">
                <h5 className="section-heading-sm mb-3">Adauga tema</h5>
                <form onSubmit={adaugaTema} noValidate>
                  <select className="form-select mb-2" value={nouaTema.idcategorie}
                    onChange={e => setNouaTema({ ...nouaTema, idcategorie: e.target.value })} required>
                    <option value="">Selecteaza categoria</option>
                    {categorii.map(c => <option key={c.idcategorie} value={c.idcategorie}>{c.denumire}</option>)}
                  </select>
                  <div className="d-flex gap-2">
                    <input className="form-control" placeholder="Denumire tema" value={nouaTema.denumire}
                      onChange={e => setNouaTema({ ...nouaTema, denumire: e.target.value })} maxLength={200} required />
                    <button className="btn btn-primary" type="submit">Adauga</button>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-md-7">
              {categorii.length === 0 ? <p className="section-text">Nu exista categorii.</p> : categorii.map(cat => (
                <div key={cat.idcategorie} className="card mb-3 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>{cat.denumire}</strong>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => stergeCategorie(cat.idcategorie)}>Sterge</button>
                  </div>
                  {cat.teme.length === 0 ? (
                    <span className="text-muted" style={{fontSize:'0.85rem'}}>Nicio tema</span>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {cat.teme.map(t => (
                        <span key={t.idtema} className="tag d-flex align-items-center gap-1" style={{fontSize:'0.8rem'}}>
                          {t.denumire}
                          <button onClick={() => stergeTema(t.idtema)}
                            style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px',lineHeight:1,color:'inherit'}}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'mesaje' && (
          <div>
            {mesaje.length === 0 ? <p className="section-text">Nu exista mesaje.</p> : mesaje.map(m => (
              <div key={m.idmesaj} className={`card mb-3 p-3 ${!m.citit ? 'border-primary' : ''}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{m.nume}</strong>
                    {!m.citit && <span className="badge bg-primary ms-2">Nou</span>}
                    <div className="text-muted" style={{fontSize:'0.85rem'}}>{m.email} · {new Date(m.dataora).toLocaleString('ro-RO')}</div>
                    <div className="mt-1"><strong>{m.subiect}</strong></div>
                    <div className="mt-1" style={{fontSize:'0.9rem'}}>{m.mesaj}</div>
                  </div>
                  <div className="d-flex gap-2 ms-3" style={{ flexShrink: 0 }}>
                    {!m.citit && <button className="btn btn-sm btn-outline-primary" onClick={() => marcheazaCitit(m.idmesaj)}>Marcat citit</button>}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => stergeMesaj(m.idmesaj)}>Sterge</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'utilizatori' && (
          <div>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Cauta dupa nume sau email..."
              value={searchUtilizatori}
              onChange={e => setSearchUtilizatori(e.target.value)}
              style={{ maxWidth: '360px' }}
            />
            <div className="table-responsive">
              <table className="table table-hover">
                <thead><tr><th>Nume</th><th>Email</th><th>Tip</th><th>Inregistrat</th><th></th></tr></thead>
                <tbody>
                  {utilizatori
                    .filter(u => {
                      const q = searchUtilizatori.toLowerCase()
                      return (
                        `${u.prenume} ${u.nume}`.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q)
                      )
                    })
                    .map(u => (
                      <tr key={u.idutilizator}>
                        <td>{u.prenume} {u.nume}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.tip === 'admin' ? 'bg-danger' : u.tip === 'instructor' ? 'bg-warning text-dark' : 'bg-success'}`}>{u.tip}</span></td>
                        <td>{new Date(u.datacrearii).toLocaleDateString('ro-RO')}</td>
                        <td>{u.tip !== 'admin' && <button className="btn btn-sm btn-outline-danger" onClick={() => stergeUtilizator(u.idutilizator)}>Sterge</button>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'ateliere' && (() => {
          const instructoriUnici = [...new Set(ateliere.map(a => a.instructor).filter(Boolean))]
          const ateliereFiltrate = ateliere.filter(a =>
            !filtruInstructor || a.instructor === filtruInstructor
          )
          return (
            <div>
              <div className="d-flex gap-2 mb-3 align-items-center">
                <select
                  className="form-select"
                  style={{ maxWidth: '260px' }}
                  value={filtruInstructor}
                  onChange={e => setFiltruInstructor(e.target.value)}
                >
                  <option value="">Toti instructorii</option>
                  {instructoriUnici.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
                {filtruInstructor && (
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setFiltruInstructor('')}>
                    Reseteaza
                  </button>
                )}
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {ateliereFiltrate.length} atelier{ateliereFiltrate.length !== 1 ? 'e' : ''}
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead><tr><th>Denumire</th><th>Instructor</th><th>Data</th><th>Pret</th><th>Participanti</th><th></th></tr></thead>
                  <tbody>
                    {ateliereFiltrate.map(a => (
                      <tr key={a.idatelier}>
                        <td>{a.denumire}</td>
                        <td>{a.instructor}</td>
                        <td>{new Date(a.data).toLocaleDateString('ro-RO')}</td>
                        <td>{a.pret} RON</td>
                        <td>{a.nrparticipanti}</td>
                        <td><button className="btn btn-sm btn-outline-danger" onClick={() => stergeAtelier(a.idatelier)}>Sterge</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}
      </div>

        {tab === 'statistici' && statistici && (
          <div style={{ padding: '0 8px' }}>
            <div className="row g-3 mb-5 justify-content-center">
              {[
                { label: 'Utilizatori', value: statistici.general.total_utilizatori, color: '#6c63ff' },
                { label: 'Ateliere', value: statistici.general.total_ateliere, color: 'var(--roz)' },
                { label: 'Inscrieri active', value: statistici.general.total_inscrieri, color: '#26a69a' },
                { label: 'Au participat', value: statistici.general.total_participari, color: '#ef6c00' },
                { label: 'Recenzii', value: statistici.general.total_recenzii, color: '#fbc02d' },
              ].map(s => (
                <div key={s.label} className="col-6 col-sm-4 col-md-2">
                  <div className="card h-100 text-center" style={{ padding: '24px 12px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secundar)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4" style={{ marginLeft: 0, marginRight: 0 }}>
              <div className="col-md-6">
                <div className="card p-4">
                  <h5 className="section-heading-sm mb-3">Instructori</h5>
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Instructor</th>
                        <th className="text-center">Ateliere totale</th>
                        <th className="text-center">Rating</th>
                        <th className="text-center">Recenzii</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...statistici.instructori].sort((a, b) => b.nr_ateliere - a.nr_ateliere).map((inst, i) => (
                        <tr key={i}>
                          <td>{inst.nume}</td>
                          <td className="text-center">{inst.nr_ateliere}</td>
                          <td className="text-center">
                            {inst.rating_mediu > 0
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-principal)' }}>
                                  <img src={starIcon} alt="star" style={{ width: '13px', height: '13px' }} />
                                  {inst.rating_mediu.toFixed(1)}
                                </span>
                              : <span style={{ color: 'var(--text-secundar)' }}>—</span>}
                          </td>
                          <td className="text-center">{inst.nr_recenzii}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card p-4">
                  <h5 className="section-heading-sm mb-3">Top 5 ateliere după rating</h5>
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Atelier</th>
                        <th>Instructor</th>
                        <th className="text-center">Rating</th>
                        <th className="text-center">Recenzii</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistici.top_ateliere_rating.map((a, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: '0.88rem' }}>{a.denumire}</td>
                          <td style={{ fontSize: '0.88rem' }}>{a.instructor}</td>
                          <td className="text-center">
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-principal)' }}>
                              <img src={starIcon} alt="star" style={{ width: '13px', height: '13px' }} />
                              {a.rating_mediu.toFixed(1)}
                            </span>
                          </td>
                          <td className="text-center">{a.nr_recenzii}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      {modal && <ModalConfirmare text={modal.text} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
    </>
  )
}
