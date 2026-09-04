import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaArrowRightFromBracket,
  FaBan,
  FaBars,
  FaCalendarDays,
  FaCalendarCheck,
  FaCheck,
  FaChartSimple,
  FaCircleInfo,
  FaClock,
  FaFilePdf,
  FaFloppyDisk,
  FaLock,
  FaPhone,
  FaPlus,
  FaRotateRight,
  FaTags,
  FaTrash,
  FaTrashCan,
  FaUserTie,
  FaXmark,
} from 'react-icons/fa6'
import { formatLocalDate } from '../utils/date'
import './Admin.css'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const sections = {
  '/admin': {
    title: 'Randevular',
    eyebrow: 'Randevu Takibi',
    description: 'Günlük randevuları takip et, telefon numarasını gör ve gelmeyen müşteriyi tek tıkla engelle.',
  },
  '/admin/gun-kapat': {
    title: 'Gün Kapat',
    eyebrow: 'Takvim Yönetimi',
    description: 'Çalışma olmayacak tarihleri kapat ve kapalı günleri listeden tekrar aç.',
  },
  '/admin/saat-kapat': {
    title: 'Saat Kapat',
    eyebrow: 'Saat Yönetimi',
    description: 'Belirli bir günde belirli saatleri randevuya kapat ve tekrar aç.',
  },
  '/admin/numara-engelle': {
    title: 'Numara Engelle',
    eyebrow: 'Müşteri Kontrolü',
    description: 'Randevuya gelmeyen veya alınmayacak telefon numaralarını yönet.',
  },
  '/admin/fiyatlar': {
    title: 'Fiyatlar',
    eyebrow: 'Hizmet Yönetimi',
    description: 'Mevcut işlemlerin fiyatlarını ve sürelerini güncelle.',
  },
  '/admin/islem-ekle': {
    title: 'İşlem Ekle',
    eyebrow: 'Yeni Hizmet',
    description: 'Randevu sayfasında görünecek yeni bir işlem oluştur.',
  },
  '/admin/islem-sil': {
    title: 'İşlem Sil',
    eyebrow: 'Hizmet Temizliği',
    description: 'Artık alınmayacak işlemleri randevu ve fiyat listelerinden kaldır.',
  },
}

const navItems = [
  { to: '/admin', label: 'Randevular', icon: FaCalendarDays },
  { to: '/admin/gun-kapat', label: 'Gün Kapat', icon: FaBan },
  { to: '/admin/saat-kapat', label: 'Saat Kapat', icon: FaClock },
  { to: '/admin/numara-engelle', label: 'Numara Engelle', icon: FaPhone },
  { to: '/admin/fiyatlar', label: 'Fiyatlar', icon: FaTags },
  { to: '/admin/islem-ekle', label: 'İşlem Ekle', icon: FaPlus },
  { to: '/admin/islem-sil', label: 'İşlem Sil', icon: FaTrash },
]

