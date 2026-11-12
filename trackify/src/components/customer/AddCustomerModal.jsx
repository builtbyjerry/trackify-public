import React, { useState, useRef, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native'
import { X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const COLORS = {
  green: '#3D9E83',
  greenLight: '#D1EAE4',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  grayBorder: '#E5E7EB',
  white: '#FFFFFF',
  black: '#111827',
  blackSoft: '#374151',
}

const UnderLineInput =  React.memo( function UnderlineInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
}) {
  const [focused, setFocused] = useState(false)
  const lineAnim = useRef(new Animated.Value(0)).current

  const handleFocus = () => {
    setFocused(true)
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleBlur = () => {
    setFocused(false)
    Animated.timing(lineAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start()
  }

  const lineColor = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.grayBorder, COLORS.green],
  })

  const lineHeight = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  })

  return (
    <View style={inputStyles.wrapper}>
      <Text style={[inputStyles.label, focused && inputStyles.labelFocused]}>
        {label}
      </Text>
      <TextInput
        style={inputStyles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        selectionColor={COLORS.green}
        cursorColor={COLORS.green}
      />
      <Animated.View
        style={[
          inputStyles.underline,
          { backgroundColor: lineColor, height: lineHeight },
        ]}
      />
    </View>
  )
})

const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  labelFocused: {
    color: COLORS.green,
  },
  input: {
    fontSize: 16,
    color: COLORS.black,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  underline: {
    marginTop: 2,
    borderRadius: 2,
  },
})

export default function AddCustomerModal({ visible, onClose, onSave, initialName = '', initialPhone = '' }) {
  const insets = useSafeAreaInsets()
  
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)

  useEffect(() => {
    if (visible) {
      setName(initialName || '')
      setPhone(initialPhone || '')
    }
  }, [initialName, initialPhone, visible])

  const handleSavePress = () => {
    if (!name.trim() || !phone.trim()) return
    onSave(name.trim(), phone.trim())
    setName('')
    setPhone('')
    onClose()
  }

  const handleClose = () => {
    setName('')
    setPhone('')
    onClose()
  }

  const canSave = name.trim().length > 0 && phone.trim().length >= 11

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { bottom: insets.bottom}]}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <X size={22}/>
              </Pressable>
              <Text style={styles.title}>Add new customers</Text>
            </View>
            {/* Form */}
            <View style={styles.form}>
              <UnderLineInput
                label="Customer name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. John Doe"
                autoCapitalize="words"
              />
              <UnderLineInput
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                placeholder="08012345678"
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                onPress={handleSavePress}
                disabled={!canSave}
              >
                <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                  Add customer
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    left: 0,
    marginBottom: 10,

  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  form: {},

  buttonRow: {
    marginTop: 8,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayBorder,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.gray,
  },

  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.greenLight,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  saveTextDisabled: {
    color: COLORS.green,
    opacity: 0.6,
  },
})