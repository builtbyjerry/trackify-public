import { log } from "../utils/loggers.js";
import { supabase } from "./supabase.js"

export const createDebtPayment = async (txnId, businessId, amountPaid, recordedBy) => {
    try {
        const { data, error } = await supabase
            .from('debt_payments')
            .insert({
            transaction_id: txnId,
            business_id: businessId,
            amount_paid: amountPaid,
            recorded_by: recordedBy,
            paid_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (err) {
        log("Error creating debt record: ", err)
        throw err
    }
}

export const getDebtPayment =  async () => {
    const { data, error } = await supabase
        .from('debt_payments')
        .select('*')

    if (error) throw error
    return data
} 