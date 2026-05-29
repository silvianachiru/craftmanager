import { useAuth } from '../context/AuthContext'
import atelierPoza from '../assets/atelier1.jpg'
import studioPoza from '../assets/atelier2.jpg'
import artIcon from '../assets/art.png'
import natureIcon from '../assets/nature.png'
import presentationIcon from '../assets/presentation.png'
import calendarIcon from '../assets/calendar.png'

export default function Despre() {
  const { utilizator } = useAuth()
  return (
    <div className="despre-page">

      <div className="page-hero">
        <img
          src={atelierPoza}
          alt="Atelier creativ"
          className="page-hero-image"
        />
        <div className="page-hero-overlay">
          <h1 className="page-hero-title">Despre CraftManager</h1>
          <p className="page-hero-subtitle">
            O platforma dedicata atelierelor creative si comunitatii pasionate de arta si handmade
          </p>
        </div>
      </div>

      <div className="container py-5">

        <div className="row align-items-center mb-5 g-5">
          <div className="col-md-6">
            <h2 className="section-heading-md">Misiunea noastra</h2>
            <p className="section-text section-text-spacious">
              CraftManager s-a nascut din dorinta de a conecta oamenii pasionati de creativitate cu instructori
              talentati care vor sa impartaseasca din cunostintele lor. Credem ca fiecare persoana are un artist
              in interior care asteapta sa fie descoperit.
            </p>
            <p className="section-text section-text-spacious">
              Platforma noastra simplifica procesul de organizare si participare la ateliere creative,
              oferind o experienta moderna si intuitiva atat pentru organizatori, cat si pentru participanti.
            </p>
          </div>
          <div className="col-md-6">
            <img
              src={studioPoza}
              alt="Studio creativ"
              className="despre-studio-image"
            />
          </div>
        </div>

        <div className="row g-4 mb-5">
          {[
            { icon: artIcon, titlu: 'Ateliere diverse', text: 'De la pictura si ceramica pana la fotografie si dezvoltare personala, gasesti ceva pentru fiecare pasiune.' },
            { icon: presentationIcon, titlu: 'Instructori talentati', text: 'Toti instructorii nostri sunt pasionati de ceea ce predau, garantand o experienta de calitate.' },
            { icon: natureIcon, titlu: 'Comunitate prietenoasa', text: 'Un spatiu sigur si relaxant unde poti invata si te poti conecta cu oameni care iti impartasesc pasiunile.' },
            { icon: calendarIcon, titlu: 'Organizare simpla', text: 'Inscrieri online, gestionare facila a atelierelor si notificari, totul intr-un singur loc.' },
          ].map((item, i) => (
            <div key={i} className="col-md-3">
              <div className="card h-100 text-center p-4">
                <div className="despre-feature-icon-wrap">
                  <img
                    src={item.icon}
                    alt={item.titlu}
                    className="despre-feature-icon"
                  />
                </div>
                <h5 className="section-heading-sm">
                  {item.titlu}
                </h5>
                <p className="section-text-sm">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="despre-cta">
          <h2 className="section-heading-md">Gata sa incepi?</h2>
          <p className="section-text cta-text">
            Alatura-te comunitatii noastre si descopera primul tau atelier creativ
          </p>
          {!utilizator && (
            <a href="/register" className="btn btn-primary px-5">
              Inregistreaza-te gratuit
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
