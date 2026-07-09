import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { extrageEroare } from '../utils/validare'
import calendarIcon from '../assets/calendar.png'
import clockIcon from '../assets/clock.png'
import locationIcon from '../assets/location.png'
import tagIcon from '../assets/tag.png'
import ageIcon from '../assets/age-group.png'
import participantIcon from '../assets/participant.png'
import artIcon from '../assets/art.png'
import presentationIcon from '../assets/presentation.png'

const getAtelierDateTime = (data, ora) => {
  if (!data) return null

  const timeValue = ora?.slice?.(0, 5) || '00:00'
  return new Date(`${data}T${timeValue}:00`)
}

export default function DetaliiAtelier() {
  const { id } = useParams()
  const { utilizator, tip } = useAuth()
  const navigate = useNavigate()

  const [atelier, setAtelier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mesaj, setMesaj] = useState('')
  const [eroare, setEroare] = useState('')
  const [inscris, setInscris] = useState(false)

  useEffect(() => {
    api.get(`/ateliere/${id}`)
      .then(res => { setAtelier(res.data); setEroare('') })
      .catch(() => setEroare('Atelierul nu a fost gasit'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!utilizator || tip !== 'participant') return

    api.get('/inregistrari/ale-mele')
      .then(res => {
        const inregistrareExistenta = res.data.find(inr =>
          inr.idatelier === parseInt(id) && inr.status !== 'Anulare'
        )

        if (inregistrareExistenta) {
          setInscris(true)
          setMesaj(
            inregistrareExistenta.status === 'Participare'
              ? 'Ai participat deja la acest atelier'
              : 'Esti deja inscris la acest atelier'
          )
        }
      })
      .catch(() => {})
  }, [id, utilizator, tip])

  const handleInscriere = async () => {
    if (!utilizator) {
      navigate('/login')
      return
    }
    try {
      await api.post('/inregistrari/', { idatelier: parseInt(id) })
      setInscris(true)
      setMesaj('Te-ai inscris cu succes!')
      setEroare('')
    } catch (err) {
      setEroare(extrageEroare(err, 'Eroare la inscriere'))
    }
  }

  if (loading) return (
    <div className="container text-center py-5">
      <div className="spinner-border atelier-spinner" />
    </div>
  )

  if (!atelier) return (
    <div className="container py-5 text-center">
      <p className="section-text">Atelierul nu a fost gasit.</p>
    </div>
  )

  const atelierEsteTrecut = (() => {
    const atelierDateTime = getAtelierDateTime(atelier.data, atelier.ora)
    return atelierDateTime ? atelierDateTime < new Date() : false
  })()

  return (
    <div className="atelier-details-page">
      <div className="atelier-details-hero">
        <div className="container">
          <button
            className="btn btn-outline-primary btn-sm mb-4"
            onClick={() => navigate(-1)}
          >
            Înapoi
          </button>
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="tag mb-3 d-inline-block">{atelier.durata} minute</span>
              <h1 className="atelier-details-title">{atelier.denumire}</h1>
              <div className="d-flex flex-wrap gap-3">
                <span className="d-flex align-items-center atelier-meta-text">
                  <img src={calendarIcon} alt="data" className="icon-meta icon-filter" />
                  {new Date(atelier.data).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="d-flex align-items-center atelier-meta-text">
                  <img src={clockIcon} alt="ora" className="icon-meta icon-filter" />
                  {atelier.ora?.slice(0, 5)}
                </span>
                <span className="d-flex align-items-center atelier-meta-text">
                  <img src={locationIcon} alt="locatie" className="icon-meta icon-filter" />
                  {atelier.locatie ? `${atelier.locatie.nume}, ${atelier.locatie.oras}` : `Locatie #${atelier.idlocatie}`}
                </span>
              </div>
            </div>

            <div className="col-md-4 mt-4 mt-md-0">
              <div className="atelier-price-card">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <img src={tagIcon} alt="pret" className="atelier-price-icon icon-filter" />
                  <span className="atelier-price-value">
                    {atelier.pret} RON
                  </span>
                </div>
                <div className="atelier-price-caption">
                  per persoana
                </div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <img src={ageIcon} alt="varsta" className="icon-meta icon-filter" />
                  <span className="atelier-side-text">
                    Varsta: {atelier.varstamin} - {atelier.varstamax} ani
                  </span>
                </div>
                {mesaj && <div className="alert alert-success py-2 mb-3 atelier-inline-alert">{mesaj}</div>}
                {eroare && <div className="alert alert-danger py-2 mb-3 atelier-inline-alert">{eroare}</div>}
                {tip === 'participant' && !inscris && !atelierEsteTrecut && (
                  atelier.locatie && (atelier.nr_inscrisi ?? atelier.nrparticipanti) >= atelier.locatie.capacitate
                    ? <div className="alert alert-warning py-2 text-center mb-0" style={{fontSize:'0.85rem'}}>Atelierul este complet.</div>
                    : <button className="btn btn-primary w-100" onClick={handleInscriere}>Inscrie-te acum</button>
                )}
                {tip === 'participant' && !inscris && atelierEsteTrecut && (
                  <div className="atelier-side-text text-center">
                    Acest atelier a avut deja loc.
                  </div>
                )}
                {!utilizator && !atelierEsteTrecut && (
                  <button className="btn btn-primary w-100" onClick={() => navigate('/login')}>
                    Autentifica-te pentru a te inscrie
                  </button>
                )}
                {!utilizator && atelierEsteTrecut && (
                  <div className="atelier-side-text text-center">
                    Acest atelier a avut deja loc.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          <div className="col-md-8">
            <h3 className="section-heading-md">Despre acest atelier</h3>
            <p className="atelier-description">
              {atelier.descriere || 'Nu exista descriere pentru acest atelier.'}
            </p>

            <hr className="section-divider" />

            <h3 className="section-heading-md">Detalii</h3>
            <div className="row g-3">
              {[
                { icon: clockIcon, label: 'Durata', value: `${atelier.durata} minute` },
                { icon: tagIcon, label: 'Pret', value: `${atelier.pret} RON` },
                { icon: ageIcon, label: 'Varsta recomandata', value: `${atelier.varstamin} - ${atelier.varstamax} ani` },
                { icon: calendarIcon, label: 'Data', value: new Date(atelier.data).toLocaleDateString('ro-RO') },
                { icon: clockIcon, label: 'Ora', value: atelier.ora?.slice(0, 5) },
                { icon: participantIcon, label: 'Nr. participanti admisi', value: atelier.locatie?.capacitate ?? '?' },
                { icon: presentationIcon, label: 'Nivel', value: atelier.nivel || 'Incepator' },
              ].map((item, i) => (
                <div key={i} className="col-md-6">
                  <div className="atelier-detail-card">
                    <span className="d-flex align-items-center atelier-meta-text">
                      <img src={item.icon} alt={item.label} className="icon-card-meta icon-filter" />
                      {item.label}
                    </span>
                    <span className="atelier-detail-value">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 atelier-sidebar-card">
              <h5 className="section-heading-sm">Instructor</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="atelier-instructor-avatar">
                  <img src={artIcon} alt="instructor" className="atelier-instructor-icon icon-filter" />
                </div>
                <div>
                  <div className="atelier-instructor-name">
                    <Link
                      to={`/instructor/${atelier.idinstructor}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--roz-hover)"}
                      onMouseLeave={e => e.currentTarget.style.color = "inherit"}
                    >
                      {atelier.instructor?.utilizator
                        ? `${atelier.instructor.utilizator.prenume} ${atelier.instructor.utilizator.nume}`
                        : `Instructor #${atelier.idinstructor}`}
                    </Link>
                  </div>
                  <div className="atelier-side-text">
                    {atelier.instructor?.specializare || 'Instructor'}
                  </div>
                </div>
              </div>

              <hr className="sidebar-divider" />

              <div className="d-flex align-items-center gap-2 mb-2">
                <img src={locationIcon} alt="locatie" className="icon-meta icon-filter" />
                <span className="atelier-side-text">
                  {atelier.locatie ? `${atelier.locatie.adresa}, ${atelier.locatie.oras}` : `Locatie #${atelier.idlocatie}`}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <img src={participantIcon} alt="participanti" className="icon-meta icon-filter" />
                <span className="atelier-side-text">{atelier.nr_inscrisi ?? atelier.nrparticipanti} din {atelier.locatie?.capacitate ?? '?'} participanti inregistrati</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img src={presentationIcon} alt="tema" className="icon-meta icon-filter" />
                <span className="atelier-side-text">
                  {atelier.tema?.denumire || `Tema #${atelier.idtema}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
