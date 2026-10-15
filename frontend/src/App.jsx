import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Despre from './pages/Despre'
import Contact from './pages/Contact'
import DetaliiAtelier from './pages/DetaliiAtelier'
import Dashboard from './pages/Dashboard'
import Ateliere from './pages/Ateliere' 
import InscrierileMele from './pages/InscrierileMele'
import ContulMeu from './pages/ContulMeu'
import ProfilInstructor from './pages/ProfilInstructor'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/despre" element={<Despre />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ateliere/:id" element={<DetaliiAtelier />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ateliere" element={<Ateliere />} />
        <Route path="/inscrierile-mele" element={<InscrierileMele />} />
        <Route path="/contul-meu" element={<ContulMeu />} />
        <Route path="/instructor/:id" element={<ProfilInstructor />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default App