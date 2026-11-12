import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export function TransactionNotes({ value, onChangeText }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Transaction notes</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Add a note (optional)..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        returnKeyType="default"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,           // space below the whole block
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1EAE4',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    minHeight: 92,              // better height for notes
    lineHeight: 20,
  },
});