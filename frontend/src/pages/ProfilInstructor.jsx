import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import artIcon from '../assets/art.png'
import calendarIcon from '../assets/calendar.png'
import clockIcon from '../assets/clock.png'
import tagIcon from '../assets/tag.png'
import starIcon from '../assets/star.png'

function Stele({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <img
          key={i}
          src={starIcon}
          alt=""
          style={{
            width: "14px", height: "14px", marginRight: "2px",
            filter: i <= rating
              ? "invert(70%) sepia(80%) saturate(400%) hue-rotate(5deg)"
              : "invert(80%) brightness(1.2)"
          }}
        />
      ))}
    </span>
  )
}

export default function ProfilInstructor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [instructor, setInstructor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eroare, setEroare] = useState("")

  useEffect(() => {
    api.get("/instructori/" + id)
      .then(res => setInstructor(res.data))
      .catch(() => setEroare("Profilul nu a putut fi incarcat."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="container text-center py-5">
      <div className="spinner-border" style={{ color: "var(--roz)" }} />
    </div>
  )

  if (eroare) return (
    <div className="container py-5">
      <div className="alert alert-danger">{eroare}</div>
    </div>
  )

  const ateliereViitoare = instructor.ateliere.filter(a => new Date(a.data) >= new Date()).sort((a, b) => new Date(a.data) - new Date(b.data))

  return (
    <div style={{ minHeight: "100vh", background: "var(--crem)" }}>
      <div className="page-header-sm">
        <div className="container">
          <button className="btn btn-outline-primary btn-sm mb-3" onClick={() => navigate(-1)}>
            Inapoi
          </button>
          <div className="d-flex align-items-center gap-4">
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--roz-deschis)", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <img src={artIcon} alt="" style={{ width: "36px", height: "36px", filter: "invert(60%) sepia(30%) saturate(400%) hue-rotate(300deg)" }} />
            </div>
            <div>
              <h1 style={{ color: "var(--text-principal)", marginBottom: "4px" }}>
                {instructor.prenume} {instructor.nume}
              </h1>
              <span className="tag">{instructor.specializare || "Instructor"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-8">

            {instructor.bio && (
              <div className="card p-4 mb-4">
                <h5 style={{ marginBottom: "12px" }}>Despre instructor</h5>
                <p style={{ color: "var(--text-secundar)", margin: 0, lineHeight: "1.7" }}>{instructor.bio}</p>
              </div>
            )}

            <div className="card p-4 mb-4">
              <h5 style={{ marginBottom: "20px" }}>
                Recenzii
                {instructor.rating_mediu && (
                  <span style={{ marginLeft: "12px", fontSize: "0.9rem", color: "var(--text-secundar)", fontWeight: 400 }}>
                    <Stele rating={Math.round(instructor.rating_mediu)} />
                    {" "}{instructor.rating_mediu} / 5
                  </span>
                )}
              </h5>
              {instructor.recenzii.length === 0 ? (
                <p style={{ color: "var(--text-secundar)", margin: 0, fontSize: "0.9rem" }}>Nicio recenzie inca.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {instructor.recenzii.map((r, i) => (
                    <div key={i} style={{
                      background: "var(--crem)", borderRadius: "12px",
                      padding: "16px", border: "1px solid var(--border)"
                    }}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{r.prenume_participant} {r.nume_participant}</span>
                        <Stele rating={r.rating} />
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secundar)", marginBottom: r.comentariu ? "8px" : 0 }}>
                        {r.denumire_atelier}
                      </div>
                      {r.comentariu && (
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-principal)" }}>"{r.comentariu}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {ateliereViitoare.length > 0 && (
              <div className="card p-4">
                <h5 style={{ marginBottom: "20px" }}>Ateliere disponibile</h5>
                <div className="d-flex flex-column gap-3">
                  {ateliereViitoare.map(a => (
                    <Link key={a.idatelier} to={"/ateliere/" + a.idatelier} style={{ textDecoration: "none" }}>
                      <div style={{
                        background: "var(--crem)", borderRadius: "12px",
                        padding: "14px 16px", border: "1px solid var(--border)"
                      }}>
                        <div style={{ fontWeight: 500, marginBottom: "6px", color: "var(--text-principal)" }}>{a.denumire}</div>
                        <div className="d-flex gap-3 flex-wrap">
                          <small className="d-flex align-items-center gap-1" style={{ color: "var(--text-secundar)" }}>
                            <img src={calendarIcon} alt="" style={{ width: "14px" }} />
                            {new Date(a.data).toLocaleDateString("ro-RO")}
                          </small>
                          <small className="d-flex align-items-center gap-1" style={{ color: "var(--text-secundar)" }}>
                            <img src={clockIcon} alt="" style={{ width: "14px" }} />
                            {a.ora?.slice(0, 5)}
                          </small>
                          <small className="d-flex align-items-center gap-1" style={{ color: "var(--text-secundar)" }}>
                            <img src={tagIcon} alt="" style={{ width: "14px" }} />
                            {a.pret} RON
                          </small>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="card p-4">
              <h5 style={{ marginBottom: "20px" }}>Statistici</h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span style={{ color: "var(--text-secundar)", fontSize: "0.9rem" }}>Ateliere totale</span>
                  <span style={{ fontWeight: 600 }}>{instructor.nr_ateliere}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: "var(--text-secundar)", fontSize: "0.9rem" }}>Recenzii primite</span>
                  <span style={{ fontWeight: 600 }}>{instructor.recenzii.length}</span>
                </div>
                {instructor.rating_mediu && (
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-secundar)", fontSize: "0.9rem" }}>Rating mediu</span>
                    <span style={{ fontWeight: 600 }}>{instructor.rating_mediu} / 5</span>
                  </div>
                )}
                {ateliereViitoare.length > 0 && (
                  <div className="d-flex justify-content-between">
                    <span style={{ color: "var(--text-secundar)", fontSize: "0.9rem" }}>Ateliere viitoare</span>
                    <span style={{ fontWeight: 600 }}>{ateliereViitoare.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
