// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyPin } from './pinServices.ts'


serve(async (req: Request) => {
    console.log("Verifying pin started.")
    try {
        const { pin } = await req.json()
        if (!pin) {
            console.error('verify-pin: missing pin')
            return new Response(JSON.stringify({ isValid: false }), { status: 400 })
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
            return new Response(JSON.stringify({ success: false }), { status: 401 })
        }

        const userId = user.id

        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('pin_hash')
            .eq('user_id', userId)
            .single()

        if (error || !data?.pin_hash) {
            console.error('verify-pin: could not fetch hash:', error?.message)
            return new Response(JSON.stringify({ isValid: false }), { status: 400 })
        }

        const isValid = await verifyPin(pin, data.pin_hash)
        return new Response(JSON.stringify({ isValid }), { status: 200 })
    } catch (err) {
        console.error('verify-pin: ', err)
        return new Response(JSON.stringify({ isValid: false }), { status: 400 })
    }
})