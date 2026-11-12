import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OtpInput } from 'react-native-otp-entry'
import { Lock } from 'lucide-react-native'
import { isNotRepeatedPIN } from '../../src/utils/pinValidation'
import { router } from 'expo-router'
import { log } from '../../src/utils/loggers.js';

const PinSetup = () => {
    const [pin, setPin] = useState("")
    const [loading, setLoading]  = useState(false)
    const [error, setError] = useState(null)

    const goToConfirmPin =  (pin) => {
        setError(null)
        setLoading(true)

        if (!isNotRepeatedPIN(pin)) {
            setError("PIN must not be repeated digits")
            setLoading(false)
            setPin("")
            return
        }

        log("PIN:", pin)
        log("PIN' type:", typeof pin)
        log("PIN's length:", pin.length)

        setLoading(false)
        router.push({
            pathname: "/onboarding/ConfirmPin",
            params: { pin: pin }
        })

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
                <Text style={styles.title}>Enter PIN</Text>
                <Text style={styles.subtitle}>
                Enter a pin to sign transactions
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
                onFilled={goToConfirmPin}
                />
        </KeyboardAvoidingView>

    </SafeAreaView>
  )
}

export default PinSetup

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