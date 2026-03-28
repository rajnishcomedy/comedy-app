import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthScreen from './AuthScreen';

/** Full-screen spinner shown while Firebase resolves the auth state */
function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Loading Carlin…
      </span>
    </div>
  );
}

/**
 * Wrap your app content with <ProtectedRoute>.
 * Shows loading screen → auth screen → app content based on auth state.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <AuthScreen />;
  return <>{children}</>;
}
