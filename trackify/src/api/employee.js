import { supabase } from "./supabase"

export const createEmployee = async (user, role = "staff", business_id = 1) => {
    const { data: newEmployee, error } = await supabase.from("employees").insert([
        {
            user_id: user.id,
            role: role,
            business_id: business_id,
        }
    ])
    .select()
    .single()

    if (error) throw error
    return newEmployee
}

export const getEmployeeByUserId = async (userId) => {
    const { data, error } = await supabase
        .from('employees')
        .select('id, role')
        .eq('user_id', userId)
        .select()
        .single()
    
    if (error) throw error
    return data
}