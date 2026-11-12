import { log } from "../utils/loggers.js";
import { uploadProfileImageToStorage } from "./storage.js";
import { supabase } from "./supabase.js"


export const createUserProfile = async (profile) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single()
    
    if (error) throw error

    return data
}

export const updateUserProfile = async (userId, updates) => {
    const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)

    if (error) {
        log("Error updating user profile:", error)
        throw error
    }
    return { success: true }
}

export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) throw error
    return data
}

export const saveProfileImage = async (imageUri, userId, extraUpdates = {}) => {
    log('=== saveProfileImage called ===', { imageUri, userId })
    const { publicUrl } = await uploadProfileImageToStorage(imageUri, userId)
    log("PublicUrl:", publicUrl)

    const { success } = await updateUserProfile(userId, {
        profile_url: publicUrl,
        ...extraUpdates,           // onboarding passes { display_name }, edit passes nothing
    })
    if (success) {
        log("Hurray we've successfully updated userprofile with new image")
    } else {
        log("Check.. something went wrong")
    }

    return publicUrl
}