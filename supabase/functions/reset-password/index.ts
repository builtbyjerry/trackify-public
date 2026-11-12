// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OTP_PURPOSES } from "../../../trackify/src/constants/otpConstants.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  console.log("Request received for password reset")
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { resetToken, newPassword } = await req.json()

    if (!resetToken || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Reset token and new password are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('MY_SUPABASE_URL') ?? '',
      Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    // Verify the reset token in the database
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('reset_tokens')
      .select('*')
      .eq('token', resetToken)
      .eq('used', false)
      .single()

    if (!tokenRecord || tokenError) {
      return new Response(
        JSON.stringify({ error: tokenError?.message || 'Invalid reset token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    // Check if token hasn't expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Reset token has expired. ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check the purpose of the token
    if (tokenRecord.purpose !== OTP_PURPOSES.PASSWORD_RESET) {
      return new Response(
        JSON.stringify({ error: 'Invalid Reset Token. ' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }


    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password: newPassword }
    )

    if (updateError) {
      console.log("Update Error:", updateError)
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark the reset token as used
    await supabaseAdmin
      .from('reset_tokens')
      .update({ used: true })
      .eq('token', resetToken)

    return new Response(
      JSON.stringify({ message: 'Password has been reset successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  
  
  
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})