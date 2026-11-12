// src/components/analytics/SalesVsDebt.jsx

import { View, Text, StyleSheet } from 'react-native'

export default function SalesVsDebt({ data, loading }) {
  const total = data?.totalTransactions ?? 0
  const sales = data?.salesCount ?? 0
  const debt = data?.debtCount ?? 0

  const salesPct = total > 0 ? (sales / total) * 100 : 0
  const debtPct = total > 0 ? (debt / total) * 100 : 0

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Sales vs debt</Text>
          <Text style={styles.cardSub}>{loading ? '—' : `${total} total`}</Text>
        </View>

        <View style={styles.barGroup}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Sales</Text>
            <Text style={styles.barLabel}>
              {loading ? '—' : `${sales} (${Math.round(salesPct)}%)`}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${salesPct}%`, backgroundColor: '#42B39E' }]} />
          </View>
        </View>

        <View style={styles.barGroup}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Debt</Text>
            <Text style={styles.barLabel}>
              {loading ? '—' : `${debt} (${Math.round(debtPct)}%)`}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${debtPct}%`, backgroundColor: '#0a7d4f' }]} />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingBottom: 4
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  cardSub: {
    fontSize: 12,
    color: '#999999'
  },
  barGroup: {
    marginBottom: 12
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  barLabel: {
    fontSize: 12,
    color: '#666666'
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: 4
  }
})