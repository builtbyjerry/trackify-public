import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SAVED_EMAIL: 'saved_email',
};

export const getSavedEmail = async () => {
  return await AsyncStorage.getItem(KEYS.SAVED_EMAIL);
};

export const setSavedEmail = async (email) => {
  await AsyncStorage.setItem(KEYS.SAVED_EMAIL, email);
};

export const clearSavedEmail = async () => {
  await AsyncStorage.removeItem(KEYS.SAVED_EMAIL);
};