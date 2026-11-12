import { useLocalSearchParams, useRouter } from "expo-router"

import { useVerifyOtp } from '../../src/hooks/useVerifyOtp.jsx'
import { useResendOtp } from '../../src/hooks/useResendOtp.jsx'
import OTPInput from '../../src/components/OTPInput.jsx'
import { useUser } from "../../src/hooks/useUser.jsx";
import { maskEmail } from "../../src/utils/formatters.js";

export default function ResetPinOtp() {

  const { user } = useUser()
  const email = user?.email

  const router = useRouter()
  const { purpose } = useLocalSearchParams()

  const { verifyOTP, error: verifyError, loading: verifying, clearError } = useVerifyOtp(purpose, () => {
    router.push("/pin-reset/UpdatePin") 
  })

  const { resendOTP, error: resendError, loading: resending, cooldown } = useResendOtp(email, purpose)

  const handleResend = () => {
    clearError()  
    resendOTP()
  }

  return (
    <OTPInput
      title="Pin Reset"
      maskedEmail={maskEmail(email)}
      onVerify={(otp) => verifyOTP(email, otp)}
      onResend={handleResend}
      error={verifyError || resendError}
      loading={verifying}
      resendLoading={resending}
      cooldown={cooldown}
    />
  )
}