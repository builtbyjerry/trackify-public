// src/components/products/Combobox.jsx

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  View, Text, TextInput, Pressable,
  StyleSheet, Keyboard,
  ScrollView
} from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, } from 'react-native-reanimated'

import { ChevronDown, X, Check, Plus, Tag } from 'lucide-react-native'

const TEAL = '#0F6E56'


const Combobox = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select or type...',
  addLabel = 'category',
}) => {
  const ITEM_HEIGHT = 48
  const MAX_ITEMS_VISIBLE = 3

  // ── State ────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)

  // ── Derived values (no hooks, just computed) ──────────────────────────────
  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(query.toLowerCase())
  )

  const showAdd = query.trim().length > 0 &&
    !options.some(opt => opt.toLowerCase() === query.toLowerCase())

  const isSelected = !!value && value === query

  // ── Animation ─────────────────────────────────────────────────────────────
  const dropdownHeight = useSharedValue(0)
  const dropdownOpacity = useSharedValue(0)

  const MAX_DROPDOWN_HEIGHT = useMemo(() => {
    const count = Math.min(filtered.length, MAX_ITEMS_VISIBLE) + (showAdd ? 1 : 0)
    return count * ITEM_HEIGHT
  }, [filtered.length, showAdd])

  useEffect(() => {
    if (open) {
      dropdownHeight.value = withTiming(MAX_DROPDOWN_HEIGHT, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      })
      dropdownOpacity.value = withTiming(1, { duration: 150 })
    } else {
      dropdownHeight.value = withTiming(0, {
        duration: 160,
        easing: Easing.in(Easing.cubic),
      })
      dropdownOpacity.value = withTiming(0, { duration: 120 })
    }
  }, [open, MAX_DROPDOWN_HEIGHT])

  const animatedDropdownStyle = useAnimatedStyle(() => ({
    height: dropdownHeight.value,
    opacity: dropdownOpacity.value,
    overflow: 'hidden',
  }))

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelect = useCallback((selected) => {
    setQuery(selected)
    onChange(selected)
    setOpen(false)
    Keyboard.dismiss()
  }, [onChange])

  const handleAdd = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    onChange(trimmed)
    setOpen(false)
    Keyboard.dismiss()
  }, [query, onChange])

  const handleClear = useCallback(() => {
    setQuery('')
    onChange('')
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [onChange])

  const handleFocus = () => setOpen(true)

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 150)
  }

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={
        styles.inputBox
      }>
        <TextInput
          ref={inputRef}
          style={[styles.input, open && styles.inputBoxOpen, isSelected && styles.inputBoxSelected,]}
          value={query}
          onChangeText={(text) => {
            setQuery(text)
            if (!open) setOpen(true)
            // if they're typing after a selection, clear the committed value
            if (value && text !== value) onChange('')
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
        />
        {isSelected ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={16} color="#bbb" />
          </Pressable>
        ) : (
          <ChevronDown size={16} color="#bbb" />
        )}
      </View>
        <Animated.View style={[styles.dropdown, animatedDropdownStyle]}>
          <ScrollView 
            style={[styles.dropdown, { maxHeight: 48 * 3 }]}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            scrollEnabled={filtered.length > 3}  // only scrollable if actually needed
            showsVerticalScrollIndicator={filtered.length > 3}>
            {filtered.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.dropdownItem, value === opt && styles.dropdownItemSelected]}
                onPress={() => handleSelect(opt)}
              >
                {value === opt
                  ? <Check size={14} color={TEAL} />
                  : <Tag size={14} color="#bbb" />
                }
                <Text style={[
                  styles.dropdownText,
                  value === opt && styles.dropdownTextSelected
                ]}>
                  {opt}
                </Text>
              </Pressable>
            ))}

            {showAdd && (
              <Pressable
                style={[styles.dropdownItem, styles.dropdownItemAdd]}
                onPress={handleAdd}
              >
                <Plus size={14} color={TEAL} />
                <Text style={styles.dropdownTextAdd}>
                  Add "{query.trim()}" as new {addLabel}
                </Text>
              </Pressable>
            )}

            {filtered.length === 0 && !showAdd && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No {addLabel}s yet</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
    </View>
  )
}

export default Combobox

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,  // important — dropdown sits above siblings
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  inputBoxOpen: {
    borderColor: TEAL,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: TEAL,
    shadowOpacity: 0.08,
  },
  inputBoxSelected: {
    borderColor: TEAL,
    backgroundColor: '#f0faf6',
  },
  input: {
    width: '100%',
    fontSize: 14,
    color: '#1a1a1a',
    height: 46,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: TEAL,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    // overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0faf6',
  },
  dropdownItemAdd: {
    borderTopWidth: 0.5,
    borderTopColor: '#e8e8e8',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  dropdownTextSelected: {
    color: TEAL,
    fontWeight: '500',
  },
  dropdownTextAdd: {
    fontSize: 14,
    color: TEAL,
    fontWeight: '500',
  },
  emptyState: {
    padding: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#999999',
  },
})