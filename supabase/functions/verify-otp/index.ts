// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  console.log("Request received for OTP verification")
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, otp, purpose } = await req.json()
    

    if (!email || !otp || !purpose) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? '',
      Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hash the otp before querying the database
      const data = new TextEncoder().encode(otp); 
      const hashBuffer = await crypto.subtle.digest('SHA-256', data); 
      const otpHash = Array.from(new Uint8Array(hashBuffer)) .map(b => b.toString(16).padStart(2, '0')) .join('')

      const { data: otpRecord, error: otpError } = await supabaseAdmin
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('otp_hash', otpHash)
        .eq('used', false)
        .single()

      if (otpError || !otpRecord) {
         return new Response(
          JSON.stringify({ error: 'Invalid OTP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // Check if OTP is for the right purpose
      if (otpRecord.purpose !== purpose) {
        return new Response(
          JSON.stringify({ error: 'Wrong OTP purpose' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      }

      if (new Date(otpRecord.expires_at) < new Date()) {
        console.log("OTP has expired for this email")
        return new Response(
          JSON.stringify({ error: 'OTP has expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate a short lived reset token
      const resetToken = crypto.randomUUID()
      const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      
      await supabaseAdmin
      .from('reset_tokens')
      .insert({
        token: resetToken,
        user_id: otpRecord.user_id,
        email: email,
        expires_at: tokenExpiresAt,
        used: false,
        purpose: purpose
      })

      await supabaseAdmin
        .from('otps')
        .update({ 
          used: true,
          verified_at: new Date()
         })
        .eq('id', otpRecord.id)

      return new Response(
        JSON.stringify({ resetToken, expiresAt: tokenExpiresAt }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  
  } catch (error) {
    console.error('Error verifying OTP:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }


})