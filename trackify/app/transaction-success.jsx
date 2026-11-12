import { useLocalSearchParams, useRouter } from 'expo-router'
import TransactionSuccess from '../src/components/cart/TransactionSuccess.jsx'
import { useEffect } from 'react';
import { log } from '../src/utils/loggers.js';

export default function TransactionSuccessScreen() {
  const router = useRouter()
  const { customerName, customerPhone, cartTotal, txnType: transactionType } = useLocalSearchParams()

  useEffect(() => {
    log("Here's the txn type: ", transactionType)
  }, [])

  return (
    <TransactionSuccess
      amount={cartTotal}
      customerName={customerName}
      customerPhone={customerPhone}
      onContinue={() => router.replace('/products')}
      transactionType={transactionType}
    />
  )
}