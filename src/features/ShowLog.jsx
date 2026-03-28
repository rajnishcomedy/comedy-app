import { useState } from 'react';
import { uid, today, fmtDate, VENUES_NCR } from '../utils';
import { Button, Input, Select, Modal, EmptyState } from '../components/UI';
import { Mic2, Plus, Trash2, MapPin, Mic, Square, Volume2, Play, Pause } from 'lucide-react';

export default function ShowLog({ shows, addShow, updateShow, deleteShow, sets = [], jokes = [], profile, toast }) {
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // The blank function is replaced by the initialization logic in openNew
    // const blank = () => ({
    //     id: uid(), date: today(), venue: "", city: "Delhi", type: "Open Mic",
    //     setLength: 7, crowdSize: 30, energy: 7, score: 7,
    //     killed: "", died: "", newBits: "", crowdWork: "", lessons: "", video: ""
    // });
    const [form, setForm] = useState({}); // Initial state will be set by openNew/openEdit
    const [editing, setEditing] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioPreview, setAudioPreview] = useState(null);

    const openNew = () => {
        const defaultVenue = (profile?.venues && profile.venues.length > 0) ? profile.venues[0] : VENUES_NCR[0];
        setForm({
            id: uid(), date: today(), venue: defaultVenue, city: "New Delhi", type: "Open Mic",
            setLength: 10, crowdSize: 30, energy: 7, score: 5,
            killed: "", died: "", newBits: "", crowdWork: "", lessons: "", video: "",
            setId: ""
        });
        setAudioPreview(null);
        setEditing(null);
        setShowForm(true);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioPreview(URL.createObjectURL(blob));
                setForm(f => ({ ...f, _blob: blob }));
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Recording failed:", err);
            toast?.error("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
            setMediaRecorder(null);
            setIsRecording(false);
        }
    };

    const openEdit = (s) => {
        setForm({
            ...s,
            venue: s.venue || VENUES_NCR[0],
            city: s.city || "New Delhi",
            bitsKilled: s.bitsKilled || s.killed || "",
            died: s.died || "",
            newBits: s.newBits || "",
            crowdWork: s.crowdWork || "",
            lessons: s.lessons || "",
            video: s.video || ""
        });
        setEditing(s.id);
        setShowForm(true);
    };

    const save = async () => {
        if (!form.venue || !form.venue.trim()) return;
        if (isRecording) stopRecording();
        if (isSaving) return;
        setIsSaving(true);
        try {
            if (editing) {
                await updateShow(editing, form);
                toast?.success('Show updated!');
            } else {
                await addShow(form);
                toast?.success('Show logged!');
            }
            setShowForm(false);
        } catch (err) {
            console.error('Show save failed:', err);
            toast?.error(err?.message || 'Failed to save show.');
        } finally {
            setIsSaving(false);
        }
    };

    const del = async (id) => {
      try {
        await deleteShow(id);
        setShowForm(false);
        toast?.info('Show deleted');
      } catch (err) {
        console.error('Show delete failed:', err);
        toast?.error(err?.message || 'Failed to delete show.');
      }

    };

    const sorted = [...shows].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg2)" }}>
                <div className="section-header" style={{ margin: 0 }}>Show History</div>
                <Button onClick={() => openNew()} variant="primary" icon={Plus}>Log Show</Button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="fade-in scrollable">
                {sorted.length === 0 && <EmptyState icon={Mic2} text="No shows logged" sub="Hit the stage tonight and log your first show." />}

                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))" }}>
                    {sorted.map(s => (
                        <div key={s.id} className="card hover-lift" onClick={() => openEdit(s)} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>{s.venue || "Untitled Venue"}</span>
                                        <span className="pill" style={{ fontSize: 11, background: "rgba(200, 241, 53, 0.1)", color: "var(--accent)", border: "1px solid rgba(200, 241, 53, 0.2)" }}>{s.type}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: "var(--text3)", display: "flex", alignItems: "center", gap: 6 }}>
                                        <MapPin size={12} /> {s.city} <span style={{ opacity: 0.5 }}>|</span> {fmtDate(s.date)} <span style={{ opacity: 0.5 }}>|</span> {s.setLength} min <span style={{ opacity: 0.5 }}>|</span> {s.crowdSize} people
                                    </div>
                                </div>

                                <div style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)" }}>
                                    <div style={{ fontFamily: "var(--mono)", fontSize: 24, color: s.score >= 8 ? "var(--green)" : s.score >= 6 ? "var(--amber)" : "var(--red)", lineHeight: 1, fontWeight: 700 }}>{s.score}</div>
                                    <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>Score</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 8, border: "1px solid var(--border)" }}>
                                {(s.bitsKilled || s.killed) && (
                                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                                        <span style={{ color: "var(--bg)", background: "var(--green)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, marginRight: 8 }}>KILLED</span>
                                        <span style={{ color: "var(--text)" }}>{s.bitsKilled || s.killed}</span>
                                    </div>
                                )}
                                {s.died && (
                                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                                        <span style={{ color: "var(--bg)", background: "var(--red)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, marginRight: 8 }}>DIED</span>
                                        <span style={{ color: "var(--text2)" }}>{s.died}</span>
                                    </div>
                                )}
                            </div>

                            {s.lessons && (
                                <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                                    "{s.lessons}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Show Log" : "Log a Show"} width={640}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    <div className="grid-half">
                        <Input label="Date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="date" />
                        <Select 
                            label="Venue" 
                            value={form.venue} 
                            onChange={v => setForm(f => ({ ...f, venue: v }))} 
                            options={[...(profile?.venues || []), ...VENUES_NCR]} 
                        />
                    </div>
                    <div className="grid-half">
                        <Input label="City" value={form.city || ""} onChange={v => setForm(f => ({ ...f, city: v }))} />
                        <Select 
                            label="Associated Set" 
                            value={form.setId || ""} 
                            onChange={v => {
                                const set = sets.find(s => s.id === v);
                                const newResults = {};
                                if (set) set.slots.forEach(id => newResults[id] = 0);
                                setForm(f => ({ ...f, setId: v, results: newResults }));
                            }} 
                            options={[{ label: "No Set Linked", value: "" }, ...sets.map(s => ({ label: s.name, value: s.id }))]} 
                        />
                    </div>

                    {form.setId && (
                        <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Joke Performance (Rate each bit)</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", paddingRight: 8 }} className="scrollable">
                                {(sets.find(s => s.id === form.setId)?.slots || []).map(jokeId => {
                                    const joke = jokes.find(j => j.id === jokeId);
                                    if (!joke) return null;
                                    const currentRating = form.results?.[jokeId] || 0;
                                    
                                    return (
                                        <div key={jokeId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                            <div style={{ flex: 1, fontSize: 13, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {joke.setup}
                                            </div>
                                            <div style={{ display: "flex", gap: 4 }}>
                                                {[
                                                    { v: -2, label: "💣", color: "var(--red)" },
                                                    { v: -1, label: "😶", color: "var(--amber)" },
                                                    { v: 1, label: "🙂", color: "var(--accent)" },
                                                    { v: 2, label: "🔥", color: "var(--green)" }
                                                ].map(btn => (
                                                    <button
                                                        key={btn.v}
                                                        onClick={() => setForm(f => ({ ...f, results: { ...f.results, [jokeId]: btn.v } }))}
                                                        style={{
                                                            width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
                                                            background: currentRating === btn.v ? btn.color : "transparent",
                                                            color: currentRating === btn.v ? "#000" : "var(--text3)",
                                                            fontSize: 12, cursor: "pointer", transition: "all 0.15s",
                                                            display: "flex", alignItems: "center", justifyContent: "center"
                                                        }}
                                                        title={btn.label}
                                                    >
                                                        {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div style={{ padding: 16, background: "rgba(200,241,53,0.05)", border: "1px dashed var(--accent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                                <Mic size={14} /> {isRecording ? "Recording Show Audio..." : audioPreview || form.audioURL ? "Audio Recorded" : "Record Show Audio"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>Capture your set for review</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {audioPreview || form.audioURL ? (
                                <audio src={audioPreview || form.audioURL} controls style={{ height: 32, width: 180 }} />
                            ) : null}
                            {!isRecording ? (
                                <Button onClick={startRecording} variant="outline" icon={Mic} size="sm">Start Rec</Button>
                            ) : (
                                <Button onClick={stopRecording} variant="danger" icon={Square} size="sm" className="pulse">Stop</Button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                        <Select label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={["Open Mic", "Showcase", "Paid Gig", "Corporate", "Headliner", "Other"]} />
                        <Input label="Set (min)" value={form.setLength} onChange={v => setForm(f => ({ ...f, setLength: +v }))} type="number" />
                        <Input label="Crowd" value={form.crowdSize} onChange={v => setForm(f => ({ ...f, crowdSize: +v }))} type="number" />

                        <div>
                            <label style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 500 }}>Score</label>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <input type="range" min={1} max={10} step={1} value={form.score} onChange={e => setForm(f => ({ ...f, score: +e.target.value }))} style={{ flex: 1, padding: 0 }} />
                                <span style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontSize: 16, fontWeight: 600, minWidth: 20 }}>{form.score}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Input label="What KILLED" value={form.bitsKilled || form.killed} onChange={v => setForm(f => ({ ...f, bitsKilled: v, killed: v }))} placeholder="Bits that got the biggest laugh…" />
                        <Input label="What DIED" value={form.died} onChange={v => setForm(f => ({ ...f, died: v }))} placeholder="Bits that fell flat…" />
                        <Input label="New bits tried" value={form.newBits} onChange={v => setForm(f => ({ ...f, newBits: v }))} placeholder="First-time material…" />
                        <Input label="Crowd work moments" value={form.crowdWork} onChange={v => setForm(f => ({ ...f, crowdWork: v }))} placeholder="What happened, what you built from it…" />
                    </div>

                    <Input label="Lessons" value={form.lessons} onChange={v => setForm(f => ({ ...f, lessons: v }))} placeholder="What to do differently next time…" multiline rows={3} />
                    <Input label="Video URL" value={form.video} onChange={v => setForm(f => ({ ...f, video: v }))} placeholder="https://…" />

                    <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                        <div>
                            {editing && <Button onClick={() => del(editing)} variant="danger" icon={Trash2}>Delete</Button>}
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
                            <Button onClick={save} variant="primary">Save Show</Button>
                        </div>
                    </div>

                </div>
            </Modal>
        </div>
    );
}
