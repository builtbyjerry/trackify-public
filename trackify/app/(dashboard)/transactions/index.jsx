import { RefreshControl, SectionList, StatusBar, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useCallback, useState } from 'react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useGroupedTransactions } from '../../../src/hooks/useGroupedTransactions.jsx' 

import TransactionCard from '../../../src/components/TransactionCard.jsx'
import FilterSheet from '../../../src/components/transactions/FilterSheet.jsx'
import { router } from 'expo-router'



// default filter state
const DEFAULT_FILTERS = {
  type: 'all',
  period: 'all',
  customFrom: null,
  customTo: null,
  minAmount: '',
  maxAmount: '',
  selectedCustomer: null,
}

const Transactions = () => {
  // ─── State ───────────────────────────────────────────
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS)
  const [filterVisible, setFilterVisible] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // ─── Data ─────────────────────────────────────────────
  const { groupedData, loading: groupedLoading, refreshTransactions } = useGroupedTransactions(appliedFilters)

  const hasActiveFilters =
    appliedFilters.type !== 'all' ||
    appliedFilters.period !== 'all' ||
    appliedFilters.minAmount !== '' ||
    appliedFilters.maxAmount !== '' 
    
  // ─── Handlers ─────────────────────────────────────────
  const handleApply = () => {
    setAppliedFilters(filters)
    setFilterVisible(false)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setFilterVisible(false)
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refreshTransactions()
    setRefreshing(false)
  }, [refreshTransactions])

  const openTransaction = (transactionId) => {
    router.push({
      pathname: '/transactions/TransactionDetail',
      params: { id: transactionId },
    })
  }

  // ─── Early returns ────────────────────────────────────
  if (filterLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="0a7d4f" />
        <Text style={styles.loadingText}>Fetching transactions...</Text>
      </View>
    )

  return (
    <SafeAreaProvider>
     <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.topbar}>
          <View style={styles.topbarSide}/>
          <Text style={styles.topbarTitle}>Transactions</Text>
          <TouchableOpacity
            style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
            onPress={() => setFilterVisible(true)}
            activeOpacity={0.7}
          >
            {hasActiveFilters && <View style={styles.filterDot} />}
            <Text style={[styles.filterBtnText, hasActiveFilters && styles.filterBtnTextActive]}>
              Filter
            </Text>
            <Text style={styles.filterChevron}>⌄</Text>
          </TouchableOpacity>
        </View>
        <SectionList
          sections={groupedData}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyExtractor={(item) => item.id.toString()}

        // 🏷️ Each date section (like “2025-10-31”)
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}

        // 💳 Each individual transaction card
        renderItem={({ item }) => (
          <TransactionCard item={item} onPress={() => {openTransaction(item.id)}} />
        )}

        // 🧭 Optional: Empty state message
        ListEmptyComponent={
          !groupedLoading && (
            <Text style={styles.emptyText}>No transactions found.</Text>
          )
        }

        contentContainerStyle={{ paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
      />
      </SafeAreaView>
      <FilterSheet
        visible={filterVisible}
        filters={filters}
        onChange={setFilters}
        onApply={handleApply}
        onReset={handleReset}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaProvider>
    
  )
}

export default Transactions

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#E7F2EF',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 12,
  },
  topbarSide: {
    minWidth: 60, // must match filterBtn's minWidth
  },
  topbarTitle: {
    fontSize: 20,
    flex: 1,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
    marginBottom: 6,
    textAlign: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  filterBtnActive: {
    backgroundColor: '#e8f7f1',
    borderColor: '#0a7d4f',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0a7d4f',
  },
  filterBtnText: {
    fontSize: 13,
    color: '#666666',
  },
  filterBtnTextActive: {
    color: '#0a7d4f',
    fontWeight: '500',
  },
  filterChevron: {
    fontSize: 11,
    color: '#999999',
  },
})