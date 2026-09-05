import { useEffect } from 'react'

const siteUrl = 'https://mamirandevu.com'
const defaultImage = `${siteUrl}/hero-barber.jpg`

const pages = {
  '/': {
    title: 'Muhammed Barber | Çankırı Merkez Berber ve Online Randevu',
    description:
      "Çankırı Merkez'de erkek saç kesimi, sakal tıraşı, fade kesim, damat bakımı ve online berber randevusu.",
    canonical: '/',
  },
  '/randevu': {
    title: 'Online Berber Randevusu | Muhammed Barber Çankırı',
    description:
      "Muhammed Barber'da saç kesimi, sakal tıraşı ve bakım hizmetleri için Çankırı online berber randevunuzu oluşturun.",
    canonical: '/randevu',
  },
  '/randevu-sorgula': {
    title: 'Randevu Sorgula | Muhammed Barber Çankırı',
    description: "Çankırı Muhammed Barber randevunuzu telefon numaranızla hızlıca sorgulayın.",
    canonical: '/randevu-sorgula',
  },
  '/kvkk': {
    title: 'KVKK Aydınlatma Metni | Muhammed Barber',
    description: 'Muhammed Barber randevu işlemleri için KVKK aydınlatma metni.',
    canonical: '/kvkk',
  },
}

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

function setCanonical(href) {
  let canonical = document.head.querySelector('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', href)
}

function Seo({ pathname }) {
  useEffect(() => {
    const page = pages[pathname] || pages['/']
    const canonicalUrl = `${siteUrl}${page.canonical}`

    document.title = page.title
    setCanonical(canonicalUrl)
    setMeta('meta[name="description"]', { name: 'description', content: page.description })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: page.title })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: page.description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: defaultImage })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: page.description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: defaultImage })
  }, [pathname])

  return null
}

export default Seo
