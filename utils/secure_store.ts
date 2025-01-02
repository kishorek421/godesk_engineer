import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
    // console.log(`Token saved successfully for key: ${key} -> ${value}`);
  } catch (e) {
    console.error('Failed to save the token:', e);
  }
}

export async function getItem(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(`Retrieved token for key: ${key} -> ${value}`);
    return value;
  } catch (e) {
    console.error('Failed to retrieve the token:', e);
    return null;
  }
}

export async function removeItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Token removed for key: ${key}`);
  } catch (e) {
    console.error('Failed to remove the token:', e);
  }
}

export async function clearStorage() {
  try {
    await AsyncStorage.clear();
    console.log('Storage cleared');
  } catch (e) {
    console.error('Failed to clear storage:', e);
  }
}