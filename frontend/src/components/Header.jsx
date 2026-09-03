import { useState } from 'react'
import { HiOutlineMenuAlt4 } from 'react-icons/hi'
import { IoCloseOutline } from 'react-icons/io5'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuLinks = ['Hakkimizda', 'Hizmetler', 'Galeri', 'Iletisim']

  return (
    <header className="site-header">
      <a className="site-logo" href="/" aria-label="Ana sayfa">
        <img src="/logo.png" alt="Logo" />
      </a>

      <button
        className="menu-button"
        type="button"
        aria-label={isMenuOpen ? 'Menuyu kapat' : 'Menuyu ac'}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        {isMenuOpen ? <IoCloseOutline /> : <HiOutlineMenuAlt4 />}
      </button>

      <nav className={`header-menu ${isMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="header-menu-content">
          <a className="menu-logo" href="/" aria-label="Ana sayfa">
            <img src="/logo.png" alt="Logo" />
          </a>

          <div className="header-menu-links">
            {menuLinks.map((link) => (
              <a key={link} href={`/${link.toLowerCase()}`}>
                {link}
              </a>
            ))}
          </div>

          <div className="menu-footer">
            <div className="menu-footer-links">
              <a href="/">Ana Sayfa</a>
              <span>-</span>
              <a href="/ekibimiz">Ekibimiz</a>
              <span>-</span>
              <a href="/yorumlar">Yorumlar</a>
              <span>-</span>
              <a href="/iletisim">Iletisim</a>
            </div>
            <div className="menu-contact">
              <span>+90 538 811 78 68</span>
              <span>-</span>
              <span>@muhammed_barbers</span>
            </div>
          </div>

          <a className="appointment-link" href="/randevu">
            Randevu Al
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Header
