import { useState, useEffect, useRef, useCallback } from 'react';
import { uid, today, fmtDate, ATTITUDES, ATTITUDE_COLORS } from '../utils';
import { Button, EmptyState } from '../components/UI';
import { Lightbulb, Trash2, ArrowRight, Mic, Play, Pause } from 'lucide-react';

export default function IdeaDump({ ideas, addIdea, updateIdea, deleteIdea, addJoke, deleteJoke, toast, setVoiceOpen }) {
  const [input, setInput]       = useState('');
  const [attitude, setAttitude] = useState('Weird');
  const [filterA, setFilterA]   = useState('All');
  const [filterSrc, setFilterSrc] = useState('All');
  const [playingId, setPlayingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const audioRefs = useRef({});
  const angleTimeoutRef = useRef(null);

  const debouncedUpdateAngle = useCallback((id, v) => {
    if (angleTimeoutRef.current) clearTimeout(angleTimeoutRef.current);
    angleTimeoutRef.current = setTimeout(async () => {
      try {
        await updateIdea(id, { angle: v });
      } catch (err) {
        console.error('updateAngle failed:', err);
        toast?.error(err?.message || 'Failed to update angle.');
      }
    }, 350);
  }, [updateIdea, toast]);

  useEffect(() => {
    return () => {
      if (angleTimeoutRef.current) {
        clearTimeout(angleTimeoutRef.current);
      }
    };
  }, []);

  const add = async () => {
    if (!input.trim()) {
      toast?.info('Type something to dump.');
      return;
    }

    setIsSaving(true);
    try {
      await addIdea({
        idea: input, attitude, source: 'Observation',
        angle: '', promoted: false, date: today(), label: '', audioURL: null,
      });
      setInput('');
      toast?.success('Idea dumped!');
    } catch (err) {
      console.error('Idea dump failed:', err);
      toast?.error(err?.message || 'Could not dump idea.');
    } finally {
      setIsSaving(false);
    }
  };

  const promote = async (ideaDoc) => {
    const newId = uid();
    let createdJoke = false;
    try {
      await addJoke({
        id: newId, cat: 'Other', setup: ideaDoc.idea, punch: '', tags: ['', '', ''],
        status: 'Raw', score: 5, notes: `From idea dump: ${ideaDoc.date}`, maker: '—',
        created: today(), performed: 0, killed: 0,
      });
      createdJoke = true;
      await updateIdea(ideaDoc.id, { promoted: true });
      toast?.success('Moved to Joke Bank!');
    } catch (err) {
      console.error('Promote failed:', err);
      toast?.error(err?.message || 'Failed to move idea to joke bank.');
      if (createdJoke) {
        try {
          await deleteJoke(newId);
        } catch (rollbackErr) {
          console.error('Rollback failed:', rollbackErr);
        }
      }
    }
  };

  const del = async (id, audioPath) => {
    try {
      await deleteIdea(id, audioPath);
      toast?.info('Idea deleted');
    } catch (err) {
      console.error('Idea delete failed:', err);
      toast?.error(err?.message || 'Failed to delete idea.');
    }
  };

  const updateAngle = (id, v) => {
    debouncedUpdateAngle(id, v);
  };

  const filtered = ideas.filter(i => {
    const matchA   = filterA === 'All' || i.attitude === filterA;
    const matchSrc = filterSrc === 'All' || (filterSrc === 'Voice' ? i.source === 'Voice Recording' : i.source !== 'Voice Recording');
    return matchA && matchSrc;
  });

  const togglePlay = (id) => {
    const el = audioRefs.current[id];
    if (!el) return;

    if (playingId === id) {
      el.pause();
      setPlayingId(null);
      return;
    }

    Object.values(audioRefs.current).forEach(a => {
      if (a && a !== el) a.pause();
    });

    el.play().then(() => {
      setPlayingId(id);
    }).catch(err => {
      console.error('Audio play failed:', err);
      toast?.error(err?.message || 'Could not play audio.');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Input bar */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && add()}
            placeholder="Raw observation, premise, overheard line, anything..."
            style={{ flex: 1, padding: '14px 20px', fontSize: 15, borderRadius: 12 }}
          />
          <Button onClick={add} variant="primary" style={{ padding: '0 24px' }} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Dump It'}
          </Button>
          <Button
            onClick={() => setVoiceOpen(true)} variant="outline" icon={Mic}
            style={{ padding: '0 18px', borderColor: 'var(--red)', color: 'var(--red)', background: 'rgba(255,76,76,0.05)' }}
          />
        </div>

        {/* Attitude selector */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attitude:</span>
            {ATTITUDES.map(a => (
              <button key={a} onClick={() => setAttitude(a)} style={{
                padding: '6px 14px', borderRadius: 999,
                border: `1px solid ${attitude === a ? ATTITUDE_COLORS[a] : 'var(--border)'}`,
                background: attitude === a ? `${ATTITUDE_COLORS[a]}15` : 'transparent',
                color: attitude === a ? ATTITUDE_COLORS[a] : 'var(--text3)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              }}>{a}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter:</span>
            {['All', ...ATTITUDES, 'Voice'].map(a => {
              const isActive = a === 'Voice' ? filterSrc === 'Voice' : filterA === a;
              return (
                <button key={a} onClick={() => { if (a === 'Voice') { setFilterSrc('Voice'); setFilterA('All'); } else { setFilterA(a); setFilterSrc('All'); } }}
                  style={{
                    padding: '6px 14px', borderRadius: 999,
                    border: `1px solid ${isActive ? 'var(--text2)' : 'transparent'}`,
                    background: isActive ? 'var(--bg3)' : 'transparent',
                    color: isActive ? 'var(--text)' : 'var(--text3)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  }}>{a === 'Voice' ? '🎙 Voice' : a}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, alignContent: 'start' }} className="fade-in scrollable">
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState icon={Lightbulb} text="Dump is empty" sub="Type anything above. No filter. No judgment." />
          </div>
        )}

        {filtered.map(i => (
          <div key={i.id} className="card" style={{ opacity: i.promoted ? 0.6 : 1, display: 'flex', flexDirection: 'column', borderLeft: i.source === 'Voice Recording' ? '3px solid var(--red)' : undefined }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: `${ATTITUDE_COLORS[i.attitude] || 'var(--text3)'}15`, color: ATTITUDE_COLORS[i.attitude] || 'var(--text3)', fontFamily: 'var(--mono)', fontWeight: 600, border: `1px solid ${ATTITUDE_COLORS[i.attitude] || 'var(--text3)'}33` }}>{i.attitude}</span>
              {i.source === 'Voice Recording' && <span style={{ fontSize: 10, color: 'var(--red)', fontFamily: 'var(--mono)', background: 'rgba(255,76,76,0.1)', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>🎙 VOICE</span>}
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{fmtDate(i.date)}</span>
              {i.promoted && <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'var(--mono)', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 4 }}>PROMOTED</span>}
            </div>

            <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16, fontWeight: 400 }}>{i.idea}</div>

            {/* Audio playback */}
            {i.audioURL && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,76,76,0.05)', borderRadius: 8, border: '1px solid rgba(255,76,76,0.2)', marginBottom: 12 }}>
                <button onClick={() => togglePlay(i.id)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {playingId === i.id ? <Pause size={13} color="#fff" /> : <Play size={13} color="#fff" />}
                </button>
                <span style={{ fontSize: 12, color: 'var(--text3)', flex: 1 }}>{i.label || 'Voice recording'}</span>
                <audio
                  ref={el => {
                    if (el) audioRefs.current[i.id] = el;
                    else delete audioRefs.current[i.id];
                  }}
                  src={i.audioURL}
                  onEnded={() => setPlayingId(null)}
                />
              </div>
            )}

            <div style={{ marginTop: 'auto' }}>
              <input
                value={i.angle || ''} onChange={e => updateAngle(i.id, e.target.value)}
                placeholder="Possible angle — what's weird/scary/hard/stupid about this?"
                style={{ fontSize: 13, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.02)' }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <Button onClick={() => del(i.id, i.audioPath)} variant="ghost" size="sm" icon={Trash2} style={{ padding: '6px 10px' }} />
                {!i.promoted
                  ? <Button onClick={() => promote(i)} variant="accent" size="sm" icon={ArrowRight}>Move to Joke Bank</Button>
                  : <span style={{ fontSize: 12, color: 'var(--text3)', alignSelf: 'center', fontStyle: 'italic' }}>Sent to Joke Bank</span>
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
