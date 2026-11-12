import * as SecureStore from 'expo-secure-store';

const getTokenKey = (purpose) => `resetToken-${purpose}`;
const getExpiryKey = (purpose) => `resetTokenExpiry-${purpose}`;

export const tokenStorage = {
  async save(purpose, token, expiry) {
    await SecureStore.setItemAsync(getTokenKey(purpose), token);
    await SecureStore.setItemAsync(getExpiryKey(purpose), expiry);
  },

  async get(purpose) {
    const token = await SecureStore.getItemAsync(getTokenKey(purpose));
    const expiry = await SecureStore.getItemAsync(getExpiryKey(purpose));

    return { token, expiry };
  },

  async clear(purpose) {
    await SecureStore.deleteItemAsync(getTokenKey(purpose));
    await SecureStore.deleteItemAsync(getExpiryKey(purpose));
  }
};