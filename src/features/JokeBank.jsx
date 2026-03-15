import { useState } from 'react';
import { Button, Input, Select, StatusTag, ScoreBar, Modal, EmptyState } from '../components/UI';
import { CATEGORIES, STATUS_ORDER, MAKERS, uid, today, killRate, checkLaughTrigger } from '../utils';
import { Search, Plus, Trash2, Library } from 'lucide-react';

export default function JokeBank({ jokes, setJokes }) {
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const blank = () => ({
        id: uid(), cat: "Middle Class", setup: "", punch: "", tags: ["", "", ""],
        status: "Raw", score: 7, notes: "", maker: "Reversal", created: today(), performed: 0, killed: 0
    });
    const [form, setForm] = useState(blank());

    const filtered = jokes.filter(j => {
        const q = search.toLowerCase();
        const matchQ = !q || j.setup.toLowerCase().includes(q) || j.punch.toLowerCase().includes(q) || j.cat.toLowerCase().includes(q);
        const matchC = filterCat === "All" || j.cat === filterCat;
        const matchS = filterStatus === "All" || j.status === filterStatus;
        return matchQ && matchC && matchS;
    });

    const openNew = () => { setForm(blank()); setEditing(null); setShowForm(true); };

    const openEdit = (j) => {
        setForm({
            ...j,
            tags: [...(j.tags || ["", "", ""])],
            ...(j.tags?.length < 3 ? { tags: [...(j.tags || []), ...Array(3 - (j.tags || []).length).fill("")] } : {})
        });
        setEditing(j.id);
        setShowForm(true);
    };

    const save = () => {
        if (!form.setup.trim() || !form.punch.trim()) {
            alert("Setup and Punchline are required.");
            return;
        }
        if (editing) setJokes(js => js.map(j => j.id === editing ? { ...form } : j));
        else setJokes(js => [{ ...form, id: uid() }, ...js]);
        setShowForm(false);
    };

    const del = (id) => {
        setJokes(js => js.filter(j => j.id !== id));
        setShowForm(false);
    };

    const cats = ["All", ...new Set(jokes.map(j => j.cat))];
    const trigger = editing || showForm ? checkLaughTrigger(form.punch) : null;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", background: "var(--bg2)" }}>
                <div style={{ position: "relative", maxWidth: 260, flex: 1 }}>
                    <Search size={16} color="var(--text3)" style={{ position: "absolute", left: 14, top: 12 }} />
                    <input
                        placeholder="Search jokes…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 38 }}
                    />
                </div>
                <Select value={filterCat} onChange={v => setFilterCat(v)} options={cats} style={{ maxWidth: 180 }} />
                <Select value={filterStatus} onChange={v => setFilterStatus(v)} options={["All", ...STATUS_ORDER]} style={{ maxWidth: 180 }} />

                <div style={{ marginLeft: "auto" }}>
                    <Button onClick={openNew} variant="primary" icon={Plus}>New Joke</Button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="fade-in scrollable">
                {filtered.length === 0 && <EmptyState icon={Library} text="No jokes found" sub="Write your first joke or adjust filters." />}

                <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))" }}>
                    {filtered.map(j => (
                        <div key={j.id} className="card" style={{ cursor: "pointer", display: "flex", flexDirection: "column" }} onClick={() => openEdit(j)}>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                                <span className="pill">{j.cat}</span>
                                <StatusTag status={j.status} />
                                <span style={{ marginLeft: "auto", fontSize: 12, fontFamily: "var(--mono)", color: "var(--text3)", fontWeight: 500 }}>
                                    {killRate(j)}% kill
                                </span>
                            </div>

                            <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 8, lineHeight: 1.6 }}>
                                <span style={{ color: "var(--text3)", fontSize: 11, fontFamily: "var(--mono)", marginRight: 8, fontWeight: 600 }}>SETUP</span>
                                {j.setup}
                            </div>

                            <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, borderLeft: "3px solid var(--accent)", paddingLeft: 12, marginBottom: 12 }}>
                                {j.punch}
                            </div>

                            {j.tags?.filter(t => t).length > 0 && (
                                <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                                    {j.tags.filter(t => t).map((t, i) => (
                                        <span key={i} style={{ fontSize: 12, color: "var(--text3)", background: "rgba(255,255,255,0.03)", padding: "4px 12px", borderRadius: 20, border: "1px solid var(--border)" }}>
                                            ↳ {t.slice(0, 60)}{t.length > 60 ? "…" : ""}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 16 }}>
                                <ScoreBar score={j.score} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Joke" : "New Joke"} width={700}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Select label="Category" value={form.cat} onChange={v => setForm(f => ({ ...f, cat: v }))} options={CATEGORIES} />
                        <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={STATUS_ORDER} />
                    </div>

                    <Input
                        label="Setup — straight truth, no funny, active present tense"
                        value={form.setup}
                        onChange={v => setForm(f => ({ ...f, setup: v }))}
                        placeholder="Play it straight. Never attempt funny here."
                        multiline rows={2}
                    />

                    <div>
                        <Input
                            label="Punchline — laugh trigger MUST be the last word"
                            value={form.punch}
                            onChange={v => setForm(f => ({ ...f, punch: v }))}
                            placeholder="The surprise lands on the final word."
                            multiline rows={2}
                        />
                        {form.punch && (() => {
                            if (trigger?.warning) {
                                return <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.3)", borderRadius: 8, fontSize: 13, color: "var(--amber)" }}>⚠ {trigger.warning}</div>;
                            }
                            if (form.punch.length > 10) {
                                return <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, fontSize: 13, color: "var(--green)" }}>✓ Last word: <b style={{ fontWeight: 600 }}>{trigger?.lastWord}</b> — looks good</div>;
                            }
                            return null;
                        })()}
                    </div>

                    <div style={{ borderLeft: "2px solid var(--border2)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        <label style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                            Tags (Secondary Punchlines)
                        </label>
                        {[0, 1, 2].map(i => (
                            <Input
                                key={i}
                                value={form.tags?.[i] || ""}
                                onChange={v => setForm(f => ({ ...f, tags: f.tags.map((t, ti) => ti === i ? v : t) }))}
                                placeholder={`Tag ${i + 1} — shatter assumption, no new setup`}
                            />
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                        <Select label="Punchline Maker" value={form.maker} onChange={v => setForm(f => ({ ...f, maker: v }))} options={MAKERS} />

                        <div>
                            <label style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6, fontWeight: 500 }}>Laugh Score</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <input type="range" min={1} max={10} step={1} value={form.score} onChange={e => setForm(f => ({ ...f, score: +e.target.value }))} style={{ flex: 1, padding: 0 }} />
                                <span style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--accent)", minWidth: 20, fontWeight: 600 }}>{form.score}</span>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <Input label="Performed" type="number" value={form.performed} onChange={v => setForm(f => ({ ...f, performed: +v }))} />
                            <Input label="Killed" type="number" value={form.killed} onChange={v => setForm(f => ({ ...f, killed: +v }))} />
                        </div>
                    </div>

                    <Input
                        label="Notes"
                        value={form.notes}
                        onChange={v => setForm(f => ({ ...f, notes: v }))}
                        placeholder="Room conditions, set position, context…"
                    />

                    <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                        <div>
                            {editing && <Button onClick={() => del(editing)} variant="danger" icon={Trash2}>Delete</Button>}
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
                            <Button onClick={save} variant="primary">Save Joke</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
