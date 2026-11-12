import React, { useState, useEffect } from 'react'
import { 
  StyleSheet,
  View, 
  ScrollView,
  Text,
  TextInput,
  Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useUser } from '../../src/hooks/useUser'
import { getSavedEmail, setSavedEmail } from '../../src/utils/authPreferences.js'
import { log } from '../../src/utils/loggers.js'



const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [focusedInput, setFocusedInput] = useState(null)
  const [remember, setRemember] = useState(null)

  const { login } = useUser()

  useEffect(() => {
    const rememberedEmail = async () => {
      const savedEmail = await getSavedEmail();
      if (savedEmail) {
        setEmail(savedEmail)
        log("remembered/saved email,", savedEmail)
      } else {
        log("unremembered", savedEmail)
      }
    }
    rememberedEmail()
  }, [])

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password)
      
      if (error) {
        setError(error.message)
        return;
      }
      log("Login successful")
      await setSavedEmail(email)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}> 
              <Text style={styles.title}>Log in to your account</Text>
              <Text style={styles.subtitle}>Welcome back!</Text>
            </View>
            {error && (
              <>
                <Text style={styles.error}>{error}</Text>
              </>
            )}
            <View style={styles.form}>
              <TextInput
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused,
                ]}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEmail}
                value={email}
                placeholderTextColor="#8E8E93" 
                editable={!loading}
              />

              <TextInput
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                ]}
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize="none"
                onChangeText={setPassword}
                value={password}
                placeholderTextColor="#8E8E93"
                editable={!loading}
                onSubmitEditing={handleSignIn}
              />
            </View>

            <View style={styles.footer}>
              <Pressable
                style={({ pressed }) => [
                styles.button,
                pressed && { transform: [{ scale: 0.97 }] },
                loading && styles.buttonDisabled
              ]}
              onPress={handleSignIn}
              disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logging in..." : "Log In"}
                </Text>
              </Pressable>

              <View style={styles.row}>
                {/* Checkbox + Label */}
                <Pressable style={styles.checkboxContainer} onPress={() => setRemember(!remember)}>
                  <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                    {remember && (
                      <Ionicons name='checkmark' size={16} color='white' />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </Pressable>

                {/* Forgot Password Link */}
                <Pressable onPress={() => { router.push('/password-reset/ForgotPassword') }}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>

              
            </View>
        </ScrollView>
        <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>

              <Pressable onPress={() => {router.push('/signup')}}>
                <Text style={styles.signupLink}>Sign up</Text>
              </Pressable>
            </View>
      </SafeAreaView>
  )
}

export default Login

export const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { 
    alignItems: 'center', 
    paddingBottom: 24, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'monospace'
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
    width: '100%',
    alignItems: 'center',
    paddingTop: 6,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',

    // Border w/ green accent on focus (optional — see below)
    borderWidth: 1,
    borderColor: '#E0E0E0',

    // Soft iOS-style shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2, // Android shadow

    // Space around inputs
    marginVertical: 8,
  },
  inputFocused: {
    borderColor: '#2ECC71',
    shadowColor: '#2ECC71',
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    width: '90%',
    height: 52,
    backgroundColor: '#2ECC71', // modern green
    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    // iOS soft shadow
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4, // Android

    marginTop: 16,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0, 
  },
   row: {
    width: '90%',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* Checkbox container */
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#BEC5D1',
    backgroundColor: 'white',
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  checkboxChecked: {
    borderColor: '#2ECC71',
    backgroundColor: '#2ECC71',
  },

  checkboxLabel: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '400',
  },

  /* Forgot password link */
  forgotText: {
    fontSize: 15,
    color: '#2ECC71',
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24
  },
  signupText: {
    fontSize: 16,
    color: '#6C727A', // light grey
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ECC71', // modern green
  },

})

