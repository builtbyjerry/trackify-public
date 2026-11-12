import { supabase } from "../api/supabase.js"
import { errorLog } from "../utils/loggers.js";

export const verifyPin = async (pin) => {
    try {
        const { data, error } = await supabase.functions.invoke('verify-pin', {
            body: { pin }
        })
        if (error) throw error
        return typeof data === "string" ? JSON.parse(data) : data

    } catch (err) {
        errorLog(`Error verifying pin: ${err}`)
        throw err
    }
}
