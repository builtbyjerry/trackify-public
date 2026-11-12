// components/pin/PinKeypad.jsx

import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { Delete } from 'lucide-react-native'

const { width } = Dimensions.get('window')
const dialPadSize = width * 0.2
const dialPadTextSize = dialPadSize * 0.4

const KEYPAD = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']

const PinKeypad = ({ onPress, disabled = false }) => (
  <View style={styles.keypad}>
    {KEYPAD.map((key, i) => {
      if (key === '') return <View key={i} style={styles.keyEmpty} />

      return (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.key,
            pressed && !disabled && styles.keyPressed,
            disabled && styles.keyDisabled,
          ]}
          onPress={() => !disabled && onPress(key)}
          android_ripple={
            !disabled
              ? { color: 'rgba(0,0,0,0.08)', foreground: true, borderless: true }
              : null
          }
        >
          {key === 'del' ? (
            <Delete size={dialPadTextSize} color={disabled ? '#ccc' : '#1a1a1a'} />
          ) : (
            <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>
              {key}
            </Text>
          )}
        </Pressable>
      )
    })}
  </View>
)

const styles = StyleSheet.create({
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 'auto',
    paddingBottom: 16,
    width: '100%',
  },
  key: {
    width: dialPadSize,
    height: dialPadSize,
    borderRadius: dialPadSize / 2,   // circular
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
    transform: [{ scale: 0.95 }],
  },
  keyDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#f0f0f0',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyEmpty: {
    width: dialPadSize,
    height: dialPadSize,
  },
  keyText: {
    fontSize: dialPadTextSize,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  keyTextDisabled: {
    color: '#ccc',
  },
})

export default PinKeypad