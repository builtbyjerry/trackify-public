import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  Pressable,
  Keyboard, 
  KeyboardAvoidingView,
  Modal,
  Dimensions, 
} from 'react-native'
import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'


import { TransactionNotes } from '../../../src/components/customer/TransactionNotes.jsx'
import { SearchBar } from '../../../src/components/customer/SearchBar.jsx'
import { TabSwitcher } from '../../../src/components/customer/TabSwitcher.jsx'
import { RecentSearchView } from '../../../src/components/customer/RecentSearchView.jsx'
import { AnonymousView } from '../../../src/components/customer/AnonymousView.jsx'
import AddCustomerModal from '../../../src/components/customer/AddCustomerModal.jsx'
import AddedCustomerCard from '../../../src/components/customer/AddedCustomerCard.jsx'
import BottomSheet from '../../../src/components/sheet/BottomSheet.jsx'
import OrderSummary from '../../../src/components/customer/OrderSummary.jsx'
import PinSheetModal from '../../../src/components/customer/PinSheetModal.jsx'
import { useCart } from '../../../src/hooks/useCart.jsx'
import { useUser } from '../../../src/hooks/useUser.jsx'
import { otpService } from '../../../src/services/otpService.jsx'
import { OTP_PURPOSES } from '../../../src/constants/otpConstants.js' 
import { useToast } from '../../../src/hooks/useToast.jsx'
import { verifyPin } from '../../../src/services/userProfileService.js' 
import { useTransactionSession } from '../../../src/hooks/useTransactionSession.jsx'
import { getAllCustomers } from '../../../src/api/customer.js'
import { log, errorLog } from '../../../src/utils/loggers.js'

