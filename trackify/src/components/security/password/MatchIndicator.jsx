import { StyleSheet, Text, View } from "react-native";
import { CheckCircle } from "lucide-react-native";

const MatchIndicator = ({ password, confirm }) => {
  if (!confirm) return null 
  const matches = password === confirm
  return (
    <View style={styles.matchRow}>
      <CheckCircle size={14} color={matches ? '#2ECC71' : '#FF3B30'} />
      <Text style={[styles.matchText, { color: matches ? '#2ECC71' : '#FF3B30' }]}>
        {matches ? 'Passwords match' : "Passwords don't match"}
      </Text>
    </View>
  )
}

export default MatchIndicator

const styles = StyleSheet.create({
    // Match indicator
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    matchText: {
        fontSize: 12,
    },
})