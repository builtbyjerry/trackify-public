import { useRouter, useSegments } from "expo-router"
import { useEffect } from "react"
import { useUser } from "../../hooks/useUser.jsx"
import { log } from "../../utils/loggers.js";

export default function GuestGuard({ children }) {
  const { user, authChecked, onboardingStatus, ONBOARDING_STATUS } = useUser()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (!authChecked) return
    if (!user) return  // no user = guest, let them stay in (auth)
    if (onboardingStatus === null) return  // wait

    // user is logged in and trying to access (auth) screens
    if (segments[0] === '(auth)') {
      if (onboardingStatus === ONBOARDING_STATUS.PROFILE_PENDING) {
        router.replace('/onboarding/ProfileSetup')
        return
      }
      if (onboardingStatus === ONBOARDING_STATUS.PIN_PENDING) {
        router.replace('/onboarding/PinSetup')
        return
      }
      if (onboardingStatus === ONBOARDING_STATUS.COMPLETED) {
        router.replace('/products')
        return
      }
    }
  }, [user, authChecked, segments, onboardingStatus])

  if (!authChecked) {
    log("Auth checked is false.")
  }

  // Show loader while redirecting logged-in user
  if (user && segments[0] === '(auth)') {
    log("User is present sha")
  }

  return children
}