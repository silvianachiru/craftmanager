import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import calendarIcon from '../assets/calendar.png'
import clockIcon from '../assets/clock.png'
import searchIcon from '../assets/search.png'
import tagIcon from '../assets/tag.png'
import ageIcon from '../assets/age-group.png'
import { getIconAtelier } from '../utils/iconAtelier'


export default function Home() {
  const [ateliere, setAteliere] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/ateliere/')
      .then(res => setAteliere(res.data.sort((a, b) => new Date(a.data) - new Date(b.data))))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const ateliereAfisate = ateliere.filter(a =>
    a.denumire.toLowerCase().includes(search.toLowerCase())
  )
  const atelierePreview = ateliereAfisate.slice(0, 3)

  return (
    <>
      <section className="hero-section">
        <div className="container text-center">
          <h1 className="hero-title">Descopera ateliere creative</h1>
          <p className="hero-subtitle">
            Invata ceva nou, conecteaza-te cu oameni pasionati si exploreaza-ti creativitatea
          </p>
          <div className="search-bar mx-auto">
            <img
              src={searchIcon}
              alt="search"
              className="icon-md icon-filter"
            />
            <input
              type="text"
              placeholder="Cauta un atelier..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h2 className="section-title">Ateliere disponibile</h2>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border atelier-spinner" />
          </div>
        ) : ateliereAfisate.length === 0 ? (
          <div className="text-center py-5">
            <p className="section-text">
              {search ? 'Niciun atelier gasit.' : 'Nu exista ateliere momentan.'}
            </p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {atelierePreview.map(atelier => (
                <div key={atelier.idatelier} className="col-md-4">
                  <Link to={`/ateliere/${atelier.idatelier}`} className="text-decoration-none">
                    <div className="card h-100 atelier-card">
                      <div className="card-img-placeholder">
                        <img
                          src={getIconAtelier(atelier)}
                          alt=""
                          className="atelier-card-icon"
                        />
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
                        </div>
                      </div>
                      <div className="card-footer bg-transparent border-0 pb-3 px-3">
                        <div className="d-flex gap-3">
                          <small className="d-flex align-items-center atelier-footer-meta">
                            <img src={calendarIcon} alt="data" className="icon-sm icon-filter" />
                            {new Date(atelier.data).toLocaleDateString('ro-RO')}
                          </small>
                          <small className="d-flex align-items-center atelier-footer-meta">
                            <img src={clockIcon} alt="ora" className="icon-sm icon-filter" />
                            {atelier.ora?.slice(0, 5)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <Link to="/ateliere" className="btn btn-outline-primary px-5">
                Vezi mai multe
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  )
}
