// src/components/transactions/FilterSheet.jsx

import { useRef, useEffect, useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Dimensions
} from 'react-native'
import BottomSheet from '../sheet/BottomSheet.jsx'
import { RotateCcw, X } from 'lucide-react-native'
import useCustomerSearch from '../../hooks/useCustomerSearch.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPES = [
  { key: 'all',   label: 'All' },
  { key: 'sale',  label: 'Sales' },
  { key: 'debt',  label: 'Debt' },
]

const PERIODS = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this_week', label: 'This week' },
  { key: 'this_month', label: 'This month' },
]

export default function FilterSheet({ visible, filters, onChange, onApply, onReset, onClose }) {
  const SCREEN_HEIGHT = Dimensions.get('screen').height
  const SNAP_POINT = -(SCREEN_HEIGHT * 0.77)
  const { bottom } = useSafeAreaInsets()
  const sheetRef = useRef(null)

  const [customerInput, setCustomerInput] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { results, loading } = useCustomerSearch(customerInput)

  useEffect(() => {
    if (visible) {
      sheetRef.current?.scrollTo(SNAP_POINT - bottom)
    } else {
      sheetRef.current?.scrollTo(0)
    }
  }, [visible, SCREEN_HEIGHT])

  const handleTypeChange = useCallback((key) => {
    onChange({ ...filters, type: key })
  }, [filters, onChange])

  const handlePeriodChange = useCallback((key) => {
    onChange({ ...filters, period: key, customFrom: '', customTo: '' })
  }, [filters, onChange])

  const handleSelectCustomer = useCallback((customer) => {
    setCustomerInput(customer.name)
    onChange({ ...filters, selectedCustomer: customer, })
    setIsSearchFocused(false)
    Keyboard.dismiss()
  }, [filters, onChange])

  const handleClearCustomer = useCallback(() => {
    setCustomerInput('')
    onChange({ ...filters, selectedCustomer: null, })
  }, [filters, onChange])

  const handleCancelSearch = () => {
    setIsSearchFocused(false)
    if (!filters.selectedCustomer) setCustomerInput('')
    Keyboard.dismiss()
  }

  return (
    <BottomSheet
      ref={sheetRef}
      backgroundColor='#ffffff'
      avoidKeyboard
      snapPoints={[SNAP_POINT]}
      showHandle
      onClose={onClose}
      showOverlay
    >
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide}/>
        <View style={styles.headerMain}>
          <Text style={styles.title}>Filter transactions</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} />
          </TouchableOpacity>
        </View>
      </View>

      { /* Body */}
      {!isSearchFocused && (
        <View style={styles.body}>
          {/* Type */}
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.chipRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.chip, filters.type === t.key && styles.chipActive]}
                onPress={() => handleTypeChange(t.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, filters.type === t.key && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Period */}
          <Text style={styles.sectionTitle}>Period</Text>
          <View style={styles.chipRow}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[styles.chip, filters.period === p.key && styles.chipActive]}
                onPress={() => handlePeriodChange(p.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, filters.period === p.key && styles.chipTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom date range — only shows when custom is selected */}
          {filters.period === 'custom' && (
            <View style={styles.dateRow}>
              <View style={styles.dateInputWrap}>
                <Text style={styles.dateLabel}>From</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder='DD/MM/YYYY'
                  placeholderTextColor='#cccccc'
                  value={filters.customFrom}
                  onChangeText={(v) => onChange({ ...filters, customFrom: v })}
                  keyboardType='numeric'
                />
              </View>
              <View style={styles.dateSep} />
              <View style={styles.dateInputWrap}>
                <Text style={styles.dateLabel}>To</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder='DD/MM/YYYY'
                  placeholderTextColor='#cccccc'
                  value={filters.customTo}
                  onChangeText={(v) => onChange({ ...filters, customTo: v })}
                  keyboardType='numeric'
                />
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Amount range */}
          <Text style={styles.sectionTitle}>Amount range</Text>
          <View style={styles.amountRow}>
            <View style={styles.amountInputWrap}>
              <Text style={styles.amountPrefix}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder='Min'
                placeholderTextColor='#cccccc'
                value={filters.minAmount}
                onChangeText={(v) => onChange({ ...filters, minAmount: v })}
                keyboardType='numeric'
                returnKeyType='next'
              />
            </View>
            <Text style={styles.amountDash}>—</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.amountPrefix}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder='Max'
                placeholderTextColor='#cccccc'
                value={filters.maxAmount}
                onChangeText={(v) => onChange({ ...filters, maxAmount: v })}
                keyboardType='numeric'
                returnKeyType='done'
              />
            </View>
          </View>

          <View style={styles.divider} />
        </View>
      )}

        <View style={styles.customerSection}>
        <View style={[styles.customerHeader, (isSearchFocused && { paddingTop: 12, })]}>
          <Text style={styles.sectionTitle}>Customer</Text>
          {/* Cancel exits search mode */}
          {isSearchFocused && (
            <TouchableOpacity onPress={handleCancelSearch}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {filters.selectedCustomer ? (
        // selected state — card
        <View style={styles.selectedCustomer}>
          <View>
            <Text style={styles.selectedName}>{filters.selectedCustomer.name}</Text>
          </View>
          <TouchableOpacity onPress={handleClearCustomer} hitSlop={8}>
            <X size={16} color="#999999" />
          </TouchableOpacity>
        </View>
      ) : (
        // search state — input
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            value={customerInput}
            onChangeText={(text) => {
              setCustomerInput(text)
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search by name or phone"
          />
        </View>
      )}

        {isSearchFocused && customerInput.trim() !== '' && (
          <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
            {loading ? (
              <ActivityIndicator />
            ) : results.length === 0 ? (
              <Text style={styles.noResults}>No customers found</Text>
            ) : (
              results.map(customer => (
                <TouchableOpacity
                  key={customer.id}
                  onPress={() => handleSelectCustomer(customer)}
                  style={styles.resultItem}
                >
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerPhone}>{customer.phone}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Footer — hidden when searching */}
      {!isSearchFocused && (
        <View style={styles.footer}>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={styles.applyBtn} onPress={onApply} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>Apply filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    // borderBottomWidth: 0.5,
    // borderBottomColor: '#f0f0f0',
  },
  headerSide: {
    flex: 0.8,
  },
  headerMain: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  resetBtn: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  resetText: {
    fontSize: 13,
    color: '#666666',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  chipActive: {
    backgroundColor: '#0a7d4f',
    borderColor: '#0a7d4f',
  },
  chipText: {
    fontSize: 13,
    color: '#666666',
  },
  chipTextActive: {
    color: '#e1f5ee',
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  dateInputWrap: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  dateSep: {
    width: 12,
    height: 0.5,
    backgroundColor: '#e0e0e0',
    marginTop: 20,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  amountInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  amountPrefix: {
    fontSize: 13,
    color: '#999999',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a1a',
    paddingVertical: 10,
    padding: 0,
  },
  amountDash: {
    fontSize: 13,
    color: '#cccccc',
  },
  customerSection: {
    paddingHorizontal: 20,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelText: {
    fontSize: 13,
    color: '#0a7d4f',
  },
  clearText: {
    fontSize: 18,
    color: '#999999',
    paddingHorizontal: 8,
  },
  selectedCustomer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#0a7d4f',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0faf6',
  },
  selectedName: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  searchWrap: {
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  searchInput: {
    fontSize: 13,
    color: '#1a1a1a',
    paddingVertical: 10,
  },
  results: {
    maxHeight: 180,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    marginTop: 8,
  },
  resultItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  customerName: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  noResults: {
    fontSize: 13,
    color: '#666666',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
  },
  applyBtn: {
    backgroundColor: '#0a7d4f',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e1f5ee',
  },
})