// src/services/analyticsService.js

import { supabase } from '../api/supabase.js' // adjust path if different
import { log } from '../utils/loggers.js';

// ─── helpers ────────────────────────────────────────────────────────────────

const getDateRange = (period) => {
  const now = new Date()
  const start = new Date()

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    default:
      start.setHours(0, 0, 0, 0)
  }

  return {
    from: start.toISOString(),
    to: now.toISOString()
  }
}

// ─── sales overview ─────────────────────────────────────────────────────────

/**
 * Returns revenue, profit, transaction count, avg order value
 * for a given period and business
 *
 * Revenue  = SUM(price_at_purchase * quantity_sold)
 * Profit   = SUM((price_at_purchase - cost_price_at_purchase) * quantity_sold)
 * Avg order = revenue / transaction count
 */
export const fetchSalesOverview = async (businessId, period) => {
  const { from, to } = getDateRange(period)

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      transaction_type,
      created_at,
      transaction_items (
        quantity_sold,
        price_at_purchase,
        cost_price_at_purchase
      )
    `)
    .eq('business_id', businessId)
    .gte('created_at', from)
    .lte('created_at', to)

  if (error) throw error

  let revenue = 0
  let profit = 0
  let salesCount = 0
  let debtCount = 0

  data.forEach(txn => {
    const isSaleOrDebt = ['sale', 'debt', 'debt_firm'].includes(txn.transaction_type)
    if (!isSaleOrDebt) {
        log("No records found for transaction type")
        return
    }

    txn.transaction_type === 'sale' ? salesCount++ : debtCount++

    txn.transaction_items.forEach(item => {
      const itemRevenue = item.price_at_purchase * item.quantity_sold
      const itemProfit = (item.price_at_purchase - item.cost_price_at_purchase) * item.quantity_sold
      revenue += itemRevenue
      profit += itemProfit
    })
  })

  const totalTransactions = salesCount + debtCount
  const avgOrder = totalTransactions > 0 ? revenue / totalTransactions : 0

  return {
    revenue,
    profit,
    totalTransactions,
    salesCount,
    debtCount,
    avgOrder,
    margin: revenue > 0 ? (profit / revenue) * 100 : 0
  }
}

// ─── most sold products ──────────────────────────────────────────────────────

/**
 * Returns top N variants by total quantity sold in period
 */
export const fetchMostSold = async (businessId, period, limit = 3) => {
  const { from, to } = getDateRange(period)

  const { data, error } = await supabase
    .from('transaction_items')
    .select(`
      quantity_sold,
      variant_id,
      product_variants (
        name,
        products (
          name,
          category
        )
      ),
      transactions!inner (
        business_id,
        created_at,
        transaction_type
      )
    `)
    .eq('transactions.business_id', businessId)
    .gte('transactions.created_at', from)
    .lte('transactions.created_at', to)
    .in('transactions.transaction_type', ['sale', 'debt', 'debt_firm'])

  if (error) throw error

  const totals = {}

  data.forEach(item => {
    const key = item.variant_id
    if (!totals[key]) {
      totals[key] = {
        variantId: item.variant_id,
        variantName: item.product_variants.name,
        productName: item.product_variants.products.name,
        category: item.product_variants.products.category,
        totalQuantity: 0
      }
    }
    totals[key].totalQuantity += item.quantity_sold
  })

  return Object.values(totals)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit)
}

// ─── best performing products ────────────────────────────────────────────────

/**
 * Returns top N variants by total profit generated in period
 */
export const fetchBestPerforming = async (businessId, period, limit = 3) => {
  const { from, to } = getDateRange(period)

  const { data, error } = await supabase
    .from('transaction_items')
    .select(`
      quantity_sold,
      price_at_purchase,
      cost_price_at_purchase,
      variant_id,
      product_variants (
        name,
        products (
          name,
          category
        )
      ),
      transactions!inner (
        business_id,
        created_at,
        transaction_type
      )
    `)
    .eq('transactions.business_id', businessId)
    .gte('transactions.created_at', from)
    .lte('transactions.created_at', to)
    .in('transactions.transaction_type', ['sale', 'debt_customer', 'debt_firm'])

  if (error) throw error

  const totals = {}

  data.forEach(item => {
    const key = item.variant_id
    const itemProfit = (item.price_at_purchase - item.cost_price_at_purchase) * item.quantity_sold
    const itemRevenue = item.price_at_purchase * item.quantity_sold

    if (!totals[key]) {
      totals[key] = {
        variantId: item.variant_id,
        variantName: item.product_variants.name,
        productName: item.product_variants.products.name,
        category: item.product_variants.products.category,
        totalProfit: 0,
        totalRevenue: 0
      }
    }

    totals[key].totalProfit += itemProfit
    totals[key].totalRevenue += itemRevenue
  })

  return Object.values(totals)
    .map(p => ({
      ...p,
      margin: p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit)
    .slice(0, limit)
}

// ─── top customers ───────────────────────────────────────────────────────────

/**
 * Returns top N customers by total spend in period
 * Includes outstanding debt per customer
 */
export const fetchTopCustomers = async (businessId, period, limit = 3) => {
  const { from, to } = getDateRange(period)

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      total_amount,
      transaction_type,
      created_at,
      customers (
        id,
        name,
        phone
      ),
      debt_payments (
        amount_paid
      )
    `)
    .eq('business_id', businessId)
    .gte('created_at', from)
    .lte('created_at', to)
    .not('customer_id', 'is', null)
    .in('transaction_type', ['sale', 'debt'])

  if (error) throw error

  const customerMap = {}

  data.forEach(txn => {
    if (!txn.customers) return
    const customerId = txn.customers.id
    const totalPaid = txn.debt_payments.reduce((sum, p) => sum + p.amount_paid, 0)
    const outstanding = ['debt', 'debt_firm'].includes(txn.transaction_type)
      ? Math.max(0, txn.total_amount - totalPaid)
      : 0

    if (!customerMap[customerId]) {
      customerMap[customerId] = {
        customerId,
        name: txn.customers.name,
        phone: txn.customers.phone,
        totalSpend: 0,
        transactionCount: 0,
        outstandingDebt: 0
      }
    }

    customerMap[customerId].totalSpend += txn.total_amount
    customerMap[customerId].transactionCount++
    customerMap[customerId].outstandingDebt += outstanding
  })

  return Object.values(customerMap)
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, limit)
}

// ─── debt breakdown ───────────────────────────────────────────────────────────

/**
 * Returns all unpaid/partially paid debt transactions for a customer
 * Used in the debt breakdown bottom sheet
 */
export const fetchCustomerDebtBreakdown = async (businessId, customerId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      total_amount,
      created_at,
      transaction_type,
      debt_payments (
        amount_paid,
        paid_at
      )
    `)
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .in('transaction_type', ['debt_customer', 'debt_firm'])
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
    .map(txn => {
      const totalPaid = txn.debt_payments.reduce((sum, p) => sum + p.amount_paid, 0)
      const outstanding = Math.max(0, txn.total_amount - totalPaid)
      return {
        transactionId: txn.id,
        totalAmount: txn.total_amount,
        totalPaid,
        outstanding,
        createdAt: txn.created_at,
        isSettled: outstanding === 0,
        payments: txn.debt_payments
      }
    })
    .filter(txn => txn.outstanding > 0)
}