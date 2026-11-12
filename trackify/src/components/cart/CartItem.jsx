import { useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { Minus, Plus, Trash2, Percent } from 'lucide-react-native'
import ProductThumbnail from '../products/ProductThumbnail.jsx'
import { useCart } from '../../hooks/useCart.jsx'
import { getEffectivePrice } from '../../utils/cartUtils.js'

const CartItem = ({ item, onOpenDiscount }) => {
  const { updateQuantity, removeFromCart } = useCart()

  const hasDiscount = !!item.discount_type && item.discount_value > 0
  const effectivePrice = getEffectivePrice(item)
  const lineTotal = effectivePrice * item.quantity
  const originalLineTotal = item.sell_price * item.quantity

  const handleIncrease = useCallback(() => {
    updateQuantity(item.id, item.quantity + 1)
  }, [item.id, item.quantity])

  const handleDecrease = useCallback(() => {
    if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1)
  }, [item.id, item.quantity])

  return (
    <>
      <View style={styles.card}>
        {/* Trash — top right */}
        <Pressable
          style={styles.trashBtn}
          onPress={() => removeFromCart(item.id)}
          hitSlop={4}
        >
          <Trash2 size={14} color="#fff" />
        </Pressable>

        <View style={styles.top}>
          {/* Thumbnail */}
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.image} />
          ) : (
            <ProductThumbnail name={item.name} imageUrl={null} size={64} />
          )}

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.category} numberOfLines={1}>
              {item.category}{item.size ? ` · ${item.size}` : ''}
            </Text>

            {/* Price row */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₦{lineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </Text>
              {hasDiscount && (
                <>
                  <Text style={styles.originalPrice}>
                    ₦{originalLineTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {item.discount_type === 'percent'
                        ? `${item.discount_value}%`
                        : `₦${item.discount_value}`
                      } off
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Bottom row — qty stepper + discount btn */}
        <View style={styles.bottom}>
          <View style={styles.qtyRow}>
            <Pressable style={styles.qtyBtn} onPress={handleDecrease}>
              <Minus size={14} color="#fff" />
            </Pressable>
            <Text style={styles.qtyVal}>{item.quantity}</Text>
            <Pressable style={styles.qtyBtn} onPress={handleIncrease}>
              <Plus size={14} color="#fff" />
            </Pressable>
          </View>

          <Pressable
            style={[styles.discountBtn, hasDiscount && styles.discountBtnActive]}
            onPress={onOpenDiscount}
          >
            <Percent size={13} color={hasDiscount ? '#854F0B' : '#999'} />
            <Text style={[styles.discountBtnText, hasDiscount && styles.discountBtnTextActive]}>
              {hasDiscount
                ? item.discount_type === 'percent'
                  ? `${item.discount_value}% off`
                  : `₦${item.discount_value} off`
                : 'Discount'
              }
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  )
}

export default CartItem

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginVertical: 5,
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    position: 'relative',
  },
  trashBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CC475A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  top: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    paddingRight: 30,  // space for trash btn
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#42B39E',
  },
  originalPrice: {
    fontSize: 12,
    color: '#bbb',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FFF6E5',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountBadgeText: {
    fontSize: 11,
    color: '#854F0B',
    fontWeight: '500',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#42B39E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: 32,
    textAlign: 'center',
  },
  discountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  discountBtnActive: {
    borderColor: '#854F0B',
    backgroundColor: '#FFF6E5',
  },
  discountBtnText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  discountBtnTextActive: {
    color: '#854F0B',
  },
})