import { Pressable, StyleSheet, Text, View } from "react-native";

const TypeToggle = ({ value, onChange }) => (
  <View style={styles.typeToggle}>
    <Pressable
      style={[styles.typeOpt, value === 'percent' && styles.typeOptActive]}
      onPress={() => onChange('percent')}
    >
      <Text style={[styles.typeOptText, value === 'percent' && styles.typeOptTextActive]}>
        Percentage (%)
      </Text>
    </Pressable>
    <Pressable
      style={[styles.typeOpt, value === 'fixed' && styles.typeOptActive]}
      onPress={() => onChange('fixed')}
    >
      <Text style={[styles.typeOptText, value === 'fixed' && styles.typeOptTextActive]}>
        Fixed amount (₦)
      </Text>
    </Pressable>
  </View>
)

export default TypeToggle

const styles = StyleSheet.create({
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 3,
        gap: 3,
    },
    typeOpt: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    typeOptActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    typeOptText: {
        fontSize: 13,
        color: '#666',
    },
    typeOptTextActive: {
        fontWeight: '500',
        color: '#1a1a1a',
    },
})