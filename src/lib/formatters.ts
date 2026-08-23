/**
 * Formats Emirates ID to standard UAE format: 784-YYYY-XXXXXXX-X (15 digits)
 * Example input: 784202112345671 -> 784-2021-1234567-1
 */
export function formatEmiratesId(value: string): string {
  if (!value) return ''
  // Strip all non-digits and cap at 15 digits
  const digits = value.replace(/\D/g, '').slice(0, 15)
  
  if (digits.length <= 3) {
    return digits
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  if (digits.length <= 14) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14, 15)}`
}

/**
 * Formats Passport Number (1 letter + 7 digits, e.g. A1234567)
 * Automatically converts to uppercase and enforces standard alphanumeric pattern
 */
export function formatPassportNumber(value: string): string {
  if (!value) return ''
  // Uppercase and remove special characters/spaces, limit to 9 chars max
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9)
}

/**
 * Validates Emirates ID (must be 15 digits starting with 784)
 */
export function isValidEmiratesId(value: string): boolean {
  if (!value) return true
  const digits = value.replace(/\D/g, '')
  return digits.length === 15 && digits.startsWith('784')
}

/**
 * Validates Passport number format (e.g. 1 Letter + 7 Digits like A1234567)
 */
export function isValidPassport(value: string): boolean {
  if (!value) return true
  const clean = value.toUpperCase().trim()
  return /^[A-Z][0-9]{7}$/.test(clean) || /^[A-Z0-9]{6,9}$/.test(clean)
}
