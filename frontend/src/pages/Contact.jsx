import { useState } from 'react'
import axios from 'axios'
import { emailValid } from '../utils/validare'
import atelier4 from '../assets/atelier4.jpg'
import letterIcon from '../assets/letter.png'
import phoneIcon from '../assets/phone-call.png'
import locationIcon from '../assets/location.png'
import clockIcon from '../assets/clock.png'

export default function Contact() {
  const [form, setForm] = useState({ nume: '', email: '', subiect: '', mesaj: '' })
  const [trimis, setTrimis] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const [eroare, setEroare] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEroare('')
    if (!form.nume.trim() || !form.subiect.trim() || !form.mesaj.trim()) {
      setEroare('Completeaza toate campurile.')
      return
    }
    if (!emailValid(form.email)) {
      setEroare('Adresa de email nu este valida (ex: adresa@email.com).')
      return
    }
    try {
      await axios.post('http://localhost:8000/contact', form)
      setTrimis(true)
    } catch {
      setEroare('A aparut o eroare. Incearca din nou.')
    }
  }

  return (
    <div className="contact-page">

      <div className="page-hero">
        <img src={atelier4} alt="Contact" className="page-hero-image" />
        <div className="page-hero-overlay">
          <h1 className="page-hero-title">Contact</h1>
          <p className="page-hero-subtitle page-hero-subtitle-sm">
            Ai intrebari sau sugestii? Suntem aici pentru tine
          </p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          <div className="col-md-4">
            <h4 className="section-heading-lg">Informatii de contact</h4>
            {[
              { icon: letterIcon, titlu: 'Email', info: 'contact@craftmanager.ro' },
              { icon: phoneIcon, titlu: 'Telefon', info: '+40 712 345 678' },
              { icon: locationIcon, titlu: 'Adresa', info: 'Constanta, Romania' },
              { icon: clockIcon, titlu: 'Program', info: 'Lun - Vin: 9:00 - 18:00' },
            ].map((item, i) => (
              <div key={i} className="d-flex align-items-start gap-3 mb-4">
                <div className="contact-info-icon-box">
                  <img src={item.icon} alt={item.titlu} className="icon-contact" />
                </div>
                <div>
                  <div className="contact-info-title">{item.titlu}</div>
                  <div className="contact-info-text">{item.info}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-md-8">
            <div className="card p-4">
              {trimis ? (
                <div className="text-center py-5">
                  <img src={letterIcon} alt="trimis" className="icon-hero" />
                  <h4 className="section-heading-sm">Mesaj trimis!</h4>
                  <p className="section-text">Iti vom raspunde in cel mai scurt timp posibil.</p>
                  <button className="btn btn-primary" onClick={() => setTrimis(false)}>Trimite alt mesaj</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h4 className="section-heading-lg">Trimite un mesaj</h4>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nume</label>
                      <input name="nume" className="form-control" placeholder="Numele tau" value={form.nume} onChange={handleChange} maxLength={100} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input name="email" type="email" className="form-control" placeholder="adresa@email.com" value={form.email} onChange={handleChange} maxLength={200} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subiect</label>
                    <input name="subiect" className="form-control" placeholder="Despre ce vrei sa ne scrii?" value={form.subiect} onChange={handleChange} maxLength={200} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Mesaj</label>
                    <textarea name="mesaj" className="form-control" placeholder="Mesajul tau..." value={form.mesaj} onChange={handleChange} rows={5} maxLength={2000} required />
                  <div className="form-text text-end">{form.mesaj.length}/2000</div>
                  </div>
                  {eroare && <div className="alert alert-danger py-2 mb-3">{eroare}</div>}
                  <button type="submit" className="btn btn-primary px-5">Trimite mesajul</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
