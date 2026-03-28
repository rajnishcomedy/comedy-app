import { killRate, fmtDate, getGreeting } from '../utils';
import { Button } from '../components/UI';
import {
  PenTool, Zap, Lightbulb, FileText, Mic2, Target,
  CheckCircle2, TrendingUp, AlertCircle, BarChart2, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const StatCard = ({ label, value, sub, color = 'var(--accent)' }) => {
  const isCssVar = color.trim().startsWith('var(');
  const bubbleColor = isCssVar
    ? `color-mix(in srgb, ${color} 20%, transparent)`
    : color;
  const textShadow = isCssVar ? 'none' : `0 0 20px ${color}44`;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: bubbleColor, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' }} />
      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--mono)', color, lineHeight: 1.1, textShadow }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
};

function QuickAction({ icon, label, tab, color = 'var(--text)', setActive, onClick }) {
  const Icon = icon;
  const isCssVar = String(color).trim().startsWith('var(');
  const bgColor = isCssVar ? `color-mix(in srgb, ${color} 18%, transparent)` : `${color}12`;
  const borderColor = isCssVar ? `color-mix(in srgb, ${color} 25%, transparent)` : `${color}25`;
  const isDev = import.meta.env?.DEV === true;

  return (
    <div
      onClick={() => {
        if (onClick) return onClick();
        if (setActive) return setActive(tab);
        if (isDev) {
          console.warn('QuickAction clicked but no onClick or setActive provided', { label, tab });
        }
      }}
      className="card hover-lift"
      style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all var(--trans-base)' }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${borderColor}` }}>
        <Icon size={20} color={color} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
    </div>
  );
}

export default function Dashboard({ jokes, shows, ideas, setActive, openVoiceRecorder, profile, user }) {
  const ready   = jokes.filter(j => j.status === 'Stage-Ready').length;
  const punch   = jokes.filter(j => j.status === 'Punch-Up Needed').length;
  const testedJokes = jokes.filter(j => j.performed > 0);
  const avgKill = testedJokes.length
    ? Math.round(testedJokes.reduce((a, j) => a + killRate(j), 0) / testedJokes.length)
    : 0;
  const topJoke = testedJokes.length > 0
    ? [...testedJokes].sort((a, b) => killRate(b) - killRate(a))[0]
    : null;
  const recentShow = shows.length > 0
    ? [...shows].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const greeting = getGreeting();

  const name = profile?.stageName || user?.displayName || user?.email?.split('@')[0] || 'Comic';

  return (
    <div style={{ padding: 32, overflowY: 'auto', height: '100%' }} className="fade-in scrollable">
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: 28, color: 'var(--text)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {greeting}, <span style={{ color: 'var(--accent)' }}>{name}.</span>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <motion.div variants={itemAnim}><StatCard label="Total Jokes" value={jokes.length} sub={`${ready} stage-ready`} /></motion.div>
        <motion.div variants={itemAnim}><StatCard label="Kill Rate Avg" value={`${avgKill}%`} sub="tested jokes only" color="var(--green)" /></motion.div>
        <motion.div variants={itemAnim}><StatCard label="Shows Logged" value={shows.length} sub="in show log" color="var(--purple)" /></motion.div>
        <motion.div variants={itemAnim}><StatCard label="Raw Ideas" value={ideas.filter(i => !i.promoted).length} sub="waiting in dump" color="var(--blue)" /></motion.div>
        <motion.div variants={itemAnim}><StatCard label="Need Punch-Up" value={punch} sub="in the queue" color={punch > 0 ? 'var(--amber)' : 'var(--text3)'} /></motion.div>
      </motion.div>

      {/* Top Killer + Last Show */}
      <div className="grid-half" style={{ gap: 20, marginBottom: 32 }}>
        {topJoke ? (
          <div className="card" style={{ position: 'relative', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="section-header" style={{ color: 'var(--green)', marginBottom: 12 }}><TrendingUp size={14} /> Top Killer</div>
            <div style={{ fontSize: 15, color: 'var(--text)', marginBottom: 16, lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>
              "{(topJoke.setup || '').slice(0, 80)}{(topJoke.setup || '').length > 80 ? '…' : ''}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(16,185,129,0.06)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--green)', fontWeight: 700 }}>{killRate(topJoke)}%</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kill Rate</span>
                <span>{topJoke.performed} performances · {topJoke.cat}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, minHeight: 160, opacity: 0.5 }}>
            <TrendingUp size={24} color="var(--text3)" />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>No performance data yet</div>
          </div>
        )}

        {recentShow ? (
          <div className="card">
            <div className="section-header" style={{ color: 'var(--blue)', marginBottom: 12 }}><Mic2 size={14} /> Last Show</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{recentShow.venue}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="pill">{fmtDate(recentShow.date)}</span>
              <span className="pill">{recentShow.city}</span>
              <span className="pill" style={{ color: recentShow.score >= 8 ? 'var(--green)' : recentShow.score >= 6 ? 'var(--amber)' : 'var(--red)' }}>
                {recentShow.score}/10
              </span>
            </div>
            {(recentShow.bitsKilled || recentShow.killed) && (
              <div style={{ fontSize: 13, color: 'var(--text)', background: 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 600, marginRight: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>KILLED:</span>
                {(recentShow.bitsKilled || recentShow.killed).slice(0, 60)}{(recentShow.bitsKilled || recentShow.killed).length > 60 ? '…' : ''}
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, minHeight: 160, opacity: 0.5 }}>
            <Mic2 size={24} color="var(--text3)" />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>No shows logged yet</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="section-header" style={{ marginBottom: 16 }}><CheckCircle2 size={16} /> Quick Actions</div>
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <motion.div variants={itemAnim}><QuickAction icon={PenTool}  label="Write a new joke"      tab="jokes"    color="var(--accent)"  setActive={setActive} /></motion.div>
        <motion.div variants={itemAnim}><QuickAction icon={Zap}      label="Punch up a weak bit"   tab="punchup"  color="var(--amber)"   setActive={setActive} /></motion.div>
        <motion.div variants={itemAnim}><QuickAction icon={Lightbulb}label="Dump a new idea"       tab="ideas"    color="var(--blue)"    setActive={setActive} /></motion.div>
        <motion.div variants={itemAnim}><QuickAction icon={FileText} label="Build tonight's set"   tab="sets"     color="var(--purple)"  setActive={setActive} /></motion.div>
        <motion.div variants={itemAnim}><QuickAction icon={Mic2}     label="Voice idea recorder"   onClick={openVoiceRecorder} color="var(--red)" /></motion.div>
        <motion.div variants={itemAnim}><QuickAction icon={Mic2}     label="Log last night's show" tab="shows"    color="var(--green)"   setActive={setActive} /></motion.div>
        <motion.div variants={itemAnim}><QuickAction icon={Target}   label="Run a premise drill"   tab="drill"    color="var(--red)"     setActive={setActive} /></motion.div>
      </motion.div>

      {/* Framework Quick-Ref */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: 16 }}><AlertCircle size={16} /> Framework Quick-Ref</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {[
            ['Laugh Trigger',    'MUST be the last word. Not second-to-last. Last. Always.'],
            ['Setup Rule',       'Active present tense. Never attempt funny in the setup.'],
            ['Tag Mechanic',     'Shatter same/different/new assumption. No new setup ever.'],
            ['Attitude Formula', 'Weird · Scary · Hard · Stupid — pick one angle per premise.'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--accent)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em' }}>{k}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
