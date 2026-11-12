import { errorLog } from "../utils/loggers.js";
import { supabase } from "./supabase.js"

export const createCustomer = async ({ name, phone, business_id}) => {
    const { data, error } = await supabase
    .from('customers')
    .insert({
        name, phone, business_id
    })
    .select()
    .single()

    if (error) {
        errorLog("Error creating customer:", error)
        throw error
    }
    return data
}

export const getAllCustomers = async() => {
    const { data, error } = await supabase
    .from('customers')
    .select('*')

    if (error) throw error
    return { data, error }
}

export const getCustomer = async (params = {}) => {
  let query = supabase
    .from('customers')
    .select('*')

  if (params.id) {
    query = query.eq('id', params.id)
  }

  if (params.phone) {
    query = query.eq('phone', params.phone)
  }

  if (params.name) {
    query = query.ilike('name', params.name)
  }

  const { data, error } = await query

  if (error) throw error

  return data
}