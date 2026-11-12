import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Delete, Diamond } from 'lucide-react-native'

import PinDots  from '../../../src/components/security/pin/PinDots.jsx'
import { verifyPin } from '../../../src/services/userProfileService.js'
import { savePinToUserProfile } from '../../../src/services/onboardingService.js'
import { useUser } from '../../../src/hooks/useUser.jsx'
import { otpService } from '../../../src/services/otpService.jsx'
import { OTP_PURPOSES } from '../../../src/constants/otpConstants.js' 
import { errorLog, log } from '../../../src/utils/loggers.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const PIN_LENGTH = 4
const purpose = OTP_PURPOSES.PIN_RESET

const STEPS = {
  current: {
    index: 0,
    title: 'Enter current PIN',
    sub: 'Confirm your identity before setting a new PIN',
  },
  new: {
    index: 1,
    title: 'New PIN',
    sub: "Choose a 4-digit PIN you'll remember",
  },
  confirm: {
    index: 2,
    title: 'Confirm PIN',
    sub: 'Enter your new PIN one more time',
  },
}

const TOTAL_STEPS = Object.keys(STEPS).length

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

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

const Keypad = ({ onPress }) => (
  <View style={styles.keypad}>
    {KEYPAD.flat().map((key, i) => {
      if (key === '') return <View key={i} style={styles.keyEmpty} />
      return (
        <Pressable
          key={i}
          style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          onPress={() => onPress(key)}
          android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
        >
          {key === 'del'
            ? <Delete size={20} color="#666" />
            : <Text style={styles.keyText}>{key}</Text>
          }
        </Pressable>
      )
    })}
  </View>
)

// ─── Main screen ──────────────────────────────────────────────────────────────

const ChangePIN = () => {
  const { user } = useUser()

  
  const userEmail = user?.email
  
  const [step, setStep] = useState('current')
  const [currentPin, setCurrentPin] = useState('')
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [forgotPinLoading, setForgotPinLoading] = useState(false)

  const { index, title, sub } = STEPS[step]

  // which pin state is active based on current step
  const pinValue = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin
  const setPinValue = step === 'current' ? setCurrentPin : step === 'new' ? setNewPin : setConfirmPin

  const handleKey = useCallback(async (key) => {
    if (loading) return
    setError('')

    if (key === 'del') {
      setPinValue(prev => prev.slice(0, -1))
      return
    }

    if (pinValue.length >= PIN_LENGTH) return

    const next = pinValue + key
    setPinValue(next)

    if (next.length === PIN_LENGTH) {
      await handleSubmit(next)
    }
  }, [pinValue, step, loading])

  const handleSubmit = async (pin) => {
    setError('')

    if (step === 'current') {
        setLoading(true)
        setIsVerifying(true)
        try {
            const { isValid } = await verifyPin(pin)
            if (isValid) {
                setStep('new')
                setOldPin(pin)
                setCurrentPin('')
            } else {
                setError('Incorrect PIN. Please try again.')
                setCurrentPin('')
            }
        } catch (e) {
            setError(e?.message || "Something's wrong")
            console.error(e)
            setCurrentPin('')
        } finally {
            setIsVerifying(false)
            setLoading(false)
        }

    } else if (step === 'new') {
        // just store it and move on — no API call needed here
        setStep('confirm')

    } else if (step === 'confirm') {
        if (pin !== newPin) {
        setError("PINs don't match. Please try again.")
        setConfirmPin('')
        } else {
        setLoading(true)
        setIsVerifying(true)
        try {
            const result = await savePinToUserProfile(pin, { isOnboarding: false, currentPin: oldPin })
            setIsVerifying(false)
            if (result.success) {
              router.setParams({ pinChanged: true })
              router.back()
            } else {
              setError(result.error || 'Failed to update PIN. Please try again.')
              setConfirmPin('')
            }
            
           
        } catch (e) {
            setError(e?.message || 'Failed to update PIN. Please try again.')
            setConfirmPin('')
        } finally {
            setLoading(false)
            setIsVerifying(false)
        }
        }
    }
  }

  const handleForgotPin = async () => {
      log("Your email:", userEmail)
      setForgotPinLoading(true)
      try {
        const result = await otpService.requestOTP(userEmail, purpose)
        if (result.success) {
          router.push({
            pathname: "/pin-reset/ResetPinOtp",
            params: { purpose: purpose }
          })
        } else {
          errorLog(result.error)
        }
      } catch (err) {
        errorLog(err)
      } finally {
        setForgotPinLoading(false)
      }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={16} color="#1a1a1a" />
        </Pressable>
        <Text style={styles.title}>Change PIN</Text>
      </View>

      <View style={styles.body}>
        <StepDots currentIndex={index} />

        <View style={[styles.iconBadge, error && styles.iconBadgeError]}>
          <Diamond size={20} style={[styles.iconEmoji, error && styles.iconEmojiError]}  />
        </View>

        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSub}>{sub}</Text>

        <PinDots length={pinValue.length} error={!!error} isVerifying={isVerifying} />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {step === 'current' && !error && (
          <Pressable onPress={handleForgotPin} hitSlop={12} disabled={forgotPinLoading}>
            {forgotPinLoading ? (
              <View style={styles.forgotPinRow}>
                <ActivityIndicator size="small" color="#27804b" />
                <Text style={styles.forgotLink}>Sending code...</Text>
              </View>
            ) : (
              <Text style={styles.forgotLink}>Forgot your PIN?</Text>
            )}
          </Pressable>
        )}

        <Keypad onPress={handleKey} />
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
    backgroundColor: '#2ECC71',
  },
  dotDone: {
    backgroundColor: '#2ECC71',
  },

  // Icon badge
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E8F8EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconBadgeError: {
    backgroundColor: '#FFEEEE',
  },
  iconEmoji: {
    color: '#2ECC71'
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
    marginBottom: 32,
    lineHeight: 19,
    maxWidth: 220,
  },

  // PIN dots
  pinDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  pinDotFilled: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  pinDotError: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    marginBottom: 4,
  },
  forgotPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  forgotLink: {
    fontSize: 13,
    color: '#2ECC71',
    marginTop: 14,
  },

  // Keypad
  keypad: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 'auto',
    paddingBottom: 16,
  },
  key: {
    width: '30%',
    flexGrow: 1,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  keyPressed: {
    backgroundColor: '#f0f0f0',
  },
  keyEmpty: {
    width: '30%',
    flexGrow: 1,
    height: 60,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1a1a1a',
  },
})

export default ChangePIN