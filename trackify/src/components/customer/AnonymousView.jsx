import { View, Text, StyleSheet } from 'react-native'

export function AnonymousView() {
  return (
    <View style={styles.anonymousBody}>
      <Text style={styles.anonymousIcon}>🕵️‍♂️</Text>
      <Text style={styles.anonymousTitle}>Anonymous Transaction</Text>
      <Text style={styles.anonymousSubtitle}>
        No customer will be linked to this sale.{'\n'}
        Great for walk-ins or one-time purchases.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  anonymousBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  anonymousIcon: {
    fontSize: 64,
  },
  anonymousTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  anonymousSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  }, 
})