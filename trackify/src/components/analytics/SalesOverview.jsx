import { View, Text, StyleSheet } from 'react-native'

const formatCurrency = (amount) => {
  if (amount == null) return '—'
  return `₦${Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

const formatPercent = (value) => {
  if (value == null) return '—'
  return `${Math.round(value)}%`
}

function MetricCard({ label, value, sub, subPositive }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {sub ? (
        <Text style={[styles.sub, subPositive ? styles.subUp : styles.subNeutral]}>
          {sub}
        </Text>
      ) : null}
    </View>
  )
}

export default function SalesOverview({ data, loading }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Sales overview</Text>
      <View style={styles.grid}>
        <MetricCard
          label='Total revenue'
          value={loading ? '—' : formatCurrency(data?.revenue)}
          sub={loading ? null : `${formatPercent(data?.margin)} margin`}
          subPositive
        />
        <MetricCard
          label='Total profit'
          value={loading ? '—' : formatCurrency(data?.profit)}
          subPositive
        />
      </View>
      <View style={styles.grid}>
        <MetricCard
          label='Transactions'
          value={loading ? '—' : String(data?.totalTransactions ?? 0)}
          sub='this period'
        />
        <MetricCard
          label='Avg order'
          value={loading ? '—' : formatCurrency(data?.avgOrder)}
        />
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
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 14
  },
  label: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 6
  },
  value: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0a7d4f'
  },
  sub: {
    fontSize: 11,
    marginTop: 4
  },
  subUp: {
    color: '#0a7d4f'
  },
  subNeutral: {
    color: '#999999'
  }
})