import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { useUser } from '../../hooks/useUser.jsx'
import { ActivityIndicator, View } from 'react-native'
import { log } from '../../utils/loggers.js'

export default function ProtectedGuard({ children }) {
  const { user, authChecked, onboardingStatus, ONBOARDING_STATUS } = useUser()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (!authChecked) return

    log('[PROTECTED GUARD] Checking access...')
    log('[PROTECTED GUARD] User:', user?.email || 'none')
    log('[PROTECTED GUARD] Segments:', segments)
    log('[PROTECTED GUARD] Onboarding:', onboardingStatus)

    const inOnboarding = segments[0] === 'onboarding'
    const inMain = segments[0] === '(dashboard)'
    const inAuth = segments[0] === '(auth)'

    if (!user) {
      log('[PROTECTED GUARD] No user, redirecting to login')
      router.replace('/login')
      return
    }
    // Wait for onboarding status to load
    if (onboardingStatus === null) {
      log('[PROTECTED GUARD] Waiting for onboarding status...')
      return
    }

    // Onboarding incomplete
    if (onboardingStatus === ONBOARDING_STATUS.PROFILE_PENDING) {
       if (inOnboarding) {
        return  // ← add this — already where we need to be, do nothing
      }
      if (!inOnboarding) {
        log('[PROTECTED GUARD] Needs profile, redirecting')
        router.replace('/onboarding/ProfileSetup')
      }
      return
    }
    

    if (onboardingStatus === ONBOARDING_STATUS.PIN_PENDING && !inOnboarding) {
        log('[PROTECTED GUARD] Needs PIN, redirecting')
        router.replace('/onboarding/PinSetup')
    }

    // Onboarding complete, redirect to main app
    if (onboardingStatus === ONBOARDING_STATUS.COMPLETED && inOnboarding) {
      log('[PROTECTED GUARD] Onboarding complete, redirecting to main')
      router.replace('/products')
    }
  }, [user, authChecked, onboardingStatus, segments])

  if (!authChecked || onboardingStatus == null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return children
}