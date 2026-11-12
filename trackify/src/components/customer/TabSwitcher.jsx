import { View, StyleSheet, Platform } from 'react-native'
import SegmentedControlTab from '@react-native-segmented-control/segmented-control'

export function TabSwitcher({ mode, onModeChange }) {
  const selectedIndex = mode === 'recentSearch' ? 0 : 1

  const handleChange = (event) => {
    const index = event.nativeEvent.selectedSegmentIndex
    onModeChange(index === 0 ? 'recentSearch' : 'anonymous')
  }

  return (
    <View style={styles.headerContainer}>
      <SegmentedControlTab
        values={['Recent / Search', 'Anonymous']}
        selectedIndex={selectedIndex}
        onChange={handleChange}
        tintColor="#3D9E83"
        backgroundColor="rgba(200, 200, 200, 0.18)"
        fontStyle={{ color: '#333' }}
        activeFontStyle={{ color: '#fff' }}
        appearance={Platform.OS === 'ios' ? 'automatic' : 'light'}
        style={styles.control}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  control: {
    height: 36,
  },
})