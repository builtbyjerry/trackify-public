// src/components/analytics/DebtBreakdownSheet.jsx

import { useEffect, useState } from 'react'
import {
  View, Text, Modal, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet
} from 'react-native'
import { fetchCustomerDebtBreakdown } from '../../services/analyticsService.js'
import { errorLog } from '../../utils/loggers.js';

const formatCurrency = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

export default function DebtBreakdownSheet({ customer, businessId, onClose }) {
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!customer) return
    loadBreakdown()
  }, [customer])

  const loadBreakdown = async () => {
    setLoading(true)
    try {
      const data = await fetchCustomerDebtBreakdown(businessId, customer.customerId)
      setBreakdown(data)
    } catch (err) {
      errorLog('Debt breakdown failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={!!customer}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>Outstanding debt</Text>
            <Text style={styles.sheetSub}>{customer?.name ?? 'Customer'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            color='#42B39E'
            style={styles.loader}
          />
        ) : breakdown.length === 0 ? (
          <Text style={styles.empty}>No outstanding debt found</Text>
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {breakdown.map((txn, index) => (
              <View
                key={txn.transactionId}
                style={[styles.row, index === breakdown.length - 1 && styles.rowLast]}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowDate}>{formatDate(txn.createdAt)}</Text>
                  <Text style={styles.rowMeta}>
                    Paid {formatCurrency(txn.totalPaid)} of {formatCurrency(txn.totalAmount)}
                  </Text>
                </View>
                <Text style={styles.rowOwed}>
                  {formatCurrency(txn.outstanding)}
                </Text>
              </View>
            ))}

            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total outstanding</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  breakdown.reduce((sum, t) => sum + t.outstanding, 0)
                )}
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%'
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  sheetSub: {
    fontSize: 13,
    color: '#999999',
    marginTop: 2
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  closeBtnText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500'
  },
  loader: {
    marginTop: 40
  },
  empty: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  rowLast: {
    borderBottomWidth: 0
  },
  rowLeft: {
    flex: 1
  },
  rowDate: {
    fontSize: 13,
    color: '#1a1a1a'
  },
  rowMeta: {
    fontSize: 11,
    color: '#999999',
    marginTop: 3
  },
  rowOwed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a32d2d'
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0'
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#a32d2d'
  }
})