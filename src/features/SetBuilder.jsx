import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button, StatusTag, EmptyState } from '../components/UI';
import { killRate, KEYS, uid, today } from '../utils';
import { FileText, Plus, X, ChevronUp, ChevronDown, LayoutList } from 'lucide-react';

export default function SetBuilder({ jokes }) {
    const [sets, setSets] = useLocalStorage(KEYS.sets, []);
    const [active, setActiveSet] = useState(null);
    const [newName, setNewName] = useState("");

    const createSet = () => {
        if (!newName.trim()) return;
        const s = { id: uid(), name: newName, slots: [], created: today() };
        setSets(ss => [...ss, s]);
        setActiveSet(s.id);
        setNewName("");
    };

    const currentSet = sets.find(s => s.id === active);

    const addJoke = (jid) => {
        if (!currentSet || currentSet.slots.includes(jid)) return;
        setSets(ss => ss.map(s => s.id === active ? { ...s, slots: [...s.slots, jid] } : s));
    };

    const removeJoke = (jid) => setSets(ss => ss.map(s => s.id === active ? { ...s, slots: s.slots.filter(id => id !== jid) } : s));

    const moveJoke = (idx, dir) => {
        if (!currentSet) return;
        const slots = [...currentSet.slots];
        const ni = idx + dir;
        if (ni < 0 || ni >= slots.length) return;
        [slots[idx], slots[ni]] = [slots[ni], slots[idx]];
        setSets(ss => ss.map(s => s.id === active ? { ...s, slots } : s));
    };

    const delSet = (id) => {
        setSets(ss => ss.filter(s => s.id !== id));
        if (active === id) setActiveSet(null);
    };

    const slotsWithData = currentSet ? currentSet.slots.map(id => jokes.find(j => j.id === id)).filter(Boolean) : [];

    const energyColor = j => j.status === "Stage-Ready" && j.score >= 8 ? "var(--green)" :
        j.status === "Stage-Ready" ? "var(--accent)" :
            j.status === "Test Carefully" ? "var(--red)" : "var(--amber)";

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

            {/* Sidebar - Set List */}
            <div style={{ width: 260, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--bg2)" }}>
                <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
                    <div className="section-header" style={{ marginBottom: 12 }}>My Sets</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            placeholder="New set name…"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && createSet()}
                            style={{ flex: 1, padding: "8px 12px" }}
                        />
                        <Button onClick={createSet} variant="primary" style={{ padding: "8px 12px" }}><Plus size={16} /></Button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    {sets.length === 0 && <div style={{ fontSize: 13, color: "var(--text3)", padding: 12, textAlign: "center" }}>No sets drafted yet</div>}

                    {sets.map(s => (
                        <div
                            key={s.id}
                            onClick={() => setActiveSet(s.id)}
                            className="hover-lift"
                            style={{
                                padding: "12px 14px", borderRadius: 8,
                                background: active === s.id ? "rgba(200, 241, 53, 0.1)" : "var(--bg3)",
                                border: `1px solid ${active === s.id ? "rgba(200, 241, 53, 0.3)" : "var(--border)"}`,
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: "all var(--trans-fast)"
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 14, color: active === s.id ? "var(--accent)" : "var(--text)", fontWeight: active === s.id ? 600 : 500, marginBottom: 2 }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: "var(--text3)" }}>{s.slots.length} list items</div>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); delSet(s.id); }}
                                style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 4 }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {!currentSet ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EmptyState icon={FileText} text="Select or create a set" sub="Build your set list and map out the energy arc for the room." />
                </div>
            ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Header Arc */}
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{currentSet.name}</span>
                            <span className="pill">~{slotsWithData.length} min</span>
                            <span className="pill">{slotsWithData.length} items</span>
                        </div>

                        {slotsWithData.length > 0 && (
                            <div style={{ display: "flex", gap: 6, alignItems: "center", height: 40, background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border2)" }}>
                                <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", marginRight: 8, fontWeight: 600 }}>ENERGY ARC</span>
                                {slotsWithData.map((j) => (
                                    <div
                                        key={j.id}
                                        title={j.setup.slice(0, 40)}
                                        style={{ flex: 1, height: "100%", background: energyColor(j), borderRadius: 4, opacity: 0.8, minWidth: 12, transition: "background 0.3s" }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

                        {/* Main Editor */}
                        <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="scrollable">
                            {slotsWithData.length === 0 && <EmptyState icon={LayoutList} text="Empty Setlist" sub="Click jokes from the right panel to add them to this set." />}

                            {slotsWithData.map((j, i) => (
                                <div key={j.id} className="card" style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center", padding: "16px 20px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", paddingRight: 12, borderRight: "1px solid var(--border)" }}>
                                        <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--accent)", fontWeight: 600, width: 24, textAlign: "center" }}>{i + 1}</span>
                                        <button onClick={() => moveJoke(i, -1)} disabled={i === 0} style={{ background: "none", border: "none", color: i === 0 ? "var(--border)" : "var(--text2)", cursor: i === 0 ? "default" : "pointer", padding: 2 }}>
                                            <ChevronUp size={16} />
                                        </button>
                                        <button onClick={() => moveJoke(i, 1)} disabled={i === slotsWithData.length - 1} style={{ background: "none", border: "none", color: i === slotsWithData.length - 1 ? "var(--border)" : "var(--text2)", cursor: i === slotsWithData.length - 1 ? "default" : "pointer", padding: 2 }}>
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                                            <span className="pill" style={{ fontSize: 11 }}>{j.cat}</span>
                                            <StatusTag status={j.status} />
                                            <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text3)", marginLeft: "auto", fontWeight: 500 }}>{killRate(j)}% kill</span>
                                        </div>
                                        <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, marginBottom: 4, fontWeight: 500 }}>{j.setup}</div>
                                        <div style={{ fontSize: 13, color: "var(--text2)", borderLeft: "2px solid var(--accent)", paddingLeft: 10, lineHeight: 1.5 }}>
                                            {j.punch.slice(0, 100)}{j.punch.length > 100 ? "…" : ""}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeJoke(j.id)}
                                        style={{ background: "rgba(255, 76, 76, 0.1)", border: "1px solid rgba(255, 76, 76, 0.2)", color: "var(--red)", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all var(--trans-fast)" }}
                                        className="hover-lift"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Right Panel - Available Jokes */}
                        <div style={{ width: 300, borderLeft: "1px solid var(--border)", background: "var(--bg2)", display: "flex", flexDirection: "column" }}>
                            <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)" }}>
                                <div className="section-header" style={{ margin: 0 }}>Available Material</div>
                            </div>
                            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                                {jokes.filter(j => !currentSet.slots.includes(j.id)).map(j => (
                                    <div
                                        key={j.id}
                                        onClick={() => addJoke(j.id)}
                                        className="hover-lift"
                                        style={{
                                            padding: "14px", borderRadius: 10, border: "1px solid var(--border2)",
                                            marginBottom: 10, cursor: "pointer", background: "var(--bg3)",
                                            transition: "border-color var(--trans-fast)"
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}><StatusTag status={j.status} /></div>
                                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontWeight: 500 }} className="truncate">{j.setup}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
