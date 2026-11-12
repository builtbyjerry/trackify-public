import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native'
import { useCart } from '../../../src/hooks/useCart.jsx'
import CartItem from '../../../src/components/cart/CartItem.jsx'
import SaleCreditToggle from '../../../src/components/SaleCreditToggle.jsx'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { useTransactionSession } from '../../../src/hooks/useTransactionSession.jsx'
import { Plus } from 'lucide-react-native'
import DiscountSheet from '../../../src/components/cart/DiscountSheet.jsx'
import { log } from '../../../src/utils/loggers.js'
  
const Cart = () => {
  const { updateTransactionType } = useTransactionSession()
  const [transactionType, setTransactionType] = useState('sale')
  const [discountSheet, setDiscountSheet] = useState(null)
  const {
    cart,
    cartTotal,
    subtotal,
    orderDiscountType,
    orderDiscountValue,
    applyOrderDiscount,
    removeOrderDiscount,
    applyItemDiscount,
    removeItemDiscount,
  } = useCart()
  
  const hasOrderDiscount = !!orderDiscountType && orderDiscountValue > 0
  const orderDiscountAmount = subtotal - cartTotal
  useEffect(() => {
    log("Current Transaction Type in Cart:", transactionType)
    log("Cart: ", cart)
  }, [transactionType])

  const handleProceedToCustomer = () => {
    updateTransactionType(transactionType)
    router.push({
      pathname: '/cart/CustomerSelectScreen',
    })
  }
  
  const handleOpenItemDiscount = (item) => {
    setDiscountSheet({ item })
  }
  const openDiscount = () => {
    setDiscountSheet({ isOrderDiscount: true })
  }

  return (
      <SafeAreaView style={styles.container}>        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
        </View>

        {/* Cart Items */}
        <View style={styles.scrollView}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => 
              <CartItem 
                item={item}
                onOpenDiscount={() => handleOpenItemDiscount(item)} 
                />
          }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your cart is empty 🛒</Text>
              </View>
            }
          />
      </View>

        <View style={styles.footer}>
          <View style={styles.totalSection}>

            {/* Subtotal — only show when discounts exist */}
            {(hasOrderDiscount) && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  ₦{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            {/* Order discount row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Order discount</Text>
              {hasOrderDiscount ? (
                <Pressable onPress={() => setDiscountSheet({ isOrderDiscount: true })}>
                  <Text style={styles.discountActive}>
                    − ₦{orderDiscountAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.addDiscountBtn}
                  onPress={openDiscount}
                >
                  <Plus size={13} color="#635BFF" />
                  <Text style={styles.addDiscountText}>Add discount</Text>
                </Pressable>
              )}
            </View>

            {/* Sale/Credit toggle */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Credit/Sale</Text>
              <SaleCreditToggle
                transactionType={transactionType}
                setTransactionType={setTransactionType}
              />
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabelMain}>Total</Text>
              <Text style={[
                styles.totalValueMain,
                { color: transactionType === 'sale' ? '#42B39E' : '#CC475A' }
              ]}>
                ₦{cartTotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkoutButton} onPress={handleProceedToCustomer}>
            <Text style={styles.checkoutButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Order discount sheet */}
        <DiscountSheet
          visible={!!discountSheet}
          onClose={() => setDiscountSheet(null)}
          onApply={(type, value) => {
            log('onApply received — type:', type, '| value:', value, '| isOrderDiscount:', discountSheet?.isOrderDiscount)
            if (discountSheet?.isOrderDiscount) {
              applyOrderDiscount(type, value)
            } else {
              applyItemDiscount(discountSheet.item.id, type, value)
            }
            setDiscountSheet(null)
          }}
          onRemove={() => {
            if (discountSheet?.isOrderDiscount) {
              removeOrderDiscount()
            } else {
              removeItemDiscount(discountSheet.item.id)
            }
            setDiscountSheet(null)
          }}
          item={discountSheet?.item ?? null}
          isOrderDiscount={discountSheet?.isOrderDiscount ?? false}
          orderSubtotal={subtotal}
          existingDiscountType={
            discountSheet?.isOrderDiscount
              ? orderDiscountType
              : discountSheet?.item?.discount_type
          }
          existingDiscountValue={
            discountSheet?.isOrderDiscount
              ? orderDiscountValue
              : discountSheet?.item?.discount_value
          }
        />
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F2EF",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: { 
    alignItems: "center", 
    marginTop: 40 
  },
  emptyText: { 
    fontSize: 14, 
    color: "#888" 
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3C4043',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#42B39E',
  },
  error: {
    color: '#CC475A',
    padding: 10,
    backgroundColor: '#f5c1c8',
    borderColor: '#cc475a',
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  success: {
    color: '#4CAF50',
    padding: 10,
    backgroundColor: '#A1C2BD',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#DADCE0",
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#42B39E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#3C4043',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    color: '#3C4043',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#F1F3F4',
    borderTopWidth: 1,
    borderTopColor: "#DADCE0",
  },
  totalSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#5F6368',
  },
  totalLabelMain: {
    fontSize: 18,
    color: "#3C4043",
    fontWeight: 'bold',
  },
  totalValueMain: {
    fontSize: 18,
    color: "#42B39E",
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: "#42B39E",
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#E8EAED',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalView: {
    alignItems: 'center',
    flex: 1,
    padding: 24,
  },
  discountActive: {
  fontSize: 13,
  color: '#854F0B',
  fontWeight: '500',
},
addDiscountBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
addDiscountText: {
  fontSize: 13,
  color: '#635BFF',
  fontWeight: '500',
},
totalValue: {
  fontSize: 14,
  color: '#1a1a1a',
  fontWeight: '500',
},
  
})

export default Cart