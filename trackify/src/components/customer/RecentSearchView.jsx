import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import { CustomerRow } from './CustomerRow.jsx';
import { AddNewCustomerRow } from './AddNewCustomerRow.jsx';

export function RecentSearchView({ data, selected, onSelect, onAddNew, loading }) {
  const renderItem = ({ item }) => (
    <CustomerRow
      customer={item}
      selected={selected}
      onPress={onSelect}
    />
  )
  
  const renderHeader = () => {
    return <AddNewCustomerRow onPress={onAddNew}/>
  }

  return (
    <FlatList
      style={styles.list}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      data={data}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#34C759" />
            <Text style={styles.emptyText}>Loading customers...</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No customers yet</Text>
            <Text style={styles.emptySubtitle}>Add your customer to get started</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              No customers match your search
            </Text>
          </View>
        )
      }
      ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1EAE4',
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#D1EAE4',
    marginHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 36,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
})