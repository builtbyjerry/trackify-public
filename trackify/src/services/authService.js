import { signUp } from '../api/auth'
import { createEmployee } from '../api/employee'
import { errorLog, log } from '../utils/loggers.js';
import { isValidEmail, isValidPassword } from '../utils/validation'
import { createUserProfile } from '../api/profile.js'

export const registerEmployee = async (email, password, firstName, lastName, phoneNo) => {
    if (!isValidEmail(email)) {
        throw new Error('Invaild email format.')
    }
    if (!isValidPassword(password)) {
        throw new Error("Password must be at least 8 characters") 
    }
    const businessId = 1
    const role = "staff" // Very wrong hardcodes, buh until I implement the business feature which from notes, this will stay.

    try {
        const { user } = await signUp(email, password, firstName, phoneNo)
        const employee = await createEmployee(user, role, businessId)

        const profile = await createUserProfile({
            user_id: user?.id,
            display_name: firstName,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNo,
            business_id: businessId
        })

        const defaultedEmployee = {
            id: employee?.id,
            user_id: employee?.user_id ?? null,
            role: employee?.role ?? "staff",
            business_id: employee?.business_id ?? 1,
        }

        const defaultedProfile = {
            user_id: profile?.user_id ?? null,
            first_name: profile?.first_name ?? '',
            last_name: profile?.last_name ?? '',
            display_name: profile?.display_name ?? profile?.first_name ?? '',
            profile_url: profile?.profile_url ?? null,
            phone: profile?.phone ?? '',
            pin_hash: profile?.pin_hash ?? null,
        }
        log("New profile created:", profile)
        log("Artificalyy made profile:", defaultedProfile)
        return { defaultedEmployee, defaultedProfile }
    } catch (error) {
        errorLog("Error signing user up: ", error)
        throw error
    }
    
}