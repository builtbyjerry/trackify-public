import { createContext, useState } from "react";

export const TransactionSessionContext = createContext()

export function TransactionSessionProvider({ children }) {
    const [transactionType, setTransactionType] = useState(null)
    const [customer, setCustomer] = useState(null)
    const [notes, setNotes] = useState('')

    const updateTransactionType = (txnType) => {
        setTransactionType(txnType)
    }
    const clearTransactionType = () => {
        setTransactionType(null)
    }

    const updateCustomer = (newCustomer) => {
        setCustomer(newCustomer)
    }

    const updateNotes = (newNotes) => {
        setNotes(newNotes)
    }

    const clearSession = () => {
        setTransactionType(null)
        setCustomer(null)
        setNotes('')
    }
    
    const value ={
        transactionType,
        customer,
        notes,
        updateTransactionType,
        clearTransactionType,
        updateCustomer,
        updateNotes,
        clearSession,
    }

    return (
        <TransactionSessionContext.Provider value={value}>
            {children}
        </TransactionSessionContext.Provider>
    )
}