import { useMemo } from 'react'
import { useTransactions } from './useTransactions'  
import { applyFilters } from '../utils/transactionFilters.js'

export function useGroupedTransactions(filters = {}) {
  const { transactions, transactionItems, debtPayments,  loading, error, fetchTransactions, refreshTransactions } = useTransactions()

  // Step 0: filter transactions
  const filteredTransactions = useMemo(() => 
    applyFilters(transactions, filters), 
  [transactions, filters])


  const groupedData = useMemo(() => {
    if (!filteredTransactions.length) return []

    // Formats the date into "Today", "Yesterday", or "Month Day, Year"
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      const today = new Date()

      const isToday = date.toDateString() === today.toDateString()

      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      const isYesterday = date.toDateString() === yesterday.toDateString()

      if (isToday) return 'Today'
      if (isYesterday) return 'Yesterday'

      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }

    // Step 1: Group transactions by date
    const groups = {}

    filteredTransactions.forEach((tx) => {
      const dateKey = formatDate(tx.created_at)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      // Step 2: Grab all matching transaction items (matching by transaction_id)
      const itemsForTx = transactionItems.filter(
        (item) => item.transaction_id === tx.id
      )
      // Step 3: Grab matching debt payments
      const paymentsForTx = debtPayments.filter(
        (payment) => payment.transaction_id === tx.id
      )

      // Step 3: Add full transaction (with items) to that date group
      groups[dateKey].push({ ...tx, items: itemsForTx, debt_payments: paymentsForTx })
    })

    // Step 4: Convert from { key: [...] } object → array (for SectionList)
    return Object.keys(groups).map((date) => ({
      title: date,
      data: groups[date],
    }))
  }, [filteredTransactions, transactionItems, debtPayments])

  return { groupedData, loading, error, fetchTransactions, refreshTransactions }
}
