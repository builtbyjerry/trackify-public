import { Pressable, View, Text, StyleSheet } from 'react-native'

export function AddNewCustomerRow({ onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.addNewRow,
        pressed && styles.addNewRowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.addNewAvatar}>
        <Text style={styles.addNewPlus}>+</Text>
      </View>
      <Text style={styles.addNewText}>Add new customer</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#EDFAF6',
    borderRadius: 14,
  },
  addNewRowPressed: { backgroundColor: '#D8F2E8' },
  addNewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3D9E83',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewPlus: { fontSize: 28, color: '#fff', fontWeight: '700' },
  addNewText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3D9E83',
  },
})