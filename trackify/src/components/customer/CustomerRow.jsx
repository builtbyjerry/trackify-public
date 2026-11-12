import { Pressable, View, Text, StyleSheet } from 'react-native'

export function CustomerRow({ customer, selected, onPress }) {
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

const styles = StyleSheet.create({
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
    backgroundColor: '#F6FBFA',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: '#3D9E83',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  avatarTextSelected: {
    color: '#fff',
  },
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  customerNameSelected: {
    color: '#3D9E83',
  },
  customerPhone: {
    fontSize: 13,
    color: '#6B7280',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1EAE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3D9E83',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3D9E83',
  },
})