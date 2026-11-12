import { View, Text, TextInput, StyleSheet } from 'react-native'

export function SearchBar({ value, onChangeText }) {
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

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FBFA',
    borderWidth: 1,
    borderColor: '#D1EAE4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    fontSize: 20,
    color: '#6B7280',
    marginRight: 8,
    lineHeight: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
})