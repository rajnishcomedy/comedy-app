import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  doc, setDoc, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { buildSeedJokes, buildSeedShows, buildSeedIdeas } from '../data/seedUserData';
import { Mic2, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [stageName, setStageName] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const friendly = (code) => {
    const MAP = {
      'auth/invalid-email':          'Invalid email address.',
      'auth/user-not-found':         'No account found with this email.',
      'auth/wrong-password':         'Incorrect password.',
      'auth/email-already-in-use':   'An account with this email already exists.',
      'auth/weak-password':          'Password must be at least 6 characters.',
      'auth/too-many-requests':      'Too many attempts. Try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/invalid-credential':     'Incorrect email or password.',
      'permission-denied':           'Insufficient Firestore permissions. Check your account rules or ask admin to grant access.',
    };
    return MAP[code] || 'Something went wrong. Please try again.';
  };

  const seedNewUser = async (uid) => {
    try {
      const batch = writeBatch(db);
      buildSeedJokes().forEach(j => batch.set(doc(db, 'users', uid, 'jokes', j.id), j));
      buildSeedShows().forEach(s => batch.set(doc(db, 'users', uid, 'shows', s.id), s));
      buildSeedIdeas().forEach(i => batch.set(doc(db, 'users', uid, 'ideas', i.id), i));
      await batch.commit();
      await setDoc(doc(db, 'users', uid, 'profile', 'data'), { seeded: true }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Seed data error (non-fatal):', e);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup') {
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (stageName.trim()) {
          await updateProfile(cred.user, { displayName: stageName.trim() });
        }
        // Write profile doc
        await setDoc(doc(db, 'users', cred.user.uid, 'profile', 'data'), {
          displayName: cred.user.displayName || '',
          stageName: stageName.trim(),
          bio: '',
          email: cred.user.email,
          createdAt: serverTimestamp(),
          seeded: false,
        });
        // Seed starter data
        await seedNewUser(cred.user.uid);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendly(err.code));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: 'var(--text)',
    fontSize: 14, fontFamily: 'var(--sans)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    fontFamily: 'var(--mono)', textTransform: 'uppercase',
    letterSpacing: '0.06em', color: 'var(--text3)', marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,241,53,0.06) 0%, transparent 100%)',
    }}>

      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic2 size={20} color="#0A0A0A" />
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Carlin
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--sans)' }}>
          Your comedy workspace, everywhere.
        </p>
      </div>

      {/* Auth card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '32px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
      }}>
        {/* Toggle tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 10, padding: 4, marginBottom: 28, gap: 4,
        }}>
          {['signin', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '9px 0',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
                background: mode === m ? 'var(--bg3)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text3)',
                transition: 'all 0.2s',
                borderColor: mode === m ? 'var(--border2)' : 'transparent',
                borderStyle: 'solid', borderWidth: 1,
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'signup' && (
            <div>
              <label htmlFor="stageName" style={labelStyle}>Stage Name</label>
              <input
                id="stageName"
                aria-label="Stage Name"
                aria-required="true"
                value={stageName} onChange={e => setStageName(e.target.value)}
                placeholder="Your stage persona (e.g. Rajnish Kumar)"
                style={inputStyle} autoComplete="name"
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              aria-label="Email"
              aria-required="true"
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required style={inputStyle}
              autoComplete="email"
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                aria-label="Password"
                aria-required="true"
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6+ characters" required
                style={{ ...inputStyle, paddingRight: 44 }}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw(s => !s)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex',
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
              <input
                id="confirmPassword"
                aria-label="Confirm Password"
                aria-required="true"
                type={showPw ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Same password again" required
                style={inputStyle} autoComplete="new-password"
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', gap: 8, padding: '10px 14px',
              background: 'rgba(255,76,76,0.10)', border: '1px solid rgba(255,76,76,0.25)',
              borderRadius: 8, color: 'var(--red)', fontSize: 13, lineHeight: 1.4,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'var(--accent)', color: '#0A0A0A',
              fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}
          >
            {loading
              ? <><Loader2 size={18} className="spin" /> {mode === 'signin' ? 'Signing in…' : 'Creating account…'}</>
              : mode === 'signin' ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          {mode === 'signin'
            ? <>No account? <button onClick={() => { setMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600 }}>Create one for free</button></>
            : <>Already have an account? <button onClick={() => { setMode('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600 }}>Sign in</button></>
          }
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
        Your data is stored securely in the cloud · Access from any device
      </p>
    </div>
  );
}
