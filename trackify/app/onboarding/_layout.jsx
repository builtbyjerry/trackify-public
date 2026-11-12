import { Stack } from 'expo-router'
import ProtectedGuard from '../../src/navigation/guards/ProtectedGuard'

export default function OnboardingLayout() {
  return (
    <ProtectedGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedGuard>
  )
}