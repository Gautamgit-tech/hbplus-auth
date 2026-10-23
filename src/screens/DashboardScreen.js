import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../config/constants';

export default function DashboardScreen() {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.wrap}>
        <View style={s.header}>
          <Text style={s.logo}>HB+</Text>
          <Pressable onPress={logout} style={s.logout} accessibilityRole="button">
            <Text style={s.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <View style={s.card}>
          {user.photoURL ? <Image source={{ uri: user.photoURL }} style={s.avatar} /> : <View style={s.avatar} />}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>Welcome, {user.displayName || 'there'}</Text>
            <Text style={s.email}>{user.email}</Text>
          </View>
          <View style={[s.badge, isAdmin && s.badgeAdmin]}>
            <Text style={[s.badgeText, isAdmin && { color: '#fff' }]}>{isAdmin ? 'Admin' : 'User'}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.h2}>{isAdmin ? 'Admin tools' : 'Your workspace'}</Text>
          <Text style={s.p}>
            {isAdmin
              ? 'You can see this panel because your role is admin. Manage team access here.'
              : 'You are signed in with an approved company account.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: colors.bg },
  wrap: { width: '100%', maxWidth: 720, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  logo: { fontSize: 28, fontWeight: '800', color: colors.brand, letterSpacing: -1 },
  logout: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  logoutText: { color: colors.ink, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.line, flexWrap: 'wrap' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.line },
  name: { fontSize: 18, fontWeight: '700', color: colors.ink },
  email: { fontSize: 14, color: colors.muted, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  badgeAdmin: { backgroundColor: colors.brand, borderColor: colors.brand },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  h2: { fontSize: 17, fontWeight: '700', color: colors.ink, width: '100%' },
  p: { fontSize: 15, lineHeight: 22, color: colors.muted, width: '100%' },
});
