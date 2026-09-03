import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'

const services = [
  { name: 'Sac, Sakal Kesimi ve Yikama', price: '500 TL', time: '55 dk' },
  { name: 'Sac kesimi', price: '350 TL', time: '35 dk' },
  { name: 'Sakal tirasi', price: '200 TL', time: '20 dk' },
  { name: 'Cocuk kesimi', price: '250 TL', time: '25 dk' },
  { name: 'Damat bakimi', price: '900 TL', time: '75 dk' },
]

const timeSlots = [
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
]

const pageReveal = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
}

function getDateOptions() {
  const weekdayFormatter = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' })
  const monthFormatter = new Intl.DateTimeFormat('tr-TR', { month: 'short' })

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)

    return {
      value: date.toISOString().split('T')[0],
      weekday: index === 0 ? 'Bugun' : weekdayFormatter.format(date),
      day: date.getDate(),
      month: monthFormatter.format(date),
    }
  })
}

function Randevu() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(services[0])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const dateOptions = useMemo(() => getDateOptions(), [])
  const isReadyToConfirm = selectedService && selectedDate && selectedTime
  const selectedDateInfo = dateOptions.find((date) => date.value === selectedDate)
  const selectedDateLabel = selectedDateInfo
    ? `${selectedDateInfo.weekday} ${selectedDateInfo.day} ${selectedDateInfo.month}`
    : ''
  const isCustomerReady = customerName.trim() && customerPhone.trim()
  const canContinue =
    (step === 1 && selectedService) ||
    (step === 2 && selectedDate) ||
    (step === 3 && selectedTime) ||
    (step === 4 && isReadyToConfirm)

  return (
    <main className="appointment-page">
      <motion.section className="appointment-shell" {...pageReveal}>
        <span className="appointment-brand">Muhammed Barbers</span>
        <h1>Randevu Al</h1>
        <p>Hizmetini sec, tarihini ve saatini belirle. Koltugun hazir olsun.</p>

        <button className="selected-service-bar" type="button" onClick={() => setStep(1)}>
          <div>
            <span>Secimleriniz</span>
            <strong>
              {selectedService.name} - {selectedService.price} - {selectedService.time}
            </strong>
          </div>
          <FaChevronRight aria-hidden="true" />
        </button>

        <div className="appointment-card">
          <div className="appointment-lines" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((line) => (
              <span className={line <= step ? 'is-active' : ''} key={line} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                className="appointment-panel"
                key="service"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2>Islem Secin</h2>
                <div className="appointment-services">
                  {services.map((service) => (
                    <button
                      className={`appointment-service ${selectedService.name === service.name ? 'is-selected' : ''}`}
                      type="button"
                      key={service.name}
                      onClick={() => {
                        setSelectedService(service)
                        setSelectedDate('')
                        setSelectedTime('')
                      }}
                    >
                      <div>
                        <strong>{service.name}</strong>
                        <span>{service.time}</span>
                      </div>
                      <b>{service.price}</b>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                className="appointment-panel"
                key="date"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2>Tarih Secin</h2>
                <div className="date-grid">
                  {dateOptions.map((date) => (
                    <button
                      className={selectedDate === date.value ? 'is-selected' : ''}
                      type="button"
                      key={date.value}
                      onClick={() => {
                        setSelectedDate(date.value)
                        setSelectedTime('')
                      }}
                    >
                      <span>{date.weekday}</span>
                      <strong>{date.day}</strong>
                      <i>{date.month}</i>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                className="appointment-panel"
                key="time"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2>Saat Secin</h2>
                <div className="time-grid">
                  {timeSlots.map((time) => (
                    <button
                      className={selectedTime === time ? 'is-selected' : ''}
                      type="button"
                      key={time}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                className="appointment-panel"
                key="summary"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2>Secimlerin</h2>
                <div className="appointment-review-list">
                  <div>
                    <span>Islem</span>
                    <strong>{selectedService.name}</strong>
                  </div>
                  <div>
                    <span>Fiyat / sure</span>
                    <strong>
                      {selectedService.price} - {selectedService.time}
                    </strong>
                  </div>
                  <div>
                    <span>Tarih</span>
                    <strong>{selectedDateLabel}</strong>
                  </div>
                  <div>
                    <span>Saat</span>
                    <strong>{selectedTime}</strong>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                className="appointment-panel"
                key="customer"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2>Bilgilerin</h2>
                <div className="customer-form">
                  <label>
                    <span>Ad Soyad</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Adinizi ve soyadinizi yazin"
                      required
                    />
                  </label>
                  <label>
                    <span>Telefon Numarasi</span>
                    <div className="phone-input">
                      <button type="button">TR +90</button>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(event) => setCustomerPhone(event.target.value)}
                        placeholder="5xx xxx xx xx"
                        required
                      />
                    </div>
                  </label>
                  <label>
                    <span>Not (Opsiyonel)</span>
                    <textarea
                      value={customerNote}
                      onChange={(event) => setCustomerNote(event.target.value)}
                      placeholder="Eklemek istediginiz bir sey var mi?"
                    />
                  </label>

                  <label className="kvkk-check">
                    <input
                      type="checkbox"
                      checked={isKvkkAccepted}
                      onChange={(event) => setIsKvkkAccepted(event.target.checked)}
                    />
                    <span>
                      <a href="/kvkk" target="_blank" rel="noreferrer">
                        KVKK Aydinlatma Metni
                      </a>
                      ni okudum; bilgilerimin randevu amaciyla islenmesini onayliyorum.
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                className="appointment-panel completion-panel"
                key="complete"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span>Tamamlandi</span>
                <h2>Randevun Alindi</h2>
                <p>
                  {customerName}, {selectedDateLabel} tarihinde saat {selectedTime} icin
                  randevu talebin olusturuldu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCompleted && (
            <div className="appointment-bottom">
              <button
                className="wizard-back"
                type="button"
                disabled={step === 1}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
              >
                <FaChevronLeft aria-hidden="true" />
                Geri
              </button>
              {step < 5 ? (
                <button
                  className="wizard-next"
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep((current) => Math.min(5, current + 1))}
                >
                  Devam
                  <FaChevronRight aria-hidden="true" />
                </button>
              ) : (
                <button
                  className="wizard-next"
                  type="button"
                  disabled={!isReadyToConfirm || !isCustomerReady || !isKvkkAccepted}
                  onClick={() => {
                    setIsCompleted(true)
                    setStep(6)
                  }}
                >
                  Randevuyu Tamamla
                  <FaChevronRight aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.section>
    </main>
  )
}

export default Randevu
