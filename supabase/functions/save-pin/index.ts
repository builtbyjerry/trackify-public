// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hashPin, verifyPin } from "./pinServices.ts";
import { OTP_PURPOSES } from "../../../trackify/src/constants/otpConstants.js"

serve(async (req: Request) => {
    try {
        const { pin, isOnboarding, currentPin, resetToken } = await req.json()
        if (!pin) {
            console.error('save-pin: missing pin')
            return new Response(JSON.stringify({ success: false, error: 'pin is required' }), { status: 400 })
        }

        const supabaseAdmin = createClient(
          Deno.env.get('MY_SUPABASE_URL') ?? '',
          Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const authorization =  req.headers.get('Authorization')
        if (!authorization || !authorization?.startsWith('Bearer ')) {
            console.error("Either authorization was null, or couldn't extract jwt from authorizaiton")
            return new Response(JSON.stringify({ success: false }), { status: 401 })
        }

        const jwt = authorization.slice('Bearer '.length)
        const { data: { user }, error: jwtError } =  await supabaseAdmin.auth.getUser(jwt)

        if (!user || jwtError) {
            console.error('jwt check failed:', jwtError?.message, 'header present:', !!authorization)
            return new Response(JSON.stringify({ success: false }), { status: 401 })
        }

        const userId = user.id

        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('pin_hash')
            .eq('user_id', userId)
            .single()
        
        if (!profile) {
            return new Response(JSON.stringify({ success: false, error: "Profile not found" }), { status: 404 })
        }

        if (profile.pin_hash) { // This means a PIN exist, so onboarding should be false
            let authorized = false
            if (resetToken) {
                const { data: tokenRow } = await supabaseAdmin
                    .from('reset_tokens').select('token, expires_at')
                    .eq('token', resetToken).eq('user_id', userId)
                    .eq('purpose', OTP_PURPOSES.PIN_RESET).eq('used', false).maybeSingle()
                
                authorized = !!tokenRow && new Date(tokenRow.expires_at) >= new Date()
            } else if (currentPin) {
                authorized = await verifyPin(currentPin, profile.pin_hash)
            }
            console.log('Authorization debug:', {
                hasCurrentPin: !!currentPin,
                currentPinLength: currentPin?.length,
                hasStoredHash: !!profile.pin_hash,
                authorized
            })
            if (!authorized) return new Response(JSON.stringify({ success: false, error: "Not Authorized"}), { status: 403 })
        }

        const newPinHash = await hashPin(pin)

        const { error } = await supabaseAdmin
            .from('user_profiles')
            .update({
                pin_hash: newPinHash,
                pin_set_at: new Date().toISOString(),
                ...(isOnboarding && { onboarding_completed: true }),
            })
            .eq('user_id', userId)

        if (error) {
            console.error('save-pin: db error:', error.message)
            return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 })
        }
        // Burn the token
        if (profile.pin_hash) {
            await supabaseAdmin.from("reset_tokens").update({ used: true }).eq('token', resetToken)
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (err) {
        console.error('save-pin: unhandled:', err)
        return new Response(JSON.stringify({ success: false, error: `Internal server error: ${err}` }), { status: 500 })
    }
})