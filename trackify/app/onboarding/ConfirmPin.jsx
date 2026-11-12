import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OtpInput } from 'react-native-otp-entry'
import { Lock } from 'lucide-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { savePinToUserProfile } from '../../src/services/onboardingService.js'
import { useUser } from '../../src/hooks/useUser'

const ConfirmPin = () => {
    const [pin, setPin] = useState("")
    const [loading, setLoading]  = useState(false)
    const [error, setError] = useState(null)

    const { pin: initialPin } = useLocalSearchParams()
    const { updateOnboardingStatus, user } = useUser()

    const handleSubmit = async (pin) => {
        setError(null)
        setLoading(true)

        if (pin !== initialPin) {
            setError("PINs do not match")
            setLoading(false)
            setPin("")
            return
        }

        const result = await savePinToUserProfile(pin, { isOnboarding: true})
        if (!result.success) {
            setError(`Failed to save PIN. ${result.error}`)
            setLoading(false)
            return
        }
        setLoading(false)
        // Route to the main page
        await updateOnboardingStatus()
        router.replace("/products")
    }


  return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Lock size={24} />
                </View>
                <Text style={styles.title}>Confirm PIN</Text>
                <Text style={styles.subtitle}>
                Confirm your pin to sign transactions
                </Text>
            </View>
            {error && (
                <Text style={styles.errorMessage}>{error}</Text>
            )}
            <OtpInput
                numberOfDigits={4}
                focusColor="#2ECC71" 
                type='numeric'
                onTextChange={setPin}
                disabled={loading}
                textInputProps={{
                accessibilityLabel: "PIN",
                }}
                onFilled={handleSubmit}
                />
        </KeyboardAvoidingView>

    </SafeAreaView>
  )
}

export default ConfirmPin

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 36,
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    paddingBottom: 24,
  },
  headerIcon: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
  },
  errorMessage: {
    textAlign: "center",
    padding: 10,
    borderRadius: 6,
    width: "90%",
    borderWidth: 1,
    alignSelf: "center",
    marginVertical: 12,
    color: "#cc475a",
    backgroundColor: "#fef0f0",
    borderColor: "#cc475a",
  },
})