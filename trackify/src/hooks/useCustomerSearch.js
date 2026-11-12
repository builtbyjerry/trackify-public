import { useState, useEffect, useMemo } from 'react'
import { getAllCustomers } from '../api/customer.js'

const useCustomerSearch = (query) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      const { data, error } = await getAllCustomers()
      if (!error) setCustomers(data ?? [])
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return customers
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
      )
      .slice(0, 5)
  }, [query, customers])

  return { results, loading }
}

export default useCustomerSearch