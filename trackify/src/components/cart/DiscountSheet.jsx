// components/cart/DiscountSheet.jsx

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, Pressable,
  TextInput,
  Dimensions,
} from 'react-native'
import { X } from 'lucide-react-native'
import BottomSheet from '../sheet/BottomSheet.jsx'
import PreviewCard from './PreviewCard.jsx'
import TypeToggle from './TypeToggle.jsx'
import { log } from '../../utils/loggers.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEAL = '#0F6E56'

// ─── Main component ───────────────────────────────────────────────────────────

const DiscountSheet = ({
  visible,
  onClose,
  onApply,
  onRemove,

  // item discount mode
  item = null,

  // order discount mode
  isOrderDiscount = false,
  orderSubtotal = 0,
  existingDiscountType = null,
  existingDiscountValue = 0,
}) => {

  const ref = useRef(null)
  const SCREEN_HEIGHT = Dimensions.get('screen').height
  const { bottom } = useSafeAreaInsets()
  const SNAP_POINT = -(SCREEN_HEIGHT * 0.57)


  const isItemMode = !!item && !isOrderDiscount
  const originalPrice = isItemMode ? item.sell_price : orderSubtotal
  const lineTotal = isItemMode ? item.sell_price * item.quantity : orderSubtotal
  const hasExisting = !!existingDiscountType && existingDiscountValue > 0

  const [discountType, setDiscountType] = useState('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (visible) {
      ref.current?.scrollTo(SNAP_POINT - bottom)
    } else {
      ref.current?.scrollTo(0)
    }
  }, [visible, SCREEN_HEIGHT])

  const handleApply = useCallback(() => {
    const value = parseFloat(discountValue)
    log('handleApply fired — discountType:', discountType, '| discountValue:', discountValue, '| parsed value:', value)
    if (!value || value <= 0) return
    if (discountType === 'percent' && value > 100) return
    onApply(discountType, value)
    onClose()
  }, [discountType, discountValue, onApply, onClose])

  const handleRemove = useCallback(() => {
    onRemove()
    onClose()
  }, [onRemove, onClose])

  const handleTypeChange = (type) => {
    setDiscountType(type)
    setDiscountValue('')  // clear value when switching type
  }

  const isValid = useMemo(() => {
    const value = parseFloat(discountValue)
    if (!value || value <= 0) return false
    if (discountType === 'percent' && value > 100) return false
    return true
  }, [discountType, discountValue])

  useEffect(() => {
    if (visible) {
      setDiscountType(existingDiscountType ?? 'percent')
      setDiscountValue(existingDiscountValue ? String(existingDiscountValue) : '')
    }
  }, [visible])

  return (
    <BottomSheet
      ref={ref}
      showHandle
      snapPoints={[SNAP_POINT]}
      avoidKeyboard
      onClose={onClose}
      showOverlay
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {isOrderDiscount ? 'Order discount' : `Discount : ${item?.name}`}
          </Text>
          <Text style={styles.headerSub}>
            {isOrderDiscount
              ? 'Applied to the total after item discounts'
              : `${item?.size} · original price ₦${item?.sell_price?.toLocaleString('en-NG')}`
            }
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <X size={16} color="#999" />
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Type toggle */}
        <TypeToggle value={discountType} onChange={handleTypeChange} />

        {/* Input */}
        <View>
          <Text style={styles.inputLabel}>Discount</Text>
          <View style={styles.inputBox}>
            <Text style={styles.inputPrefix}>
              {discountType === 'percent' ? '%' : '₦'}
            </Text>
            <TextInput
              style={[styles.input, focused && styles.inputBoxFocused]}
              value={discountValue}
              onChangeText={setDiscountValue}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#C0C0C0"
            />
          </View>
        </View>

        {/* Live preview */}
        <PreviewCard
          originalPrice={originalPrice}
          lineTotal={lineTotal}
          discountType={discountType}
          discountValue={discountValue}
          showMargin={isItemMode}
          item={item}
        />

        {/* Apply */}
        <Pressable
          style={[styles.applyBtn, !isValid && styles.applyBtnDisabled, discountValue === '' && {  marginTop: (SCREEN_HEIGHT * 0.6 )- (SCREEN_HEIGHT * 0.45) }]}
          onPress={handleApply}
          disabled={!isValid}
        >
          <Text style={styles.applyBtnText}>Apply discount</Text>
        </Pressable>

        {/* Remove — only if editing existing discount */}
        {hasExisting && (
          <Pressable style={styles.removeBtn} onPress={handleRemove}>
            <X size={14} color="#A32D2D" />
            <Text style={styles.removeBtnText}>Remove discount</Text>
          </Pressable>
        )}
      </View>
    </BottomSheet>
  )
}

export default DiscountSheet

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 12,
    color: '#999',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
    gap: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    gap: 6,
  },
  inputBoxFocused: {
    borderColor: TEAL,
    shadowColor: TEAL,
    shadowOpacity: 0.1,
  },
  inputPrefix: {
    fontSize: 16,
    color: '#999',
  },
  input: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    width: "95%",
  
  },
  applyBtn: {
    height: 50,
    backgroundColor: TEAL,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderWidth: 0.5,
    borderColor: '#F09595',
    borderRadius: 10,
  },
  removeBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A32D2D',
  },
})