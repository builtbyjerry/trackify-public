import { useEffect, useState } from "react"
import { useRouter } from "expo-router"
import { useUser } from "../src/hooks/useUser"
import SplashScreen from "./Splash"
import { log } from "../src/utils/loggers.js";

export default function Index() {
  const { user, authChecked, onboardingStatus, ONBOARDING_STATUS } = useUser()
  const router = useRouter()
  const [minimumTimePassed, setMinimumTimePassed] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)

  // Force splash to show for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setMinimumTimePassed(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Navigate ONCE after conditions are met
  useEffect(() => {
    if (hasNavigated) return // Prevent multiple navigations
    if (!authChecked || !minimumTimePassed) return

    log('[INDEX] Auth checked, navigating...')
    log('[INDEX] User:', user?.email || 'none')
    log('[INDEX] Onboarding status:', onboardingStatus)

    // Not logged in
    if (!user) {
      log('[INDEX] → Redirecting to login')
      router.replace('/(auth)/login')
      setHasNavigated(true)
      return
    }

    // Logged in - check onboarding
    if (!onboardingStatus) {
      log('[INDEX] Waiting for onboarding status...')
      return
    }

    if (onboardingStatus === ONBOARDING_STATUS.PROFILE_PENDING) {
      log('[INDEX] → Redirecting to ProfileSetup')
      router.replace('/onboarding/ProfileSetup')
      setHasNavigated(true)
    } else if (onboardingStatus === ONBOARDING_STATUS.PIN_PENDING) {
      log('[INDEX] → Redirecting to PinSetup')
      router.replace('/onboarding/PinSetup')
      setHasNavigated(true)
    } else if (onboardingStatus === ONBOARDING_STATUS.COMPLETED) {
      log('[INDEX] → Redirecting to products')
      router.replace('/products')
      setHasNavigated(true)
    }
  }, [authChecked, minimumTimePassed, user, onboardingStatus, hasNavigated])

  return <SplashScreen />
}