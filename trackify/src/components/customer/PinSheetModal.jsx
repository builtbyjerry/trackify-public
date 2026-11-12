import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Delete, X } from 'lucide-react-native'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  mint:        '#00C170',
  mintSoft:    '#00C17018',
  mintBorder:  '#00C17060',
  label:       '#0A0A0F',
  sublabel:    '#6B7280',
  sheet:       '#FFFFFF',
  keyBg:       '#F2F2F7',
  keyPressed:  '#D1D1D6',
  rose:        '#FF3B30',
  roseSoft:    '#FF3B3014',
  roseBorder:  '#FF3B3066',
  separator:   '#E4E4EB',
  handle:      '#D1D1D6',
  closeBg:     '#EFEFEF',
  closeIcon:   '#8E8E93',
}

const PIN_LENGTH = 4

const KEY_PAD = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [0, 'del'],
]

// ─── Shake Hook (lightweight — just translateX, no spring) ────────────────────
function useShake() {
  const shakeX = useRef(new Animated.Value(0)).current

  const shake = useCallback(() => {
    shakeX.setValue(0)
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  0, duration: 40, useNativeDriver: true }),
    ]).start()
  }, [shakeX])

  return { shakeX, shake }
}

// ─── PIN Cells ────────────────────────────────────────────────────────────────
function PinDisplay({ pin, error, shakeX }) {
  return (
    <Animated.View style={[styles.pinRow, { transform: [{ translateX: shakeX }] }]}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => {
        const filled = i < pin.length
        const active = i === pin.length && !error

        return (
          <View
            key={i}
            style={[
              styles.pinCell,
              active && styles.pinCellActive,
              filled && !error && styles.pinCellFilled,
              error  && styles.pinCellError,
            ]}
          >
            {filled && (
              <View style={[styles.pinDot, error && styles.pinDotError]} />
            )}
          </View>
        )
      })}
    </Animated.View>
  )
}

// ─── Key Button ───────────────────────────────────────────────────────────────
function KeyButton({ item, onPress }) {
  const isZero   = item === 0
  const isDelete = item === 'del'

  return (
    <Pressable
      onPress={() => onPress(item)}
      android_ripple={null}
      style={{ flex: isZero ? 2 : 1 }}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.keyInner,
            // Delete is always transparent — no background, no shadow bleed
            isDelete
              ? styles.keyInnerGhost
              : { backgroundColor: pressed ? COLORS.keyPressed : COLORS.keyBg },
          ]}
        >
          {isDelete ? (
            <Delete
              size={21}
              color={pressed ? COLORS.sublabel : COLORS.label}
              strokeWidth={1.8}
            />
          ) : (
            <Text style={[styles.keyLabel, pressed && styles.keyLabelPressed]}>
              {item}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  )
}

// ─── Dial Pad ─────────────────────────────────────────────────────────────────
function DialPad({ onKeyPress }) {
  return (
    <View style={styles.dialPad}>
      {KEY_PAD.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyRow}>
          {row.map((item, index) => (
            <KeyButton key={index} item={item} onPress={onKeyPress} />
          ))}
        </View>
      ))}
    </View>
  )
}

// ─── Sheet ────────────────────────────────────────────────────────────────────
/**
 * PinSheetModal
 *
 * Props
 *   onCancel()            close the sheet
 *   onNext(pin: string)   called once all 4 digits are entered
 *   onForgotPin()         "Forgot PIN?" handler
 *   incorrectPin: bool    flip to true to trigger shake + error state
 */
export default function PinSheetModal({
  onCancel,
  onNext,
  onForgotPin,
  incorrectPin = false,
  onErrorHandled,
  forgotPinLoading = false, 
}) {
  const [pin,   setPin]   = useState('')
  const [error, setError] = useState(false)
  const { shakeX, shake } = useShake()
  const timerRef = useRef(null)

  useEffect(() => {
    if (!incorrectPin) return
    setError(true)
    shake()
    timerRef.current = setTimeout(() => {
      setPin('')
      setError(false)

      onErrorHandled?.()
    }, 1500)
    return () => clearTimeout(timerRef.current)
  }, [incorrectPin])

  const handleKeyPress = useCallback((item) => {
    if (error) return

    if (item === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }

    setPin((p) => {
      if (p.length >= PIN_LENGTH) return p
      const next = p + String(item)
      if (next.length === PIN_LENGTH) {
        setTimeout(() => onNext?.(next), 80)
      }
      return next
    })
  }, [error, onNext])

  return (
    <View style={styles.sheet}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enter Payment PIN</Text>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.55 }]}
          onPress={onCancel}
          hitSlop={12}
        >
          <X size={13} color={COLORS.closeIcon} strokeWidth={2.8} />
        </Pressable>
      </View>
      {/* PIN + feedback */}
      <View style={styles.pinSection}>
        <PinDisplay pin={pin} error={error} shakeX={shakeX} />
        {/* Fixed-height slot — layout never shifts on error/clear */}
        <View style={styles.feedbackSlot}>
          {error && <Text style={styles.errorLabel}>Incorrect PIN, please try again</Text>}
        </View>
        <Pressable
          onPress={onForgotPin}
          hitSlop={10}
          disabled={forgotPinLoading}
          style={({ pressed }) => ([
            styles.forgotPinButton,
            { opacity: pressed && !forgotPinLoading ? 0.5 : 1 },
            forgotPinLoading && styles.forgotPinButtonDisabled,
          ])}
        >
          {forgotPinLoading ? (
            <View style={styles.forgotPinRow}>
              <ActivityIndicator size="small" color="#27804b" />
              <Text style={styles.forgotPinText}>Sending code...</Text>
            </View>
          ) : (
            <Text style={styles.forgotPinText}>Forgot Payment PIN?</Text>
          )}
        </Pressable>
      </View>

      {/* Keypad */}
      <DialPad onKeyPress={handleKeyPress} />

    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheet: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    gap: 14,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.handle,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: -4,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.label,
    letterSpacing: -0.2,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.closeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── PIN section ──
  pinSection: {
    alignItems: 'center',
    gap: 8,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pinCell: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.separator,
    backgroundColor: COLORS.keyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCellActive: {
    borderColor: COLORS.mintBorder,
    backgroundColor: COLORS.mintSoft,
  },
  pinCellFilled: {
    borderColor: COLORS.separator,
    backgroundColor: COLORS.sheet,
  },
  pinCellError: {
    borderColor: COLORS.roseBorder,
    backgroundColor: COLORS.roseSoft,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.label,
  },
  pinDotError: {
    backgroundColor: COLORS.rose,
  },

  feedbackSlot: {
    height: 16,
    justifyContent: 'center',
  },
  errorLabel: {
    fontSize: 12,
    color: COLORS.rose,
    fontWeight: '500',
  },
  forgotPinButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignSelf: 'center',
  },
  forgotPinButtonDisabled: {
    opacity: 0.5,
  },
  forgotPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forgotPinText: {
    fontSize: 14,
    color: COLORS.mint,
    fontWeight: '500',
  },

  // ── Keypad ──
  dialPad: {
    gap: 8,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyInner: {
    height: 52,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ghost variant for delete — no bg, no shadow, no elevation bleed
  keyInnerGhost: {
    backgroundColor: 'transparent',
  },
  keyLabel: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.label,
    letterSpacing: -0.4,
  },
  keyLabelPressed: {
    color: COLORS.sublabel,
  },
})