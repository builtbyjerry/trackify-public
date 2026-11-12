import { useState, useEffect } from "react"
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
import { KeyRound } from "lucide-react-native"
import * as SecureStore from 'expo-secure-store'
import { otpService } from '../../src/services/otpService.jsx'
import { tokenStorage } from '../../src/utils/tokenStorage.js'
import { log } from "../../src/utils/loggers.js";

const UpdatePassword = () => {

  const { purpose, source } = useLocalSearchParams()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState(null)
    const [error, setError] = useState(null)

    const isStrong = password.length >= 8
    const activeColor = isStrong ? "#635BFF" : "#FF4F4F"

    const isSame = password === confirmPassword
    const confirmColor = isSame ? "#635BFF" : "#FF4F4F"

    useEffect(() => {
      const checkToken = async () => {
        const { token, expiry } = await tokenStorage.get(purpose)

        if (!token || !expiry || new Date(expiry) < new Date()) {
          log("Token:", token)
          log("Expiry:", expiry)
          log("Is expired? ", new Date(expiry) < new Date())
          log("Reset token is missing or expired. Redirecting to login (or profile page).")
          
          source === "dashboard" ? router.replace("(dashboard)/profile") : router.replace("login")
        }
      }
      checkToken()
    }, [])
    

    const handleResetPassword = async () => {
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError(null)
          const { token } =  await tokenStorage.get(purpose)
          const result = await otpService.resetPassword(token, password)
          if (result.success) {
            log("Password reset successfully. Redirecting to login.")
            await tokenStorage.clear(purpose)
            await tokenStorage.clear(purpose)
            router.replace({
                pathname: '/password-reset/Success',
                params: { source }
            })
          } else {
            setError(result.error || "Error resetting password. Please try again.")
            setLoading(false)
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
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderRadius: 12,
                padding: 12,
                marginBottom: 24,
              }}
            >
              <KeyRound size ={24} />
            </View>
            <Text style={styles.title}>Set new password</Text>
            <Text style={styles.subtitle}>
              Must be at least 8 characters long
            </Text>
          </View>
          {error && (
                <Text style={styles.error}>{error}</Text>
            )}
          <View style={styles.form}>
            <TextInput
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              style={[styles.input, focused === "password" && { borderColor: activeColor, shadow: activeColor }]} 
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setPassword}
              value={password}
              placeholderTextColor="#8E8E93"
              editable={!loading}
            />

            <TextInput
              onFocus={() => setFocused("confirmPassword")}
              onBlur={() => setFocused(null)}
              style={[styles.input, focused === "confirmPassword" && { borderColor: confirmColor, shadowColor: confirmColor }]}
              placeholder="Confirm Password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
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
                {loading ? "Resetting password..." : "Reset Password"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default UpdatePassword

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
  error: {
    color: '#cc475a',
    textAlign: 'center',
    backgroundColor: '#fef0f0',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cc475a',
    width: '90%',
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

    // Border w/ green accent on focus (optional — see below)
    borderWidth: 1,
    borderColor: "#E0E0E0",

    // Soft iOS-style shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2, // Android shadow

    // Space around inputs
    marginVertical: 8,
  },
  footer: {
    alignItems: "center",
    width: "100%",
  },
  button: {
    width: "90%",
    height: 52,
    backgroundColor: "#635BFF", // modern green
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",

    // iOS soft shadow
    shadowColor: "#635BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4, // Android

    marginTop: 16,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: "#B8B5FF",
    shadowOpacity: 0,
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
