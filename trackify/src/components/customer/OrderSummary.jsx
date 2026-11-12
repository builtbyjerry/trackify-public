import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { X } from 'lucide-react-native'

export default function OrderSummary({
  onCancel,
  onNext,
  payload,
}) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions()
  const [isItemsExpanded, setIsItemsExpanded] = useState(false)

  const { customer, items = [], transactionType, totalPrice, totalNoOfItems, notes } = payload

  const customerName =
    customer?.type === 'anonymous'
      ? 'Anonymous'
      : customer?.data?.name ?? '—'

  const ITEM_HEIGHT = SCREEN_HEIGHT * 0.18
  

  return (
    <View style={styles.container}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order summary</Text>
        <Pressable onPress={onCancel} style={styles.closeBtn} hitSlop={12}>
          <X size={18} color="#8E8E93" />
        </Pressable>
      </View>

      {/* ── Price ────────────────────────────────────────────────────────── */}
      <View style={styles.priceBlock}>
        <Text style={styles.priceLabel}>Total</Text>
        <Text style={styles.priceValue}>₦{Number(totalPrice).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</Text>
      </View>

      <View style={styles.separator} />

      {/* ── Meta rows (fixed, no scroll) ─────────────────────────────────── */}
      <View style={styles.metaBlock}>
        <View style={styles.row}>
          <Text style={styles.label}>Customer</Text>
          <Text style={[
            styles.value,
            customer?.type === 'anonymous' && styles.valueAnon
          ]}>
            {customerName}
          </Text>
        </View>
        <View style={styles.rowDivider} />
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <View style={[
            styles.typePill,
            transactionType === 'debt' ? styles.pillDebt : styles.pillSale
          ]}>
            <Text style={[
              styles.pillText,
              transactionType === 'debt' ? styles.pillTextDebt : styles.pillTextSale
            ]}>
              {transactionType}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.separator} />

      {/* ── Items block (fixed height, internally scrollable) ────────────── */}
      <View style={[styles.itemsBlock, { height: ITEM_HEIGHT }]}>
        {/* Items header — tappable to expand/collapse */}
        <Pressable
          style={styles.itemsToggle}
          onPress={() => setIsItemsExpanded(!isItemsExpanded)}
        >
          <View style={styles.itemsToggleLeft}>
            <Text style={styles.itemsTitle}>Items</Text>
            <View style={styles.itemCountPill}>
              <Text style={styles.itemCountText}>{totalNoOfItems}</Text>
            </View>
          </View>
          <Text style={styles.toggleChevron}>
            {isItemsExpanded ? '↑ collapse' : '↓ show all'}
          </Text>
        </Pressable>

        {/* Collapsed: first 2 items as a preview */}
        {!isItemsExpanded && (
          <View style={styles.itemsPreview}>
            {items.slice(0, 2).map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₦{Number(item.sell_price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
            {totalNoOfItems > 2 && (
              <Text style={styles.moreText}>+{totalNoOfItems - 2} more items</Text>
            )}
          </View>
        )}

        {/* Expanded: full scrollable list within the fixed block */}
        {isItemsExpanded && (
          <ScrollView
            style={styles.itemsScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsScrollContent}
          >
            {items.map((item, i) => (
              <View key={i}>
                <View style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ₦{Number(item.sell_price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                {i < items.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Notes — only if present, sits at the bottom of items block */}
      {notes ? (
        <View style={styles.noteRow}>
          <Text style={styles.noteIcon}>📝</Text>
          <Text style={styles.noteText} numberOfLines={2}>{notes}</Text>
        </View>
      ) : <View style={{ paddingVertical: 16}} />}

      <View style={styles.separator} />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
          onPress={onNext}
        >
          <Text style={styles.payText}>Confirm & Pay</Text>
        </Pressable>
      </View>

    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SURFACE  = '#FAFAF9'
const BORDER   = '#E5E5EA'   // iOS separator color
const TEXT_PRI = '#1C1C1E'   // iOS primary text
const TEXT_SEC = '#8E8E93'   // iOS secondary text
const ACCENT   = '#3D9E83'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SURFACE,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRI,
    letterSpacing: -0.2,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Price
  priceBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8, 
  },
  priceLabel: {
    fontSize: 13,
    color: TEXT_SEC,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: TEXT_PRI,
    letterSpacing: -1,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 0,
  },

  // Meta
  metaBlock: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowDivider: {
    height: 1,
    backgroundColor: BORDER,
  },
  label: {
    fontSize: 15,
    color: TEXT_SEC,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRI,
  },
  valueAnon: {
    color: TEXT_SEC,
    fontStyle: 'italic',
  },

  // Type pill
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillSale: {
    backgroundColor: '#E8F5F0',
  },
  pillDebt: {
    backgroundColor: '#FFF4EC',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pillTextSale: {
    color: ACCENT,
  },
  pillTextDebt: {
    color: '#C2622A',
  },

  // Items block
  itemsBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8, 
  },
  itemsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRI,
  },
  itemCountPill: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  toggleChevron: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '500',
  },

  // Items preview (collapsed)
  itemsPreview: {
    gap: 2,
  },

  // Items scroll (expanded)
  itemsScroll: {
    flex: 1,
  },
  itemsScrollContent: {
    paddingBottom: 4,
  },

  // Item row
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  qtyBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_PRI,
  },
  itemName: {
    fontSize: 14,
    color: TEXT_PRI,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRI,
  },
  moreText: {
    fontSize: 13,
    color: TEXT_SEC,
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Notes
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  noteIcon: {
    fontSize: 13,
    marginTop: 1,
  },
  noteText: {
    fontSize: 13,
    color: TEXT_SEC,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Footer
  footer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: ACCENT,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonPressed: {
    opacity: 0.85,
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
})