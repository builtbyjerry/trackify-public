import { supabase } from './supabase'

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email:email.trim().toLowerCase(),
        password: password,
    })
    if (error) throw error
    return data
}

export const signUp = async (email, password, firstName, phoneNo) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                ...(firstName && { first_name: firstName }),   
                ...(phoneNo && { phone_number: phoneNo }),
            }
        }
    })
    if (error) throw error

    return data
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export const getInitialSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
    
}

export const subscribeToAuthChanges = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
}