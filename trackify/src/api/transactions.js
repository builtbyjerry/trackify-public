import { supabase } from './supabase.js'

export const getTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error
    return data
}

export const getTransactionItems = async () => {
    const { data, error } = await supabase
        .from('transaction_items')
        .select(` *, product_variants(image_url, products(name))`)
        .order('created_at', { ascending: false });

    if (error) throw error
    return data
}

export const getTransactionDetail = async (txnId, businessId) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
        id,
        total_amount,
        transaction_type,
        notes,
        discount_type,
        discount_value,
        discount_amount,
        created_at,
        customers (
            id,
            name,
            phone
        ),
        employees (
            id
        ),
        user_profiles (
            user_id,
            first_name,
            last_name,
            display_name
        ),
        transaction_items (
            id,
            quantity_sold,
            price_at_purchase,
            cost_price_at_purchase,
            discount_type,
            discount_value,
            original_price,
            product_variants (
            id,
            name,
            units_per_variant,
            products (
                id,
                name,
                category
            )
            )
        ),
        debt_payments (
            id,
            amount_paid,
            paid_at,
            employees (
            id
            )
        )
        `)
        .eq('id', txnId)
        .eq('business_id', businessId)
        .single()

    if (error) throw error
    return data

}