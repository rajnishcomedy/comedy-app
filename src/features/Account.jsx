import React, { useState } from 'react';
import { Button } from '../components/UI';
import { KEYS } from '../utils';
import { UserCircle, Key, Eye, EyeOff, Download, Trash2, LogOut, Mail, MapPin, Plus } from 'lucide-react';
import { Modal } from '../components/UI';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Account({ user, profile, saveProfile, jokes = [], shows = [], ideas = [], onSignOut, toast }) {
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    stageName:   profile?.stageName   || '',
    bio:         profile?.bio         || '',
    venues:      profile?.venues      || [],
  });
  const [newVenue, setNewVenue] = useState('');
  const [apiKey, setApiKey]   = useState(localStorage.getItem('cws_anthropic_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Keep form in sync when profile loads from Firestore
  React.useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        stageName:   profile.stageName   || '',
        bio:         profile.bio         || '',
        venues:      profile.venues      || [],
      });
    }
  }, [profile]);

  const addVenue = () => {
    const v = newVenue.trim();
    if (!v || (form.venues || []).includes(v)) return;
    setForm(f => ({ ...f, venues: [...(f.venues || []), v] }));
    setNewVenue('');
  };

  const removeVenue = (v) => {
    setForm(f => ({ ...f, venues: (f.venues || []).filter(item => item !== v) }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await saveProfile(form);
      if (form.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: form.displayName });
      }
      toast?.success('Profile saved!');
    } catch {
      toast?.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('cws_anthropic_key', apiKey);
    toast?.success('API key saved locally!');
  };

  const exportData = () => {
    const data = {
      jokes, shows, ideas,
      exportedAt: new Date().toISOString(),
      user: { email: user?.email, displayName: form.displayName, stageName: form.stageName },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carlin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast?.success('Data exported!');
  };

  const initials = (form.stageName || form.displayName || user?.email || 'C')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const labelStyle = {
    fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ padding: 40, overflowY: 'auto', height: '100%', maxWidth: 640, margin: '0 auto' }} className="fade-in scrollable">

      {/* Avatar + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(200,241,53,0.08)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700, color: 'var(--accent)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            {form.stageName || form.displayName || 'Your Stage Name'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Mail size={13} color="var(--text3)" />
            <span style={{ fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{user?.email}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
            {jokes.length} jokes · {shows.length} shows · {ideas.length} ideas
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 20 }}><UserCircle size={16} /> Profile</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-half" style={{ gap: 16 }}>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Your real / display name" />
            </div>
            <div>
              <label style={labelStyle}>Stage Name</label>
              <input value={form.stageName} onChange={e => setForm(f => ({ ...f, stageName: e.target.value }))} placeholder="Your stage persona" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Delhi-based comic. Performs at Laugh Store, Guftagoo…" rows={3} />
          </div>
          <Button onClick={handleSaveProfile} variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* API Key */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 14 }}><Key size={16} /> Anthropic API Key</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
          Required for the AI Punch-Up Workshop. Stored locally in your browser only — never uploaded to our servers.
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type={showKey ? 'text' : 'password'} value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-…" style={{ paddingRight: 44 }}
          />
          <button onClick={() => setShowKey(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex' }}>
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Button onClick={saveApiKey} variant="outline">Save API Key</Button>
        {!apiKey && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
            Without this key, Punch-Up Workshop returns demo Hinglish punchlines.
          </div>
        )}
      </div>

      {/* Frequent Venues */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 14 }}><MapPin size={16} /> Frequent Venues</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Add venues where you perform regularly to pick them quickly in the Show Log.
        </div>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input 
            value={newVenue} 
            onChange={e => setNewVenue(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && addVenue()}
            placeholder="e.g. The Laugh Store, Mumbai" 
            style={{ flex: 1 }}
          />
          <Button onClick={addVenue} variant="outline" icon={Plus}>Add</Button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(form.venues || []).map(v => (
            <div key={v} className="pill" style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              padding: '6px 12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)'
            }}>
              <span>{v}</span>
              <button 
                onClick={() => removeVenue(v)}
                style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {(!form.venues || form.venues.length === 0) && (
            <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>No custom venues added yet.</div>
          )}
        </div>
      </div>

      {/* Data Export */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 14 }}><Download size={16} /> Data Export</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Download all your jokes, shows, and ideas as a JSON backup file.
        </div>
        <Button onClick={exportData} variant="outline" icon={Download}>Export Backup</Button>
      </div>

      {/* Sign Out */}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 14 }}><LogOut size={16} /> Sign Out</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Your data is saved in the cloud. You can sign back in on any device.
        </div>
        <Button onClick={onSignOut} variant="outline" icon={LogOut}>Sign Out</Button>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: '1px solid rgba(255,76,76,0.2)' }}>
        <div className="section-header" style={{ color: 'var(--red)', marginBottom: 14 }}><Trash2 size={16} /> Danger Zone</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Clears your local preferences. Your Firestore data (jokes, shows, ideas) is safe and will reload on next sign-in.
        </div>
        <Button onClick={() => setShowDanger(true)} variant="danger" icon={Trash2}>Clear Local Cache</Button>
      </div>

      {/* Confirm modal */}
      <Modal open={showDanger} onClose={() => { setShowDanger(false); setConfirmText(''); }} title="Clear Local Cache" width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '12px 16px', background: 'rgba(255,76,76,0.08)', border: '1px solid rgba(255,76,76,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
            ⚠ This clears your browser's local prefs (API key, last tab). Your cloud data (jokes, shows, ideas) is NOT deleted.
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
              Type <strong style={{ color: 'var(--text)' }}>CLEAR</strong> to confirm:
            </label>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="CLEAR" />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setShowDanger(false); setConfirmText(''); }} variant="ghost">Cancel</Button>
            <Button
              onClick={() => {
                if (confirmText !== 'CLEAR') return;
                localStorage.clear();
                toast?.success('Local cache cleared. Reloading…');
                setTimeout(() => window.location.reload(), 1200);
              }}
              variant="danger"
              disabled={confirmText !== 'CLEAR'}
            >
              Clear Cache
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
