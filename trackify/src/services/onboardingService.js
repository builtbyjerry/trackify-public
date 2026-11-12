import { getProfileImageUrl , updateUserProfile, uploadProfileImageToStorage } from "../api/profile.js"
import { supabase } from '../api/supabase.js'
import { mapError } from "../utils/errorMappers.js";
import { errorLog } from "../utils/loggers.js";


export const setUserProfileImage = async (imageUri, userId, userName="") => {
    try {
        // Upload the profile image to storage
        const { filePath } = await uploadProfileImageToStorage(imageUri, userId)

        // Retrieve the public URL of the uploaded image
        const publicUrl = getProfileImageUrl(filePath)

        // Store the public URL in the user's profile table and update the display name
        const profile = await updateUserProfile(userId, {
            profile_url: publicUrl,
            display_name: userName,
        })
        return profile

    } catch (error) {
        errorLog("Error setting user profile image:", error)
        throw error
    }
}

export const savePinToUserProfile = async (pin, { isOnboarding = false, currentPin, resetToken } = {}) => {
    try {
        const { error } = await supabase.functions.invoke('save-pin', {
            body: { pin, isOnboarding, currentPin, resetToken }  
        })
        if (error) throw error

        return { success: true }
    
    } catch (error) {
        return { success: false, error: mapError(error) }
    }
}

export const getOnboardingStatus = (profile) => {
    if (!profile) return "PROFILE_PENDING"
    if (profile.onboarding_completed) return "COMPLETED"
    if (profile.pin_hash) return "COMPLETED"
    if (profile.profile_url || profile.image_skipped) return "PIN_PENDING"
    return "PROFILE_PENDING"

}

export const setImageSkipped = async (userId) => {
    const profile = await updateUserProfile(userId, {
        image_skipped: true
    })
}

