import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

const SaleCreditToggle = ({ transactionType, setTransactionType }) => {
  const animation = useRef(new Animated.Value(transactionType === 'debt' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: transactionType === 'sale' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [transactionType]);

  const handleToggle = () => {
    const next = transactionType === 'sale' ? 'debt' : 'sale';
    setTransactionType(next);
  };

  const interpolateColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#42B39E", "#F44336"], // Sale green → Debt red
  });

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 52],
  });

  const isSale = transactionType === 'sale';

  return (
    <TouchableOpacity onPress={handleToggle} activeOpacity={0.9}>
      <Animated.View style={[styles.container, { backgroundColor: interpolateColor }]}>
        <Animated.View style={[styles.slider, { transform: [{ translateX }] }]} />
        <View style={styles.textContainer}>
          <Text style={[styles.text, isSale ? styles.activeText : styles.inactiveText]}>
            Debt
          </Text>
          <Text style={[styles.text, !isSale ? styles.activeText : styles.inactiveText]}>
            Sale
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 36,
    borderRadius: 18,
    padding: 2,
    justifyContent: "center",
    overflow: "hidden",
  },
  slider: {
    position: "absolute",
    width: 46,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 2,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeText: {
    color: "#FFFFFF",
  },
  inactiveText: {
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "800",
  },
});

export default SaleCreditToggle;
