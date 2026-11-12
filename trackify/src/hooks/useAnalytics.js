import { useState, useEffect } from 'react'
import {
  fetchSalesOverview,
  fetchMostSold,
  fetchBestPerforming,
  fetchTopCustomers
} from '../services/analyticsService.js'
import { errorLog } from '../utils/loggers.js';

export const useAnalytics = (businessId, period) => {
  const [data, setData] = useState({
    overview: null,
    mostSold: [],
    bestPerforming: [],
    topCustomers: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!businessId) return
    fetchAll()
  }, [businessId, period])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overview, mostSold, bestPerforming, topCustomers] = await Promise.all([
        fetchSalesOverview(businessId, period),
        fetchMostSold(businessId, period),
        fetchBestPerforming(businessId, period),
        fetchTopCustomers(businessId, period)
      ])
      setData({ overview, mostSold, bestPerforming, topCustomers })
    } catch (err) {
      setError(err.message)
      errorLog('Analytics fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return { ...data, loading, error, refresh: fetchAll }
}