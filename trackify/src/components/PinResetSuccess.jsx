import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CheckCircle } from 'lucide-react-native'

export default function PinResetSuccess({ onDone, visible }) {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) {
      progress.setValue(0)
      return
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,  // width animation needs this false
    }).start(() => onDone())   // fires when bar completes
  }, [visible])

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <CheckCircle size={32} color="#2ECC71" />
      </View>
      <Text style={styles.title}>PIN updated</Text>
      <Text style={styles.subtitle}>
        Your payment PIN has been changed successfully. Returning you to main page
      </Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width }]} />
      </View>
      <TouchableOpacity style={styles.button} onPress={onDone}>
        <Text style={styles.buttonText}>Go to profile</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0faf4',
    borderWidth: 1.5,
    borderColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 2,
  },
  button: {
    width: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
})