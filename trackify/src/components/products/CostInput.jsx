// components/products/CostInput.jsx

import { useState, useMemo } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

const ACCENT = '#0F6E56'

const CostInput = ({ baseUnit = 'unit', value, onChange }) => {
  const [mode, setMode] = useState('direct') // 'direct' | 'calculate'
  const [unitsBought, setUnitsBought] = useState('')
  const [totalPaid, setTotalPaid] = useState('')
  const [focused, setFocused] = useState(null)

  const computedCost = useMemo(() => {
    const units = parseFloat(unitsBought)
    const total = parseFloat(totalPaid)
    if (!units || !total || units <= 0) return null
    return total / units
  }, [unitsBought, totalPaid])

  // push computed cost up whenever it changes
  const handleUnitsChange = (text) => {
    setUnitsBought(text)
    const units = parseFloat(text)
    const total = parseFloat(totalPaid)
    if (units > 0 && total > 0) onChange(total / units)
  }

  const handleTotalChange = (text) => {
    setTotalPaid(text)
    const units = parseFloat(unitsBought)
    const total = parseFloat(text)
    if (units > 0 && total > 0) onChange(total / units)
  }

  const handleDirectChange = (text) => {
    onChange(parseFloat(text) || 0)
  }

  return (
    <View>
      <Text style={styles.label}>Cost per {baseUnit}</Text>

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleOpt, mode === 'direct' && styles.toggleOptActive]}
          onPress={() => setMode('direct')}
        >
          <Text style={[styles.toggleText, mode === 'direct' && styles.toggleTextActive]}>
            I know the cost
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleOpt, mode === 'calculate' && styles.toggleOptActive]}
          onPress={() => setMode('calculate')}
        >
          <Text style={[styles.toggleText, mode === 'calculate' && styles.toggleTextActive]}>
            Calculate from purchase
          </Text>
        </Pressable>
      </View>

      {mode === 'direct' ? (
        <View style={styles.inputBox}>
          <Text style={styles.prefix}>₦</Text>
          <TextInput
            style={[styles.input, focused === 'direct' && styles.inputFocused]}
            value={value ? String(value) : ''}
            onChangeText={handleDirectChange}
            onFocus={() => setFocused('direct')}
            onBlur={() => setFocused(null)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#B0B0B0"
          />
        </View>
      ) : (
        <>
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Units bought</Text>
                <TextInput
                  style={[styles.input, focused === 'units' && styles.inputFocused, { paddingHorizontal: 12,}]}
                  value={unitsBought}
                  onChangeText={handleUnitsChange}
                  onFocus={() => setFocused('units')}
                  onBlur={() => setFocused(null)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#B0B0B0"
                />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Total paid</Text>
              <View style={styles.inputBox}>
                <Text style={styles.prefix}>₦</Text>
                <TextInput
                  style={[styles.input, focused === 'total' && styles.inputFocused]}
                  value={totalPaid}
                  onChangeText={handleTotalChange}
                  onFocus={() => setFocused('total')}
                  onBlur={() => setFocused(null)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#B0B0B0"
                />
              </View>
            </View>
          </View>

          {computedCost !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Cost per {baseUnit}</Text>
              <Text style={styles.resultValue}>
                ₦{computedCost.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.resultSub}>
                ₦{parseFloat(totalPaid).toLocaleString('en-NG')} ÷ {unitsBought} units
              </Text>
            </View>
          )}

          <Text style={styles.helper}>
            This will be used as the cost for this product. You can adjust units bought next time you restock.
          </Text>
        </>
      )}
    </View>
  )
}

export default CostInput

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  toggleOpt: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 7,
  },
  toggleOptActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 12,
    color: '#666666',
  },
  toggleTextActive: {
    fontWeight: '500',
    color: '#1a1a1a',
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  inputFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.12,
  },
  prefix: {
    fontSize: 14,
    color: '#999999',
    marginRight: 4,
  },
  input: {
    width: '100%',
    fontSize: 14,
    color: '#1a1a1a',
    paddingHorizontal: 6,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  resultCard: {
    marginTop: 12,
    backgroundColor: '#E8F8EE',
    borderRadius: 10,
    padding: 12,
  },
  resultLabel: {
    fontSize: 11,
    color: ACCENT,
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '500',
    color: ACCENT,
  },
  resultSub: {
    fontSize: 11,
    color: ACCENT,
    opacity: 0.7,
    marginTop: 2,
  },
  helper: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    lineHeight: 18,
  },
})