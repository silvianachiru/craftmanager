import { useState, useEffect } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import calendarIcon from '../assets/calendar.png'
import clockIcon from '../assets/clock.png'
import tagIcon from '../assets/tag.png'
import participantIcon from '../assets/participant.png'
import starIcon from '../assets/star.png'
import documentsIcon from '../assets/documents.png'
import checkMarkIcon from '../assets/check-mark.png'
import warningIcon from '../assets/warning.png'
import ideaIcon from '../assets/idea.png'
import starsIcon from '../assets/stars.png'
import trashBinIcon from '../assets/trash-bin.png'

const azi = new Date().toISOString().split('T')[0]

const formGol = {
  denumire: '', descriere: '', nivel: 'Incepator', pret: '', varstamin: '', varstamax: '',
  durata: '', data: '', ora: '', idtema: '',
  locatie_nume: '', locatie_adresa: '', locatie_oras: '', locatie_capacitate: ''
}

// DropdownTeme definit in afara componentei
function DropdownTeme({ value, onChange, temeGrupate }) {
  return (
    <select name="idtema" className="form-select" value={value} onChange={onChange} required>
      <option value="">Selecteaza tema</option>
      {Object.entries(temeGrupate).map(([categorie, temeGrup]) => (
        <optgroup key={categorie} label={categorie}>
          {temeGrup.map(t => <option key={t.idtema} value={t.idtema}>{t.denumire}</option>)}
        </optgroup>
      ))}
    </select>
  )
}

