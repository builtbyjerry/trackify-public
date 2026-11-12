// src/components/transactions/TransactionCard.jsx

import { Pressable, View, Text, StyleSheet } from 'react-native'
import { CheckCircle2, CircleCheckBig, Clock3, Clock4 } from 'lucide-react-native';

const formatCurrency = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const getDebtStatus = (item) => {
  if (item.transaction_type !== 'debt') return null
  const totalPaid = (item.debt_payments ?? []).reduce((s, p) => s + p.amount_paid, 0)
  const outstanding = item.total_amount - totalPaid
  if (outstanding <= 0) return 'settled'
  if (totalPaid > 0) return 'partial'
  return 'unpaid'
}

const STATUS = {
  sale:    { label: 'Sale',    badgeBg: '#e1f5ee', badgeText: '#085041', accent: null, icon: CircleCheckBig },
  unpaid:  { label: 'Unpaid',  badgeBg: '#fcebeb', badgeText: '#791f1f', accent: '#E24B4A', icon: Clock4 },
  partial: { label: 'Partial', badgeBg: '#faeeda', badgeText: '#633806', accent: '#EF9F27', icon: Clock3 },
  settled: { label: 'Settled', badgeBg: '#e1f5ee', badgeText: '#085041', accent: '#42B39E', icon: CheckCircle2 },
}

const formatTitle = (items) => {
  if (!items || items.length === 0) return 'Transaction'
  const first = items[0]?.product_variants?.products?.name ?? 'Item'
  return items.length > 1 ? `${first} + ${items.length - 1} more` : first
}

export default function TransactionCard({ item, onPress }) {
  const debtStatus = getDebtStatus(item)
  const statusKey = item.transaction_type === 'sale' ? 'sale' : debtStatus
  const status = STATUS[statusKey] ?? STATUS.sale
  const isDebt = item.transaction_type !== 'sale'
  const IconComponent = status.icon

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        status.accent && { borderLeftColor: status.accent, borderLeftWidth: 3, borderRadius: 0, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
        pressed && styles.cardPressed
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: status.badgeBg }]}>
        <IconComponent size={16} color={status.badgeText} />
      </View>

      <View style={styles.mid}>
        <Text style={styles.title} numberOfLines={1}>
          {item.customers?.name ?? formatTitle(item.items)}
        </Text>
        <Text style={styles.meta}>
          {item.items?.length ?? 0} item{item.items?.length !== 1 ? 's' : ''} · {formatTime(item.created_at)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, isDebt && styles.amountDebt]}>
          {isDebt ? '-' : '+'}{formatCurrency(item.total_amount)}
        </Text>
        <View style={[styles.badge, { backgroundColor: status.badgeBg }]}>
          <Text style={[styles.badgeText, { color: status.badgeText }]}>
            {status.label}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 8,
  },
  cardPressed: {
    backgroundColor: '#f5f5f5',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconText: {
    fontSize: 16,
    color: '#085041',
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  amountDebt: {
    color: '#a32d2d',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
  },
})