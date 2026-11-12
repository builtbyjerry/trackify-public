import { StyleSheet, Text, View } from "react-native"

const getStrength = (password) => {
  if (password.length === 0) return 0
  if (password.length < 8) return 1
  if (password.length < 12) return 2
  if (password.length < 16) return 3
  return 4
}

const STRENGTH_COLORS = ['#e0e0e0', '#FF3B30', '#FF9500', '#FFD60A', '#2ECC71']
const STRENGTH_LABELS = ['', 'Too short', 'Weak', 'Fair', 'Strong']


const StrengthBar = ({ password }) => {
    const strength = getStrength(password)

    return (
        <View style={styles.strengthSection}>
            <View style={styles.strengthBars}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <View
                    key={i}
                    style={[
                        styles.strengthBar,
                        { backgroundColor: i < strength ? STRENGTH_COLORS[strength] : '#e0e0e0' }
                    ]}
                    />
                ))}
            </View>
            {password.length > 0 && (
                <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength] }]}>
                    {STRENGTH_LABELS[strength]}
                </Text>
            )}
        </View>
    )
}

export default StrengthBar

const styles = StyleSheet.create({
    // Strength bar
  strengthSection: {
    width: '100%',
    marginBottom: 8,
    gap: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
  },
})