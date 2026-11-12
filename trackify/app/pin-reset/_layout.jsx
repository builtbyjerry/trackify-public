import { Stack } from 'expo-router'
import ProtectedGuard from '../../src/navigation/guards/ProtectedGuard.jsx'

export default function PinResetLayout() {
  return (
    <ProtectedGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </ProtectedGuard>
  )
}