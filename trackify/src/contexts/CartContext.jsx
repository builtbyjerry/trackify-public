// src/contexts/CartContext.jsx
import { createContext, useState } from 'react'
import { 
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  processTransaction,
} from '../services/cartService'
import { useTransactionSession } from '../hooks/useTransactionSession'

import { applyItemDiscount, removeItemDiscount, calculateCartTotal, calculateSubtotal } from '../utils/cartUtils.js'
import { errorLog, log } from '../utils/loggers.js';

export const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderDiscountType, setOrderDiscountType] = useState(null)
  const [orderDiscountValue, setOrderDiscountValue] = useState(0)
  
  const { clearSession } = useTransactionSession()

  const addToCart = (product, quantity = 1) => {
    try {
      setError(null)
      const updatedCart = addItemToCart(cart, product, quantity)
      setCart(updatedCart)
    } catch (err) {
      setError(err.message)
      errorLog('Failed to add to cart:', err)
      throw err
    }
  }

  const removeFromCart = (productId) => {
    try {
      setError(null)
      const updatedCart = removeItemFromCart(cart, productId)
      setCart(updatedCart)
    } catch (err) {
      setError(err.message)
      errorLog('Failed to remove from cart:', err)
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    try {
      setError(null)
      const updatedCart = updateItemQuantity(cart, productId, newQuantity)
      setCart(updatedCart)
    } catch (err) {
      setError(err.message)
      errorLog('Failed to update quantity:', err)
      throw err
    }
  }

  const checkout = async (employeeId, businessId, transactionType, customer, notes, userId, orderDiscountType, orderDiscountValue) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await processTransaction(employeeId, businessId, transactionType, cart, customer, notes, userId, orderDiscountType, orderDiscountValue)
      clearCart() 
      clearSession()
      return result
    } catch (err) {
      setError(err.message)
      errorLog('Checkout failed:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // update clearCart to also clear order discount
  const clearCart = () => {
    setCart([])
    setOrderDiscountType(null)
    setOrderDiscountValue(0)
    setError(null)
  }
  
  // new actions
  const applyItemDiscountAction = (productId, discountType, discountValue) => {
    try {
      setError(null)
      setCart(prev => applyItemDiscount(prev, productId, discountType, discountValue))
    } catch (err) {
      setError(err.message)
    }
  }

  const removeItemDiscountAction = (productId) => {
    try {
      setError(null)
      setCart(prev => removeItemDiscount(prev, productId))
    } catch (err) {
      setError(err.message)
    }
  }

  const applyOrderDiscount = (discountType, discountValue) => {
    log('applyOrderDiscount called — type:', discountType, '| value:', discountValue)
    setOrderDiscountType(discountType)
    setOrderDiscountValue(discountValue)
  }

  const removeOrderDiscount = () => {
    setOrderDiscountType(null)
    setOrderDiscountValue(0)
  }

  // update value object
  const value = {
    cart,
    loading,
    error,

    addToCart,
    removeFromCart,
    updateQuantity,
    checkout,
    clearCart,
    applyItemDiscount: applyItemDiscountAction,
    removeItemDiscount: removeItemDiscountAction,
    applyOrderDiscount,
    removeOrderDiscount,

    cartTotal: calculateCartTotal(cart, orderDiscountType, orderDiscountValue),
    subtotal: calculateSubtotal(cart),
    orderDiscountType,
    orderDiscountValue,
    itemCount: cart.length,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}