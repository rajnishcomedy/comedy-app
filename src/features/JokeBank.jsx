import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button, Input, Select, StatusTag, ScoreBar, Modal, EmptyState } from '../components/UI';
import { CATEGORIES, STATUS_ORDER, MAKERS, uid, today, killRate } from '../utils';
import { Search, Plus, Trash2, Library, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemAnim = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
};
const getHeatmap = (kill) => {
  if (kill >= 80) return 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, var(--bg2) 100%)';
  if (kill > 0 && kill < 40) return 'linear-gradient(145deg, rgba(255, 76, 76, 0.12) 0%, var(--bg2) 100%)';
  return 'var(--bg2)';
};

export default function JokeBank({ jokes, addJoke, updateJoke, deleteJoke, toast }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const debounceRef = useRef(null);

  // Debounce search 300ms
  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const blank = () => ({
    id: uid(), cat: 'Middle Class', setup: '', punch: '', tags: [],
    status: 'Raw', score: 7, notes: '', maker: 'Reversal', created: today(),
    performed: 0, killed: 0, duration: 0,
    punchlines: [{ text: '', note: 'Original', active: true }],
  });
  const [form, setForm] = useState(blank());

  const filtered = useMemo(() => jokes.filter(j => {
    const q = debouncedSearch.toLowerCase();
    const matchQ = !q || j.setup.toLowerCase().includes(q) || j.punch.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q);
    const matchC = filterCat === 'All' || j.cat === filterCat;
    const matchS = filterStatus === 'All' || j.status === filterStatus;
    return matchQ && matchC && matchS;
  }), [jokes, debouncedSearch, filterCat, filterStatus]);

  const openNew = () => { setForm(blank()); setEditing(null); setShowForm(true); };

  const openEdit = (j) => {
    const tags = [...(j.tags || [])];
    while (tags.length < 3) tags.push('');
    setForm({ ...j, tags });
    setEditing(j.id);
    setShowForm(true);
  };

  const save = async () => {
    const activePunch = form.punchlines.find(p => p.active)?.text || form.punch || '';
    if (!form.setup.trim() || !activePunch.trim()) {
      toast?.error('Setup and an active Punchline are required.');
      return;
    }

    const updatedForm = { ...form, punch: activePunch };
    
    if (editing) {
      await updateJoke(editing, updatedForm);
      toast?.success('Joke updated!');
    } else {
      await addJoke({ ...updatedForm, id: uid(), created: today() });
      toast?.success('Joke saved to bank!');
    }
    setShowForm(false);
  };

  const del = async (id) => {
    await deleteJoke(id);
    setShowForm(false);
    toast?.info('Joke deleted');
  };

  const cats = ['All', ...new Set(jokes.map(j => j.cat))];
  const killPercent = form.performed > 0 ? Math.round((form.killed / form.performed) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search bar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg2)' }}>
        <div style={{ position: 'relative', maxWidth: 280, flex: 1 }}>
          <Search size={15} color="var(--text3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            placeholder="Search jokes…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <Select value={filterCat} onChange={v => setFilterCat(v)} options={cats} style={{ maxWidth: 180 }} />
        <Select value={filterStatus} onChange={v => setFilterStatus(v)} options={['All', ...STATUS_ORDER]} style={{ maxWidth: 180 }} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {filtered.length} / {jokes.length}
          </span>
          <Button onClick={openNew} variant="primary" icon={Plus}>New Joke</Button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="fade-in scrollable">
        {filtered.length === 0 && (
          <EmptyState icon={Library} text="No jokes found" sub="Write your first joke or adjust filters." />
        )}

        <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
          {filtered.map(j => (
            <motion.div variants={itemAnim} key={j.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', background: getHeatmap(killRate(j)) }} onClick={() => openEdit(j)}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="pill" style={{ fontSize: 11 }}>{j.cat}</span>
                <StatusTag status={j.status} />
                <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {Math.floor(j.duration / 60)}m {j.duration % 60}s
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--mono)', color: killRate(j) >= 70 ? 'var(--green)' : killRate(j) >= 40 ? 'var(--amber)' : 'var(--text3)', fontWeight: 600 }}>
                  {killRate(j)}% kill
                </span>
              </div>

              <div className="joke-text" style={{ color: 'var(--text2)', marginBottom: 8 }}>
                <span style={{ color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)', marginRight: 8, fontWeight: 600 }}>SETUP</span>
                {j.setup}
              </div>

              <div className="joke-text" style={{ color: 'var(--text)', borderLeft: '3px solid var(--accent)', paddingLeft: 14, marginBottom: 16 }}>
                {j.punch}
              </div>

              {j.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 12 }}>
                  {j.tags.map((t, i) => (
                    <span key={i} style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(200,241,53,0.05)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(200,241,53,0.1)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}


              <div style={{ marginTop: 12 }}>
                <ScoreBar score={j.score} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* New/Edit modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Joke' : 'New Joke'} width={700}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid-half">
            <Select label="Category" value={form.cat} onChange={v => setForm(f => ({ ...f, cat: v }))} options={CATEGORIES} />
            <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={STATUS_ORDER} />
          </div>

          <div className="grid-half">
            <Input
              label="Duration (Minutes)"
              type="number"
              value={Math.floor(form.duration / 60)}
              onChange={v => setForm(f => ({ ...f, duration: (parseInt(v) || 0) * 60 + (f.duration % 60) }))}
            />
            <Input
              label="Duration (Seconds)"
              type="number"
              value={form.duration % 60}
              onChange={v => setForm(f => ({ ...f, duration: (Math.floor(f.duration / 60) * 60) + (parseInt(v) || 0) }))}
            />
          </div>

          <Input
            label="Setup — straight truth, no funny, active present tense"
            value={form.setup}
            onChange={v => setForm(f => ({ ...f, setup: v }))}
            placeholder="Play it straight. Never attempt funny here."
            multiline rows={2}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
                Punchline Versions (A/B Testing)
              </label>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setForm(f => ({ ...f, punchlines: [...(f.punchlines || []), { text: '', note: 'New Var', active: false }] }))}>
                Add Variation
              </Button>
            </div>
            
            {(form.punchlines || []).map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: p.active ? 'rgba(200,241,53,0.05)' : 'transparent', border: `1px solid ${p.active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Input 
                    value={p.text} 
                    onChange={v => setForm(f => ({ ...f, punchlines: f.punchlines.map((px, pi) => pi === i ? { ...px, text: v } : px) }))}
                    placeholder="Punchline text..."
                    multiline rows={1}
                  />
                  <input 
                    value={p.note} 
                    onChange={e => setForm(f => ({ ...f, punchlines: f.punchlines.map((px, pi) => pi === i ? { ...px, note: e.target.value } : px) }))}
                    placeholder="Note (e.g. 'Sarcastic', 'High Energy')"
                    style={{ fontSize: 11, background: 'none', border: 'none', padding: 0, color: 'var(--text3)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button 
                    onClick={() => setForm(f => ({ ...f, punchlines: f.punchlines.map((px, pi) => ({ ...px, active: pi === i })) }))}
                    style={{ 
                      padding: '4px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer',
                      background: p.active ? 'var(--accent)' : 'var(--bg3)', 
                      color: p.active ? '#000' : 'var(--text3)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {p.active ? 'ACTIVE' : 'ACTIVATE'}
                  </button>
                  {i > 0 && (
                    <button 
                      onClick={() => setForm(f => ({ ...f, punchlines: f.punchlines.filter((_, pi) => pi !== i) }))}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 10 }}
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 16 }}>
            <Input
              label="Robust Tags (#topic, #energy, #position)"
              value={(form.tags || []).join(' ')}
              onChange={v => setForm(f => ({ ...f, tags: v.split(' ').map(t => t.startsWith('#') ? t : `#${t}`).filter(t => t !== '#') }))}
              placeholder="e.g. #dating #family #closer"
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(form.tags || []).map(t => (
                <span key={t} style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(200,241,53,0.1)', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Score + Stats */}
          <div className="grid-third" style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
            <Select label="Punchline Maker" value={form.maker} onChange={v => setForm(f => ({ ...f, maker: v }))} options={MAKERS} />

            <div>
              <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Laugh Score
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="range" min={1} max={10} step={1} value={form.score} onChange={e => setForm(f => ({ ...f, score: +e.target.value }))} style={{ flex: 1 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--accent)', minWidth: 24, fontWeight: 700 }}>{form.score}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="grid-half" style={{ gap: 10 }}>
                <Input label="Performed" type="number" value={form.performed} onChange={v => setForm(f => ({ ...f, performed: +v }))} />
                <Input label="Killed" type="number" value={form.killed} onChange={v => setForm(f => ({ ...f, killed: +v }))} />
              </div>
              {form.performed > 0 && (
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', textAlign: 'center', color: killPercent >= 70 ? 'var(--green)' : killPercent >= 40 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                  Kill Rate: {killPercent}%
                </div>
              )}
            </div>
          </div>

          <Input label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Room conditions, set position, context…" />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div>
              {editing && <Button onClick={() => del(editing)} variant="danger" icon={Trash2}>Delete</Button>}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
              <Button onClick={save} variant="primary">Save Joke</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
