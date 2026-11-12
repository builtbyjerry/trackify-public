// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getOtpEmailContent } from "./emailTemplates.ts"


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Function 'request-otp' initialized")
serve(async (req) => {
  console.log("Request received for OTP")

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, purpose } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  
    const supabaseAdmin = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? '',
      Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )


    // deno-lint-ignore no-unused-vars
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email === email)

    if (!user) {
      return new Response(
        JSON.stringify({ success: true, message: 'If the email exists, an OTP has been sent' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const otpCode = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => (b % 10).toString()).join('')

    const data = new TextEncoder().encode(otpCode); 
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); 
    const otpHash = Array.from(new Uint8Array(hashBuffer)) .map(b => b.toString(16).padStart(2, '0')) .join('')
    
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Invalidate any previous unused OTPs for this user
    await supabaseAdmin
      .from('otps')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    const { error: insertError } = await supabaseAdmin
      .from('otps')
      .insert({
        user_id: user.id,
        email: email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        purpose: purpose,
      })

    if (insertError) {
      console.error("Insert error:", insertError)
      throw insertError
    }
    
    const { subject, html } = getOtpEmailContent(purpose, otpCode)
    

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'otp@auth.mytrackify.shop',
        to: email,
        subject: subject,
        html: html,
      }),
    })

    if (!emailResponse.ok) {
      console.error("Email send error:", await emailResponse.text())
    }

    return new Response(
      JSON.stringify({ success: true, message: 'If an account exists for that email, a code has been sent.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.log("Error in request-otp function:", error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})