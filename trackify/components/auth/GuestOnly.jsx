import { useRouter } from "expo-router"
import { useEffect } from "react"
import { useUser } from "../../src/hooks/useUser"


const GuestOnly = ({ children }) => {
  const { user, authChecked, onboardStatus } = useUser()
  const router = useRouter()

  const ONBOARDING_STATUS = {
    INCOMPLETE: 'incomplete',
    PROFILE_PENDING: 'profile_pending',
    PIN_PENDING: 'pin_pending',
    COMPLETED: 'completed'
}

  useEffect(() => {
    if (authChecked && user !== null) {
      { /* If (onboardStatus === "incomplete" || onboardStatus === "profile_pending") {
        router.replace("onboarding/ProfileSetup")
      } else if (onboardStatus === "pin_pending") {
        router.replace("onboarding/PinSetup")
      } else if (onboardStatus === "completed") {
       router.replace("/products")}
      */ }
      router.replace("/products")
    }
  }, [user, authChecked, onboardStatus])
  return children
}

export default GuestOnly