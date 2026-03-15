import { useState } from 'react';
import { uid, today, fmtDate, VENUES_NCR } from '../utils';
import { Button, Input, Select, Modal, EmptyState } from '../components/UI';
import { Mic2, Plus, Trash2, MapPin } from 'lucide-react';

export default function ShowLog({ shows, setShows }) {
    const [showForm, setShowForm] = useState(false);
    // The blank function is replaced by the initialization logic in openNew
    // const blank = () => ({
    //     id: uid(), date: today(), venue: "", city: "Delhi", type: "Open Mic",
    //     setLength: 7, crowdSize: 30, energy: 7, score: 7,
    //     killed: "", died: "", newBits: "", crowdWork: "", lessons: "", video: ""
    // });
    const [form, setForm] = useState({}); // Initial state will be set by openNew/openEdit
    const [editing, setEditing] = useState(null);

    const openNew = () => {
        setForm({
            id: uid(), date: today(), venue: VENUES_NCR[0], city: "New Delhi", type: "Open Mic",
            setLength: 10, crowdSize: 30, energy: 7, score: 5,
            killed: "", died: "", newBits: "", crowdWork: "", lessons: "", video: ""
        });
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (s) => {
        setForm({
            ...s,
            venue: s.venue || VENUES_NCR[0],
            city: s.city || "New Delhi",
            killed: s.killed || "",
            died: s.died || "",
            newBits: s.newBits || "",
            crowdWork: s.crowdWork || "",
            lessons: s.lessons || "",
            video: s.video || ""
        });
        setEditing(s.id);
        setShowForm(true);
    };

    const save = () => {
        if (!form.venue.trim()) return; // Ensure venue is not empty
        if (editing) setShows(ss => ss.map(s => s.id === editing ? { ...form } : s));
        else setShows(ss => [{ ...form, id: uid() }, ...ss]);
        setShowForm(false);
    };

    const del = id => {
        setShows(ss => ss.filter(s => s.id !== id));
        setShowForm(false);
    };

    const sorted = [...shows].sort((a, b) => b.date.localeCompare(a.date));

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
                                {s.killed && (
                                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                                        <span style={{ color: "var(--bg)", background: "var(--green)", padding: "2px 6px", borderRadius: 4, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, marginRight: 8 }}>KILLED</span>
                                        <span style={{ color: "var(--text)" }}>{s.killed}</span>
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Input label="Date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="date" />
                        <Select label="Venue" value={form.venue || VENUES_NCR[0]} onChange={v => setForm(f => ({ ...f, venue: v }))} options={VENUES_NCR} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                        <Input label="City" value={form.city || ""} onChange={v => setForm(f => ({ ...f, city: v }))} />
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
                        <Input label="What KILLED" value={form.killed} onChange={v => setForm(f => ({ ...f, killed: v }))} placeholder="Bits that got the biggest laugh…" />
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
