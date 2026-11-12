import { useState, useCallback } from 'react'
import {
  Pressable, StyleSheet, Text,
  TextInput, View, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Eye, EyeOff, Lock, LockOpen, DoorOpen } from 'lucide-react-native'

import { isValidPassword } from '../../../src/utils/validation.js'
import { signIn } from '../../../src/api/auth.js'
import { useUser } from '../../../src/hooks/useUser.jsx'
import StrengthBar from '../../../src/components/security/password/StrengthBar.jsx'
import MatchIndicator from '../../../src/components/security/password/MatchIndicator.jsx'
import { updateUserPassword } from '../../../src/api/user.js'
import { log } from '../../../src/utils/loggers.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = '#635BFF'

const STEPS = {
  current: {
    index: 0,
    title: 'Current password',
    sub: 'Confirm your identity before setting a new password',
    icon: Lock,
  },
  new: {
    index: 1,
    title: 'New password',
    sub: "Choose a strong password you haven't used before",
    icon: LockOpen,
  },
  confirm: {
    index: 2,
    title: 'Confirm password',
    sub: 'Enter your new password one more time',
    icon: DoorOpen,
  },
}

const TOTAL_STEPS = Object.keys(STEPS).length

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepDots = ({ currentIndex }) => (
  <View style={styles.stepDots}>
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i === currentIndex && styles.dotActive,
          i < currentIndex && styles.dotDone,
        ]}
      />
    ))}
  </View>
)

const PasswordInput = ({ value, onChangeText, placeholder, error, focused, onFocus, onBlur }) => {
  const [visible, setVisible] = useState(false)

  return (
    <View style={styles.inputWrap}>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        secureTextEntry={!visible}
        autoCapitalize="none"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <Pressable
        style={styles.eyeBtn}
        onPress={() => setVisible(v => !v)}
        hitSlop={8}
      >
        {visible
          ? <Eye size={18} color="#999" />
          : <EyeOff size={18} color="#999" />
        }
      </Pressable>
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

const ChangePassword = () => {

  const { user } = useUser()
  const userEmail = user?.email  

  const [step, setStep] = useState('current')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)

  const { index, title, sub, icon: IconComponent } = STEPS[step]

  const activeValue = step === 'current'
    ? currentPassword
    : step === 'new'
      ? newPassword
      : confirmPassword

  const setActiveValue = step === 'current'
    ? setCurrentPassword
    : step === 'new'
      ? setNewPassword
      : setConfirmPassword

  // ── Button disabled logic ──────────────────────────────────────────────────
  const isContinueDisabled = (() => {
    if (loading) return true
    if (step === 'current') return currentPassword.length === 0
    if (step === 'new') return !isValidPassword(newPassword)
    if (step === 'confirm') return confirmPassword !== newPassword
    return false
  })()

  const triggerPasswordReset = () => {
    router.push({
        pathname: '/password-reset/ForgotPassword',
        params: { source: 'dashboard' }
    })
  }

  // ── Step handler ──────────────────────────────────────────────────────────
  const handleContinue = useCallback(async () => {
    setError('')

    if (step === 'current') {
      setLoading(true)
      try {
        await signIn(userEmail, currentPassword)
        setStep('new')
        setCurrentPassword('')
      } catch (e) {
        setError('Incorrect password. Please try again.')
        log("Error trying to check current password:", e)
      } finally {
        setLoading(false)
      }

    } else if (step === 'new') {
      setStep('confirm')

    } else if (step === 'confirm') {
      setLoading(true)
      try {
        await updateUserPassword(newPassword)
        router.setParams({ pinChanged: true })
        router.back()
      } catch (e) {
        setError('Failed to update password. Please try again.')
        setConfirmPassword('')
        log("Error trying to update password:", e)
      } finally {
        setLoading(false)
      }
    }
  }, [step, currentPassword, newPassword, confirmPassword])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={16} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.title}>Change password</Text>
      </View>

      <View style={styles.body}>
        <StepDots currentIndex={index} />

        <View style={[styles.iconBadge, error && styles.iconBadgeError]}>
          
          <IconComponent size={24} style={[styles.iconEmoji, error && styles.iconEmojiError]} />
        </View>

        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSub}>{sub}</Text>

        <PasswordInput
          value={activeValue}
          onChangeText={(text) => {
            setError('')
            setActiveValue(text)
          }}
          placeholder={
            step === 'current' ? 'Enter current password'
            : step === 'new' ? 'Enter new password'
            : 'Confirm new password'
          }
          error={!!error}
          focused={focused}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {step === 'new' && (
          <StrengthBar password={newPassword} />
        )}

        {step === 'confirm' && (
          <MatchIndicator password={newPassword} confirm={confirmPassword} />
        )}

        {step === 'current' && (
          <Pressable
            style={({ pressed }) => [
              styles.forgotLink,
              pressed && styles.forgotLinkPressed
            ]}
            onPress={triggerPasswordReset}
          >
            
            <Text style={styles.forgotLinkText}>Forgot your password?</Text>
          </Pressable>
        )}

        <View style={styles.footer}>
          <Pressable
            style={[styles.btn, isContinueDisabled && styles.btnDisabled]}
            onPress={handleContinue}
            disabled={isContinueDisabled}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {step === 'confirm' ? 'Save password' : 'Continue'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // Step dots
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
  },
  dotActive: {
    width: 20,
    backgroundColor: ACCENT,
  },
  dotDone: {
    backgroundColor: ACCENT,
  },

  // Icon badge
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconBadgeError: {
    backgroundColor: '#FFEEEE',
  },
  iconEmoji: {
    color: '#635BFF'
  },
  iconEmojiError: {
    color: '#FF3B30'
  },

  // Text
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 19,
    maxWidth: 220,
  },

  // Input
  inputWrap: {
    width: '100%',
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.12,
  },
  inputError: {
    borderColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.12,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -9 }],
  },
  errorText: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 8,
  },

  // Forgot link
  forgotLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  forgotLinkPressed: {
    opacity: 0.5,
  },
  forgotLinkText: {
    fontSize: 13,
    color: ACCENT,
  },

  // Footer
  footer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 8,
  },
  btn: {
    width: '100%',
    height: 52,
    backgroundColor: ACCENT,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})

export default ChangePassword