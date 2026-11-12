export const getEffectivePrice = (item) => {
  if (!item.discount_type || !item.discount_value) return item.sell_price
  if (item.discount_type === 'percent') {
    return item.sell_price * (1 - item.discount_value / 100)
  }
  const lineTotal = item.sell_price * item.quantity
  const discounted = Math.max(0, lineTotal - item.discount_value)
  return discounted / item.quantity  // back to per-unit for consistency
}

export const applyItemDiscount = (currentCart, productId, discountType, discountValue) => {
  return currentCart.map(item =>
    item.id === productId
      ? { ...item, discount_type: discountType, discount_value: discountValue }
      : item
  )
}

export const removeItemDiscount = (currentCart, productId) => {
  return currentCart.map(item =>
    item.id === productId
      ? { ...item, discount_type: null, discount_value: 0 }
      : item
  )
}

export const calculateSubtotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (getEffectivePrice(item) * item.quantity)
  }, 0)
}

// replaces existing calculateCartTotal
export const calculateCartTotal = (cartItems, orderDiscountType = null, orderDiscountValue = 0) => {
  const subtotal = calculateSubtotal(cartItems)
  if (!orderDiscountType || !orderDiscountValue) return subtotal
  if (orderDiscountType === 'percent') {
    return subtotal * (1 - orderDiscountValue / 100)
  }
  return Math.max(0, subtotal - orderDiscountValue)
}

export const getItemMargin = (item) => {
  const effectivePrice = getEffectivePrice(item)
  const cost = (item.cost_per_base_unit ?? 0) * item.units_per_variant
  if (!cost || effectivePrice <= 0) return null
  const profit = effectivePrice - cost
  const percent = (profit / effectivePrice) * 100
  return { profit, percent, isLow: percent < 10 }
}