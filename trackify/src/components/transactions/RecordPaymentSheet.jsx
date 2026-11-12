// src/components/transactions/RecordPaymentSheet.jsx

import { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Platform,
  Dimensions
} from 'react-native'
import { recordDebtPayment } from '../../services/transactionService.js'
import { useToast } from '../../hooks/useToast.jsx'
import BottomSheet from '../sheet/BottomSheet.jsx'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const formatCurrency = (amount) =>
  `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`

export default function RecordPaymentSheet({
  visible,
  transaction,
  outstanding,
  businessId,
  employeeId,
  onClose,
  onSuccess
}) {
  const ref = useRef(null)

  const SCREEN_HEIGHT = Dimensions.get('screen').height
  const SNAP_POINT = -(SCREEN_HEIGHT * 0.44)
  const { bottom } = useSafeAreaInsets()

  const { showToast } = useToast()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0
  const isFullPayment = parsedAmount >= outstanding
  const isValid = parsedAmount > 0 && parsedAmount <= outstanding

  useEffect(() => {
    if (visible) {
      ref.current?.scrollTo(SNAP_POINT - bottom)
    } else {
      ref.current?.scrollTo(0)
    }
  }, [visible, SCREEN_HEIGHT])

  const handlePayFull = () => setAmount(String(outstanding))

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    try {
      await recordDebtPayment({
        transactionId: transaction.id,
        businessId,
        amountPaid: parsedAmount,
        recordedBy: employeeId
      })

      showToast({
        title: isFullPayment ? 'Debt settled' : 'Payment recorded',
        description: isFullPayment
          ? `${formatCurrency(parsedAmount)} received. Debt fully cleared`
          : `${formatCurrency(parsedAmount)} recorded. ${formatCurrency(outstanding - parsedAmount)} still outstanding`,
        type: 'success'
      })

      setAmount('')
      onSuccess()
    } catch (err) {
      showToast({
        title: 'Payment failed',
        description: err.message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    onClose()
  }

  return (
    <BottomSheet
      ref={ref}
      backgroundColor="#fff"
      avoidKeyboard
      snapPoints={[SNAP_POINT]}
      showHandle
      onClose={handleClose}
      showOverlay
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Record payment</Text>
          <Text style={styles.sub}>
            {transaction?.customers?.name ?? 'Customer'} · {formatCurrency(outstanding)} outstanding
          </Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.inputWrap}>
          <Text style={styles.inputPrefix}>₦</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType='numeric'
            placeholder='0'
            placeholderTextColor='#cccccc'
            autoFocus={visible}
          />
        </View>

        {amount !== '' && parsedAmount > outstanding && (
          <Text style={styles.errorText}>
            Amount exceeds outstanding balance of {formatCurrency(outstanding)}
          </Text>
        )}

        <TouchableOpacity
          style={styles.fullPayBtn}
          onPress={handlePayFull}
          activeOpacity={0.7}
        >
          <Text style={styles.fullPayBtnText}>
            Pay full amount · {formatCurrency(outstanding)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color='#e1f5ee' />
          ) : (
            <Text style={[styles.submitBtnText, !isValid && styles.submitBtnTextDisabled]}>
              {isFullPayment && parsedAmount > 0 ? 'Settle debt' : 'Record payment'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a'
  },
  sub: {
    fontSize: 13,
    color: '#999999',
    marginTop: 3
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  closeBtnText: {
    fontSize: 13,
    color: '#1a1a1a'
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#42B39E',
    paddingBottom: 8,
    marginBottom: 16
  },
  inputPrefix: {
    fontSize: 28,
    fontWeight: '500',
    color: '#999999',
    marginRight: 6
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '500',
    color: '#1a1a1a',
    padding: 0
  },
  errorText: {
    fontSize: 12,
    color: '#a32d2d',
    marginBottom: 12
  },
  fullPayBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#0a7d4f',
    marginTop: 4
  },
  fullPayBtnText: {
    fontSize: 13,
    color: '#0a7d4f',
    fontWeight: '500'
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24
  },
  submitBtn: {
    backgroundColor: '#0a7d4f',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center'
  },
  submitBtnDisabled: {
    backgroundColor: '#f0f0f0'
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e1f5ee'
  },
  submitBtnTextDisabled: {
    color: '#bbbbbb'
  }
})