
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './Pages/Home'
import Randevu from './Pages/Randevu'
import Kvkk from './Pages/Kvkk'

function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/randevu" element={<Randevu />} />
        <Route path="/kvkk" element={<Kvkk />} />
      </Routes>
    </>
  )
}

export default App
