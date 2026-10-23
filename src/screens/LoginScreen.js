import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, ALLOWED_DOMAIN } from '../config/constants';

export default function LoginScreen() {
  const { loginWithGoogle, signingIn, error, ready } = useAuth();
  const disabled = signingIn || !ready;

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.card}>
        <Text style={s.logo}>HB+</Text>
        <Text style={s.title}>Team portal</Text>
        <Text style={s.sub}>Sign in with your @{ALLOWED_DOMAIN} Google account to continue.</Text>

        {!!error && (
          <View style={s.error} accessibilityRole="alert">
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={loginWithGoogle}
          disabled={disabled}
          style={({ pressed }) => [s.btn, disabled && s.btnOff, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          {signingIn ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={s.btnText}>  Signing in…</Text>
            </>
          ) : (
            <Text style={s.btnText}>Login with Google</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.bg },
  card: { width: '100%', maxWidth: 400, backgroundColor: colors.card, borderRadius: 16, padding: 28, borderWidth: 1, borderColor: colors.line },
  logo: { fontSize: 34, fontWeight: '800', color: colors.brand, letterSpacing: -1, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 6, marginBottom: 24 },
  error: { backgroundColor: colors.dangerBg, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand, borderRadius: 10, paddingVertical: 14 },
  btnOff: { backgroundColor: '#7FB5A0' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
