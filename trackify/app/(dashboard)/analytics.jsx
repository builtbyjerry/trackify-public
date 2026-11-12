import { useState } from 'react'
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useUser } from '../../src/hooks/useUser.jsx'
import { useAnalytics } from '../../src/hooks/useAnalytics'
import AnalyticsHeader from '../../src/components/analytics/AnalyticsHeader'
import SalesOverview from '../../src/components/analytics/SalesOverview'
import SalesVsDebt from '../../src/components/analytics/SalesVsDebt'
import MostSold from '../../src/components/analytics/MostSold'
import BestPerforming from '../../src/components/analytics/BestPerforming'
import TopCustomers from '../../src/components/analytics/TopCustomer.jsx'

export default function Analytics() {
  const { employee } = useUser()
  const businessId = employee?.business_id
  const [period, setPeriod] = useState('today')

  const {
    overview,
    mostSold,
    bestPerforming,
    topCustomers,
    loading,
    refresh
  } = useAnalytics(businessId, period)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor='#42B39E'
            colors={['#42B39E']}
          />
        }
      >
        <SalesOverview data={overview} loading={loading} />
        <SalesVsDebt data={overview} loading={loading} />
        <MostSold data={mostSold} loading={loading} />
        <BestPerforming data={bestPerforming} loading={loading} />
        <TopCustomers
          data={topCustomers}
          loading={loading}
          businessId={businessId}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingTop: 8
  },
  bottomPadding: {
    height: 32
  }
})