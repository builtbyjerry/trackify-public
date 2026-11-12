const startOfDay = (date) => new Date(new Date(date).setHours(0, 0, 0, 0))
const endOfDay = (date) => new Date(new Date(date).setHours(23, 59, 59, 999))

export const getPeriodRange = (period, customFrom, customTo) => {
  const now = new Date()

  switch (period) {
    case 'all':
      return null

    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }

    case 'yesterday': {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }

    case 'this_week': {
      const start = new Date()
      start.setDate(start.getDate() - start.getDay()) // Sunday
      return { from: startOfDay(start), to: endOfDay(now) }
    }

    case 'this_month':
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: endOfDay(now),
      }

    case 'custom':
      if (!customFrom || !customTo) return null
      return { from: startOfDay(new Date(customFrom)), to: endOfDay(new Date(customTo)) }

    default:
      return null
  }
}

export const matchesPeriod = (tx, filters) => {
  const range = getPeriodRange(filters.period, filters.customFrom, filters.customTo)
  if (!range) return true // no period = no restriction
  const created = new Date(tx.created_at)
  return created >= range.from && created <= range.to
}

export const matchesType = (tx, type) =>
  type === 'all' || tx.transaction_type === type

export const matchesAmount = (tx, min, max) => {
  const amount = parseFloat(tx.total_amount)
  if (min !== '' && amount < parseFloat(min)) return false
  if (max !== '' && amount > parseFloat(max)) return false
  return true
}

export const matchesCustomer = (tx, selectedCustomer) => {
  if (!selectedCustomer) return true 
  if (!tx.customer_id) return false 
  return tx.customer_id === selectedCustomer.id
}

export const applyFilters = (transactions, filters) =>  
  transactions.filter(
    (tx) =>
      matchesPeriod(tx, filters) &&
      matchesType(tx, filters.type) &&
      matchesAmount(tx, filters.minAmount, filters.maxAmount) &&
      matchesCustomer(tx, filters.selectedCustomer)
  )