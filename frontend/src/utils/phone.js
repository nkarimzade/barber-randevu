export function getTurkishMobileDigits(value) {
  let digits = String(value || '').replace(/\D/g, '')

  if (digits.startsWith('90') && digits.length > 10) {
    digits = digits.slice(2)
  }

  if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1)
  }

  return digits.slice(0, 10)
}

export function formatTurkishMobileInput(value) {
  const digits = getTurkishMobileDigits(value)
  const chunks = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean)

  return chunks.join(' ')
}

export function isValidTurkishMobileNumber(value) {
  return /^5\d{9}$/.test(getTurkishMobileDigits(value))
}
