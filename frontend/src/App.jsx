
import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Home from './Pages/Home'
import Randevu from './Pages/Randevu'
import RandevuSorgula from './Pages/RandevuSorgula'
import Kvkk from './Pages/Kvkk'
import Admin from './Pages/Admin'

function App() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminPage && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/randevu" element={<Randevu />} />
        <Route path="/randevu-sorgula" element={<RandevuSorgula />} />
        <Route path="/kvkk" element={<Kvkk />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/gun-kapat" element={<Admin />} />
        <Route path="/admin/saat-kapat" element={<Admin />} />
        <Route path="/admin/numara-engelle" element={<Admin />} />
        <Route path="/admin/fiyatlar" element={<Admin />} />
        <Route path="/admin/islem-ekle" element={<Admin />} />
        <Route path="/admin/islem-sil" element={<Admin />} />
      </Routes>
    </>
  )
}

export default App
