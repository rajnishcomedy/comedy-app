# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Firebase + Auth + Firestore Cloud Sync (SetKit)

SetKit already supports per-user accounts with Firebase Authentication, real-time Firestore sync, offline persistence, and voice-recording file upload to Firebase Storage.

### 1) Firebase project setup
1. Open https://console.firebase.google.com
2. Create a new project
3. Add a Web app
4. Copy the config values into `.env` (from `.env.example`)

### 2) Enable services
- Authentication → Sign-in method → Enable Email/Password
- Firestore → Create database (test mode or production rules)
- Storage → Get started

### 3) Create `.env`
1. Copy `.env.example` to `.env` in project root
2. Fill in values:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123...
```

### 4) Run the app
- `npm install`
- `npm run dev`

### 5) Notes on how this works
- Auth state is managed in `src/context/AuthContext.jsx` (`onAuthStateChanged`)
- `ProtectedRoute` in `src/auth/ProtectedRoute.jsx` gates app content and shows `AuthScreen` when not signed in
- `AuthScreen` writes user profile doc at `users/{uid}/profile/data` and seeds jokes/shows/ideas
- Data hooks (`useJokes`, `useShows`, `useIdeas`, `useSets`, `useTasks`, `useProfile`) point at `users/{uid}/...` collections and `onSnapshot` real-time sync
- `useIdeas` also uploads voice blob to Firebase Storage (path `users/{uid}/ideas/*.webm`) and stores `audioURL` and `audioPath`

### 6) Add Firestore rules (recommended)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
