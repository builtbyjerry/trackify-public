import { useState } from "react"
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  Pressable,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { ArrowLeft, Fingerprint } from "lucide-react-native"

import { otpService } from '../../src/services/otpService.jsx'
import { isValidEmail } from '../../src/utils/validation.js'
import { OTP_PURPOSES } from "../../src/constants/otpConstants.js"
import { log } from "../../src/utils/loggers.js";

const ACCENT = "#635BFF"


const ForgotPassword = () => {

  const purpose = OTP_PURPOSES.PASSWORD_RESET


  const { source } = useLocalSearchParams()

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  })
  const [focused, setFocused] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async () => {
    log("email:", email)
    if (!isValidEmail(email)) {
      setFeedback({ type: "error", message: "Please enter a valid email" })
      return
    }

    setLoading(true)
    const result = await otpService.requestOTP(email, purpose)
    setLoading(false)
    if (result.success) {
      router.push({
        pathname: "/password-reset/ResetPassword",
        params: { email: email, purpose: purpose, source }
      }) 
    } else {
      setFeedback({ type: "error", message: result.error || "Failed to send reset OTP." })
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.header}>
            <View
              style={{
                borderWidth: 1,
                borderColor: ACCENT + '18',
                borderRadius: 12,
                padding: 12,
                marginBottom: 24,
              }}
            >
              <Fingerprint size={24} color={ACCENT} />
            </View>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              No worries, we'll send you a reset link
            </Text>
          </View>
          {feedback.message !== "" && (
            <Text
              style={[
                styles.feedbackBase,
                feedback.type === "error" ? styles.error : styles.success,
              ]}
            >
              {feedback.message}
            </Text>
          )}
          <View style={styles.form}>
            <TextInput
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={[styles.input, focused && styles.inputFocused]}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setEmail}
              value={email}
              placeholderTextColor="#8E8E93"
              editable={!loading}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { transform: [{ scale: 0.97 }] },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending Code..." : "Send Reset Code"}
              </Text>
            </Pressable>
          </View>
          {source !== "dashboard" ? (
            <Pressable
            style={styles.signupRow}
            onPress={() => {
              router.push("/login")
            }}
          >
            <ArrowLeft size={20} />
            <Text style={styles.signupText}>Back to log in</Text>
          </Pressable>
          ): null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default ForgotPassword

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "300",
  },
  feedbackBase: {
    textAlign: "center",
    padding: 10,
    borderRadius: 6,
    width: "90%",
    borderWidth: 1,
    alignSelf: "center",
    marginTop: 8,
  },

  error: {
    color: "#cc475a",
    backgroundColor: "#fef0f0",
    borderColor: "#cc475a",
  },

  success: {
    color: "#27804b",
    backgroundColor: "#e7f8ef",
    borderColor: "#27804b",
  },

  form: {
    width: "100%",
    alignItems: "center",
    paddingTop: 6,
  },
  input: {
    width: "90%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,

    // Space around inputs
    marginVertical: 8,
  },
  inputFocused: {
    borderColor: ACCENT + '18',
    shadowColor: ACCENT,
  },
  footer: {
    alignItems: "center",
    width: "100%",
  },
  button: {
    width: "90%",
    height: 52,
    backgroundColor: ACCENT, // modern green
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",


    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4, 

    marginTop: 16,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: '#B8B5FF',
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
    marginTop: 24
  },
  signupText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: '700',
    color: '#555'
    
  },
})
