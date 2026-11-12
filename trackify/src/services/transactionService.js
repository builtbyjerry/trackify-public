import { createDebtPayment } from "../api/debtPayment.js";
import { getTransactionDetail } from "../api/transactions.js";

/**
 * Fetches a single transaction with all related data
 * for the detail screen
 */
export const fetchTransactionDetail = async (transactionId, businessId) => {
  return await getTransactionDetail(transactionId, businessId)
}

/**
 * Derives debt status and amounts from a transaction record
 */
export const deriveDebtStatus = (transaction) => {
  if (transaction.transaction_type !== 'debt') return null

  const totalPaid = (transaction.debt_payments ?? [])
    .reduce((sum, p) => sum + p.amount_paid, 0)

  const outstanding = Math.max(0, transaction.total_amount - totalPaid)
  const pctPaid = transaction.total_amount > 0
    ? (totalPaid / transaction.total_amount) * 100
    : 0

  const status = outstanding <= 0
    ? 'settled'
    : totalPaid > 0
    ? 'partial'
    : 'unpaid'

  const settledPayment = status === 'settled'
    ? [...(transaction.debt_payments ?? [])]
        .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))[0]
    : null

  const daysOutstanding = Math.floor(
    (new Date() - new Date(transaction.created_at)) / (1000 * 60 * 60 * 24)
  )

  return {
    status,
    totalPaid,
    outstanding,
    pctPaid,
    daysOutstanding,
    settledAt: settledPayment?.paid_at ?? null
  }
}

/**
 * Records a debt payment
 */
export const recordDebtPayment = async ({
  transactionId,
  businessId,
  amountPaid,
  recordedBy
}) => {
  return await createDebtPayment(transactionId, businessId, amountPaid, recordedBy)
}