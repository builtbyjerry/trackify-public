// src/components/analytics/MostSold.jsx

import { View, Text, StyleSheet } from 'react-native'

export default function MostSold({ data, loading }) {
  const max = data?.[0]?.totalQuantity ?? 1

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Products</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Most sold</Text>
          <Text style={styles.cardSub}>by quantity</Text>
        </View>

        {loading ? (
          <Text style={styles.empty}>Loading...</Text>
        ) : data?.length === 0 ? (
          <Text style={styles.empty}>No sales this period</Text>
        ) : (
          data.map((item, index) => (
            <View
              key={item.variantId}
              style={[styles.row, index === data.length - 1 && styles.rowLast]}
            >
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.productName} · {item.variantName}
                </Text>
                <Text style={styles.meta}>{item.category ?? 'Uncategorised'}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${(item.totalQuantity / max) * 100}%` }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.qty}>
                {Number(item.totalQuantity).toLocaleString()} units
              </Text>
            </View>
          ))
        )}
      </View>
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
  rank: {
    fontSize: 12,
    color: '#bbbbbb',
    width: 16
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
  barTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#f0f0f0',
    marginTop: 6
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#42B39E'
  },
  qty: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
    flexShrink: 0
  },
  empty: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 16
  }
})