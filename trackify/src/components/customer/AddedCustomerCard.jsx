import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Pencil, X, Phone } from 'lucide-react-native'

export default function AddedCustomerCard({ customer, onEdit, onRemove }) {
  return (
    <View style={styles.card}>

      {/* Top row */}
      <View style={styles.topRow}>

        {/* Left: Avatar + Info */}
        <View style={styles.leftContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customer.name?.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{customer.name}</Text>

            <View style={styles.phoneRow}>
              <Phone size={14} color="#6B7280" />
              <Text style={styles.phone}>{customer.phone}</Text>
            </View>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed
            ]}
            hitSlop={10}
          >
            <Pencil size={18} color="#3D9E83" />
          </Pressable>

          <Pressable
            onPress={onRemove}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed
            ]}
            hitSlop={10}
          >
            <X size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Selected</Text>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1, // 🔥 prevents overlap with buttons
  },

  actions: {
    flexDirection: 'row',
    marginLeft: 12,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  iconBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3D9E83',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  phone: {
    fontSize: 14,
    color: '#6B7280',
  },

  badge: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F7F2',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  badgeText: {
    color: '#3D9E83',
    fontSize: 12,
    fontWeight: '600',
  },
})