import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaCalendarDays, FaClock, FaMagnifyingGlass, FaPhone, FaScissors } from 'react-icons/fa6'
import { formatTurkishMobileInput, getTurkishMobileDigits, isValidTurkishMobileNumber } from '../utils/phone'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''
const lookupSkeletonItems = ['first', 'second', 'third']

function formatAppointmentDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
}

function RandevuSorgula() {
  const [numberId, setNumberId] = useState('')
  const [lookupNumberId, setLookupNumberId] = useState('')
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const normalizedNumberId = useMemo(() => getTurkishMobileDigits(numberId), [numberId])
  const isNumberIdValid = isValidTurkishMobileNumber(numberId)
  const canSearch = isNumberIdValid && !isLoading

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!canSearch) {
      setError('Randevunu sorgulamak icin numarani 5xx xxx xx xx formatinda yaz.')
      return
    }

    setIsLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/appointments/lookup?numberId=${encodeURIComponent(normalizedNumberId)}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Randevu sorgulanamadi.')
      }

      setAppointments(data.appointments || [])
      setLookupNumberId(formatTurkishMobileInput(data.numberId || normalizedNumberId))
    } catch (requestError) {
      setAppointments([])
      setLookupNumberId('')
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="lookup-page">
      <motion.section
        className="lookup-shell"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="lookup-heading">
          <span>Randevu Sorgula</span>
          <h1>Numaranla Randevunu Bul</h1>
          <p>Randevu alirken girdigin telefon numarasi ayni zamanda Numara ID olarak kaydedilir.</p>
        </div>

        <form className="lookup-form" onSubmit={handleSubmit}>
          <label>
            <span>Telefon / Numara ID</span>
            <div className="lookup-input">
              <FaPhone aria-hidden="true" />
              <input
                type="tel"
                value={numberId}
                onChange={(event) => setNumberId(formatTurkishMobileInput(event.target.value))}
                placeholder="5xx xxx xx xx"
                autoComplete="tel"
                inputMode="numeric"
                pattern="5[0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}"
                title="5xx xxx xx xx formatinda girin"
                aria-invalid={numberId ? !isNumberIdValid : undefined}
              />
            </div>
            <small className={`phone-format-hint ${numberId && !isNumberIdValid ? 'is-invalid' : ''}`}>
              5xx xxx xx xx formatinda olmalidir.
            </small>
          </label>
          <button type="submit" disabled={!canSearch}>
            <FaMagnifyingGlass aria-hidden="true" />
            Sorgula
          </button>
        </form>

        {error && <p className="lookup-error">{error}</p>}

        <section className="lookup-results" aria-live="polite">
          {isLoading &&
            lookupSkeletonItems.map((item) => (
              <article className="lookup-appointment-card lookup-appointment-skeleton" key={item}>
                <i className="appointment-skeleton lookup-skeleton-title" />
                <i className="appointment-skeleton lookup-skeleton-line" />
                <i className="appointment-skeleton lookup-skeleton-line is-short" />
              </article>
            ))}

          {!isLoading && hasSearched && appointments.length === 0 && !error && (
            <div className="lookup-empty">
              <FaMagnifyingGlass aria-hidden="true" />
              <strong>Randevu bulunamadi</strong>
              <p>Bu Numara ID ile kayitli bir randevu gorunmuyor.</p>
              <a href="/randevu">Yeni randevu al</a>
            </div>
          )}

          {!isLoading && appointments.length > 0 && (
            <>
              <div className="lookup-result-meta">
                <span>Numara ID</span>
                <strong>{lookupNumberId}</strong>
              </div>

              {appointments.map((appointment) => (
                <article className="lookup-appointment-card" key={appointment.id}>
                  <header>
                    <div>
                      <span>{formatAppointmentDate(appointment.date)}</span>
                      <strong>{appointment.time}</strong>
                    </div>
                    <small>{appointment.status === 'booked' ? 'Aktif randevu' : appointment.status}</small>
                  </header>

                  <div className="lookup-detail-grid">
                    <div>
                      <FaScissors aria-hidden="true" />
                      <span>{appointment.serviceName}</span>
                    </div>
                    <div>
                      <FaClock aria-hidden="true" />
                      <span>{appointment.serviceTime}</span>
                    </div>
                    <div>
                      <FaCalendarDays aria-hidden="true" />
                      <span>{appointment.servicePrice}</span>
                    </div>
                  </div>
                </article>
              ))}
            </>
          )}
        </section>
      </motion.section>
    </main>
  )
}

export default RandevuSorgula
