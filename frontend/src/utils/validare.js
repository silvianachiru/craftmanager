export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const REGEX_TELEFON = /^(\+40|0)7[0-9]{8}$/
export const REGEX_NUME = /^[\p{L}\s-]+$/u

export function emailValid(email) {
  return REGEX_EMAIL.test((email || '').trim())
}

export function telefonValid(tel) {
  return REGEX_TELEFON.test((tel || '').trim())
}

export function numeValid(nume) {
  return REGEX_NUME.test((nume || '').trim())
}

export function extrageEroare(err, fallback) {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join(' ')
  return fallback
}