export default function Dashboard() {
  const { utilizator, tip, seIncarca } = useAuth()
  const navigate = useNavigate()

  const [ateliere, setAteliere] = useState([])
  const [teme, setTeme] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ ...formGol, idlocatie: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')
  const [form, setForm] = useState(formGol)
  const [generare, setGenerare] = useState({ loading: false, eroare: '', rezultat: null })
  const [participanti, setParticipanti] = useState({})
  const [showParticipanti, setShowParticipanti] = useState(null)
  const [recenzii, setRecenzii] = useState({})
  const [showRecenzii, setShowRecenzii] = useState(null)
  const [materiale, setMateriale] = useState({})
  const [showMateriale, setShowMateriale] = useState(null)
  const [toateMaterialele, setToateMaterialele] = useState([])
  const [nouMaterial, setNouMaterial] = useState({ idmaterial: '', cantitate: 1 })
  const [nouMaterialNou, setNouMaterialNou] = useState({ denumire: '', pret: '' })
  const [stergeAsociereModal, setStergeAsociereModal] = useState(null)
  const [salvatMateriale, setSalvatMateriale] = useState({})
  const [rezumate, setRezumate] = useState({})
  const [tabActiv, setTabActiv] = useState('viitoare')
  const [loadingRezumat, setLoadingRezumat] = useState({})

  useEffect(() => {
    if (seIncarca) return
    if (!utilizator || tip !== 'instructor') return
    incarcaAteliere()
    api.get('/teme/').then(res => setTeme(res.data)).catch(() => {})
  }, [utilizator, tip, seIncarca])

  const incarcaAteliere = async () => {
    setLoading(true)
    try {
      const res = await api.get('/ateliere/toate-ale-mele/')
      setAteliere(res.data.sort((a, b) => new Date(a.data) - new Date(b.data)))
      const salvat = {}
      res.data.forEach(a => { if (a.materiale_salvate) salvat[a.idatelier] = true })
      setSalvatMateriale(salvat)
    } catch {
      const res = await api.get('/ateliere/')
      setAteliere(res.data.sort((a, b) => new Date(a.data) - new Date(b.data)))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })

  const handleGenereaza = async () => {
    if (!form.denumire || !form.idtema || !form.varstamin || !form.varstamax || !form.durata) {
      setGenerare({ loading: false, eroare: 'Completeaza denumirea, tema, varsta si durata inainte de a genera.', rezultat: null })
      return
    }
    const temaSelectata = teme.find(t => t.idtema === parseInt(form.idtema))
    setGenerare({ loading: true, eroare: '', rezultat: null })
    try {
      const res = await api.post('/generate/descriere', {
        denumire: form.denumire,
        categorie: temaSelectata?.categorie || '',
        tema: temaSelectata?.denumire || '',
        nivel: form.nivel,
        durata: parseInt(form.durata),
        varstamin: parseInt(form.varstamin),
        varstamax: parseInt(form.varstamax),
      })
      setGenerare({ loading: false, eroare: '', rezultat: res.data })
    } catch (err) {
      setGenerare({ loading: false, eroare: err.response?.data?.detail || 'Eroare la generare.', rezultat: null })
    }
  }

  const handleAcceptaDescriere = () => {
    if (generare.rezultat) {
      const { description, objectives, targetText } = generare.rezultat
      const textComplet = `${description}\n\nObiective:\n${objectives.map(o => `• ${o}`).join('\n')}\n\nPublic țintă: ${targetText}`
      setForm({ ...form, descriere: textComplet.slice(0, 1000) })
      setGenerare({ loading: false, eroare: '', rezultat: null })
    }
  }

  const temeGrupate = teme.reduce((acc, t) => {
    if (!acc[t.categorie]) acc[t.categorie] = []
    acc[t.categorie].push(t)
    return acc
  }, {})

  const validareaza = (f) => {
    if (parseFloat(f.pret) < 0) return 'Pretul nu poate fi negativ'
    if (parseInt(f.varstamin) < 1 || parseInt(f.varstamin) > 120) return 'Varsta minima invalida (1-120)'
    if (parseInt(f.varstamax) < 1 || parseInt(f.varstamax) > 120) return 'Varsta maxima invalida (1-120)'
    if (parseInt(f.varstamax) < parseInt(f.varstamin)) return 'Varsta maxima trebuie sa fie mai mare decat minima'
    if (parseInt(f.durata) < 15 || parseInt(f.durata) > 1440) return 'Durata invalida (15-1440 min)'
    if (f.data < azi) return 'Data nu poate fi in trecut'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEroare(''); setMesaj('')
    const err = validareaza(form)
    if (err) { setEroare(err); return }
    try {
      const locatieRes = await api.post('/locatii/', {
        nume: form.locatie_nume, adresa: form.locatie_adresa,
        oras: form.locatie_oras, capacitate: parseInt(form.locatie_capacitate)
      })
      await api.post('/ateliere/', {
        denumire: form.denumire, descriere: form.descriere, nivel: form.nivel,
        pret: parseFloat(form.pret), varstamin: parseInt(form.varstamin),
        varstamax: parseInt(form.varstamax), durata: parseInt(form.durata),
        data: form.data, ora: form.ora + ':00',
        idtema: parseInt(form.idtema), idlocatie: locatieRes.data.idlocatie
      })
      setMesaj('Atelier creat cu succes!')
      setShowForm(false)
      setForm(formGol)
      incarcaAteliere()
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la creare')
    }
  }

  const handleReposteaza = async (atelier) => {
    let locatie = { nume: '', adresa: '', oras: '', capacitate: '' }
    try { const res = await api.get(`/locatii/${atelier.idlocatie}`); locatie = res.data } catch {}
    setForm({
      denumire: atelier.denumire, descriere: atelier.descriere || '',
      pret: atelier.pret, varstamin: atelier.varstamin, varstamax: atelier.varstamax,
      durata: atelier.durata, data: '', ora: atelier.ora?.slice(0, 5) || '',
      idtema: atelier.idtema, locatie_nume: locatie.nume,
      locatie_adresa: locatie.adresa, locatie_oras: locatie.oras, locatie_capacitate: locatie.capacitate
    })
    setShowForm(true); setEditId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditOpen = async (atelier) => {
    setEditId(atelier.idatelier); setMesaj(''); setEroare('')
    let locatie = { nume: '', adresa: '', oras: '', capacitate: '' }
    try { const res = await api.get(`/locatii/${atelier.idlocatie}`); locatie = res.data } catch {}
    setEditForm({
      denumire: atelier.denumire, descriere: atelier.descriere || '', nivel: atelier.nivel || 'Incepator',
      pret: atelier.pret, varstamin: atelier.varstamin, varstamax: atelier.varstamax,
      durata: atelier.durata, data: atelier.data, ora: atelier.ora?.slice(0, 5),
      idtema: atelier.idtema, idlocatie: atelier.idlocatie,
      locatie_nume: locatie.nume, locatie_adresa: locatie.adresa,
      locatie_oras: locatie.oras, locatie_capacitate: locatie.capacitate
    })
  }

  const handleEditSubmit = async (e, atelierOriginal) => {
    e.preventDefault()
    setEroare(''); setMesaj('')
    const err = validareaza(editForm)
    if (err) { setEroare(err); return }
    try {
      let idlocatie = editForm.idlocatie
      if (editForm.locatie_nume && editForm.locatie_adresa && editForm.locatie_oras && editForm.locatie_capacitate) {
        const locatieRes = await api.post('/locatii/', {
          nume: editForm.locatie_nume, adresa: editForm.locatie_adresa,
          oras: editForm.locatie_oras, capacitate: parseInt(editForm.locatie_capacitate)
        })
        idlocatie = locatieRes.data.idlocatie
      }
      await api.put(`/ateliere/${atelierOriginal.idatelier}`, {
        denumire: editForm.denumire, descriere: editForm.descriere, nivel: editForm.nivel || 'Incepator',
        pret: parseFloat(editForm.pret), varstamin: parseInt(editForm.varstamin),
        varstamax: parseInt(editForm.varstamax), durata: parseInt(editForm.durata),
        data: editForm.data, ora: editForm.ora.length === 5 ? editForm.ora + ':00' : editForm.ora,
        idtema: parseInt(editForm.idtema), idlocatie: parseInt(idlocatie)
      })
      setMesaj('Atelier actualizat cu succes!'); setEditId(null); incarcaAteliere()
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la editare')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/ateliere/${deleteId}`)
      setAteliere(ateliere.filter(a => a.idatelier !== deleteId))
      setDeleteId(null); setMesaj('Atelier sters cu succes!')
    } catch { setEroare('Eroare la stergere'); setDeleteId(null) }
  }

  const handleVeziParticipanti = async (idatelier) => {
    if (showParticipanti === idatelier) { setShowParticipanti(null); return }
    try {
      const res = await api.get(`/inregistrari/atelier/${idatelier}`)
      setParticipanti(prev => ({ ...prev, [idatelier]: res.data }))
      setShowParticipanti(idatelier)
    } catch { setEroare('Eroare la incarcarea participantilor') }
  }

  const handleVeziRecenzii = async (idatelier) => {
    if (showRecenzii === idatelier) { setShowRecenzii(null); return }
    handleVeziRezumat(idatelier)
    try {
      const res = await api.get(`/recenzii/atelier/${idatelier}`)
      setRecenzii(prev => ({ ...prev, [idatelier]: res.data }))
      setShowRecenzii(idatelier)
    } catch { setEroare('Eroare la incarcarea evaluarilor') }
  }

  const handleVeziRezumat = async (idatelier) => {
    if (rezumate[idatelier]) return  // deja incarcat
    try {
      const res = await api.get(`/recenzii/atelier/${idatelier}/rezumat`)
      if (res.data) {
        setRezumate(prev => ({ ...prev, [idatelier]: res.data }))
      }
    } catch {
      // nu exista rezumat salvat inca
    }
  }

  const handleGenereazaRezumat = async (idatelier) => {
    setLoadingRezumat(prev => ({ ...prev, [idatelier]: true }))
    try {
      const res = await api.post(`/recenzii/atelier/${idatelier}/rezumat`)
      setRezumate(prev => ({ ...prev, [idatelier]: res.data }))
    } catch (err) {
      const msg = err.response?.data?.detail || 'Eroare la generare rezumat.'
      alert(msg)
    } finally {
      setLoadingRezumat(prev => ({ ...prev, [idatelier]: false }))
    }
  }


  const handleVeziMateriale = async (idatelier) => {
    if (showMateriale === idatelier) { setShowMateriale(null); return }
    try {
      const [r1, r2] = await Promise.all([
        api.get(`/materiale/atelier/${idatelier}`),
        api.get('/materiale'),
      ])
      setMateriale(prev => ({ ...prev, [idatelier]: r1.data }))
      setToateMaterialele(r2.data)
      setShowMateriale(idatelier)
    } catch { setEroare('Eroare la incarcarea materialelor') }
  }

  const handleAsociazaMaterial = async (e, idatelier) => {
    e.preventDefault()
    try {
      await api.post(`/materiale/atelier/${idatelier}`, { idmaterial: parseInt(nouMaterial.idmaterial), cantitate: parseInt(nouMaterial.cantitate) })
      const r = await api.get(`/materiale/atelier/${idatelier}`)
      setMateriale(prev => ({ ...prev, [idatelier]: r.data }))
      setNouMaterial({ idmaterial: '', cantitate: 1 })
    } catch (err) { setEroare(err.response?.data?.detail || 'Eroare'); setTimeout(() => setEroare(''), 3000) }
  }

  const handleStergeAsociere = async () => {
    const { idatelier, idutilizare } = stergeAsociereModal
    try {
      await api.delete(`/materiale/atelier/${idatelier}/${idutilizare}`)
      setMateriale(prev => ({ ...prev, [idatelier]: prev[idatelier].filter(m => m.idutilizare !== idutilizare) }))
      setStergeAsociereModal(null)
    } catch { setEroare('Eroare la stergere'); setTimeout(() => setEroare(''), 3000) }
  }

  const handleSalveazaMateriale = async (idatelier) => {
    try {
      await api.post(`/materiale/atelier/${idatelier}/salveaza`)
      setSalvatMateriale(prev => ({ ...prev, [idatelier]: true }))
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la salvare.')
      setTimeout(() => setEroare(''), 4000)
    }
  }

  const handleEditeazaMateriale = async (idatelier) => {
    try {
      await api.post(`/materiale/atelier/${idatelier}/editeaza`)
      setSalvatMateriale(prev => ({ ...prev, [idatelier]: false }))
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la editare.')
      setTimeout(() => setEroare(''), 4000)
    }
  }

  const handleAdaugaMaterialNou = async (e, idatelier) => {
    e.preventDefault()
    if (!nouMaterialNou.denumire || !nouMaterialNou.pret) return
    try {
      const r = await api.post('/materiale', { denumire: nouMaterialNou.denumire, pret: parseFloat(nouMaterialNou.pret) })
      await api.post(`/materiale/atelier/${idatelier}`, { idmaterial: r.data.idmaterial, cantitate: 1 })
      const [r1, r2] = await Promise.all([api.get(`/materiale/atelier/${idatelier}`), api.get('/materiale')])
      setMateriale(prev => ({ ...prev, [idatelier]: r1.data }))
      setToateMaterialele(r2.data)
      setNouMaterialNou({ denumire: '', pret: '' })
    } catch (err) { setEroare(err.response?.data?.detail || 'Eroare'); setTimeout(() => setEroare(''), 3000) }
  }

  const handleMarcareParticipare = async (idinregistrare, idatelier) => {
    try {
      await api.put(`/inregistrari/${idinregistrare}/participare`)
      setParticipanti(prev => ({
        ...prev,
        [idatelier]: prev[idatelier].map(p =>
          p.idinregistrare === idinregistrare ? { ...p, status: 'Participare' } : p
        )
      }))
      setMesaj('Participare marcata!'); setTimeout(() => setMesaj(''), 3000)
    } catch (err) {
      setEroare(err.response?.data?.detail || 'Eroare la marcare'); setTimeout(() => setEroare(''), 3000)
    }
  }

  if (utilizator === null && tip === null) return (
    <div className="container text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--roz)' }} />
    </div>
  )
  if (seIncarca) return
    if (!utilizator || tip !== 'instructor') return <Navigate to="/" replace />

  if (loading) return (
    <div className="container text-center py-5">
      <div className="spinner-border" style={{ color: 'var(--roz)' }} />
    </div>
  )

  const dataOraAtelier = a => new Date(`${a.data}T${a.ora?.slice(0, 8) || '00:00:00'}`)
  const ateliereViitoare = ateliere.filter(a => dataOraAtelier(a) >= new Date()).sort((a, b) => dataOraAtelier(a) - dataOraAtelier(b))
  const ateliereTrecute = ateliere.filter(a => dataOraAtelier(a) < new Date()).sort((a, b) => dataOraAtelier(b) - dataOraAtelier(a))

  return (
    <>
    <div style={{ minHeight: '100vh', background: 'var(--crem)' }}>

      {/* MODAL STERGERE */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(61,44,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card p-4" style={{ maxWidth: '420px', width: '90%', borderRadius: '20px' }}>
            <div className="text-center mb-3"><img src={trashBinIcon} alt="sterge" style={{ width: '48px', height: '48px' }} /></div>
            <h5 style={{ textAlign: 'center', marginBottom: '12px' }}>Stergi acest atelier?</h5>
            <p style={{ color: 'var(--text-secundar)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
              Actiunea este ireversibila.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button type="button" className="btn btn-outline-primary px-4" onClick={() => setDeleteId(null)}>Anuleaza</button>
              <button type="button" className="btn px-4" style={{ background: '#e890a6', color: 'white', border: 'none', borderRadius: '50px' }} onClick={handleDelete}>Da, sterge</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h1 style={{ color: 'var(--text-principal)', marginBottom: '4px' }}>Dashboard Instructor</h1>
            <p style={{ color: 'var(--text-secundar)', margin: 0 }}>Gestioneaza atelierele tale</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null) }}>
            {showForm ? 'Anuleaza' : '+ Atelier nou'}
          </button>
        </div>
      </div>

      <div className="container py-5">
        {mesaj && <div className="alert alert-success">{mesaj}</div>}
        {eroare && <div className="alert alert-danger">{eroare}</div>}

        {/* FORM CREARE */}
        {showForm && (
          <div className="card p-4 mb-5">
            <h4 style={{ marginBottom: '24px' }}>Atelier nou</h4>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-8 mb-3"><label className="form-label">Denumire</label><input name="denumire" className="form-control" value={form.denumire} onChange={handleChange} maxLength={200} required /></div>
                <div className="col-md-4 mb-3"><label className="form-label">Pret (RON)</label><input name="pret" type="number" min="0" className="form-control" value={form.pret} onChange={handleChange} required /></div>
              </div>
              <div className="mb-3">
                <label className="form-label">Descriere</label>
                <textarea name="descriere" className="form-control" rows={3} value={form.descriere} onChange={handleChange} maxLength={1000} />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleGenereaza} disabled={generare.loading}>
                    {generare.loading ? 'Se genereaza...' : <><img src={starsIcon} alt="" style={{ width: '14px', height: '14px', marginRight: '5px' }} />Genereaza descriere</>}
                  </button>
                  <span className="form-text mb-0">{form.descriere.length}/1000</span>
                </div>
                {generare.eroare && <div className="alert alert-danger py-2 mt-2 mb-0" style={{fontSize:'0.85rem'}}>{generare.eroare}</div>}
                {generare.rezultat && (
                  <div className="card mt-2 p-3" style={{background:'var(--roz-deschis)', border:'1px solid var(--roz)'}}>
                    <div className="fw-500 mb-2" style={{fontSize:'0.85rem', color:'var(--roz-hover)'}}>Descriere generata de AI:</div>
                    <p style={{fontSize:'0.9rem', margin:0, marginBottom:'8px'}}>{generare.rezultat.description}</p>
                    <div className="fw-500 mb-1" style={{fontSize:'0.85rem', color:'var(--roz-hover)'}}>Obiective:</div>
                    <ul style={{fontSize:'0.9rem', margin:0, marginBottom:'8px', paddingLeft:'18px'}}>
                      {generare.rezultat.objectives.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                    <div className="fw-500 mb-1" style={{fontSize:'0.85rem', color:'var(--roz-hover)'}}>Public tinta:</div>
                    <p style={{fontSize:'0.9rem', margin:0, marginBottom:'12px'}}>{generare.rezultat.targetText}</p>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleAcceptaDescriere}>
                      Foloseste aceasta descriere
                    </button>
                  </div>
                )}
              </div>
              <div className="row">
                <div className="col-md-3 mb-3"><label className="form-label">Varsta min</label><input name="varstamin" type="number" min="1" max="120" className="form-control" value={form.varstamin} onChange={handleChange} required /></div>
                <div className="col-md-3 mb-3"><label className="form-label">Varsta max</label><input name="varstamax" type="number" min={form.varstamin || '1'} max="120" className="form-control" value={form.varstamax} onChange={handleChange} required /></div>
                <div className="col-md-3 mb-3"><label className="form-label">Durata (min)</label><input name="durata" type="number" min="15" max="1440" className="form-control" value={form.durata} onChange={handleChange} required /></div>
                <div className="col-md-3 mb-3"><label className="form-label">Nivel</label><select name="nivel" className="form-select" value={form.nivel} onChange={handleChange} required><option value="Incepator">Incepator</option><option value="Mediu">Mediu</option><option value="Avansat">Avansat</option></select></div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3"><label className="form-label">Tema</label><DropdownTeme value={form.idtema} onChange={handleChange} temeGrupate={temeGrupate} /></div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3"><label className="form-label">Data</label><input name="data" type="date" min={azi} className="form-control" value={form.data} onChange={handleChange} required /></div>
                <div className="col-md-4 mb-3"><label className="form-label">Ora</label><input name="ora" type="time" className="form-control" value={form.ora} onChange={handleChange} required /></div>
                <div className="col-md-4 mb-3"><label className="form-label">Capacitate</label><input name="locatie_capacitate" type="number" min="1" max="5000" className="form-control" value={form.locatie_capacitate} onChange={handleChange} required /></div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3"><label className="form-label">Nume locatie</label><input name="locatie_nume" className="form-control" value={form.locatie_nume} onChange={handleChange} maxLength={200} required /></div>
                <div className="col-md-4 mb-3"><label className="form-label">Adresa</label><input name="locatie_adresa" className="form-control" value={form.locatie_adresa} onChange={handleChange} maxLength={300} required /></div>
                <div className="col-md-4 mb-3"><label className="form-label">Oras</label><input name="locatie_oras" className="form-control" value={form.locatie_oras} onChange={handleChange} maxLength={200} required /></div>
              </div>
              <button type="submit" className="btn btn-primary px-5">Creeaza atelier</button>
            </form>
          </div>
        )}

        {/* TABS */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '32px', display: 'flex', gap: '4px' }}>
          {[
            { key: 'viitoare', label: 'Ateliere viitoare', count: ateliereViitoare.length },
            { key: 'incheiate', label: 'Ateliere incheiate', count: ateliereTrecute.length },
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

        {/* ATELIERE VIITOARE */}
        {tabActiv === 'viitoare' && (ateliereViitoare.length === 0 ? (
          <div className="text-center py-4 mb-5"><p style={{ color: 'var(--text-secundar)' }}>Nu ai ateliere viitoare.</p></div>
        ) : (
          <div className="d-flex flex-column gap-4 mb-5">
            {ateliereViitoare.map(atelier => (
              <div key={atelier.idatelier} className="card p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="grow">
                    <h5 style={{ marginBottom: '8px' }}>{atelier.denumire}</h5>
                    <p className="small mb-3" style={{ color: 'var(--text-secundar)' }}>{atelier.descriere?.slice(0, 100)}...</p>
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      <span className="badge-pret d-flex align-items-center gap-1">
                        <img src={tagIcon} alt="pret" className="icon-badge" style={{ filter: 'invert(30%) sepia(40%) saturate(300%) hue-rotate(120deg)' }} />
                        {atelier.pret} RON
                      </span>
                      <span className="badge-categorie d-flex align-items-center gap-1">
                        <img src={clockIcon} alt="durata" className="icon-badge" style={{ filter: 'invert(30%) sepia(20%) saturate(300%) hue-rotate(240deg)' }} />
                        {atelier.durata} min
                      </span>
                      <span className="badge-categorie d-flex align-items-center gap-1" style={{ background: '#f0f4ff', color: '#3b5bdb', border: '1px solid #c5d0fa' }}>
                        {atelier.nivel || 'Incepator'}
                      </span>
                    </div>
                    <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                      <img src={calendarIcon} alt="data" className="icon-sm" />
                      {new Date(atelier.data).toLocaleDateString('ro-RO')} la {atelier.ora?.slice(0, 5)}
                    </small>
                  </div>
                  <div className="d-flex gap-2 ms-3 flex-wrap justify-content-end">
                    <Link to={`/ateliere/${atelier.idatelier}`} className="btn btn-outline-primary btn-sm">Vezi</Link>
                    <button type="button" className="btn btn-sm" style={{ border: '1px solid var(--roz)', color: 'var(--roz)', borderRadius: '50px' }}
                      onClick={() => editId === atelier.idatelier ? setEditId(null) : handleEditOpen(atelier)}>
                      {editId === atelier.idatelier ? 'Anuleaza' : 'Editeaza'}
                    </button>
                    <button type="button" className="btn btn-sm" style={{ border: '1px solid #e890a6', color: '#c0566e', borderRadius: '50px' }}
                      onClick={() => setDeleteId(atelier.idatelier)}>Sterge</button>
                  </div>
                </div>

                {/* FORM EDITARE */}
                {editId === atelier.idatelier && (
                  <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    <h5 style={{ marginBottom: '20px' }}>Editeaza atelier</h5>
                    <form onSubmit={(e) => handleEditSubmit(e, atelier)}>
                      <div className="row">
                        <div className="col-md-8 mb-3"><label className="form-label">Denumire</label><input name="denumire" className="form-control" value={editForm.denumire} onChange={handleEditChange} maxLength={200} required /></div>
                        <div className="col-md-4 mb-3"><label className="form-label">Pret (RON)</label><input name="pret" type="number" min="0" className="form-control" value={editForm.pret} onChange={handleEditChange} required /></div>
                      </div>
                      <div className="mb-3"><label className="form-label">Descriere</label><textarea name="descriere" className="form-control" rows={3} value={editForm.descriere} onChange={handleEditChange} maxLength={1000} /><div className="form-text text-end">{editForm.descriere.length}/1000</div></div>
                      <div className="row">
                        <div className="col-md-3 mb-3"><label className="form-label">Varsta min</label><input name="varstamin" type="number" min="1" max="120" className="form-control" value={editForm.varstamin} onChange={handleEditChange} required /></div>
                        <div className="col-md-3 mb-3"><label className="form-label">Varsta max</label><input name="varstamax" type="number" min={editForm.varstamin || '1'} max="120" className="form-control" value={editForm.varstamax} onChange={handleEditChange} required /></div>
                        <div className="col-md-3 mb-3"><label className="form-label">Durata (min)</label><input name="durata" type="number" min="15" max="1440" className="form-control" value={editForm.durata} onChange={handleEditChange} required /></div>
                        <div className="col-md-3 mb-3"><label className="form-label">Nivel</label><select name="nivel" className="form-select" value={editForm.nivel || 'Incepator'} onChange={handleEditChange} required><option value="Incepator">Incepaator</option><option value="Mediu">Mediu</option><option value="Avansat">Avansat</option></select></div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3"><label className="form-label">Tema</label><DropdownTeme value={editForm.idtema} onChange={handleEditChange} temeGrupate={temeGrupate} /></div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3"><label className="form-label">Data</label><input name="data" type="date" min={azi} className="form-control" value={editForm.data} onChange={handleEditChange} required /></div>
                        <div className="col-md-6 mb-3"><label className="form-label">Ora</label><input name="ora" type="time" className="form-control" value={editForm.ora} onChange={handleEditChange} required /></div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3"><label className="form-label">Capacitate</label><input name="locatie_capacitate" type="number" min="1" max="5000" className="form-control" value={editForm.locatie_capacitate} onChange={handleEditChange} /></div>
                        <div className="col-md-4 mb-3"><label className="form-label">Nume locatie</label><input name="locatie_nume" className="form-control" value={editForm.locatie_nume} onChange={handleEditChange} maxLength={200} /></div>
                        <div className="col-md-4 mb-3"><label className="form-label">Adresa</label><input name="locatie_adresa" className="form-control" value={editForm.locatie_adresa} onChange={handleEditChange} maxLength={300} /></div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 mb-3"><label className="form-label">Oras</label><input name="locatie_oras" className="form-control" value={editForm.locatie_oras} onChange={handleEditChange} maxLength={200} /></div>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary px-4">Salveaza modificarile</button>
                        <button type="button" className="btn btn-outline-primary px-4" onClick={() => setEditId(null)}>Anuleaza</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* ATELIERE INCHEIATE */}
        {tabActiv === 'incheiate' && (ateliereTrecute.length === 0 ? (
          <div className="text-center py-4"><p style={{ color: 'var(--text-secundar)' }}>Nu ai ateliere incheiate inca.</p></div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {ateliereTrecute.map(atelier => (
                <div key={atelier.idatelier} className="card p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="grow">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 style={{ marginBottom: 0 }}>{atelier.denumire}</h5>
                        <span style={{ background: '#f5f5f5', color: '#888', borderRadius: '50px', padding: '2px 10px', fontSize: '0.75rem' }}>Incheiat</span>
                        <span style={{ background: '#f0f4ff', color: '#3b5bdb', border: '1px solid #c5d0fa', borderRadius: '50px', padding: '2px 10px', fontSize: '0.75rem' }}>{atelier.nivel || 'Incepator'}</span>
                      </div>
                      <p className="small mb-3" style={{ color: 'var(--text-secundar)' }}>{atelier.descriere?.slice(0, 100)}...</p>
                      <small className="d-flex align-items-center" style={{ color: 'var(--text-secundar)' }}>
                        <img src={calendarIcon} alt="data" className="icon-sm" />
                        {new Date(atelier.data).toLocaleDateString('ro-RO')} la {atelier.ora?.slice(0, 5)}
                      </small>
                    </div>
                    <div className="d-flex gap-2 ms-3 flex-wrap justify-content-end">
                      <Link to={`/ateliere/${atelier.idatelier}`} className="btn btn-outline-primary btn-sm">Vezi</Link>
                      <button type="button" className="btn btn-sm" style={{ border: '1px solid var(--roz)', color: 'var(--roz)', borderRadius: '50px' }}
                        onClick={() => handleVeziParticipanti(atelier.idatelier)}>
                        <img src={participantIcon} alt="" className="icon-sm" />
                        {showParticipanti === atelier.idatelier ? 'Ascunde' : 'Participanti'}
                      </button>
                      <button type="button" className="btn btn-sm" style={{ border: '1px solid var(--roz)', color: 'var(--roz)', borderRadius: '50px' }}
                        onClick={() => handleVeziRecenzii(atelier.idatelier)}>
                        <img src={starIcon} alt="" className="icon-sm" style={{ filter: 'none' }} />
                        {showRecenzii === atelier.idatelier ? 'Ascunde' : 'Evaluari'}
                      </button>
                      <button type="button" className="btn btn-sm" style={{ border: '1px solid #66bb6a', color: '#388e3c', borderRadius: '50px' }}
                        onClick={() => handleVeziMateriale(atelier.idatelier)}>
                        {showMateriale === atelier.idatelier ? 'Ascunde' : 'Materiale'}
                      </button>
                      <button type="button" className="btn btn-sm" style={{ border: '1px solid #7986cb', color: '#7986cb', borderRadius: '50px' }}
                        onClick={() => handleReposteaza(atelier)}>Reposteaza</button>
                    </div>
                  </div>

                  {/* EVALUARI */}
                  {showRecenzii === atelier.idatelier && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                      {/* Header cu statistici + buton generare */}
                      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                          <h6 style={{ marginBottom: '2px' }}>Evaluari primite</h6>
                          {recenzii[atelier.idatelier] && recenzii[atelier.idatelier].length > 0 && (() => {
                            const lista = recenzii[atelier.idatelier]
                            const mediu = (lista.reduce((s, r) => s + r.rating, 0) / lista.length).toFixed(1)
                            return (
                              <small style={{ color: 'var(--text-secundar)' }}>
                                {lista.length} {lista.length === 1 ? 'evaluare' : 'evaluari'} · rating mediu{' '}
                                <strong>{mediu}/5</strong>
                              </small>
                            )
                          })()}
                        </div>
                        {recenzii[atelier.idatelier] && recenzii[atelier.idatelier].some(r => r.comentariu) && (
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--roz)', color: '#fff', borderRadius: '50px', border: 'none', fontSize: '0.8rem' }}
                            onClick={() => handleGenereazaRezumat(atelier.idatelier)}
                            disabled={loadingRezumat[atelier.idatelier]}
                          >
                            {loadingRezumat[atelier.idatelier] ? (
                              <><span className="spinner-border spinner-border-sm me-1" />Generare...</>
                            ) : rezumate[atelier.idatelier] ? (<><img src={starsIcon} alt="" style={{ width: '14px', height: '14px', marginRight: '5px' }} />Regenereaza rezumat</>) : (<><img src={starsIcon} alt="" style={{ width: '14px', height: '14px', marginRight: '5px' }} />Genereaza rezumat</>)}
                          </button>
                        )}
                      </div>

                      {/* Lista evaluari brute */}
                      {!recenzii[atelier.idatelier] || recenzii[atelier.idatelier].length === 0 ? (
                        <p style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Nicio evaluare inca.</p>
                      ) : (
                        <div className="d-flex flex-column gap-2 mb-3">
                          {recenzii[atelier.idatelier].map((r, i) => (
                            <div key={i} style={{ background: 'var(--crem)', borderRadius: '10px', padding: '12px 16px', border: '1px solid var(--border)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.prenume} {r.nume}</span>
                                <span className="d-flex align-items-center gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <img key={s} src={starIcon} alt="" style={{ width: '13px', height: '13px', opacity: s <= r.rating ? 1 : 0.2 }} />
                                  ))}
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secundar)', marginLeft: '4px' }}>{r.rating}/5</span>
                                </span>
                              </div>
                              {r.comentariu && (
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secundar)' }}>"{r.comentariu}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rezumat LLM */}
                      {rezumate[atelier.idatelier] && (() => {
                        const rez = rezumate[atelier.idatelier]
                        return (
                          <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                            <h6 style={{ marginBottom: '12px', color: 'var(--roz)', display: 'flex', alignItems: 'center', gap: '6px' }}><img src={starsIcon} alt="" style={{ width: '18px', height: '18px' }} />Rezumat generat automat</h6>
                            <div className="d-flex flex-column gap-3">

                              {/* Rezumat general */}
                              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#444', display: 'flex', alignItems: 'center', gap: '5px' }}><img src={documentsIcon} alt="" style={{ width: '15px', height: '15px' }} />Rezumat general</div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secundar)', lineHeight: 1.6 }}>{rez.rezumat_general}</p>
                              </div>

                              <div className="row g-2">
                                {/* Puncte forte */}
                                <div className="col-md-4">
                                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', height: '100%' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}><img src={checkMarkIcon} alt="" style={{ width: '15px', height: '15px' }} />Puncte forte</div>
                                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#166534' }}>
                                      {rez.puncte_forte.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                  </div>
                                </div>

                                {/* Puncte slabe */}
                                <div className="col-md-4">
                                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', height: '100%' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '5px' }}><img src={warningIcon} alt="" style={{ width: '15px', height: '15px' }} />Puncte slabe</div>
                                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#991b1b' }}>
                                      {rez.puncte_slabe.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                  </div>
                                </div>

                                {/* Sugestii */}
                                <div className="col-md-4">
                                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 16px', height: '100%' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '5px' }}><img src={ideaIcon} alt="" style={{ width: '15px', height: '15px' }} />Sugestii</div>
                                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#1e40af' }}>
                                      {rez.sugestii.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <small style={{ color: 'var(--text-secundar)', fontSize: '0.75rem' }}>
                                Generat la {new Date(rez.generat_la).toLocaleString('ro-RO')}
                              </small>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}


                  {/* MATERIALE */}
                  {showMateriale === atelier.idatelier && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                      <h6 style={{ marginBottom: '12px' }}>Materiale utilizate</h6>

                      {/* Tabel raport cost */}
                      {materiale[atelier.idatelier] && materiale[atelier.idatelier].length > 0 ? (
                        <div style={{ marginBottom: '16px' }}>
                          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-secundar)', fontWeight: 500 }}>
                                <td style={{ paddingBottom: '4px' }}>Material</td>
                                <td style={{ textAlign: 'center', paddingBottom: '4px' }}>Cant.</td>
                                <td style={{ textAlign: 'right', paddingBottom: '4px' }}>Pret/buc</td>
                                <td style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</td>
                                {!salvatMateriale[atelier.idatelier] && <td></td>}
                              </tr>
                            </thead>
                            <tbody>
                              {materiale[atelier.idatelier].map(m => (
                                <tr key={m.idutilizare} style={{ borderTop: '1px solid var(--border)' }}>
                                  <td style={{ padding: '5px 0' }}>{m.denumire}</td>
                                  <td style={{ textAlign: 'center', padding: '5px 0' }}>{m.cantitate}</td>
                                  <td style={{ textAlign: 'right', padding: '5px 0', color: 'var(--text-secundar)' }}>{m.pret.toFixed(2)} RON</td>
                                  <td style={{ textAlign: 'right', padding: '5px 0', fontWeight: 500 }}>{m.total.toFixed(2)} RON</td>
                                  {!salvatMateriale[atelier.idatelier] && (
                                    <td style={{ textAlign: 'right', padding: '5px 0', paddingLeft: '8px' }}>
                                      <button type="button"
                                        onClick={() => setStergeAsociereModal({ idatelier: atelier.idatelier, idutilizare: m.idutilizare, denumire: m.denumire })}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <img src={trashBinIcon} alt="sterge" style={{ width: '14px', height: '14px' }} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr style={{ borderTop: '2px solid var(--border)' }}>
                                <td colSpan={salvatMateriale[atelier.idatelier] ? 4 : 3} style={{ paddingTop: '6px', fontWeight: 600 }}>Total cheltuit</td>
                                <td style={{ textAlign: 'right', paddingTop: '6px', fontWeight: 700, color: 'var(--roz)' }}>
                                  {materiale[atelier.idatelier].reduce((s, m) => s + m.total, 0).toFixed(2)} RON
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        !salvatMateriale[atelier.idatelier] && (
                          <p style={{ color: 'var(--text-secundar)', fontSize: '0.85rem', marginBottom: '12px' }}>Niciun material asociat inca.</p>
                        )
                      )}

                      {/* MOD SALVAT: tabel read-only + buton Editeaza */}
                      {salvatMateriale[atelier.idatelier] ? (
                        <button type="button" className="btn btn-sm"
                          style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 16px', fontSize: '0.82rem', background: 'white' }}
                          onClick={() => handleEditeazaMateriale(atelier.idatelier)}>
                          ✏️ Editeaza
                        </button>
                      ) : (
                        <>
                          {/* Form selectare material existent */}
                          <form onSubmit={e => handleAsociazaMaterial(e, atelier.idatelier)} style={{ marginBottom: '8px' }}>
                            <div className="d-flex gap-2 flex-wrap align-items-center">
                              <select className="form-select form-select-sm" value={nouMaterial.idmaterial}
                                onChange={e => setNouMaterial({ ...nouMaterial, idmaterial: e.target.value })} required
                                style={{ flex: '1 1 200px', minWidth: '180px', borderColor: 'var(--border)', boxShadow: 'none' }}>
                                <option value="">Selecteaza material existent</option>
                                {toateMaterialele.filter(m => !materiale[atelier.idatelier]?.find(x => x.idmaterial === m.idmaterial)).map(m => (
                                  <option key={m.idmaterial} value={m.idmaterial}>{m.denumire} - {m.pret} RON</option>
                                ))}
                              </select>
                              <div className="d-flex align-items-center" style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                                <button type="button"
                                  onClick={() => setNouMaterial(p => ({ ...p, cantitate: Math.max(1, parseInt(p.cantitate||1) - 1) }))}
                                  style={{ border: 'none', background: 'none', padding: '4px 10px', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-secundar)' }}>−</button>
                                <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{nouMaterial.cantitate}</span>
                                <button type="button"
                                  onClick={() => setNouMaterial(p => ({ ...p, cantitate: Math.min(9999, parseInt(p.cantitate||1) + 1) }))}
                                  style={{ border: 'none', background: 'none', padding: '4px 10px', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-secundar)' }}>+</button>
                              </div>
                              <button className="btn btn-sm" type="submit"
                                style={{ background: '#66bb6a', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 14px' }}>
                                Adauga
                              </button>
                            </div>
                            {nouMaterial.idmaterial && (() => {
                              const matSel = toateMaterialele.find(m => m.idmaterial === parseInt(nouMaterial.idmaterial))
                              const cerut = parseInt(nouMaterial.cantitate) || 0
                              if (matSel && cerut) return (
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secundar)', marginTop: '4px' }}>
                                  {matSel.denumire} × {cerut} buc = <strong style={{ color: 'var(--text-principal)' }}>{(matSel.pret * cerut).toFixed(2)} RON</strong>
                                </div>
                              )
                              return null
                            })()}
                          </form>

                          {/* Form material nou */}
                          <form onSubmit={e => handleAdaugaMaterialNou(e, atelier.idatelier)} style={{ marginBottom: '12px' }}>
                            <div className="d-flex gap-2 flex-wrap align-items-center">
                              <input className="form-control form-control-sm" placeholder="Material nou..."
                                value={nouMaterialNou.denumire}
                                onChange={e => setNouMaterialNou(p => ({ ...p, denumire: e.target.value }))}
                                style={{ flex: '1 1 160px', maxWidth: '220px', boxShadow: 'none' }} />
                              <input className="form-control form-control-sm" type="number" min="0" step="0.01" placeholder="Pret RON"
                                value={nouMaterialNou.pret}
                                onChange={e => setNouMaterialNou(p => ({ ...p, pret: e.target.value }))}
                                style={{ width: '100px', boxShadow: 'none' }} />
                              <button className="btn btn-sm" type="submit"
                                style={{ background: 'white', color: '#66bb6a', border: '1px solid #66bb6a', borderRadius: '8px', padding: '5px 14px', whiteSpace: 'nowrap' }}>
                                + Material nou
                              </button>
                            </div>
                          </form>

                          {/* Buton Salveaza */}
                          {materiale[atelier.idatelier]?.length > 0 && (
                            <button type="button" className="btn btn-sm"
                              style={{ background: 'var(--roz)', color: 'white', border: 'none', borderRadius: '8px', padding: '5px 20px' }}
                              onClick={() => handleSalveazaMateriale(atelier.idatelier)}>
                              Salveaza
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* PARTICIPANTI */}
                  {showParticipanti === atelier.idatelier && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                      <h6 style={{ marginBottom: '12px' }}>Participanti inscrisi</h6>
                      {!participanti[atelier.idatelier] || participanti[atelier.idatelier].length === 0 ? (
                        <p style={{ color: 'var(--text-secundar)', fontSize: '0.9rem' }}>Niciun participant inscris.</p>
                      ) : (
                        <>
                          <div className="d-flex flex-column gap-2">
                            {participanti[atelier.idatelier].map(p => (
                              <div key={p.idinregistrare} className="d-flex justify-content-between align-items-center"
                                style={{ background: 'var(--crem)', borderRadius: '10px', padding: '10px 16px', border: '1px solid var(--border)' }}>
                                <div>
                                  <span style={{ fontWeight: 500, color: 'var(--text-principal)', fontSize: '0.9rem' }}>{p.prenume} {p.nume}</span>
                                  <span style={{ marginLeft: '10px', background: p.status === 'Participare' ? '#e3f2fd' : '#e8f5e9', color: p.status === 'Participare' ? '#1565c0' : '#2e7d32', borderRadius: '50px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 500 }}>
                                    {p.status}
                                  </span>
                                </div>
                                {p.status === 'Inscriere' && (
                                  <button type="button" className="btn btn-sm btn-primary" style={{ fontSize: '0.8rem' }}
                                    onClick={() => handleMarcareParticipare(p.idinregistrare, atelier.idatelier)}>
                                    Marcare participare
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {(() => {
                            const nrParticipanti = participanti[atelier.idatelier].filter(p => p.status === 'Participare').length
                            const nrInscrisi = participanti[atelier.idatelier].length
                            const incasare = nrParticipanti * parseFloat(atelier.pret)
                            return (
                              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ color: 'var(--text-secundar)', paddingBottom: '4px' }}>Inscrisi</td>
                                      <td style={{ textAlign: 'right', paddingBottom: '4px' }}>{nrInscrisi}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ color: 'var(--text-secundar)', paddingBottom: '4px' }}>Au participat efectiv</td>
                                      <td style={{ textAlign: 'right', paddingBottom: '4px', fontWeight: 500 }}>{nrParticipanti}</td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                                      <td style={{ paddingTop: '6px', fontWeight: 600 }}>
                                        Total incasat &nbsp;
                                        <span style={{ fontWeight: 400, color: 'var(--text-secundar)', fontSize: '0.78rem' }}>
                                          ({nrParticipanti} × {parseFloat(atelier.pret).toFixed(2)} RON)
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'right', paddingTop: '6px', fontWeight: 700, color: 'var(--roz)', fontSize: '0.95rem' }}>
                                        {incasare.toFixed(2)} RON
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )
                          })()}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>

      {stergeAsociereModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(61,44,53,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card p-4" style={{ maxWidth: '420px', width: '90%', borderRadius: '20px' }}>
            <div className="text-center mb-3"><img src={trashBinIcon} alt="sterge" style={{ width: '48px', height: '48px' }} /></div>
            <h5 style={{ textAlign: 'center', marginBottom: '12px' }}>Elimini materialul?</h5>
            <p style={{ color: 'var(--text-secundar)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '24px' }}>
              Esti sigur ca vrei sa elimini <strong>{stergeAsociereModal.denumire}</strong> din acest atelier?
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button className="btn btn-outline-primary px-4" onClick={() => setStergeAsociereModal(null)}>Nu, pastreaza</button>
              <button className="btn px-4" style={{ background: '#e890a6', color: 'white', border: 'none', borderRadius: '50px' }} onClick={handleStergeAsociere}>
                Da, elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}