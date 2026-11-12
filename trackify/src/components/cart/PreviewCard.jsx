import { useMemo } from "react";
import { getItemMargin } from "../../utils/cartUtils.js"
import { View, Text, StyleSheet } from "react-native"
import { AlertTriangle, TrendingUp } from "lucide-react-native";

const TEAL = '#0F6E56'

const PreviewCard = ({ originalPrice, lineTotal, discountType, discountValue, showMargin, item }) => {
  const value = parseFloat(discountValue) || 0

  const discountAmount = useMemo(() => {
    if (!value) return 0
    if (discountType === 'percent') return lineTotal * (value / 100)
    return Math.min(value, lineTotal)
  }, [originalPrice, lineTotal, discountType, value])

  const newPrice = Math.max(0, lineTotal - discountAmount)

  const margin = useMemo(() => {
    if (!showMargin || !item) return null
    return getItemMargin({ ...item, sell_price: newPrice, discount_type: null, discount_value: 0 })
  }, [newPrice, item, showMargin])

  if (!value) return null

  return (
    <View style={styles.previewCard}>
      <View style={styles.previewRow}>
        <Text style={styles.previewLabel}>Original price</Text>
        <Text style={[styles.previewValue, styles.previewStrike]}>
          ₦{lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={styles.previewLabel}>Discount</Text>
        <Text style={styles.previewDiscount}>
          − ₦{discountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <View style={styles.previewRow}>
        <Text style={styles.previewLabel}>New price</Text>
        <Text style={styles.previewNew}>
          ₦{newPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {margin && (
        <>
          <View style={styles.previewDivider} />
          <View style={styles.marginRow}>
            {margin.isLow
              ? <AlertTriangle size={13} color="#854F0B" />
              : <TrendingUp size={13} color={TEAL} />
            }
            <Text style={[styles.marginText, margin.isLow && styles.marginTextWarn]}>
              {margin.isLow
                ? `Margin drops to ${margin.percent.toFixed(1)}% — below recommended`
                : `Margin: ${margin.percent.toFixed(1)}% · ₦${margin.profit.toFixed(0)} profit`
              }
            </Text>
          </View>
        </>
      )}
    </View>
  )
}

export default PreviewCard

const styles = StyleSheet.create({
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: '#e8e8e8',
        padding: 12,
        gap: 8,
    },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewLabel: {
        fontSize: 13,
        color: '#999',
    },
    previewValue: {
        fontSize: 13,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    previewStrike: {
        textDecorationLine: 'line-through',
        color: '#bbb',
    },
    previewDiscount: {
        fontSize: 13,
        color: '#854F0B',
        fontWeight: '500',
    },
    previewNew: {
        fontSize: 15,
        color: TEAL,
        fontWeight: '700',
    },
    previewDivider: {
        height: 0.5,
        backgroundColor: '#f0f0f0',
    },
    marginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    marginText: {
        fontSize: 12,
        color: TEAL,
    },
    marginTextWarn: {
        color: '#854F0B',
    },
})

