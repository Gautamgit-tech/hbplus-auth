# HB+ Portal: Google login with domain restriction

One React Native codebase (Expo + React Native for Web) for Android, iOS and browser.
Only `@hbplus.fit` Google accounts can sign in.

## Setup
1. `npm install` then `npx expo install --fix`
2. Firebase console: create a project, enable **Authentication > Google**, create **Firestore**, and paste `firestore.rules`.
3. Google Cloud console > Credentials: create OAuth client IDs (Web, Android, iOS). Add your Netlify URL and `http://localhost:8081` to the Web client's authorised origins, and add the Firebase `.../__/auth/handler` URL as an authorised redirect URI.
4. Copy `.env.example` to `.env` and fill in the values.
5. Run: `npm run web` (browser), `npm run android`, or `npm run ios`.
6. Deploy: push to GitHub, connect to Netlify (build `npm run build:web`, publish `dist`, set the same env vars). `netlify.toml` already handles routing.

## Authentication flow
1. User taps **Login with Google** (shows a loading state).
2. Web uses a Firebase popup; native uses `expo-auth-session` to get a Google ID token, then `signInWithCredential`.
3. Firebase creates a session; `onAuthStateChanged` fires in `AuthContext`.
4. The domain check runs. If it fails, the user is signed out and sees: "Access restricted. Please login using your official domain email."
5. If it passes, the profile is saved to Firestore (`users/{uid}`), the role is loaded, and the Dashboard is shown.

## How domain restriction works
- `src/utils/domain.js` compares the text after the **last** `@` to `hbplus.fit` exactly. This blocks tricks like `x@hbplus.fit.evil.com`.
- The check runs inside the single auth listener, so it also covers restored sessions, not just fresh logins.
- The `hd` Google parameter only pre-filters the account picker. It is a hint, not security.
- `firestore.rules` repeats the check on the server, so a tampered client cannot read or write data.
- `email_verified` must be true.

## Protected routes and tokens
- The Dashboard screen is only registered in the navigator when a valid user exists, so `/dashboard` while logged out shows Login.
- Tokens are handled and refreshed by the Firebase SDK (AsyncStorage on native, browser storage on web). The app never stores raw tokens.
- Roles: new users get `user`. Set `role: "admin"` on a user document in Firestore to promote them. Users cannot change their own role (see rules).

## Structure
```
src/config      firebase + constants
src/context     AuthContext (state, login, logout, domain gate)
src/navigation  RootNavigator (protected routing)
src/screens     LoginScreen, DashboardScreen
src/utils       domain.js
```
