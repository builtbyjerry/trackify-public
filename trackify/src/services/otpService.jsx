import { supabase } from "../api/supabase"
import { errorLog } from "../utils/loggers.js"
import { mapError } from '../utils/errorMappers.js'

export const otpService = {
    async requestOTP(email, purpose) {
        try {
            const { data, error } = await supabase.functions.invoke(
                'a-request-otp',
                {
                    body: { email, purpose }
                }
            )
            if (error) throw error
            return { success: true, data }
        } catch (error) {
            errorLog("Error requesting OTP:", error.message)
            if (error.context) {
                const body = await error.context.clone().json()
                return { success: false, error: mapError(body) }
            }
        }
    },

    async verifyOTP(email, otp, purpose) {
        try {
            const { data, error } = await supabase.functions.invoke(
                'verify-otp',
                {
                    body: { email, otp, purpose }
                }
            ) 
            if (error) throw error
            return { success: true, data }
        } catch (error) {
            errorLog("Error verifying OTP:", error.message)
            if (error.context) {
                const body = await error.context.clone().json()
                return { success: false, error: mapError(body) }
            }
             
            return { success: false, error: mapError(error) }
        }
    },

    async resetPassword(resetToken, newPassword) {
        try {
            const { data, error } = await supabase.functions.invoke(
                'reset-password',
                {
                    body: { resetToken, newPassword }
                }
            )
            if (error) throw error
            return { success: true, data }
        } catch (error) {
            errorLog("Error resetting password:", error.message)
            if (error.context) {
                const body = await error.context.clone().json()
                return { success: false, error: mapError(body) }
            }
        }
    }
}