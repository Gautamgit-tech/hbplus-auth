import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence, setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

// Tokens are managed by the Firebase SDK: AsyncStorage on native, browser storage on web.
// We never store raw tokens ourselves.
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(() => {});
} else {
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);
