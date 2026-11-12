import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native'

// ─── Mock data (replace with your real data) ────────────────────────────────
const MOCK_CUSTOMERS = [
  { id: '1', name: 'John Doe',    phone: '08012345678', status: 'warning', statusLabel: 'Frequent complaints' },
  { id: '2', name: 'Jane Smith',  phone: '07098765432', status: null,      statusLabel: null },
  { id: '3', name: 'Michael A.',  phone: '08122233334', status: 'vip',     statusLabel: 'VIP customer' },
  { id: '4', name: 'Amaka Obi',   phone: '09031112233', status: null,      statusLabel: null },
  { id: '5', name: 'Tunde Bello', phone: '08055667788', status: 'vip',     statusLabel: 'VIP customer' },
]
const ROW_HEIGHT = 68 // approximate height of one row including padding
const VISIBLE_ROWS = 2

// ─── Sub-components ──────────────────────────────────────────────────────────

function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.searchWrapper}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search name or phone…"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
      />
    </View>
  )
}


function CustomerRow({ customer, selected, onPress }) {
  const isSelected = selected?.id === customer.id
  return (
    <Pressable
      style={({ pressed }) => [
        styles.customerRow,
        isSelected && styles.customerRowSelected,
        pressed && styles.customerRowPressed,
      ]}
      onPress={() => onPress(customer)}
    >
      {/* Avatar */}
      <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
        <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
          {customer.name.charAt(0)}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.customerInfo}>
        <Text style={[styles.customerName, isSelected && styles.customerNameSelected]}>
          {customer.name}
        </Text>
        <Text style={styles.customerPhone}>{customer.phone}</Text>
      </View>

      {/* Selection indicator */}
      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  )
}

function Divider({ label }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      {label && <Text style={styles.dividerLabel}>{label}</Text>}
      {label && <View style={styles.dividerLine} />}
    </View>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function CustomerSheetContent({ onNext, onCancel, onAddNew }) {
  const [query, setQuery]           = useState('')
  const [selected, setSelected]     = useState(null)
  const [anonymous, setAnonymous]   = useState(false)
  const [notes, setNotes]           = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return MOCK_CUSTOMERS
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q),
    )
  }, [query])

  function handleSelectCustomer(customer) {
    setSelected(customer)
    setAnonymous(false)
  }

  function handleAnonymous() {
    setAnonymous(true)
    setSelected(null)
  }

  function handleNext() {
    if (!selected && !anonymous) return
    onNext?.({
      customer: anonymous ? null : selected,
      anonymous,
      notes: notes.trim(),
    })
  }

  const canProceed = selected || anonymous

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select customer</Text>
        <Text style={styles.headerSub}>
          {selected
            ? selected.name
            : anonymous
            ? 'Anonymous sale'
            : 'No customer selected'}
        </Text>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

      {/* ── Customer list ── */}
      <Text style={styles.sectionLabel}>Existing customers</Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No customers match "{query}"</Text>
          </View>
        ) : (
          filtered.map((c, i) => (
            <React.Fragment key={c.id}>
              <CustomerRow
                customer={c}
                selected={selected}
                onPress={handleSelectCustomer}
              />
              {i < filtered.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))
        )}
      </ScrollView>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.addButton} onPress={onAddNew} activeOpacity={0.75}>
          <Text style={styles.addButtonText}>+ Add new customer</Text>
        </TouchableOpacity>

        <Divider label="or" />

        <TouchableOpacity
          style={[styles.anonButton, anonymous && styles.anonButtonActive]}
          onPress={handleAnonymous}
          activeOpacity={0.75}
        >
          <Text style={styles.anonIcon}>👤</Text>
          <Text style={[styles.anonText, anonymous && styles.anonTextActive]}>
            Continue as anonymous
          </Text>
        </TouchableOpacity>

        {/* ── Notes ── */}
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Transaction notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add a note (optional)…"
            placeholderTextColor="#C4C4C4"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* ── Footer buttons ── */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
            onPress={handleNext}
            activeOpacity={canProceed ? 0.8 : 1}
          >
            <Text style={styles.nextText}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ACCENT    = '#3D9E83'   // primary green
const ACCENT_LT = '#42B39E'   // lighter variant (hover, active states)
const SURFACE   = '#F6FBFA'   // very faint green-tinted surface instead of cold gray
const BORDER    = '#D1EAE4'   // green-tinted border
const TEXT_PRI  = '#111827'
const TEXT_SEC  = '#6B7280'

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRI,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: TEXT_SEC,
    marginTop: 2,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 18,
    height: 46,
  },
  searchIcon: {
    fontSize: 20,
    color: TEXT_SEC,
    marginRight: 8,
    lineHeight: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRI,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: TEXT_SEC,
    marginBottom: 8,
  },

  // List
  list: {
    maxHeight: ROW_HEIGHT * VISIBLE_ROWS,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingVertical: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 16,
  },

  // Customer row
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  customerRowSelected: {
    backgroundColor: '#EDFAF6',
  },
  customerRowPressed: {
    backgroundColor: SURFACE,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: ACCENT,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_SEC,
  },
  avatarTextSelected: {
    color: '#fff',
  },

  // Customer info
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRI,
  },
  customerNameSelected: {
    color: ACCENT,
  },
  customerPhone: {
    fontSize: 13,
    color: TEXT_SEC,
  },

  // Radio
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: ACCENT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },

  // Badges
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeVip: {
    backgroundColor: '#F0FDF4',
  },
  badgeWarning: {
    backgroundColor: '#FFFBEB',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextVip: {
    color: '#16A34A',
  },
  badgeTextWarning: {
    color: '#D97706',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_SEC,
  },

  // Actions block
  actions: {
    marginTop: 16,
    gap: 12,
  },

  // Add button
  addButton: {
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ACCENT,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerLabel: {
    fontSize: 12,
    color: TEXT_SEC,
    fontWeight: '500',
  },

  // Anonymous
  anonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  anonButtonActive: {
    backgroundColor: '#F0FDF9',
    borderColor: '#86C9BB' 
  },
  anonIcon: {
    fontSize: 18,
  },
  anonText: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_SEC,
  },
  anonTextActive: {
    color: '#2D7A65',
  },

  // Notes
  notesBlock: {
    gap: 6,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SEC,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: TEXT_PRI,
    backgroundColor: '#fff',
    minHeight: 80,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_SEC,
  },
  nextBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#A7D9CF',
  },
  nextText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
})