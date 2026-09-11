import { FaArrowLeft, FaCalendarCheck } from 'react-icons/fa6'

function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-shell">
        <span>404</span>
        <h1>Sayfa Bulunamadi</h1>
        <p>Aradigin sayfa tasinmis ya da hic olusturulmamis olabilir.</p>
        <div className="not-found-actions">
          <a href="/">
            <FaArrowLeft aria-hidden="true" />
            Ana sayfa
          </a>
          <a href="/randevu">
            <FaCalendarCheck aria-hidden="true" />
            Randevu al
          </a>
        </div>
      </section>
    </main>
  )
}

export default NotFound
