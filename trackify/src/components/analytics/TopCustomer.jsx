// src/components/analytics/TopCustomers.jsx

import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import DebtBreakdownSheet from './DebtBreakdownSheet.jsx'

const formatCurrency = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function TopCustomers({ data, loading, businessId }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Customers</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Top by spend</Text>
        </View>

        {loading ? (
          <Text style={styles.empty}>Loading...</Text>
        ) : data?.length === 0 ? (
          <Text style={styles.empty}>No customers this period</Text>
        ) : (
          data.map((customer, index) => (
            <View
              key={customer.customerId}
              style={[styles.row, index === data.length - 1 && styles.rowLast]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{customer.name ?? 'Unknown'}</Text>
                <Text style={styles.meta}>
                  {customer.transactionCount} transaction{customer.transactionCount !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.amount}>{formatCurrency(customer.totalSpend)}</Text>
                {customer.outstandingDebt > 0 ? (
                  <TouchableOpacity
                    style={styles.debtBadge}
                    onPress={() => setSelectedCustomer(customer)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.debtBadgeText}>
                      {formatCurrency(customer.outstandingDebt)} owed
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.clearBadge}>
                    <Text style={styles.clearBadgeText}>No debt</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <DebtBreakdownSheet
        customer={selectedCustomer}
        businessId={businessId}
        onClose={() => setSelectedCustomer(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 14
  },
  cardHeader: {
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e1f5ee',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0a7d4f'
  },
  info: {
    flex: 1,
    minWidth: 0
  },
  name: {
    fontSize: 13,
    color: '#1a1a1a'
  },
  meta: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2
  },
  right: {
    alignItems: 'flex-end',
    flexShrink: 0
  },
  amount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  debtBadge: {
    marginTop: 4,
    backgroundColor: '#fcebeb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  debtBadgeText: {
    fontSize: 10,
    color: '#a32d2d'
  },
  clearBadge: {
    marginTop: 4,
    backgroundColor: '#e1f5ee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  clearBadgeText: {
    fontSize: 10,
    color: '#0a7d4f'
  },
  empty: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 16
  }
})