const CustomerSelectScreen = () => {
  // ── Constants ──
  const purpose = OTP_PURPOSES.PIN_RESET


  // ── Navigation & external params ──
  const { pinResetSuccess } = useLocalSearchParams()
  const SCREEN_HEIGHT = Dimensions.get('screen').height
  const { bottom } = useSafeAreaInsets()

  // ── Contexts ──
  const { cart, cartTotal, itemCount, checkout, orderDiscountType, orderDiscountValue } = useCart()
  const { employee, user } = useUser()
  const { showToast } = useToast()
  const { transactionType: txnType, updateCustomer, updateNotes, notes, customer, clearSession } = useTransactionSession()
  const employeeBusinessId = employee?.business_id
  const employeeId = employee?.id
  const userId = user?.id
  const userEmail = user?.email
  


  // ── Refs & sheet config ──
  const sheetRef1 = useRef()
  const sheetRef2 = useRef()
  const SNAP_POINT = -(SCREEN_HEIGHT * 0.6)
  const PIN_SNAP_POINT = -(SCREEN_HEIGHT * 0.52)

  // ── UI state ──
  const [mode, setMode] = useState('recentSearch')
  const [modalVisible, setModalVisible] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [pinSheetVisible, setPinSheetVisible] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [forgotPinLoading, setForgotPinLoading] = useState(false)
  const [isCustomersLoading, setIsCustomersLoading] = useState(true)

  // ── Form state ──
  const [allCustomers, setAllCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' })

  // ── Derived state ──
  const canProceed = !!selected || mode === 'anonymous' || (newCustomer.name && newCustomer.phone)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allCustomers
    return allCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [query, allCustomers])

  const resolveCustomer = () => {
    if (newCustomer?.name?.trim()) return { type: 'new', data: newCustomer }
    if (selected) return { type: 'existing', data: selected }
    if (mode === 'anonymous') return null
    return null
  }

  const payload = {
    customer: resolveCustomer(),
    items: cart,
    transactionType: txnType,
    totalPrice: cartTotal,
    totalNoOfItems: itemCount,
    notes: notes,
  }

  // ── Effects ──
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: customers } = await getAllCustomers()
        setAllCustomers(customers)
      } catch (error) {
        errorLog("Failed to fetch customers:", error)
      } finally {
        setIsCustomersLoading(false)
      }
    }

    fetchCustomers()
  }, [])
  useEffect(() => {
    if (mode === 'anonymous') setSelected(null)
  }, [mode])
  useEffect(() => {
    if (pinSheetVisible) {
      sheetRef2.current?.scrollTo(PIN_SNAP_POINT - bottom)
    }
  }, [pinSheetVisible, PIN_SNAP_POINT])

  useEffect(() => {
    if (!pinResetSuccess) return
    showToast({
      title: 'PIN updated',
      description: 'Enter it below to complete your order'
    })
  }, [])

  // ── Handlers ──
  const handleSelectCustomer = (customer) => {
    setSelected(customer)
    log("Customer:", customer)
  }
  const handleOpenModal = () => setModalVisible(true)
  const handleCloseModal = () => setModalVisible(false)
  const editModal = () => setModalVisible(true)

  const saveNewCustomer = (name, phone) => {
    setNewCustomer({ name, phone })
    setSelected(null)
  }

  const removeNewCustomer = () => setNewCustomer({ name: '', phone: '' })

  const onCancel = () => {
    clearSession()
    if (pinResetSuccess) {
      router.replace('/(dashboard)/cart/index.jsx')
    } else {
      router.back()
    }
  }

  const handleNext = () => {
    if (!canProceed) return
    if (txnType === 'debt' && mode === 'anonymous') {
      showToast({
        title: 'Customer required',
        description: 'Debt transactions must be linked to a customer',
        type: 'warning'
      })
      log("User Id:", userId)
      return
    }
    openBottomSheet()
    log("Next pressed")
  }

  const openBottomSheet = useCallback(() => {
    if (!sheetRef1?.current) {
      log("Not present")
      return
    }
    log("present?")
    sheetRef1.current.scrollTo(SNAP_POINT - bottom)
    setSummaryVisible(true)
    Keyboard.dismiss()
  }, [SNAP_POINT])

  const closeBottomSheet = useCallback(() => {
    if (!sheetRef1?.current) return
    sheetRef1.current.scrollTo(0)
    setSummaryVisible(false)
  }, [])

  const openPinBottomSheet = useCallback(() => {
    updateCustomer(resolveCustomer())
    const resolved = resolveCustomer()
    log("resolved customer:", resolved)
    log('=== TRANSACTION DEBUG ===')
    log('orderDiscountType:', orderDiscountType)
    log('orderDiscountValue:', orderDiscountValue)
    log('=========================')
    updateNotes(notes)
    setPinSheetVisible(true)
  }, [notes, resolveCustomer, customer])

  const closePinBottomSheet = useCallback(() => {
    if (!sheetRef2?.current) return
    sheetRef2.current.scrollTo(0)
    setPinSheetVisible(false)
  }, [])

  const submitTransaction = async (pin) => {
    setPinError(false)
    try {
      const result = await verifyPin(pin, userId)
      log("Success returned is:", JSON.stringify(result, null, 2))
      
      if (!result.isValid) {
          setPinError(true)
          log("Error from here?? Is it?")
          return
      }

      // saveOrder(orderDetails) goes here when ready
      log("PIN verified, proceeding with transaction")
      const { success } = await checkout(employeeId, employeeBusinessId, txnType, customer, notes, userId, orderDiscountType, orderDiscountValue)
      if (success) {
        log("Check your transactions boyy")
        const resolved = resolveCustomer()
        router.replace({
          pathname: '/transaction-success',
          params: {
            customerName: resolved?.data?.name || 'Anonymous',
            customerPhone: resolved?.data?.phone || '', // if the transaction is anonymous
            cartTotal,
            txnType,
          },
        })
      }

      } catch (error) {
          log("Caught error from catch block", error)
          setPinError(true)
      }
  }

  const handleForgotPin = async () => {
    log("Your email:", userEmail)
    setForgotPinLoading(true)
    try {
      const result = await otpService.requestOTP(userEmail, purpose)
      if (result.success) {
        router.push({
          pathname: "/pin-reset/ResetPinOtp",
          params: { purpose: purpose }
        })
      } else {
        errorLog(result.error)
      }
    } catch (err) {
      errorLog(err)
    } finally {
      setForgotPinLoading(false)
    }
  }

  
  return (
    <>
    <SafeAreaView style={styles.container}>
     
      {(summaryVisible && <View style={[styles.overlay, { zIndex: 1}]} />)}
      {/* HEADER – always visible */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select customer</Text>
        <TabSwitcher mode={mode} onModeChange={setMode} />

        {/* Search bar only in recent mode */}
        {mode === 'recentSearch' && (
          <SearchBar value={query} onChangeText={setQuery} />
        )}
      </View>

      {/* MAIN SCROLLABLE AREA + KEYBOARD HANDLING */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* BODY – switches between the two views */}
        <View style={styles.body}>
          {mode === 'recentSearch' ? (
            // If new customer present
            (newCustomer.name || newCustomer.phone) ? (
              <AddedCustomerCard
                customer={newCustomer}
                onEdit={editModal}
                onRemove={removeNewCustomer}
              />
            ) : (
              // else if show the search view
            <RecentSearchView
              data={filtered}
              selected={selected}
              onSelect={handleSelectCustomer}
              onAddNew={handleOpenModal}
              loading={isCustomersLoading}
            />
            )
          ) : (
            // else show anonymous view
            <AnonymousView />
          )}
        </View>

        {/* SHARED NOTES – always at the bottom of the visible area */}
        <View style={styles.notesBlock}>
          <TransactionNotes value={notes} onChangeText={updateNotes} />
        </View>

        {/* FOOTER – now always visible and properly laid out */}
        <View style={styles.footer}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/*Modal to add new customers */}
      <AddCustomerModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={saveNewCustomer}
        initialName={newCustomer.name}
        initialPhone={newCustomer.phone}
      />

      {/*Bottom sheet for order summary */}
      <BottomSheet ref={sheetRef1} backgroundColor="#f4f4f4" sticky showHandle={false} snapPoints={[SNAP_POINT]}>
        <OrderSummary
          onCancel={closeBottomSheet}
          onNext={openPinBottomSheet}
          payload={payload}
        />
      </BottomSheet>

      {/* Pin sheet lives in its own native layer — renders above EVERYTHING */}
      <Modal visible={pinSheetVisible} transparent animationType="none">
        <View style={styles.overlay} />
        <BottomSheet ref={sheetRef2} backgroundColor='#f4f4f4' showHandle={false}>
          <PinSheetModal
            onCancel={closePinBottomSheet}
            onNext={submitTransaction}
            onForgotPin={handleForgotPin}
            incorrectPin={pinError}
            onErrorHandled={() => setPinError(false)}
            forgotPinLoading={forgotPinLoading}
          />
        </BottomSheet>
      </Modal>
    </SafeAreaView>
    </>
  )
}

export default CustomerSelectScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Notes (wrapper – TransactionNotes now handles its own internal styling)
  notesBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1EAE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#3D9E83',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#A7D9CF',
  },
  nextText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
})