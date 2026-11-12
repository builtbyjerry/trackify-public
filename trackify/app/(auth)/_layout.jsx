import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import GuestGuard from '../../src/navigation/guards/GuestGuard'

const AuthLayout = () => {
    return (
            <GuestGuard>
                <StatusBar style="auto" />
                <Stack screenOptions={{ animation: 'fade', headerShown: false, }}> 
                    <Stack.Screen name="login" />
                    <Stack.Screen name="signup" />
                </Stack>
            </GuestGuard>
    )

}        
export default AuthLayout