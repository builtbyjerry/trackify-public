// app/(dashboard)/products/AddProductSuccess.jsx

import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle } from 'lucide-react-native'

const TEAL = '#0F6E56'

const AddProductSuccess = () => {
  const { productName } = useLocalSearchParams()

  const handleDone = () => {
    // pop success + AddProduct off the stack, land on EditProducts
    router.back()
  }

  const handleAddAnother = () => {
    // pop just the success screen, land back on a fresh AddProduct
    router.back()
    router.push('/(dashboard)/products/AddProducts')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <CheckCircle size={40} color={TEAL} />
        </View>

        <Text style={styles.title}>Product added</Text>
        <Text style={styles.subtitle}>
          {productName
            ? `"${productName}" has been added to your catalogue.`
            : 'Your product has been added to your catalogue.'
          }
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={handleDone}
          >
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={handleAddAnother}
          >
            <Text style={styles.secondaryBtnText}>Add another product</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default AddProductSuccess

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
    backgroundColor: '#E8F8EE',
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
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    maxWidth: 260,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: TEAL,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#E1F5EE',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  secondaryBtnText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '500',
  },
})