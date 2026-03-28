import React, { Suspense } from 'react';
import { Loader2, CheckCircle2, WifiOff } from 'lucide-react';
import { Nav } from './components/Layout/Nav';
import { MobileNav } from './components/Layout/MobileNav';
import { ToastContainer } from './components/UI';
import { useToast } from './hooks/useToast';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useJokes } from './hooks/useJokes';
import { useShows } from './hooks/useShows';
import { useIdeas } from './hooks/useIdeas';
import { useTasks } from './hooks/useTasks';
import { useSets } from './hooks/useSets';
import { useProfile } from './hooks/useProfile';
import ProtectedRoute from './auth/ProtectedRoute';

const Dashboard = React.lazy(() => import('./features/Dashboard'));
const JokeBank = React.lazy(() => import('./features/JokeBank'));
const SetBuilder = React.lazy(() => import('./features/SetBuilder'));
const ShowLog = React.lazy(() => import('./features/ShowLog'));
const PunchUpWorkshop = React.lazy(() => import('./features/PunchUpWorkshop'));
const IdeaDump = React.lazy(() => import('./features/IdeaDump'));
const PremiseDrill = React.lazy(() => import('./features/PremiseDrill'));
const Analytics = React.lazy(() => import('./features/Analytics'));
const HustleTracker = React.lazy(() => import('./features/HustleTracker'));
const Account = React.lazy(() => import('./features/Account'));
const VoiceRecorderModal = React.lazy(() => import('./features/VoiceRecorderModal').then(module => ({ default: module.VoiceRecorderModal })));
const QuickCapture = React.lazy(() => import('./features/QuickCapture'));
import { useLocalStorage } from './hooks/useLocalStorage';
import { KEYS } from './utils';

const TAB_LABELS = {
  dashboard: 'Dashboard',
  jokes:     'Joke Bank',
  sets:      'Set Builder',
  shows:     'Show Log',
  punchup:   'Punch-Up Workshop',
  ideas:     'Idea Dump',
  drill:     'Premise Drill',
  analytics: 'Analytics',
  hustle:    'Hustle Tracker',
  account:   'Account',
};

function AppShell() {
  const { user, signOut } = useAuth();
  const uid = user?.uid;

  // Firestore real-time hooks
  const { jokes, loading: jLoading, error: jError, addJoke, updateJoke, deleteJoke } = useJokes(uid);
  const { shows, loading: sLoading, error: sError, addShow, updateShow, deleteShow } = useShows(uid);
  const { ideas, loading: iLoading, error: iError, addIdea, updateIdea, deleteIdea } = useIdeas(uid);
  const { tasks, loading: _tl, addTask, updateTask, deleteTask } = useTasks(uid);
  const { sets,  loading: _sl, addSet, updateSet, deleteSet }  = useSets(uid);
  const { profile, saveProfile } = useProfile(uid);

  const [activeTab, setActiveTab] = useLocalStorage(KEYS.activeTab, 'dashboard');
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const { toasts, toast, removeToast } = useToast();

  const loading = jLoading || sLoading || iLoading || _tl || _sl;
  const dataError = jError || sError || iError;

  const handleVoiceSave = async (data) => {
    try {
      await addIdea({ ...data, id: Date.now().toString() });
      toast?.success('Voice idea saved!');
      setVoiceOpen(false);
    } catch (err) {
      console.error('Voice save failed:', err);
      toast?.error(err?.message || 'Failed to save voice idea. Please retry.');
      // keep modal open for retry
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="desktop-only">
        <Nav active={activeTab} setActive={setActiveTab} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {dataError && (
          <div style={{
            background: 'rgba(255, 91, 111, 0.15)',
            border: '1px solid rgba(255, 91, 111, 0.35)',
            color: 'var(--red)',
            fontSize: 13,
            fontFamily: 'var(--mono)',
            padding: '10px 14px',
            textAlign: 'center',
            zIndex: 20,
          }}>
            Network/data sync issue: {dataError?.message || 'Firestore access issue. Check rules/permissions.'}
          </div>
        )}
        {/* Header */}
        <header style={{
          height: 64, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          justifyContent: 'space-between', backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', flexShrink: 0, zIndex: 10,
        }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 16, color: 'var(--text)', fontWeight: 600 }}>
            {TAB_LABELS[activeTab]}
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* User pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 20 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0A0A0A' }}>
                {(profile?.stageName || user?.displayName || user?.email || 'C')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.stageName || user?.displayName || user?.email}
              </span>
            </div>
            {/* Sync indicator */}
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: loading ? 'var(--accent)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 5 }} className={loading ? 'pulse' : ''}>
              {loading
                ? <><Loader2 size={12} className="spin" />SYNCING</>
                : <><CheckCircle2 size={12} />SAVED</>
              }
            </span>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Suspense fallback={<div style={{ padding: 32, fontSize: 16 }}>Loading...</div>}>
            {activeTab === 'dashboard' && (
              <Dashboard jokes={jokes} shows={shows} ideas={ideas} setActive={setActiveTab} openVoiceRecorder={() => setVoiceOpen(true)} profile={profile} user={user} />
            )}
            {activeTab === 'jokes' && (
              <JokeBank jokes={jokes} addJoke={addJoke} updateJoke={updateJoke} deleteJoke={deleteJoke} toast={toast} />
            )}
            {activeTab === 'sets' && (
              <SetBuilder jokes={jokes} sets={sets} addSet={addSet} updateSet={updateSet} deleteSet={deleteSet} toast={toast} />
            )}
            {activeTab === 'shows' && (
              <ShowLog
                shows={shows}
                addShow={addShow}
                updateShow={updateShow}
                deleteShow={deleteShow}
                sets={sets}
                jokes={jokes}
                profile={profile}
                toast={toast}
              />
            )}
            {activeTab === 'punchup' && (
              <PunchUpWorkshop jokes={jokes} updateJoke={updateJoke} toast={toast} />
            )}
            {activeTab === 'ideas' && (
              <IdeaDump
                ideas={ideas}
                addIdea={addIdea}
                updateIdea={updateIdea}
                deleteIdea={deleteIdea}
                addJoke={addJoke}
                deleteJoke={deleteJoke}
                toast={toast}
                setVoiceOpen={setVoiceOpen}
              />
            )}
            {activeTab === 'drill' && (
            <PremiseDrill addJoke={addJoke} toast={toast} />
          )}
          {activeTab === 'analytics' && (
            <Analytics jokes={jokes} shows={shows} />
          )}
          {activeTab === 'hustle' && (
            <HustleTracker tasks={tasks} addTask={addTask} updateTask={updateTask} deleteTask={deleteTask} toast={toast} />
          )}
          {activeTab === 'account' && (
            <Account
              user={user} profile={profile} saveProfile={saveProfile}
              jokes={jokes} shows={shows} ideas={ideas}
              onSignOut={signOut} toast={toast}
            />
          )}
        </Suspense>
        </main>
        
        <MobileNav active={activeTab} setActive={setActiveTab} />
      </div>

      <Suspense fallback={<div style={{ position: 'fixed', bottom: 24, right: 24, padding: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}>Loading voice recorder...</div>}>
        <VoiceRecorderModal
          open={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onSave={handleVoiceSave}
        />
      </Suspense>
      <Suspense fallback={null}>
        <QuickCapture addIdea={addIdea} toast={toast} />
      </Suspense>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
