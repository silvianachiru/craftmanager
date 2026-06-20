// Validari de format folosite in toata aplicatia (inregistrare, login, contact, contul meu).

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Numar de mobil romanesc: 07 sau +407 urmat de 8 cifre (ex: 0712345678 sau +40712345678)
export const REGEX_TELEFON = /^(\+40|0)7[0-9]{8}$/
// Nume/prenume: doar litere (inclusiv diacritice), spatii si cratima
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
