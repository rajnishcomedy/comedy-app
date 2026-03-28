import { useState, useEffect } from 'react';
import { uid, today, checkLaughTrigger } from '../utils';
import { Button, Input } from '../components/UI';
import { Target, Shuffle, ArrowRight, ArrowLeft, X, Clock, Play, Square, RotateCcw } from 'lucide-react';

export default function PremiseDrill({ setJokes }) {
    const [mode, setMode] = useState("dean");
    const [step, setStep] = useState(0);

    // Dean mode states
    const [setup, setSetup] = useState("");
    const [assumptions, setAssumptions] = useState(["", "", "", "", "", ""]);
    const [target, setTarget] = useState("");
    const [connector, setConnector] = useState("");
    const [punch, setPunch] = useState("");
    const [tags, setTags] = useState(["", ""]);

    // Noun collision states
    const [listA, setListA] = useState(["Middle class", "Corporate job", "Delhi metro", "Religion", "Arranged marriage", "Bihari accent"]);
    const [listB, setListB] = useState(["Drone", "Startup pitch", "ATM", "Pigeon", "Tinder", "Income tax"]);
    const [collisions, setCollisions] = useState(Array(6).fill(""));

    // Timer states
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const trigger = checkLaughTrigger(punch);

    const promoteToBank = () => {
        if (!setup || !punch) return;
        setJokes(js => [{
            id: uid(), cat: "Other", setup, punch, tags: tags.filter(t => t),
            status: "Raw", score: 6, notes: "Generated via Premise Drill", maker: "—",
            created: today(), performed: 0, killed: 0
        }, ...js]);
        // Reset
        setStep(0); setSetup(""); setAssumptions(Array(6).fill(""));
        setTarget(""); setConnector(""); setPunch(""); setTags(["", ""]);
    };

    const DEAN_STEPS = [
        {
            label: "Write your setup",
            hint: "One sentence. Active present tense. No joke attempted. Start general — not with 'I'.",
            field: <Input value={setup} onChange={setSetup} placeholder="Play it straight. Never attempt funny here." multiline rows={3} style={{ background: "rgba(0,0,0,0.2)" }} />
        },
        {
            label: "List 6 assumptions (1st Story)",
            hint: "What does the audience automatically assume from this setup?",
            field: (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {assumptions.map((a, i) => (
                        <Input key={i} value={a} onChange={v => setAssumptions(aa => aa.map((x, xi) => xi === i ? v : x))} placeholder={`Assumption ${i + 1}…`} />
                    ))}
                </div>
            )
        },
        {
            label: "Pick your target assumption",
            hint: "This is the one assumption the punchline will completely destroy.",
            field: <Input value={target} onChange={setTarget} placeholder="The assumption they make that you'll shatter…" multiline rows={2} style={{ background: "rgba(0,0,0,0.2)" }} />
        },
        {
            label: "Find the connector",
            hint: "What word, image, or idea exists in BOTH the 1st Story and 2nd Story? This is your bridge.",
            field: <Input value={connector} onChange={setConnector} placeholder="The overlapping bridge word…" />
        },
        {
            label: "Write the punchline + tags",
            hint: "Last word MUST be the laugh trigger. Then write 2 tags — shatter another assumption.",
            field: (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Input value={punch} onChange={setPunch} placeholder="2nd Story reveal — laugh trigger is the LAST word." multiline rows={3} style={{ background: "rgba(0,0,0,0.2)" }} />
                    {punch && (trigger?.warning
                        ? <div style={{ padding: "10px 14px", background: "rgba(255,176,32,0.1)", border: "1px solid rgba(255,176,32,0.3)", borderRadius: 8, fontSize: 13, color: "var(--amber)" }}>⚠ {trigger.warning}</div>
                        : punch.length > 5 ? <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, fontSize: 13, color: "var(--green)" }}>✓ Laugh trigger lands on: <b style={{ fontWeight: 600 }}>{trigger?.lastWord}</b></div> : null
                    )}

                    <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                        {tags.map((t, i) => (
                            <Input key={i} value={t} onChange={v => setTags(tt => tt.map((x, xi) => xi === i ? v : x))} placeholder={`Tag ${i + 1} — no new setup…`} />
                        ))}
                    </div>
                </div>
            )
        },
    ];

    return (
        <div style={{ padding: 40, overflowY: "auto", height: "100%", maxWidth: 1000, margin: "0 auto" }} className="fade-in scrollable">

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
                <div style={{ display: "flex", gap: 12, background: "rgba(0,0,0,0.2)", padding: 6, borderRadius: 12, width: "fit-content" }}>
                    <button
                        onClick={() => setMode("dean")}
                    style={{
                        padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: mode === "dean" ? "var(--bg3)" : "transparent",
                        color: mode === "dean" ? "var(--text)" : "var(--text2)",
                        fontWeight: 600, transition: "all var(--trans-fast)", display: "flex", alignItems: "center", gap: 8
                    }}
                >
                    <Target size={16} color={mode === "dean" ? "var(--accent)" : "currentColor"} /> Greg Dean 5-Step
                </button>
                <button
                    onClick={() => setMode("noun")}
                    style={{
                        padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: mode === "noun" ? "var(--bg3)" : "transparent",
                        color: mode === "noun" ? "var(--text)" : "var(--text2)",
                        fontWeight: 600, transition: "all var(--trans-fast)", display: "flex", alignItems: "center", gap: 8
                    }}
                >
                    <Shuffle size={16} color={mode === "noun" ? "var(--amber)" : "currentColor"} /> Noun Collision
                </button>
            </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(0,0,0,0.3)", padding: "12px 20px", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Clock size={16} color={isRunning ? "var(--accent)" : "var(--text3)"} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: isRunning ? "var(--accent)" : "var(--text)", width: 60, textAlign: "center" }}>
                            {formatTime(time)}
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button size="sm" onClick={() => setIsRunning(!isRunning)} variant={isRunning ? "ghost" : "primary"} icon={isRunning ? Square : Play} style={{ padding: "6px 12px" }}>
                            {isRunning ? "Pause" : "Start"}
                        </Button>
                        <Button size="sm" onClick={() => { setIsRunning(false); setTime(0); }} variant="ghost" icon={RotateCcw} style={{ padding: "6px 12px" }}>
                            Reset
                        </Button>
                    </div>
                </div>
            </div>

            {mode === "dean" && (
                <div style={{ maxWidth: 700 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                        {DEAN_STEPS.map((_, i) => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "var(--accent)" : "var(--border2)", transition: "background var(--trans-base)" }} />
                        ))}
                    </div>

                    {DEAN_STEPS.map((s, i) => (
                        <div key={i} style={{ display: i === step ? "block" : "none" }} className="fade-in card">
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                    Step {i + 1} of {DEAN_STEPS.length}
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.01em" }}>{s.label}</div>
                                <div style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.5 }}>{s.hint}</div>
                            </div>

                            <div style={{ padding: "0 0 16px 0" }}>{s.field}</div>
                        </div>
                    ))}

                    {setup && step > 0 && (
                        <div className="fade-in" style={{ marginTop: 24, padding: "16px 20px", background: "rgba(200, 241, 53, 0.05)", borderRadius: 12, border: "1px dashed rgba(200, 241, 53, 0.3)" }}>
                            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent)", marginBottom: 6, fontWeight: 600 }}>LOCKED SETUP</div>
                            <div style={{ fontSize: 15, color: "var(--text)", fontWeight: 500, fontStyle: "italic" }}>"{setup}"</div>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
                        {step > 0 && <Button onClick={() => setStep(s => s - 1)} variant="ghost" icon={ArrowLeft} style={{ paddingLeft: 16 }}>Back</Button>}
                        {step < DEAN_STEPS.length - 1 && <Button onClick={() => setStep(s => s + 1)} variant="primary" style={{ padding: "12px 32px", fontSize: 16, marginLeft: "auto" }}>Next Step</Button>}
                        {step === DEAN_STEPS.length - 1 && <Button onClick={promoteToBank} variant="primary" disabled={!punch || !setup} style={{ marginLeft: "auto", background: "var(--green)", borderColor: "var(--green)" }} icon={ArrowRight}>Send to Joke Bank</Button>}
                    </div>
                </div>
            )}

            {mode === "noun" && (
                <div className="fade-in">
                    <div style={{ fontSize: 15, color: "var(--text2)", marginBottom: 24, lineHeight: 1.6, maxWidth: 800 }}>
                        <span style={{ color: "var(--amber)", fontWeight: 600 }}>Helitzer Method:</span> Fill List A (your world) and List B (anything random). Force every A×B collision into a premise. The stranger the pair, the deeper you dig to find the angle. Let the brain panic and connect them.
                    </div>

                    <div className="grid-half" style={{ gap: 24, marginBottom: 24 }}>
                        <div className="card" style={{ padding: 24 }}>
                            <div className="section-header" style={{ color: "var(--blue)" }}>List A — The Premise World</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {listA.map((v, i) => (
                                    <input key={i} value={v} onChange={e => setListA(l => l.map((x, xi) => xi === i ? e.target.value : x))} style={{ fontSize: 14, padding: "12px 16px", background: "rgba(0,0,0,0.2)" }} />
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ padding: 24 }}>
                            <div className="section-header" style={{ color: "var(--purple)" }}>List B — Random Nouns</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {listB.map((v, i) => (
                                    <input key={i} value={v} onChange={e => setListB(l => l.map((x, xi) => xi === i ? e.target.value : x))} style={{ fontSize: 14, padding: "12px 16px", background: "rgba(0,0,0,0.2)" }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <div className="section-header" style={{ color: "var(--amber)" }}><Shuffle size={14} /> Forced Collisions</div>
                        <div className="grid-half" style={{ gap: 20 }}>
                            {listA.map((a, i) => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--text3)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ color: "var(--blue)" }}>{a || `A${i + 1}`}</span> <X size={12} color="var(--border2)" /> <span style={{ color: "var(--purple)" }}>{listB[i] || `B${i + 1}`}</span>
                                    </div>
                                    <input
                                        value={collisions[i]}
                                        onChange={e => setCollisions(c => c.map((x, xi) => xi === i ? e.target.value : x))}
                                        placeholder="Force an angle connecting these two…"
                                        style={{ fontSize: 14, padding: "12px 16px" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
