import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import './env.js'
import {
  blockPhone,
  blockSlot,
  closeDay,
  createAppointment,
  createService,
  deleteAppointment,
  deleteService,
  getAppointments,
  getAppointmentsByNumberId,
  getBlockedPhones,
  getBlockedSlots,
  getClosedDays,
  getServices,
  isDayClosed,
  isPhoneBlocked,
  isSlotBlocked,
  isTimeBooked,
  normalizePhone,
  openDay,
  unblockPhone,
  unblockSlot,
  updateService,
} from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fontRegular = path.join(__dirname, 'fonts', 'Arial.ttf')
const fontBold = path.join(__dirname, 'fonts', 'Arial-Bold.ttf')

const port = Number(process.env.PORT || 4000)
const adminToken = process.env.ADMIN_TOKEN || ''

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

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  response.end(JSON.stringify(payload))
}

function sendPdf(response, filename, buffer) {
  response.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  response.end(buffer)
}

function formatTurkishDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  return `${d} ${months[m - 1]} ${y}, ${days[dt.getUTCDay()]}`
}

function createAppointmentsPdf(date, appointments) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 36,
      bufferPages: true,
      info: {
        Title: `Muhammed Barber - Randevular ${date}`,
        Author: 'Muhammed Barber',
      },
    })

    const buffers = []
    doc.on('data', (chunk) => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    const hasFonts = fs.existsSync(fontRegular) && fs.existsSync(fontBold)
    if (hasFonts) {
      doc.registerFont('Regular', fontRegular)
      doc.registerFont('Bold', fontBold)
    } else {
      doc.registerFont('Regular', 'Helvetica')
      doc.registerFont('Bold', 'Helvetica-Bold')
    }

    const pageWidth = 595.28
    const margin = 36
    const contentWidth = pageWidth - margin * 2

    // --- Top Accent Bar ---
    doc.rect(margin, 28, contentWidth, 3).fill('#2563EB')

    // --- Header Section ---
    let y = 42
    doc.font('Bold').fontSize(18).fillColor('#0F172A').text('MUHAMMED BARBER', margin, y)
    doc.font('Regular').fontSize(9.5).fillColor('#64748B').text('GÜNLÜK RANDEVU VE SALON YÖNETİM ÇİZELGESİ', margin, y + 22)

    const now = new Date()
    const printTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const printDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`

    doc.font('Regular').fontSize(8.5).fillColor('#64748B').text(`Oluşturulma: ${printDate} - ${printTime}`, margin, y + 4, {
      align: 'right',
      width: contentWidth,
    })
    doc.font('Bold').fontSize(8.5).fillColor('#2563EB').text('Sistem Raporu', margin, y + 18, {
      align: 'right',
      width: contentWidth,
    })

    // Divider
    y = 78
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#E2E8F0').lineWidth(1).stroke()

    // --- Metrics / Stat Cards Banner ---
    y += 14
    const cardGap = 12
    const cardWidth = (contentWidth - cardGap * 2) / 3
    const cardHeight = 56

    const stats = [
      { label: 'SEÇİLİ GÜN', value: formatTurkishDate(date), color: '#0F172A' },
      { label: 'AKTİF RANDEVU SAYISI', value: `${appointments.length} Randevu`, color: '#2563EB' },
      { label: 'SALON DURUMU', value: appointments.length > 0 ? 'Faal / Randevulu' : 'Randevu Yok', color: '#16A34A' },
    ]

    stats.forEach((stat, i) => {
      const cardX = margin + i * (cardWidth + cardGap)
      doc.roundedRect(cardX, y, cardWidth, cardHeight, 6).fillColor('#F8FAFC').fill()
      doc.roundedRect(cardX, y, cardWidth, cardHeight, 6).strokeColor('#E2E8F0').lineWidth(1).stroke()

      doc.font('Bold').fontSize(7.5).fillColor('#64748B').text(stat.label, cardX + 12, y + 10)
      doc.font('Bold').fontSize(11.5).fillColor(stat.color).text(stat.value, cardX + 12, y + 26, {
        width: cardWidth - 24,
        ellipsis: true,
      })
    })

    // --- Table Section ---
    y += cardHeight + 20

    const drawTableHeader = (headerY) => {
      doc.font('Bold').fontSize(11).fillColor('#0F172A').text('Randevu Listesi', margin, headerY)
      doc.font('Regular').fontSize(8.5).fillColor('#64748B').text(`${appointments.length} kayıt listelendi`, margin + 100, headerY + 2)

      const cols = [
        { title: '#', width: 28, align: 'center' },
        { title: 'SAAT', width: 56, align: 'center' },
        { title: 'MÜŞTERİ ADI', width: 140, align: 'left' },
        { title: 'TELEFON', width: 105, align: 'left' },
        { title: 'HİZMET / ÜCRET', width: 110, align: 'left' },
        { title: 'NOT', width: 84, align: 'left' },
      ]

      const tableHeaderHeight = 26
      const tableY = headerY + 18
      doc.rect(margin, tableY, contentWidth, tableHeaderHeight).fillColor('#1E293B').fill()

      let curX = margin
      cols.forEach((col) => {
        doc.font('Bold').fontSize(8).fillColor('#FFFFFF').text(col.title, curX + 6, tableY + 8, {
          width: col.width - 12,
          align: col.align,
        })
        curX += col.width
      })

      return tableY + tableHeaderHeight
    }

    const cols = [
      { title: '#', width: 28, align: 'center' },
      { title: 'SAAT', width: 56, align: 'center' },
      { title: 'MÜŞTERİ ADI', width: 140, align: 'left' },
      { title: 'TELEFON', width: 105, align: 'left' },
      { title: 'HİZMET / ÜCRET', width: 110, align: 'left' },
      { title: 'NOT', width: 84, align: 'left' },
    ]

    y = drawTableHeader(y)

    if (appointments.length === 0) {
      doc.rect(margin, y, contentWidth, 60).fillColor('#F8FAFC').fill()
      doc.rect(margin, y, contentWidth, 60).strokeColor('#E2E8F0').lineWidth(1).stroke()
      doc.font('Regular').fontSize(10).fillColor('#64748B').text('Bu tarih için kayıtlı randevu bulunmamaktadır.', margin, y + 24, {
        align: 'center',
        width: contentWidth,
      })
      y += 60
    } else {
      appointments.forEach((item, idx) => {
        const rowHeight = 32
        if (y + rowHeight > 760) {
          doc.addPage()
          y = drawTableHeader(40)
        }

        const isEven = idx % 2 === 0
        const rowBg = isEven ? '#FFFFFF' : '#F8FAFC'

        doc.rect(margin, y, contentWidth, rowHeight).fillColor(rowBg).fill()
        doc.moveTo(margin, y + rowHeight).lineTo(pageWidth - margin, y + rowHeight).strokeColor('#E2E8F0').lineWidth(0.6).stroke()

        let curX = margin

        // Col 0: Index
        doc.font('Regular').fontSize(8.5).fillColor('#64748B').text(String(idx + 1), curX + 6, y + 10, {
          width: cols[0].width - 12,
          align: cols[0].align,
        })
        curX += cols[0].width

        // Col 1: Time badge
        doc.roundedRect(curX + 6, y + 6, cols[1].width - 12, 19, 4).fillColor('#EFF6FF').fill()
        doc.font('Bold').fontSize(9).fillColor('#1D4ED8').text(item.time, curX + 6, y + 10, {
          width: cols[1].width - 12,
          align: 'center',
        })
        curX += cols[1].width

        // Col 2: Customer Name
        doc.font('Bold').fontSize(9).fillColor('#0F172A').text(item.customerName, curX + 6, y + 10, {
          width: cols[2].width - 12,
          align: cols[2].align,
          ellipsis: true,
        })
        curX += cols[2].width

        // Col 3: Customer Phone
        doc.font('Regular').fontSize(8.5).fillColor('#334155').text(item.customerPhone, curX + 6, y + 10, {
          width: cols[3].width - 12,
          align: cols[3].align,
        })
        curX += cols[3].width

        // Col 4: Service + Price
        const serviceText = item.servicePrice ? `${item.serviceName} (${item.servicePrice})` : item.serviceName
        doc.font('Regular').fontSize(8.5).fillColor('#0F172A').text(serviceText, curX + 6, y + 10, {
          width: cols[4].width - 12,
          align: cols[4].align,
          ellipsis: true,
        })
        curX += cols[4].width

        // Col 5: Note
        doc.font('Regular').fontSize(8).fillColor('#64748B').text(item.customerNote || '-', curX + 6, y + 10, {
          width: cols[5].width - 12,
          align: cols[5].align,
          ellipsis: true,
        })

        y += rowHeight
      })
    }

    // --- Footer for all pages ---
    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      const footerY = 785
      doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).strokeColor('#E2E8F0').lineWidth(0.8).stroke()
      doc.font('Regular').fontSize(7.5).fillColor('#94A3B8').text(
        'Muhammed Barber • Çankırı Merkez • Randevu Sistemi Yönetici Raporu',
        margin,
        footerY + 8,
        { width: 350, lineBreak: false }
      )
      doc.font('Regular').fontSize(7.5).fillColor('#94A3B8').text(
        `Sayfa ${i + 1} / ${range.count}`,
        pageWidth - margin - 80,
        footerY + 8,
        { width: 80, align: 'right', lineBreak: false }
      )
    }

    doc.end()
  })
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isSunday(date) {
  if (!isDate(date)) {
    return false
  }

  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).getDay() === 0
}

function isNumberId(value) {
  return /^5\d{9}$/.test(value)
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getTurkeyDateAndHour() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(now)
  const partMap = {}
  parts.forEach((p) => {
    partMap[p.type] = p.value
  })
  const todayStr = `${partMap.year}-${partMap.month}-${partMap.day}`
  const hour = parseInt(partMap.hour, 10)
  return { todayStr, hour }
}

function isAdminRequest(request) {
  if (!adminToken) {
    return false
  }

  return request.headers.authorization === `Bearer ${adminToken}`
}

async function parseBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')
  return rawBody ? JSON.parse(rawBody) : {}
}

async function requireAdmin(request, response) {
  if (isAdminRequest(request)) {
    return true
  }

  sendJson(response, 401, { message: 'Şifre yanlış' })
  return false
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if ((request.method === 'GET' || request.method === 'HEAD') && (url.pathname === '/api/health' || url.pathname === '/health' || url.pathname === '/')) {
    sendJson(response, 200, { ok: true })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/services') {
    sendJson(response, 200, { services: await getServices() })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/closed-days') {
    sendJson(response, 200, {
      closedDays: await getClosedDays(),
      weeklyClosedDays: ['sunday'],
    })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/availability') {
    const date = normalizeText(url.searchParams.get('date'))

    if (!isDate(date)) {
      sendJson(response, 400, { message: 'Gecerli bir tarih gonderin.' })
      return
    }

    const isClosed = isSunday(date) || (await isDayClosed(date))
    const appointments = await getAppointments(date)
    const blockedSlots = await getBlockedSlots(date)
    const bookedTimes = new Set(
      appointments
        .filter((appointment) => appointment.status === 'booked')
        .map((appointment) => appointment.time),
    )
    const blockedTimes = new Set(blockedSlots.map((slot) => slot.time))
    const { todayStr, hour: currentHour } = getTurkeyDateAndHour()
    const isSlotPast = (time) => {
      if (date < todayStr) return true
      if (date === todayStr) {
        const slotHour = parseInt(time.split(':')[0], 10)
        return slotHour < currentHour
      }
      return false
    }

    sendJson(response, 200, {
      date,
      isClosed,
      slots: timeSlots.map((time) => ({
        time,
        isBooked: isClosed || bookedTimes.has(time) || blockedTimes.has(time) || isSlotPast(time),
      })),
    })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/appointments/lookup') {
    const numberId = normalizePhone(url.searchParams.get('numberId') || url.searchParams.get('phone'))

    if (!isNumberId(numberId)) {
      sendJson(response, 400, { message: 'Telefon numarasi 5xx xxx xx xx formatinda olmali.' })
      return
    }

    sendJson(response, 200, {
      numberId,
      appointments: await getAppointmentsByNumberId(numberId),
    })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/appointments') {
    const body = await parseBody(request)
    const serviceId = normalizeText(body.serviceId)
    const date = normalizeText(body.date)
    const time = normalizeText(body.time)
    const customerName = normalizeText(body.customerName)
    const customerPhone = normalizeText(body.customerPhone)
    const numberId = normalizePhone(customerPhone)
    const customerNote = normalizeText(body.customerNote)
    const services = await getServices()
    const service = services.find((item) => item.id === serviceId)

    if (!service || !isDate(date) || !timeSlots.includes(time) || !customerName || !isNumberId(numberId)) {
      sendJson(response, 400, { message: 'Randevu bilgileri eksik veya hatali.' })
      return
    }

    const { todayStr, hour: currentHour } = getTurkeyDateAndHour()
    if (date < todayStr) {
      sendJson(response, 400, { message: 'Geçmiş bir tarihe randevu alınamaz.' })
      return
    }
    if (date === todayStr) {
      const slotHour = parseInt(time.split(':')[0], 10)
      if (slotHour < currentHour) {
        sendJson(response, 400, { message: 'Geçmiş bir saate randevu alınamaz.' })
        return
      }
    }

    if (isSunday(date) || (await isDayClosed(date))) {
      sendJson(response, 409, { message: 'Bu gun randevuya kapali.' })
      return
    }

    if (await isPhoneBlocked(numberId)) {
      sendJson(response, 403, { message: 'Bu telefon numarasi ile randevu alinamaz.' })
      return
    }

    if (await isTimeBooked(date, time)) {
      sendJson(response, 409, { message: 'Bu saat dolu. Lutfen baska bir saat secin.' })
      return
    }

    if (await isSlotBlocked(date, time)) {
      sendJson(response, 409, { message: 'Bu saat randevuya kapali.' })
      return
    }

    let appointment

    try {
      appointment = await createAppointment({
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceTime: service.time,
        date,
        time,
        customerName,
        customerPhone: numberId,
        numberId,
        customerNote,
      })
    } catch (error) {
      if (error.code === 'SLOT_BOOKED') {
        sendJson(response, 409, { message: error.message })
        return
      }

      throw error
    }

    sendJson(response, 201, { appointment })
    return
  }

  if (url.pathname.startsWith('/api/admin')) {
    if (!(await requireAdmin(request, response))) {
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') {
      const date = normalizeText(url.searchParams.get('date'))

      sendJson(response, 200, {
        services: await getServices(),
        closedDays: await getClosedDays(),
        blockedSlots: await getBlockedSlots(isDate(date) ? date : undefined),
        blockedPhones: await getBlockedPhones(),
        appointments: await getAppointments(isDate(date) ? date : undefined),
      })
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/appointments/pdf') {
      const date = normalizeText(url.searchParams.get('date'))

      if (!isDate(date)) {
        sendJson(response, 400, { message: 'Gecerli bir tarih gonderin.' })
        return
      }

      const appointments = await getAppointments(date)
      const pdfBuffer = await createAppointmentsPdf(date, appointments)
      sendPdf(response, `randevular-${date}.pdf`, pdfBuffer)
      return
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/appointments/')) {
      const appointmentId = decodeURIComponent(url.pathname.replace('/api/admin/appointments/', ''))

      if (!appointmentId) {
        sendJson(response, 400, { message: 'Randevu ID gerekli.' })
        return
      }

      const appointment = await deleteAppointment(appointmentId)

      if (!appointment) {
        sendJson(response, 404, { message: 'Randevu bulunamadi.' })
        return
      }

      sendJson(response, 200, { appointment })
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/services') {
      const body = await parseBody(request)
      const name = normalizeText(body.name)
      const price = normalizeText(body.price)
      const time = normalizeText(body.time)
      const detail = normalizeText(body.detail)

      if (!name || !price || !time) {
        sendJson(response, 400, { message: 'Islem adi, fiyat ve sure gerekli.' })
        return
      }

      const service = await createService({ name, price, time, detail })

      if (!service) {
        sendJson(response, 409, { message: 'Bu islem eklenemedi. Lutfen tekrar deneyin.' })
        return
      }

      sendJson(response, 201, { service })
      return
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/services/')) {
      const serviceId = decodeURIComponent(url.pathname.replace('/api/admin/services/', ''))
      const service = await deleteService(serviceId)

      if (!service) {
        sendJson(response, 404, { message: 'Hizmet bulunamadi.' })
        return
      }

      sendJson(response, 200, { service })
      return
    }

    if (request.method === 'PATCH' && url.pathname.startsWith('/api/admin/services/')) {
      const serviceId = decodeURIComponent(url.pathname.replace('/api/admin/services/', ''))
      const body = await parseBody(request)
      const updates = {}

      for (const key of ['name', 'price', 'time', 'detail']) {
        const value = normalizeText(body[key])
        if (value) updates[key] = value
      }

      const service = await updateService(serviceId, updates)

      if (!service) {
        sendJson(response, 404, { message: 'Hizmet bulunamadi.' })
        return
      }

      sendJson(response, 200, { service })
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/closed-days') {
      const body = await parseBody(request)
      const date = normalizeText(body.date)

      if (!isDate(date)) {
        sendJson(response, 400, { message: 'Gecerli bir tarih gonderin.' })
        return
      }

      sendJson(response, 201, { closedDay: await closeDay(date, normalizeText(body.note)) })
      return
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/closed-days/')) {
      const date = decodeURIComponent(url.pathname.replace('/api/admin/closed-days/', ''))

      if (!isDate(date)) {
        sendJson(response, 400, { message: 'Gecerli bir tarih gonderin.' })
        return
      }

      await openDay(date)
      sendJson(response, 200, { ok: true })
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/blocked-slots') {
      const body = await parseBody(request)
      const date = normalizeText(body.date)
      const time = normalizeText(body.time)

      if (!isDate(date) || !timeSlots.includes(time)) {
        sendJson(response, 400, { message: 'Gecerli tarih ve saat gonderin.' })
        return
      }

      sendJson(response, 201, { blockedSlot: await blockSlot(date, time, normalizeText(body.note)) })
      return
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/blocked-slots/')) {
      const slotId = decodeURIComponent(url.pathname.replace('/api/admin/blocked-slots/', ''))

      if (!slotId) {
        sendJson(response, 400, { message: 'Saat kaydi gerekli.' })
        return
      }

      await unblockSlot(slotId)
      sendJson(response, 200, { ok: true })
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/blocked-phones') {
      const body = await parseBody(request)
      const phone = normalizePhone(body.phone)

      if (!phone) {
        sendJson(response, 400, { message: 'Telefon numarasi gerekli.' })
        return
      }

      sendJson(response, 201, { blockedPhone: await blockPhone(phone, normalizeText(body.note)) })
      return
    }

    if (request.method === 'DELETE' && url.pathname.startsWith('/api/admin/blocked-phones/')) {
      const phone = decodeURIComponent(url.pathname.replace('/api/admin/blocked-phones/', ''))

      await unblockPhone(phone)
      sendJson(response, 200, { ok: true })
      return
    }
  }

  sendJson(response, 404, { message: 'Endpoint bulunamadi.' })
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error(error)
    sendJson(response, 500, { message: 'Sunucu hatasi.' })
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${port}`)
})
