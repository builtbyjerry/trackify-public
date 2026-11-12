import {
  KeyboardAvoidingView, Platform,
  Pressable, StyleSheet, Text, View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OtpInput } from 'react-native-otp-entry'
import { MailOpen } from 'lucide-react-native'
import { useEffect, useRef } from 'react'

const OTPInput = ({
  onVerify,
  onResend,
  loading = false,
  error = null,
  resendLoading = false,
  cooldown = 0,
  title = 'Check your email',
  maskedEmail,             // e.g. "ad***@business.com"
  accentColor = '#2ECC71', // green for PIN, purple for password
}) => {
  const otpRef = useRef(null)

  useEffect(() => {
    if (error) otpRef.current?.clear()
  }, [error])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Icon badge */}
        <View style={[styles.iconBadge, { backgroundColor: accentColor + '18' }]}>
          <MailOpen size={28} color={accentColor} />
        </View>

        {/* Header */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{' '}
          {maskedEmail
            ? <Text style={[styles.maskedEmail, { color: accentColor }]}>{maskedEmail}</Text>
            : 'your email'
          }
          {'. It expires in 10 minutes.'}
        </Text>

        {/* Error */}
        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* OTP boxes */}
        <OtpInput
          ref={otpRef}
          numberOfDigits={6}
          focusColor={accentColor}
          type='numeric'
          disabled={loading}
          onFilled={(otp) => onVerify(String(otp).trim())}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.otpBox,
            pinCodeTextStyle: styles.otpText,
            focusedPinCodeContainerStyle: {
              borderColor: accentColor,
              backgroundColor: accentColor + '0D',
            },
          }}
        />

        {/* Resend */}
        <Pressable
          style={styles.resendBtn}
          onPress={onResend}
          disabled={cooldown > 0 || resendLoading || loading}
        >
          <Text style={[
            styles.resendText,
            (cooldown > 0 || resendLoading) && styles.resendDisabled,
            cooldown === 0 && !resendLoading && { color: accentColor }
          ]}>
            {resendLoading
              ? 'Sending...'
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Didn't receive it? Resend code"
            }
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default OTPInput

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
  },
  keyboardAvoidingView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    maxWidth: 260,
  },
  maskedEmail: {
    fontWeight: '500',
  },
  errorWrap: {
    width: '100%',
    backgroundColor: '#fef0f0',
    borderWidth: 1,
    borderColor: '#cc475a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#cc475a',
    fontSize: 13,
    textAlign: 'center',
  },
  otpContainer: {
    width: '100%',
    paddingVertical: 8,
    marginBottom: 8,
  },
  otpBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  otpText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  resendBtn: {
    marginTop: 16,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resendDisabled: {
    color: '#bbb',
  },
})