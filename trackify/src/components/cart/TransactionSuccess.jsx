// components/TransactionSuccessView.jsx

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// ─────────────────────────────
// COLORS (Stripe-like palette)
// ─────────────────────────────
const BG = '#FFFFFF';
const TEXT = '#0A0B0D';
const SUBTEXT = '#6B7280';
const GREEN = '#10B981';
const RED = '#EC1354'
const BORDER = '#E5E7EB';

// ─────────────────────────────
// ICON (clean SVG check)
// ─────────────────────────────
const CheckIcon = () => (
  <Svg width={52} height={52} viewBox="0 0 24 24">
    <Path
      d="M20 6L9 17l-5-5"
      stroke="#fff"
      strokeWidth={2.5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────
export default function TransactionSuccessView({
  amount = '',
  currency = 'NGN',
  customerName = 'Anonymous',
  customerPhone = '',
  onContinue,
  transactionType
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fade,
              transform: [{ translateY: slide }],
            },
          ]}
        >
          {/* ICON */}
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <CheckIcon />
            </View>
          </View>

          {/* TITLE */}
          <Text style={styles.title}>Payment successful</Text>

          <Text style={styles.subtitle}>
            {time} · Transaction completed
          </Text>

          {/* AMOUNT */}
          <Text style={styles.amount}>
            {amount}{' '}
            <Text style={styles.currency}>{currency}</Text>
          </Text>

          {/* RECEIPT CARD */}
          <View style={styles.card}>
            <View>
              <Text style={styles.label}>Recipient</Text>
              <Text style={styles.value}>{customerName}</Text>
              {/* <Text style={styles.subValue}>{customerPhone}</Text> */}
            </View>

            {transactionType === 'sale' ? (
                <View style={styles.statusPill}>
                    <Text style={styles.statusText}>Completed</Text>
                </View>
            ) : (
                <View style={[styles.statusPill, { backgroundColor: '#FEEAF0'}]}>
                    <Text style={[styles.statusText, { color: RED }]}>Credit</Text>
                </View>
            )}
          </View>

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onContinue}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Back to dashboard</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────
// STYLES
// ─────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  safe: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  container: {
    alignItems: 'center',
  },

  iconWrap: {
    marginBottom: 18,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: TEXT,
    letterSpacing: -0.3,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: SUBTEXT,
    marginBottom: 18,
    textAlign: 'center',
  },

  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: TEXT,
    letterSpacing: -1,
    marginBottom: 22,
  },

  currency: {
    fontSize: 18,
    color: SUBTEXT,
    fontWeight: '500',
  },

  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  label: {
    fontSize: 12,
    color: SUBTEXT,
    marginBottom: 4,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },

  subValue: {
    fontSize: 13,
    color: SUBTEXT,
    marginTop: 2,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN,
  },

  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: TEXT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});