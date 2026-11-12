import { StyleSheet, Text, View, Animated } from "react-native"
// --- VARIANT 1: Your Original Design ---
export const StandardToast = ({ toast, translateY }) => {
  const IconComponent = toast.config.icon

  return (
    <Animated.View style={[
      styles.standardContainer,
      { borderLeftColor: toast.config.accent, transform: [{ translateY }] }
    ]}>
      <View style={[styles.icon, { backgroundColor: toast.config.iconBg }]}>
        <IconComponent size={16} color='#fff' />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{toast.title}</Text>
        {toast.description && (
          <Text style={styles.description}>{toast.description}</Text>
        )}
      </View>
    </Animated.View>
  )
}

// --- VARIANT 2: A New "Pill" Design ---
export const MinimalToast = ({ toast, translateY }) => {
  const IconComponent = toast.config.icon;
  return (
    <Animated.View style={[
      styles.capsuleContainer, 
      { transform: [{ translateY }] }
    ]}>
      <View style={[styles.capsuleIconWrapper, { backgroundColor: toast.config.accent }]}>
        <IconComponent size={14} color="#fff" strokeWidth={3} />
      </View>
      {/* flexShrink ensures long text wraps instead of stretching the pill */}
      <Text style={styles.capsuleText} numberOfLines={2}>{toast.title}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  // --- Standard Design Styles (Your original) ---
  standardContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    borderLeftWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { flex: 1 },
  title: { fontSize: 13, fontWeight: '500', color: '#fff', marginBottom: 2 },
  description: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },

  // --- Minimal Design Styles ---
  minimalContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center', // Centers it horizontally
    // Notice there is NO width defined, so it wraps its content automatically
    borderRadius: 30, // Creates the pill shape
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
    // Soft, floating shadow matching iOS style
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  minimalIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#ffffff',
    letterSpacing: 0.2, // Gives it that slight iOS typography feel
  },


  // --- 1. Dynamic Island Capsule Styles ---
  capsuleContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: '#1C1C1E', // iOS Dark Gray
    borderRadius: 100, // Perfect pill
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
    maxWidth: '85%', // Prevents horizontal explosion
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  capsuleIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    flexShrink: 1, // CRITICAL: Forces long text to wrap to next line
  },
})