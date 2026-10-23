import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  onAuthStateChanged, signOut, signInWithPopup, signInWithCredential, GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { ALLOWED_DOMAIN, RESTRICTED_MESSAGE } from '../config/constants';
import { isAllowedEmail } from '../utils/domain';

WebBrowser.maybeCompleteAuthSession();
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Saves the user and reads the role. New users are "user"; promote to "admin" in the Firebase console.
async function syncUserProfile(fbUser) {
  const ref = doc(db, 'users', fbUser.uid);
  try {
    const snap = await getDoc(ref);
    const role = snap.exists() ? snap.data().role || 'user' : 'user';
    await setDoc(ref, {
      email: fbUser.email, name: fbUser.displayName || '', photoURL: fbUser.photoURL || '',
      role, lastLoginAt: serverTimestamp(),
    }, { merge: true });
    return role;
  } catch {
    return 'user'; // Firestore is optional: the app still works without it
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [initializing, setInitializing] = useState(true); // restoring an existing session
  const [signingIn, setSigningIn] = useState(false);       // login button loading state
  const [error, setError] = useState('');

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  // Single gatekeeper: every session (fresh login OR restored) must pass the domain check.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { setUser(null); setInitializing(false); return; }
      if (!isAllowedEmail(fbUser.email) || fbUser.emailVerified === false) {
        await signOut(auth);
        setUser(null);
        setError(RESTRICTED_MESSAGE);
        setSigningIn(false);
        setInitializing(false);
        return;
      }
      setRole(await syncUserProfile(fbUser));
      setUser(fbUser);
      setError('');
      setSigningIn(false);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // Native: finish the Google flow and exchange the Google ID token for a Firebase session.
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      signInWithCredential(auth, GoogleAuthProvider.credential(idToken)).catch(() => {
        setError('Sign-in failed. Please try again.');
        setSigningIn(false);
      });
    } else {
      setSigningIn(false);
      if (response.type === 'error') setError('Google sign-in failed. Please try again.');
    }
  }, [response]);

  const loginWithGoogle = useCallback(async () => {
    setError('');
    setSigningIn(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' }); // UX hint only
        await signInWithPopup(auth, provider);
      } else {
        await promptAsync();
      }
    } catch (e) {
      setSigningIn(false);
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError('Could not sign in. Check your connection and try again.');
      }
    }
  }, [promptAsync]);

  const logout = useCallback(async () => {
    try { await signOut(auth); } catch { setError('Could not log out. Please try again.'); }
  }, []);

  const ready = Platform.OS === 'web' || !!request;

  return (
    <AuthContext.Provider value={{ user, role, initializing, signingIn, error, loginWithGoogle, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
