import { useLocalSearchParams, useRouter } from "expo-router"

import { maskEmail } from '../../src/utils/formatters.js'
import { useVerifyOtp } from "../../src/hooks/useVerifyOtp.jsx"
import { useResendOtp } from "../../src/hooks/useResendOtp.jsx"
import OTPInput from '../../src/components/OTPInput.jsx'

export default function ResetPasswordOtp() {
  const router = useRouter()
  const { email, purpose, source } = useLocalSearchParams()

  const { verifyOTP, error: verifyError, loading: verifying } = useVerifyOtp(purpose, () => {
    router.replace({
            pathname: "/password-reset/UpdatePassword",
            params: { purpose, source }
          }) 
  })

  const { resendOTP, loading: resending, cooldown } = useResendOtp(email, purpose)

  return (
    <OTPInput
        title="Check your email"
        maskedEmail={maskEmail(email)}  // your masking util
        accentColor="#635BFF"           // purple for password flow
        onVerify={(otp) => verifyOTP(email, otp)}
        onResend={resendOTP}
        error={verifyError}
        loading={verifying}
        resendLoading={resending}
        cooldown={cooldown}
    />
  )
}