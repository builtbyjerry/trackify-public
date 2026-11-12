import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle } from 'lucide-react-native'

const ACCENT = '#635BFF'

const PasswordResetSuccess = () => {
  const { source } = useLocalSearchParams()
  const isFromMain = source === 'dashboard'

  const handleContinue = () => {
    if (isFromMain) {
      router.dismissAll()
      router.replace('/(dashboard)/profile')
    } else {
      router.replace('/(auth)/login')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <CheckCircle size={36} color="#2ECC71" />
        </View>
        <Text style={styles.title}>Password updated</Text>
        <Text style={styles.subtitle}>
          Your password has been changed successfully.
          {isFromMain
            ? ' You can continue using the app.'
            : ' You can now log in with your new password.'
          }
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            pressed && styles.btnPressed,
          ]}
          onPress={handleContinue}
        >
          <Text style={styles.btnText}>
            {isFromMain ? 'Back to profile' : 'Back to log in'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

export default PasswordResetSuccess

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#E8F8EE',
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
    marginBottom: 40,
    maxWidth: 260,
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
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})