const statItems = [
  { label: 'Seçili Gün', key: 'date', icon: FaCalendarCheck, variant: 'stat-blue' },
  { label: 'Randevu', key: 'appointments', icon: FaChartSimple, variant: 'stat-indigo' },
  { label: 'Kapalı Gün', key: 'closedDays', icon: FaBan, variant: 'stat-amber' },
  { label: 'Kapalı Saat', key: 'blockedSlots', icon: FaClock, variant: 'stat-orange' },
  { label: 'Engelli Numara', key: 'blockedPhones', icon: FaPhone, variant: 'stat-rose' },
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

const skeletonRows = [0, 1, 2, 3]
const serviceSkeletonRows = [0, 1, 2, 3, 4]
const chipSkeletonRows = [0, 1, 2]

function Admin() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = sections[location.pathname] ? location.pathname : '/admin'
  const currentSection = sections[currentPath]
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '')
  const [dashboard, setDashboard] = useState({
    services: [],
    closedDays: [],
    blockedSlots: [],
    blockedPhones: [],
    appointments: [],
  })
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()))
  const [selectedSlotTime, setSelectedSlotTime] = useState(timeSlots[0])
  const [blockedSlotNote, setBlockedSlotNote] = useState('')
  const [closedDayNote, setClosedDayNote] = useState('')
  const [blockedPhone, setBlockedPhone] = useState('')
  const [blockedPhoneNote, setBlockedPhoneNote] = useState('')
  const [newService, setNewService] = useState({ name: '', price: '', time: '', detail: '' })
  const [status, setStatus] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)

  const isAuthenticated = Boolean(token)
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])
  const isStatusLoading = status.endsWith('...')

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) return

    setIsDashboardLoading(true)
    setStatus('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/dashboard?date=${selectedDate}`, {
        headers: authHeaders,
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken')
          setToken('')
          throw new Error('Oturum süresi doldu veya şifre geçersiz.')
        }
        throw new Error(data.message || 'Admin bilgileri alınamadı.')
      }

      setDashboard({
        ...data,
        services: data.services || [],
        closedDays: data.closedDays || [],
        blockedSlots: data.blockedSlots || [],
        blockedPhones: data.blockedPhones || [],
        appointments: [...(data.appointments || [])].sort((a, b) => a.time.localeCompare(b.time)),
      })
      setStatus('')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setIsDashboardLoading(false)
    }
  }, [authHeaders, isAuthenticated, selectedDate])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard, location.pathname])

  const login = async (event) => {
    event.preventDefault()
    if (!password) return

    setStatus('Giriş yapılıyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/dashboard?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${password}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Şifre hatalı.')
      }

      localStorage.setItem('adminToken', password)
      setToken(password)
      setDashboard({
        ...data,
        services: data.services || [],
        closedDays: data.closedDays || [],
        blockedSlots: data.blockedSlots || [],
        blockedPhones: data.blockedPhones || [],
        appointments: [...(data.appointments || [])].sort((a, b) => a.time.localeCompare(b.time)),
      })
      setStatus('')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
    setPassword('')
    navigate('/admin')
  }

  const updateService = async (service) => {
    setStatus('Fiyat guncelleniyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Hizmet guncellenemedi.')
      }

      setDashboard((current) => ({
        ...current,
        services: current.services.map((item) => (item.id === data.service.id ? data.service : item)),
      }))
      setStatus('Fiyat guncellendi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const closeSelectedDay = async (event) => {
    event.preventDefault()
    setStatus('Gun kapatiliyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/closed-days`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate, note: closedDayNote }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Gun kapatilamadi.')
      }

      setClosedDayNote('')
      await loadDashboard()
      setStatus('Gun randevuya kapatildi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const openClosedDay = async (date) => {
    setStatus('Gun aciliyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/closed-days/${date}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Gun acilamadi.')
      }

      await loadDashboard()
      setStatus('Gun tekrar acildi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const closeSelectedSlot = async (event) => {
    event.preventDefault()
    setStatus('Saat kapatiliyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/blocked-slots`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: selectedDate, time: selectedSlotTime, note: blockedSlotNote }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Saat kapatilamadi.')
      }

      setBlockedSlotNote('')
      await loadDashboard()
      setStatus('Saat randevuya kapatildi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const openBlockedSlot = async (slotId) => {
    setStatus('Saat aciliyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/blocked-slots/${slotId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Saat acilamadi.')
      }

      await loadDashboard()
      setStatus('Saat tekrar acildi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const blockPhone = async (phone, note = '') => {
    setStatus('Numara engelleniyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/blocked-phones`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, note }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Numara engellenemedi.')
      }

      setBlockedPhone('')
      setBlockedPhoneNote('')
      await loadDashboard()
      setStatus('Numara engellendi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const blockSelectedPhone = async (event) => {
    event.preventDefault()
    await blockPhone(blockedPhone, blockedPhoneNote)
  }

  const blockAppointmentPhone = async (appointment) => {
    await blockPhone(
      appointment.customerPhone,
      `Randevuya gelmedi: ${appointment.customerName} - ${appointment.date} ${appointment.time}`,
    )
  }

  const deleteSelectedAppointment = async (appointmentId) => {
    if (!window.confirm('Bu randevu silinsin mi?')) return
    setStatus('Randevu siliniyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Randevu silinemedi.')
      }

      setDashboard((current) => ({
        ...current,
        appointments: current.appointments.filter((a) => a.id !== appointmentId),
      }))
      setStatus('Randevu silindi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const unblockSelectedPhone = async (phone) => {
    setStatus('Engel kaldiriliyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/blocked-phones/${phone}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Engel kaldirilamadi.')
      }

      await loadDashboard()
      setStatus('Numara engeli kaldirildi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const downloadDailyPdf = async () => {
    setStatus('PDF hazirlaniyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/appointments/pdf?date=${selectedDate}`, {
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'PDF indirilemedi.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `randevular-${selectedDate}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      setStatus('PDF indirildi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const setServiceValue = (serviceId, key, value) => {
    setDashboard((current) => ({
      ...current,
      services: current.services.map((service) => (service.id === serviceId ? { ...service, [key]: value } : service)),
    }))
  }

  const setNewServiceValue = (key, value) => {
    setNewService((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const createNewService = async (event) => {
    event.preventDefault()
    setStatus('Islem ekleniyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/services`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Islem eklenemedi.')
      }

      setDashboard((current) => ({
        ...current,
        services: [...current.services, data.service],
      }))
      setNewService({ name: '', price: '', time: '', detail: '' })
      setStatus('Yeni islem eklendi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const deleteSelectedService = async (serviceId) => {
    setStatus('Islem siliniyor...')

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Islem silinemedi.')
      }

      setDashboard((current) => ({
        ...current,
        services: current.services.filter((service) => service.id !== serviceId),
      }))
      setStatus('Islem silindi.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <img className="admin-brand-logo" src="/logo.png" alt="Muhammed Barber logo" />
          <span>Admin Panel</span>
          <h1>Muhammed Barber</h1>
          <label>
            Sifre
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
          </label>
          <button type="submit">
            <FaLock aria-hidden="true" />
            Giris Yap
          </button>
          {status && !isStatusLoading && (
            <p className="admin-status">
              <FaCircleInfo aria-hidden="true" />
              {status}
            </p>
          )}
        </form>
      </main>
    )
  }

  return (
    <main className={`admin-dashboard ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
      <header className="admin-mobile-topbar">
        <button
          className="admin-mobile-menu-button"
          type="button"
          onClick={() => setIsSidebarOpen((current) => !current)}
          aria-label={isSidebarOpen ? 'Menuyu kapat' : 'Menuyu ac'}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>

        <div className="admin-mobile-brand">
          <img className="admin-brand-logo" src="/logo.png" alt="Muhammed Barber logo" />
          <strong>Muhammed Barber</strong>
        </div>
      </header>

      <button
        className="admin-sidebar-backdrop"
        type="button"
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Menuyu kapat"
      />

      <aside className="admin-dashboard-sidebar">
        <div className="admin-sidebar-brand">
          <img className="admin-brand-logo" src="/logo.png" alt="Muhammed Barber logo" />
          <div>
            <strong>Muhammed Barber</strong>
            <span>Admin Dashboard</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                className={currentPath === item.to ? 'is-active' : ''}
                to={item.to}
                key={item.to}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button className="admin-logout-button" type="button" onClick={logout}>
          <FaArrowRightFromBracket aria-hidden="true" />
          Çıkış
        </button>
      </aside>

      <section className="admin-dashboard-main">
        <header className="admin-topbar">
          <div>
            <span>{currentSection.eyebrow}</span>
            <h1>{currentSection.title}</h1>
            <p>{currentSection.description}</p>
          </div>
          {(isDashboardLoading || isStatusLoading) && (
            <div className="admin-status-skeleton admin-skeleton" aria-label="Yukleniyor" />
          )}
          {status && !isStatusLoading && !isDashboardLoading && (
            <p className="admin-status">
              <FaCircleInfo aria-hidden="true" />
              {status}
            </p>
          )}
        </header>

        <div className="admin-stat-grid">
          {statItems.map((item) => {
            const Icon = item.icon
            const value =
              item.key === 'date'
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : dashboard[item.key].length

            return (
              <div className={`admin-stat-card ${item.variant}`} key={item.key}>
                <div className="admin-stat-icon">
                  <Icon aria-hidden="true" />
                </div>
                <span>{item.label}</span>
                {isDashboardLoading ? (
                  <i className="admin-skeleton admin-stat-skeleton" aria-hidden="true" />
                ) : (
                  <strong>{value}</strong>
                )}
              </div>
            )
          })}
        </div>

        {currentPath === '/admin' && (
          <section className="admin-content-card">
            <div className="admin-card-toolbar">
              <label className="admin-toolbar-date">
                <span>Tarih Seç</span>
                <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
              <div className="admin-toolbar-actions">
                <button type="button" className="admin-btn-refresh" onClick={loadDashboard}>
                  <FaRotateRight aria-hidden="true" />
                  Yenile
                </button>
                <button type="button" className="admin-btn-pdf" onClick={downloadDailyPdf}>
                  <FaFilePdf aria-hidden="true" />
                  PDF 
                </button>
              </div>
            </div>

            {isDashboardLoading ? (
              <div className="admin-table-skeleton">
                {skeletonRows.map((row) => (
                  <div className="admin-skeleton-row" key={row}>
                    <i className="admin-skeleton admin-skeleton-time" />
                    <i className="admin-skeleton admin-skeleton-name" />
                    <i className="admin-skeleton admin-skeleton-phone" />
                    <i className="admin-skeleton admin-skeleton-action" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Saat</th>
                    <th>Musteri</th>
                    <th>Telefon</th>
                    <th>Hizmet</th>
                    <th>Not</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.appointments.length === 0 && (
                    <tr className="admin-empty-row">
                      <td colSpan="6" style={{padding:"10px"}} className="admin-empty-cell">
                        Bu tarih icin randevu yok.
                      </td>
                    </tr>
                  )}
                  {dashboard.appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td data-label="Saat" className="admin-time-cell">
                        {appointment.time}
                      </td>
                      <td data-label="Musteri">
                        <strong>{appointment.customerName}</strong>
                      </td>
                      <td data-label="Telefon">
                        <a className="admin-phone-link" href={`tel:${appointment.customerPhone}`}>
                          <FaPhone aria-hidden="true" />
                          {appointment.customerPhone}
                        </a>
                      </td>
                      <td data-label="Hizmet">{appointment.serviceName}</td>
                      <td data-label="Not">{appointment.customerNote || '-'}</td>
                      <td data-label="Aksiyon">
                        <div className="admin-action-group">
                          <button
                            className="admin-danger-button"
                            type="button"
                            onClick={() => blockAppointmentPhone(appointment)}
                          >
                            <FaBan aria-hidden="true" />
                            Engelle
                          </button>
                          <button
                            className="admin-danger-button admin-delete-button"
                            type="button"
                            onClick={() => deleteSelectedAppointment(appointment.id)}
                            aria-label="Randevuyu sil"
                          >
                            <FaTrashCan aria-hidden="true" />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </section>
        )}

        {currentPath === '/admin/gun-kapat' && (
          <section className="admin-two-column">
            <form className="admin-content-card admin-form-card" onSubmit={closeSelectedDay}>
              <h2>Gün Kapat</h2>
              <div className="admin-form-fields">
                <label>
                  <span>Tarih</span>
                  <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                </label>
                <label>
                  <span>Not</span>
                  <input value={closedDayNote} onChange={(event) => setClosedDayNote(event.target.value)} placeholder="Örn. İzin günü" />
                </label>
                <button type="submit" className="admin-submit-btn">
                  <FaBan aria-hidden="true" />
                  Günü Kapat
                </button>
              </div>
            </form>

            <section className="admin-content-card">
              <h2>Kapalı Günler</h2>
              <div className="admin-chip-list">
                {isDashboardLoading
                  ? chipSkeletonRows.map((row) => <i className="admin-skeleton admin-chip-skeleton" key={row} />)
                  : dashboard.closedDays.length === 0 && <p>Kapalı gün yok.</p>}
                {!isDashboardLoading &&
                  dashboard.closedDays.map((day) => (
                    <button type="button" key={day.date} onClick={() => openClosedDay(day.date)}>
                      {day.date}
                      <span>
                        <FaCheck aria-hidden="true" />
                        Aç
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </section>
        )}

        {currentPath === '/admin/saat-kapat' && (
          <section className="admin-two-column">
            <form className="admin-content-card admin-form-card" onSubmit={closeSelectedSlot}>
              <h2>Saat Kapat</h2>
              <div className="admin-form-fields">
                <label>
                  <span>Tarih</span>
                  <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                </label>
                <label>
                  <span>Saat</span>
                  <select value={selectedSlotTime} onChange={(event) => setSelectedSlotTime(event.target.value)}>
                    {timeSlots.map((time) => (
                      <option value={time} key={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Not</span>
                  <input
                    value={blockedSlotNote}
                    onChange={(event) => setBlockedSlotNote(event.target.value)}
                    placeholder="Örn. Mola / Özel iş"
                  />
                </label>
                <button type="submit" className="admin-submit-btn">
                  <FaClock aria-hidden="true" />
                  Saati Kapat
                </button>
              </div>
            </form>

            <section className="admin-content-card">
              <h2>Kapalı Saatler</h2>
              <div className="admin-chip-list">
                {isDashboardLoading
                  ? chipSkeletonRows.map((row) => <i className="admin-skeleton admin-chip-skeleton" key={row} />)
                  : dashboard.blockedSlots.length === 0 && <p>Bu tarih için kapalı saat yok.</p>}
                {!isDashboardLoading &&
                  dashboard.blockedSlots.map((slot) => (
                    <button type="button" key={slot.id} onClick={() => openBlockedSlot(slot.id)}>
                      {slot.date} / {slot.time}
                      <span>
                        <FaCheck aria-hidden="true" />
                        Aç
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </section>
        )}

        {currentPath === '/admin/numara-engelle' && (
          <section className="admin-two-column">
            <form className="admin-content-card admin-form-card" onSubmit={blockSelectedPhone}>
              <h2>Numara Engelle</h2>
              <div className="admin-form-fields">
                <label>
                  <span>Telefon</span>
                  <input
                    type="tel"
                    value={blockedPhone}
                    onChange={(event) => setBlockedPhone(event.target.value)}
                    placeholder="0536 415 97 42"
                    required
                  />
                </label>
                <label>
                  <span>Not</span>
                  <input value={blockedPhoneNote} onChange={(event) => setBlockedPhoneNote(event.target.value)} placeholder="Engelleme sebebi" />
                </label>
                <button type="submit" className="admin-submit-btn admin-danger-button">
                  <FaBan aria-hidden="true" />
                  Engelle
                </button>
              </div>
            </form>

            <section className="admin-content-card">
              <h2>Engelli Numaralar</h2>
              <div className="admin-chip-list">
                {isDashboardLoading
                  ? chipSkeletonRows.map((row) => <i className="admin-skeleton admin-chip-skeleton" key={row} />)
                  : dashboard.blockedPhones.length === 0 && <p>Engelli numara yok.</p>}
                {!isDashboardLoading &&
                  dashboard.blockedPhones.map((item) => (
                    <button type="button" key={item.phone} onClick={() => unblockSelectedPhone(item.phone)}>
                      {item.phone}
                      <span>
                        <FaTrashCan aria-hidden="true" />
                        Kaldır
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </section>
        )}

        {currentPath === '/admin/fiyatlar' && (
          <section className="admin-content-card admin-price-list-card">
            <h2>Fiyat ve Süre Güncelle</h2>
            <div className="admin-service-list">
              {isDashboardLoading
                ? serviceSkeletonRows.map((row) => (
                    <article className="admin-service-row admin-service-row-skeleton" key={row}>
                      <i className="admin-skeleton admin-skeleton-name" />
                      <i className="admin-skeleton admin-skeleton-field" />
                      <i className="admin-skeleton admin-skeleton-field" />
                      <i className="admin-skeleton admin-skeleton-action" />
                    </article>
                  ))
                : dashboard.services.map((service) => (
                    <article className="admin-service-row" key={service.id}>
                      <strong>
                        <FaUserTie aria-hidden="true" />
                        {service.name}
                      </strong>
                      <label>
                        <span>Fiyat</span>
                        <input
                          value={service.price}
                          onChange={(event) => setServiceValue(service.id, 'price', event.target.value)}
                          aria-label={`${service.name} fiyat`}
                        />
                      </label>
                      <label>
                        <span>Süre</span>
                        <input
                          value={service.time}
                          onChange={(event) => setServiceValue(service.id, 'time', event.target.value)}
                          aria-label={`${service.name} süre`}
                        />
                      </label>
                      <button type="button" onClick={() => updateService(service)}>
                        <FaFloppyDisk aria-hidden="true" />
                        Kaydet
                      </button>
                    </article>
                  ))}
            </div>
          </section>
        )}

        {currentPath === '/admin/islem-ekle' && (
          <form className="admin-content-card admin-form-card" onSubmit={createNewService}>
            <h2>Yeni İşlem Ekle</h2>
            <div className="admin-form-fields admin-form-grid-4">
              <label>
                <span>İşlem Adı</span>
                <input
                  value={newService.name}
                  onChange={(event) => setNewServiceValue('name', event.target.value)}
                  placeholder="Örn. Keratin bakım"
                  required
                />
              </label>
              <label>
                <span>Fiyat</span>
                <input
                  value={newService.price}
                  onChange={(event) => setNewServiceValue('price', event.target.value)}
                  placeholder="Örn. 750 TL"
                  required
                />
              </label>
              <label>
                <span>Süre</span>
                <input
                  value={newService.time}
                  onChange={(event) => setNewServiceValue('time', event.target.value)}
                  placeholder="Örn. 60 dk"
                  required
                />
              </label>
              <label>
                <span>Açıklama</span>
                <input
                  value={newService.detail}
                  onChange={(event) => setNewServiceValue('detail', event.target.value)}
                  placeholder="Opsiyonel"
                />
              </label>
              <button type="submit" className="admin-submit-btn">
                <FaPlus aria-hidden="true" />
                İşlem Ekle
              </button>
            </div>
          </form>
        )}

        {currentPath === '/admin/islem-sil' && (
          <section className="admin-content-card admin-price-list-card">
            <h2>İşlem Sil</h2>
            <div className="admin-service-list">
              {isDashboardLoading
                ? serviceSkeletonRows.map((row) => (
                    <article className="admin-service-row admin-service-row-skeleton" key={row}>
                      <i className="admin-skeleton admin-skeleton-name" />
                      <i className="admin-skeleton admin-skeleton-field" />
                      <i className="admin-skeleton admin-skeleton-action" />
                    </article>
                  ))
                : dashboard.services.map((service) => (
                    <article className="admin-service-row admin-service-delete-row" key={service.id}>
                      <strong>
                        <FaUserTie aria-hidden="true" />
                        {service.name}
                      </strong>
                      <span className="admin-service-meta">{service.price}</span>
                      <span className="admin-service-meta">{service.time}</span>
                      <button className="admin-danger-button" type="button" onClick={() => deleteSelectedService(service.id)}>
                        <FaTrashCan aria-hidden="true" />
                        Sil
                      </button>
                    </article>
                  ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default Admin
