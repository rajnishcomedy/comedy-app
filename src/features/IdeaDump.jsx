import { useState } from 'react';
import { uid, today, fmtDate, ATTITUDES } from '../utils';
import { Button, EmptyState } from '../components/UI';
import { Lightbulb, Trash2, ArrowRight } from 'lucide-react';

export default function IdeaDump({ ideas, setIdeas, setJokes }) {
    const [input, setInput] = useState("");
    const [attitude, setAttitude] = useState("Weird");
    const [source] = useState("Observation");
    const [filterA, setFilterA] = useState("All");

    const add = () => {
        if (!input.trim()) return;
        setIdeas(is => [{ id: uid(), idea: input, attitude, source, angle: "", promoted: false, date: today() }, ...is]);
        setInput("");
    };

    const promote = (id) => {
        const idea = ideas.find(i => i.id === id);
        if (!idea) return;
        setJokes(js => [{
            id: uid(), cat: "Other", setup: idea.idea, punch: "", tags: ["", "", ""],
            status: "Raw", score: 5, notes: `From idea dump: ${idea.date} - Angle: ${idea.angle}`, maker: "—",
            created: today(), performed: 0, killed: 0
        }, ...js]);
        setIdeas(is => is.map(i => i.id === id ? { ...i, promoted: true } : i));
    };

    const del = id => setIdeas(is => is.filter(i => i.id !== id));

    const updateAngle = (id, v) => setIdeas(is => is.map(i => i.id === id ? { ...i, angle: v } : i));

    const filtered = ideas.filter(i => filterA === "All" || i.attitude === filterA);

    const attColors = {
        Weird: "var(--blue)",
        Scary: "var(--red)",
        Hard: "var(--amber)",
        Stupid: "var(--purple)"
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", position: "relative", zIndex: 10 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Dump a raw thought</h2>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && add()}
                        placeholder="Raw observation, premise, overheard line, anything..."
                        style={{ flex: 1, padding: "14px 20px", fontSize: 15, borderRadius: 12, border: "1px solid var(--border2)", background: "rgba(0,0,0,0.2)" }}
                    />
                    <Button onClick={add} variant="primary" style={{ padding: "0 24px" }}>Dump It</Button>
                </div>

                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>Tag Attitude:</span>
                        {ATTITUDES.map(a => (
                            <button
                                key={a}
                                onClick={() => setAttitude(a)}
                                style={{
                                    padding: "6px 14px", borderRadius: 20,
                                    border: `1px solid ${attitude === a ? attColors[a] : "var(--border)"}`,
                                    background: attitude === a ? `${attColors[a]}15` : "transparent",
                                    color: attitude === a ? attColors[a] : "var(--text3)",
                                    fontSize: 12, fontFamily: "var(--sans)", fontWeight: 500, cursor: "pointer",
                                    transition: "all var(--trans-fast)"
                                }}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: 1, height: 24, background: "var(--border)" }} />

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 4 }}>Filter View:</span>
                        {["All", ...ATTITUDES].map(a => (
                            <button
                                key={a}
                                onClick={() => setFilterA(a)}
                                style={{
                                    padding: "6px 14px", borderRadius: 20,
                                    border: `1px solid ${filterA === a ? "var(--text2)" : "transparent"}`,
                                    background: filterA === a ? "var(--bg3)" : "transparent",
                                    color: filterA === a ? "var(--text)" : "var(--text3)",
                                    fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all var(--trans-fast)"
                                }}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 32, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 20, alignContent: "start" }} className="fade-in scrollable">
                {filtered.length === 0 && <div style={{ gridColumn: "1 / -1" }}><EmptyState icon={Lightbulb} text="Dump is empty" sub="Type anything above. No filter. No judgment." /></div>}

                {filtered.map(i => (
                    <div key={i.id} className="card" style={{ opacity: i.promoted ? 0.6 : 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                            <span style={{
                                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                                background: `${attColors[i.attitude]}15`,
                                color: attColors[i.attitude], fontFamily: "var(--mono)", fontWeight: 600,
                                border: `1px solid ${attColors[i.attitude]}33`
                            }}>
                                {i.attitude}
                            </span>
                            <span className="pill" style={{ fontSize: 11 }}>{i.source}</span>
                            <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)" }}>{fmtDate(i.date)}</span>
                            {i.promoted && <span style={{ fontSize: 10, color: "var(--green)", fontFamily: "var(--mono)", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 4 }}>PROMOTED</span>}
                        </div>

                        <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.6, marginBottom: 16, fontWeight: 400 }}>{i.idea}</div>

                        <div style={{ marginTop: "auto" }}>
                            <input
                                value={i.angle || ""}
                                onChange={e => updateAngle(i.id, e.target.value)}
                                placeholder="Possible angle — what's weird/scary/hard/stupid about this?"
                                style={{ fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(255,255,255,0.02)" }}
                            />

                            <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                                <Button onClick={() => del(i.id)} variant="ghost" size="sm" icon={Trash2} style={{ paddingLeft: 8, paddingRight: 8 }} />
                                {!i.promoted ? (
                                    <Button onClick={() => promote(i.id)} variant="accent" size="sm" icon={ArrowRight}>Move to Joke Bank</Button>
                                ) : (
                                    <span style={{ fontSize: 12, color: "var(--text3)", alignSelf: "center", fontStyle: "italic" }}>Sent to Joke Bank</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
