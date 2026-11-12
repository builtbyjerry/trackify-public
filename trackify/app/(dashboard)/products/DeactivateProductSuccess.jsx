// app/(dashboard)/products/DeactivateProductSuccess.jsx

import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArchiveX } from 'lucide-react-native'

const ACCENT = '#A32D2D'
const ACCENT_BG = '#FDF0F0'
const ACCENT_BORDER = '#F5C4C4'

const DeactivateProductSuccess = () => {
  const { productName, type } = useLocalSearchParams()
  // type: 'product' | 'variant'

  const isVariant = type === 'variant'

  const handleDone = () => {
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>

        <View style={styles.iconBadge}>
          <ArchiveX size={40} color={ACCENT} />
        </View>

        <Text style={styles.title}>
          {isVariant ? 'Size removed' : 'Product removed'}
        </Text>

        <Text style={styles.subtitle}>
          {productName
            ? `"${productName}" has been removed from your catalogue. Past transactions remain unaffected.`
            : `The ${isVariant ? 'size' : 'product'} has been removed from your catalogue. Past transactions remain unaffected.`
          }
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Removed {isVariant ? 'sizes' : 'products'} can be restored from the Archived section.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={handleDone}
        >
          <Text style={styles.btnText}>Back to catalogue</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  )
}

export default DeactivateProductSuccess

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f4',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: ACCENT_BG,
    borderWidth: 0.5,
    borderColor: ACCENT_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 260,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 40,
    maxWidth: 280,
  },
  infoText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
  btn: {
    width: '100%',
    height: 52,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})