import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { useUser } from '../../src/hooks/useUser'
import ThemedLoader from '../../src/components/ThemedLoader'

export default function GuestGuard({ children }) {
  const { user, authChecked } = useUser()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    // Wait until we've checked auth status
    if (!authChecked) return

    // If user is logged in AND currently on an auth screen
    if (user) {
      const inAuthGroup = segments[0] === '(auth)'
      
      if (inAuthGroup) {
        console.log('User already logged in, redirecting away from auth')
        router.replace('/products')
      }
    }
  }, [user, authChecked, segments])

  // Show loading while checking auth
  if (!authChecked) {
    return <ThemedLoader />
  }

  // If user exists and we're in auth group, show loading
  // (useEffect will redirect them)
  if (user && segments[0] === '(auth)') {
    return <ThemedLoader />
  }

  // User is NOT logged in, allow access to auth screens
  return children
}