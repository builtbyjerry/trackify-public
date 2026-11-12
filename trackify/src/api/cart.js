import { errorLog } from '../utils/loggers.js';
import { supabase } from './supabase'

export const createTransaction = async (updates) => {
    const { data, error } = await supabase
    .from('transactions')
    .insert(updates)
    .select()
    .single()

    if (error) {
        errorLog("Error adding transaction:", error)
        throw error
    }
    return data
}

export const createTransactionItems = async (builtItems) => {
    const { error } = await supabase
    .from('transaction_items')
    .insert(builtItems)

    if (error) throw error
}