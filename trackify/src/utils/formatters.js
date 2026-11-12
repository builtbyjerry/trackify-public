export const formatPhoneNumber = (phone) => {
    if (!phone) {
        return null
    }
    const countryCode = "+234"

    const newPhone = `${countryCode} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, phone.length)}`
    
    return newPhone
}

export const maskEmail = (email) => {
  const [local, domain] = email.split('@')
  const masked = local.slice(0, 2) + '***'
  return `${masked}@${domain}`
}