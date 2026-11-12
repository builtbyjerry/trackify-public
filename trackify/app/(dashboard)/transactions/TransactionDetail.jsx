import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useUser } from '../../../src/hooks/useUser.jsx'
import {
  fetchTransactionDetail,
  deriveDebtStatus
} from '../../../src/services/transactionService.js'
import RecordPaymentSheet from '../../../src/components/transactions/RecordPaymentSheet.jsx'
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorLog } from '../../../src/utils/loggers.js';

const formatCurrency = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

const formatDateTime = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

const formatDateOnly = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

const HERO_STYLES = {
  sale:    { bg: '#e8f7f1', border: '#b8e8d4', amount: '#085041', badgeBg: '#b8e8d4', badgeText: '#085041' },
  unpaid:  { bg: '#fdf0f0', border: '#f5c4c4', amount: '#a32d2d', badgeBg: '#f5c4c4', badgeText: '#791f1f' },
  partial: { bg: '#fdf5e8', border: '#f5d99a', amount: '#854f0b', badgeBg: '#f5d99a', badgeText: '#633806' },
  settled: { bg: '#e8f7f1', border: '#b8e8d4', amount: '#085041', badgeBg: '#b8e8d4', badgeText: '#085041' },
}

const STATUS_LABELS = {
  sale: 'Sale', unpaid: 'Unpaid', partial: 'Partial', settled: 'Settled'
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { employee } = useUser()
  const businessId = employee?.business_id

  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)

  useEffect(() => {
    loadTransaction()
  }, [id])

  const loadTransaction = async () => {
    setLoading(true)
    try {
      const data = await fetchTransactionDetail(id, businessId)
      setTransaction(data)
    } catch (err) {
      errorLog('Failed to load transaction:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color='#42B39E' />
      </View>
    )
  }

  if (!transaction) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    )
  }

  const isDebt = transaction.transaction_type === 'debt'
  const debtInfo = isDebt ? deriveDebtStatus(transaction) : null
  const statusKey = isDebt ? (debtInfo?.status ?? 'unpaid') : 'sale'
  const hero = HERO_STYLES[statusKey]

  const sortedPayments = [...(transaction.debt_payments ?? [])]
    .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topbar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topbarTitle}>Transaction</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={[styles.hero, { backgroundColor: hero.bg, borderColor: hero.border }]}>
            <Text style={[styles.heroAmount, { color: hero.amount }]}>
              {formatCurrency(transaction.total_amount)}
            </Text>
            <View style={styles.heroRow}>
              <View style={[styles.badge, { backgroundColor: hero.badgeBg }]}>
                <Text style={[styles.badgeText, { color: hero.badgeText }]}>
                  {STATUS_LABELS[statusKey]}
                </Text>
              </View>
              <Text style={styles.heroDate}>
                {formatDateTime(transaction.created_at)}
              </Text>
            </View>
          </View>

          {/* Debt status card */}
          {isDebt && debtInfo && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Debt status</Text>
              <DetailRow label='Total owed' value={formatCurrency(transaction.total_amount)} />
              {debtInfo.status === 'settled' ? (
                <>
                  <DetailRow
                    label='Paid in full'
                    value={formatCurrency(debtInfo.totalPaid)}
                    valueColor='#0a7d4f'
                  />
                  <DetailRow
                    label='Settled on'
                    value={debtInfo.settledAt ? formatDateOnly(debtInfo.settledAt) : '—'}
                  />
                  <DetailRow
                    label='Time to settle'
                    value={`${debtInfo.daysOutstanding} day${debtInfo.daysOutstanding !== 1 ? 's' : ''}`}
                    last
                  />
                </>
              ) : (
                <>
                  <DetailRow
                    label='Paid so far'
                    value={formatCurrency(debtInfo.totalPaid)}
                    valueColor={debtInfo.totalPaid > 0 ? '#0a7d4f' : '#999999'}
                  />
                  <DetailRow
                    label='Outstanding'
                    value={formatCurrency(debtInfo.outstanding)}
                    valueColor='#a32d2d'
                  />
                  <DetailRow
                    label='Days outstanding'
                    value={`${debtInfo.daysOutstanding} day${debtInfo.daysOutstanding !== 1 ? 's' : ''}`}
                    valueColor={debtInfo.daysOutstanding > 3 ? '#a32d2d' : '#854f0b'}
                    last={debtInfo.status === 'unpaid'}
                  />
                  {debtInfo.status === 'partial' && (
                    <View style={styles.progressWrap}>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>
                          {formatCurrency(debtInfo.totalPaid)} paid
                        </Text>
                        <Text style={styles.progressLabel}>
                          {Math.round(debtInfo.pctPaid)}%
                        </Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${debtInfo.pctPaid}%`, backgroundColor: '#EF9F27' }
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Payment history */}
          {isDebt && sortedPayments.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment history</Text>
              {sortedPayments.map((payment, index) => (
                <View
                  key={payment.id}
                  style={[
                    styles.paymentRow,
                    index === sortedPayments.length - 1 && styles.paymentRowLast
                  ]}
                >
                  <Text style={styles.paymentDate}>
                    {formatDateTime(payment.paid_at)}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    +{formatCurrency(payment.amount_paid)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Details</Text>
            <DetailRow
              label='Customer'
              value={transaction.customers?.name ?? 'Anonymous'}
            />
            <DetailRow
              label='Recorded by'
              value={
                transaction.user_profiles?.first_name && transaction.user_profiles?.last_name
                  ? `${transaction.user_profiles.first_name} ${transaction.user_profiles.last_name}`
                  : transaction.user_profiles?.display_name ??
                    transaction.employee?.id ??
                    "-"
              }
            />
            {transaction.notes ? (
              <DetailRow label='Note' value={transaction.notes} />
            ) : null}
            {/* Order-level discount — only show if one was applied */}
            {transaction.discount_amount > 0 && (
              <>
                <DetailRow
                  label='Subtotal'
                  value={formatCurrency(
                    transaction.total_amount + transaction.discount_amount
                  )}
                />
                <DetailRow
                  label={
                    transaction.discount_type === 'percent'
                      ? `Order discount (${transaction.discount_value}%)`
                      : 'Order discount'
                  }
                  value={`− ${formatCurrency(transaction.discount_amount)}`}
                  valueColor='#854F0B'
                />
              </>
            )}
            <DetailRow
              label='Items'
              value={String(transaction.transaction_items?.length ?? 0)}
              last
            />
          </View>

          {/* Items card — show discount per item */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Items</Text>
            {(transaction.transaction_items ?? []).map((item, index) => {
              const isLast = index === transaction.transaction_items.length - 1
              const hasDiscount = item.discount_type && item.discount_value > 0
              const originalLineTotal = item.original_price * item.quantity_sold
              const finalLineTotal = item.price_at_purchase * item.quantity_sold

              return (
                <View key={item.id}>
                  <DetailRow
                    label={`${item.product_variants?.products?.name} · ${item.product_variants?.name} × ${item.quantity_sold}`}
                    value={formatCurrency(finalLineTotal)}
                    last={isLast && !hasDiscount}
                  />
                  {hasDiscount && (
                    <DetailRow
                      label={
                        item.discount_type === 'percent'
                          ? `  ↳ ${item.discount_value}% discount`
                          : `  ↳ ₦${item.discount_value} discount`
                      }
                      value={`− ${formatCurrency(originalLineTotal - finalLineTotal)}`}
                      valueColor='#854F0B'
                      last={isLast}
                    />
                  )}
                </View>
              )
            })}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Action area */}
        {isDebt && debtInfo?.status !== 'settled' && (
          <View style={styles.actionArea}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setPaymentSheetOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Record payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {isDebt && debtInfo?.status === 'settled' && (
          <View style={styles.actionArea}>
            <Text style={styles.settledNote}>This debt has been fully settled</Text>
          </View>
        )}
      </SafeAreaView>

      <RecordPaymentSheet
        visible={paymentSheetOpen}
        transaction={transaction}
        outstanding={debtInfo?.outstanding ?? 0}
        businessId={businessId}
        employeeId={employee?.id}
        onClose={() => setPaymentSheetOpen(false)}
        onSuccess={() => {
          setPaymentSheetOpen(false)
          loadTransaction()
        }}
      />
    </>
  )
}

function DetailRow({ label, value, valueColor, last }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 14,
    color: '#999999'
  },
  topbar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backArrow: {
    fontSize: 20,
    color: '#1a1a1a',
    lineHeight: 22
  },
  topbarTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    gap: 10
  },
  hero: {
    borderRadius: 14,
    borderWidth: 0.5,
    padding: 18,
    marginBottom: 2
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '500',
    marginBottom: 8
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500'
  },
  heroDate: {
    fontSize: 12,
    color: '#999999'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 14,
    marginBottom: 2
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0
  },
  rowLabel: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
    paddingRight: 12
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'right'
  },
  progressWrap: {
    marginTop: 10
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  progressLabel: {
    fontSize: 11,
    color: '#999999'
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  paymentRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0
  },
  paymentDate: {
    fontSize: 12,
    color: '#666666'
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0a7d4f'
  },
  actionArea: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0'
  },
  actionBtn: {
    backgroundColor: '#0a7d4f',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center'
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff'
  },
  settledNote: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 4
  }
})