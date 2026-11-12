import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

export default function AnalyticsHeader({ period, onPeriodChange }) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.date}>{today}</Text>
      </View>
      <View style={styles.chipRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.chip, period === p.key && styles.chipActive]}
            onPress={() => onPeriodChange(p.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, period === p.key && styles.chipTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  date: {
    fontSize: 12,
    color: '#999999'
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5'
  },
  chipActive: {
    backgroundColor: '#0a7d4f',
    borderColor: '#0a7d4f'
  },
  chipText: {
    fontSize: 13,
    color: '#666666'
  },
  chipTextActive: {
    color: '#e1f5ee',
    fontWeight: '500'
  }
})