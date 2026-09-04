import { FaAngleUp, FaInstagram, FaPhoneAlt } from 'react-icons/fa'

const footerLinks = [
  {
    title: 'Kesfet',
    links: [
      { label: 'Hakkimizda', href: '#next-section' },
      { label: 'Galeri', href: '#galeri' },
      { label: 'Yorumlar', href: '#yorumlar' },
      { label: 'Randevu Al', href: '/randevu' },
    ],
  },
  {
    title: 'Sayfalar',
    links: [
      { label: 'Iletisim', href: '#iletisim' },
      { label: 'S.S.S', href: '#sss' },
      { label: 'KVKK', href: '/kvkk' },
      { label: 'Randevu Sorgula', href: '/randevu-sorgula' },
    ],
  },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/zmamix1/',
    Icon: FaInstagram,
  },
  {
    label: 'Telefon',
    href: 'tel:+905364159742',
    Icon: FaPhoneAlt,
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-nav">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <span>{group.title}</span>
                {group.links.map((link) => (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="footer-contact">
            <span>Iletisim</span>
            <p>Cankiri Merkez</p>
            <p>Pzt-Cmt 10:00-21:00 - Paz Kapali</p>
            <a href="tel:+905364159742">+90 536 415 97 42</a>
          </div>

          <div className="footer-social">
            <span>Takip Et</span>
            <div>
              {socialLinks.map(({ href, Icon, label }) => (
                <a href={href} aria-label={label} key={label}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-meta">
          <span>&copy; 2026 Muhammed Barber</span>
          <a href="#top" aria-label="Sayfanin basina don">
            <FaAngleUp aria-hidden="true" />
          </a>
        </div>

        <strong className="footer-brand">
          Muhammed <span>Barber</span>
        </strong>

        <a className="footer-credit" href="https://nasibkarimzade.vercel.app/" target="_blank" rel="noreferrer">
          <span>Design & Development</span>
          <strong>nK</strong>
        </a>
      </div>
    </footer>
  )
}

export default Footer
