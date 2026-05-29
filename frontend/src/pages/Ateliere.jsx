import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import calendarIcon from '../assets/calendar.png'
import clockIcon from '../assets/clock.png'
import tagIcon from '../assets/tag.png'
import ageIcon from '../assets/age-group.png'
import searchIcon from '../assets/search.png'
import locationIcon from '../assets/location.png'
import presentationIcon from '../assets/presentation.png'
import { getIconAtelier } from '../utils/iconAtelier'



const azi = new Date().toISOString().split('T')[0]


export default function Ateliere() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [ateliere, setAteliere] = useState([])
  const [categorii, setCategorii] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFiltreExtra, setShowFiltreExtra] = useState(false)

  const [categorieActiva, setCategorieActiva] = useState(
    searchParams.get('categorie') ? parseInt(searchParams.get('categorie')) : null
  )

  const [filtre, setFiltre] = useState({
    search: '',
    pretMin: '',
    pretMax: '',
    dataMin: '',
    dataMax: '',
    oras: '',
    varsta: '',
    nivel: '',
  })

  useEffect(() => {
    api.get('/categorii/').then(res => setCategorii(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const catDinUrl = searchParams.get('categorie') ? parseInt(searchParams.get('categorie')) : null
    setCategorieActiva(catDinUrl)
    incarcaAteliere(filtre, catDinUrl)
  }, [searchParams])

  const incarcaAteliere = (filtreNoi = filtre, categorie = categorieActiva) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categorie) params.append('categorie', categorie)
    if (filtreNoi.pretMin) params.append('pret_min', filtreNoi.pretMin)
    if (filtreNoi.pretMax) params.append('pret_max', filtreNoi.pretMax)
    if (filtreNoi.varsta) params.append('varsta', filtreNoi.varsta)
    const url = `/ateliere/${params.toString() ? '?' + params.toString() : ''}`
    api.get(url).then(res => setAteliere(res.data.sort((a, b) => new Date(a.data) - new Date(b.data)))).finally(() => setLoading(false))
  }

  const handleCategorie = (id) => {
    setCategorieActiva(id)
    if (id) {
      setSearchParams({ categorie: id })
    } else {
      setSearchParams({})
    }
  }

  const handleFiltruChange = (e) => {
    setFiltre({ ...filtre, [e.target.name]: e.target.value })
  }

  const handleCautare = () => {
    incarcaAteliere(filtre, categorieActiva)
  }

  const handleReset = () => {
    const filtreGoale = { search: '', pretMin: '', pretMax: '', dataMin: '', dataMax: '', oras: '', varsta: '', nivel: '' }
    setFiltre(filtreGoale)
    setCategorieActiva(null)
    setSearchParams({})
    incarcaAteliere(filtreGoale, null)
  }

  const ateliereAfisate = ateliere.filter(a => {
    const matchSearch = a.denumire.toLowerCase().includes(filtre.search.toLowerCase())
    const matchOras = !filtre.oras || a.locatie?.oras?.toLowerCase().includes(filtre.oras.toLowerCase())
    const matchDataMin = !filtre.dataMin || a.data >= filtre.dataMin
    const matchDataMax = !filtre.dataMax || a.data <= filtre.dataMax
    const matchNivel = !filtre.nivel || (a.nivel || 'Incepator') === filtre.nivel
    return matchSearch && matchOras && matchDataMin && matchDataMax && matchNivel
  })

  const areFiltreActive = categorieActiva || filtre.pretMin || filtre.pretMax ||
    filtre.dataMin || filtre.dataMax || filtre.oras || filtre.varsta || filtre.search || filtre.nivel

  return (
    <div className="ateliere-page">
      <div className="page-header">
        <div className="container">
          <h1 className="ateliere-title">
            Ateliere disponibile
          </h1>
          <p className="ateliere-subtitle">
            Descopera activitati creative si inscrie-te la cele care te inspira
          </p>

          <div className="search-bar ateliere-search">
            <img src={searchIcon} alt="search" className="icon-md icon-filter" />
            <input
              type="text"
              name="search"
              placeholder="Cauta un atelier..."
              value={filtre.search}
              onChange={handleFiltruChange}
              onKeyDown={(e) => e.key === 'Enter' && handleCautare()}
            />
          </div>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowFiltreExtra(!showFiltreExtra)}
          >
            {showFiltreExtra ? 'Ascunde filtre' : 'Filtre avansate'}
          </button>

          {showFiltreExtra && (
            <div className="card p-4 mt-3 ateliere-filtre-card">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={tagIcon} alt="" className="icon-sm icon-filter" />
                    Pret minim (RON)
                  </label>
                  <input name="pretMin" type="number" min="0" className="form-control form-control-sm" placeholder="ex: 50" value={filtre.pretMin} onChange={handleFiltruChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={tagIcon} alt="" className="icon-sm icon-filter" />
                    Pret maxim (RON)
                  </label>
                  <input name="pretMax" type="number" min={filtre.pretMin || "0"} className="form-control form-control-sm" placeholder="ex: 200" value={filtre.pretMax} onChange={handleFiltruChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={calendarIcon} alt="" className="icon-sm icon-filter" />
                    Data de la
                  </label>
                  <input name="dataMin" type="date" min={azi} className="form-control form-control-sm" value={filtre.dataMin} onChange={handleFiltruChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={calendarIcon} alt="" className="icon-sm icon-filter" />
                    Data pana la
                  </label>
                  <input name="dataMax" type="date" min={filtre.dataMin || azi} className="form-control form-control-sm" value={filtre.dataMax} onChange={handleFiltruChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={locationIcon} alt="" className="icon-sm icon-filter" />
                    Oras
                  </label>
                  <input name="oras" type="text" className="form-control form-control-sm" placeholder="ex: Constanta" value={filtre.oras} onChange={handleFiltruChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={ageIcon} alt="" className="icon-sm icon-filter" />
                    Varsta mea
                  </label>
                  <input name="varsta" type="number" min="1" max="120" className="form-control form-control-sm" placeholder="ex: 25" value={filtre.varsta} onChange={handleFiltruChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label ateliere-filter-label">
                    <img src={presentationIcon} alt="" className="icon-sm icon-filter" />
                    Nivel
                  </label>
                  <select name="nivel" className="form-select form-select-sm" value={filtre.nivel} onChange={handleFiltruChange}>
                    <option value="">Toate nivelurile</option>
                    <option value="Incepator">Incepator</option>
                    <option value="Mediu">Mediu</option>
                    <option value="Avansat">Avansat</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm px-4" onClick={handleCautare}>
                  Aplica filtrele
                </button>
                {areFiltreActive && (
                  <button className="btn btn-outline-primary btn-sm px-4" onClick={handleReset}>
                    Reseteaza
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container py-5">
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm atelier-category-btn${!categorieActiva ? ' active' : ''}`}
            onClick={() => handleCategorie(null)}
          >
            Toate
          </button>
          {categorii.map(cat => (
            <button
              key={cat.idcategorie}
              className={`btn btn-sm atelier-category-btn${categorieActiva === cat.idcategorie ? ' active' : ''}`}
              onClick={() => handleCategorie(cat.idcategorie)}
            >
              {cat.denumire}
            </button>
          ))}
        </div>

        {areFiltreActive && (
          <div className="mb-3 ateliere-results-count">
            {ateliereAfisate.length} atelier{ateliereAfisate.length !== 1 ? 'e' : ''} gasit{ateliereAfisate.length !== 1 ? 'e' : ''}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border atelier-spinner" />
          </div>
        ) : ateliereAfisate.length === 0 ? (
          <div className="text-center py-5">
            <p className="ateliere-empty-text">Niciun atelier nu corespunde filtrelor selectate.</p>
            <button className="btn btn-outline-primary btn-sm mt-2" onClick={handleReset}>
              Reseteaza filtrele
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {ateliereAfisate.map(atelier => (
              <div key={atelier.idatelier} className="col-md-4">
                <Link to={`/ateliere/${atelier.idatelier}`} className="text-decoration-none">
                  <div className="card h-100 atelier-card">
                    <div className="card-img-placeholder">
                      <img src={getIconAtelier(atelier)} alt="" className="atelier-card-icon" />
                    </div>
                    <div className="card-body">
                      <h5 className="atelier-card-title">
                        {atelier.denumire}
                      </h5>
                      <p className="small mb-3 atelier-card-description">
                        {atelier.descriere?.slice(0, 80)}...
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        <span className="badge-pret d-flex align-items-center gap-1">
                          <img src={tagIcon} alt="pret" className="icon-badge icon-badge-pret" />
                          {atelier.pret} RON
                        </span>
                        <span className="badge-categorie d-flex align-items-center gap-1">
                          <img src={clockIcon} alt="durata" className="icon-badge icon-badge-categorie" />
                          {atelier.durata} min
                        </span>
                        <span className="badge-categorie d-flex align-items-center gap-1">
                          <img src={ageIcon} alt="varsta" className="icon-badge icon-badge-categorie" />
                          {atelier.varstamin}-{atelier.varstamax} ani
                        </span>
                        <span className="badge-categorie d-flex align-items-center gap-1" style={{ background: '#f0f4ff', color: '#3b5bdb', border: '1px solid #c5d0fa' }}>
                          {atelier.nivel || 'Incepator'}
                        </span>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-0 pb-3 px-3">
                      <div className="d-flex gap-3">
                        <small className="d-flex align-items-center atelier-footer-meta">
                          <img src={calendarIcon} alt="data" className="icon-sm icon-filter" />
                          {new Date(atelier.data).toLocaleDateString('ro-RO')} la {atelier.ora?.slice(0, 5)}
                        </small>
                        {atelier.locatie && (
                          <small className="d-flex align-items-center atelier-footer-meta">
                            <img src={locationIcon} alt="oras" className="icon-sm icon-filter" />
                            {atelier.locatie.oras}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
