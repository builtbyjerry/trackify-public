import { createTransaction, createTransactionItems } from '../api/cart.js'
import { createCustomer } from '../api/customer.js'
import { calculateCartTotal, calculateSubtotal, getEffectivePrice } from '../utils/cartUtils.js';
import { errorLog, log } from '../utils/loggers.js';

export const validateProduct = (product_variant) => {
  if (!product_variant) {
    throw new Error('Product is required')
  }
  
  if (!product_variant.id) {
    throw new Error('Product ID is missing')
  }
  
  if (!product_variant.name || typeof product_variant.name !== 'string') {
    throw new Error('Product name is invalid')
  }
  
  if (typeof product_variant.sell_price !== 'number' || product_variant.sell_price < 0) {
    throw new Error('Product price is invalid')
  }
}

export const validateQuantity = (quantity) => {
  if (typeof quantity !== 'number' || quantity < 1) {
    throw new Error('Quantity must be at least 1')
  }
  
  if (quantity > 1000) {
    throw new Error('Quantity cannot exceed 1000')
  }
}

export const calculateTotalItems = (cartItems) => {
  return cartItems.reduce((total, item) => total + item.quantity, 0)
}


export const addItemToCart = (currentCart, product_variant, quantity = 1) => {
  validateProduct(product_variant)
  validateQuantity(quantity)
  
  const existingItem = currentCart.find(item => item.id === product_variant.id)

  if (existingItem) {
    return currentCart.map(item => 
      item.id === product_variant.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    )
  }

  return [...currentCart, {
    id: product_variant.id,
    name: product_variant.products?.name,
    sell_price: product_variant.sell_price,
    category: product_variant.products?.category,
    size: product_variant.name,
    quantity: quantity,
    image_url: product_variant.image_url,
    cost_per_base_unit: product_variant.products?.cost_per_base_unit,
    units_per_variant: product_variant.units_per_variant,
    discount_type: null,
    discount_value: 0, 
  }]
}

export const removeItemFromCart = (currentCart, productId) => {
  return currentCart.filter(item => item.id !== productId)
}

export const updateItemQuantity = (currentCart, productId, newQuantity) => {
  validateQuantity(newQuantity)
  
  return currentCart.map((item) => 
    item.id === productId 
      ? { ...item, quantity: newQuantity } 
      : item
  )
}

const resolveCustomerId = async (customer, businessId) => {
  if (!customer) return null
  if (customer.data.id) return customer.data.id

  // New customer — create and return id
  const newCustomer = await createCustomer({
    name: customer.data.name ?? null,
    phone: customer.data.phone ?? null,
    business_id: businessId
  })
  log(`Customer ${newCustomer.name} with phone ${newCustomer.phone} and business id ${businessId} and customerId ${newCustomer.id}`)

  return newCustomer.id
}

/**
 * Maps cart items to transaction_items rows
 * Cart item must carry: variant_id, quantity, price_at_purchase, product (with cost_per_base_unit), variant (with units_per_variant)
 */
const buildTransactionItems = (transactionId, cartItems) => {
  return cartItems.map(item => {
    if (item.cost_per_base_unit == null) {
      throw new Error(`Cost price not set for ${item.name}. Please update product before selling.`)
    }

    const costPriceAtPurchase = item.cost_per_base_unit * item.units_per_variant
    const effectivePrice = getEffectivePrice(item)

    return {
      transaction_id: transactionId,
      variant_id: item.id,
      quantity_sold: item.quantity,
      price_at_purchase: effectivePrice,         // final price after item discount
      original_price: item.sell_price,           // original before discount
      cost_price_at_purchase: costPriceAtPurchase,
      discount_type: item.discount_type ?? null,
      discount_value: item.discount_value ?? 0,
    }
  })
}


export const processTransaction = async (
  employeeId,
  businessId,
  transactionType,
  cartItems,
  customer = null,
  notes = null,
  userId,
  orderDiscountType = null,
  orderDiscountValue = 0,
) => {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty')
  }

  const subtotal = calculateSubtotal(cartItems)
  const totalAmount = calculateCartTotal(cartItems, orderDiscountType, orderDiscountValue)
  const discountAmount = subtotal - totalAmount  // actual ₦ saved
  const itemCount = cartItems.length
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  try {
    const customerId = await resolveCustomerId(customer, businessId)

    const transaction = await createTransaction({
      employee_id: employeeId,
      business_id: businessId,
      customer_id: customerId,
      transaction_type: transactionType,
      total_amount: totalAmount,
      quantity: totalQuantity,
      notes: notes ?? null,
      item_count: itemCount,
      user_profile_id: userId,
      discount_type: orderDiscountType,
      discount_value: orderDiscountValue,
      discount_amount: discountAmount > 0 ? discountAmount : 0,
    })

    const buildItems = buildTransactionItems(transaction.id, cartItems)
    await createTransactionItems(buildItems)

    return { success: true }
  } catch (error) {
    errorLog('Transaction failed:', error)
    throw new Error(`Failed to process transaction: ${error.message}`)
  }
}