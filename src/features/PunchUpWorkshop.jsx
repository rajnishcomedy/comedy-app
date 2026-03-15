import { useState } from 'react';
import { Button, StatusTag, Spinner, EmptyState } from '../components/UI';
import { killRate } from '../utils';
import { Zap, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   AI PUNCH-UP (Anthropic API Mock/Integration)
   Keeping the original fetch logic
───────────────────────────────────────────────────────────── */
async function runAIPunchUp(setup, punch, maker) {
    const prompt = `You are an expert stand-up comedy writer trained in Greg Dean's joke structure and Joe Toplyn's punch-line makers.

Setup: "${setup}"
Current punchline: "${punch}"
Current punch-line maker: ${maker || "unknown"}

Generate exactly 6 alternative punchlines — one for each of Toplyn's 6 makers:
1. Association — link two associations of the topic
2. Pop Culture Link — connect to a known reference
3. Question — pose a question the audience answers mentally
4. Play on Words — pun, double meaning, or wordplay
5. Exaggeration — push a characteristic to absurdity
6. Reversal — flip the expected outcome completely

Rules (CRITICAL):
- The laugh trigger (the most surprising word/phrase) MUST be the VERY LAST word of each punchline. Not second-to-last. LAST.
- Keep the setup intact — only rewrite the punchline
- Write in a mix of English and Hinglish appropriate for Indian stand-up
- Each punchline must be one sentence maximum
- Be brutal, specific, and original — no generic jokes

Respond ONLY as valid JSON, no markdown:
{"punchlines":[{"maker":"Association","punch":"...","trigger":"last word here"},{"maker":"Pop Culture Link","punch":"...","trigger":"..."},{"maker":"Question","punch":"...","trigger":"..."},{"maker":"Play on Words","punch":"...","trigger":"..."},{"maker":"Exaggeration","punch":"...","trigger":"..."},{"maker":"Reversal","punch":"...","trigger":"..."}]}`;

    // Since we don't have a valid API key built-in directly for Anthropic, we will mock the return for demonstration if it fails,
    // but keep the original logic intact.
    try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": localStorage.getItem("cws_anthropic_key") || "" },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1000,
                messages: [{ role: "user", content: prompt }]
            })
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message);
        const text = data.content?.map(b => b.text || "").join("") ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    } catch (err) {
        console.warn("AI API Failed, returning mock data:", err);
        // Mocking response to keep UI functional without API keys
        return new Promise(resolve => setTimeout(() => resolve({
            punchlines: [
                { maker: "Association", punch: "Mock association punchline...", trigger: "punchline" },
                { maker: "Pop Culture Link", punch: "Mock pop culture punchline...", trigger: "punchline" },
                { maker: "Question", punch: "Mock question punchline...", trigger: "punchline" },
                { maker: "Play on Words", punch: "Mock pun punchline...", trigger: "punchline" },
                { maker: "Exaggeration", punch: "Mock exaggeration punchline...", trigger: "punchline" },
                { maker: "Reversal", punch: "Mock reversal punchline...", trigger: "punchline" }
            ]
        }), 2000));
    }
}

export default function PunchUpWorkshop({ jokes, setJokes }) {
    const queue = jokes.filter(j => j.status === "Punch-Up Needed" || j.status === "Raw");
    const [selected, setSelected] = useState(null);
    const [aiResults, setAiResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [altPunches, setAltPunches] = useState(["", "", ""]);
    const [winner, setWinner] = useState("");

    const joke = jokes.find(j => j.id === selected);

    const runAI = async () => {
        if (!joke) return;
        setLoading(true); setError(""); setAiResults(null);
        try {
            const res = await runAIPunchUp(joke.setup, joke.punch, joke.maker);
            setAiResults(res.punchlines);
        } catch {
            setError("AI punch-up failed. Ensure you have network connectivity or a valid API key setup.");
        }
        setLoading(false);
    };

    const promoteWinner = () => {
        if (!winner || !selected) return;
        setJokes(js => js.map(j => j.id === selected ? { ...j, punch: winner, status: "Stage-Ready" } : j));
        setWinner(""); setAiResults(null);
        // In actual app, might want to automatically unselect it or advance to next
    };

    const MAKERS_INFO = [
        { name: "Association", hint: "Link two associations of the topic. What does A share with B?" },
        { name: "Pop Culture Link", hint: "Connect to a known reference. What famous thing maps onto this?" },
        { name: "Question", hint: "Pose a question the audience answers in their head." },
        { name: "Play on Words", hint: "Pun, double meaning, or homonym." },
        { name: "Exaggeration", hint: "Push a characteristic to total absurdity." },
        { name: "Reversal", hint: "Flip the expected outcome completely." },
    ];

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            <div style={{ width: 280, borderRight: "1px solid var(--border)", overflowY: "auto", padding: "20px 16px", background: "var(--bg2)" }}>
                <div className="section-header">Punch-Up Queue ({queue.length})</div>
                {queue.length === 0 && <div style={{ fontSize: 13, color: "var(--text3)", padding: 8, textAlign: "center", marginTop: 24 }}>Nothing in the queue. Mark jokes as "Punch-Up Needed" in the Joke Bank.</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {queue.map(j => (
                        <div
                            key={j.id}
                            onClick={() => { setSelected(j.id); setAiResults(null); setWinner(""); setError(""); }}
                            className="hover-lift"
                            style={{
                                padding: "16px", borderRadius: 10, border: `1px solid ${selected === j.id ? "var(--accent)" : "var(--border)"}`,
                                cursor: "pointer", background: selected === j.id ? "rgba(200, 241, 53, 0.05)" : "var(--bg3)",
                                transition: "all var(--trans-fast)", position: "relative", overflow: "hidden"
                            }}
                        >
                            {selected === j.id && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--accent)" }} />}
                            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}><StatusTag status={j.status} /></div>
                            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, fontWeight: 500 }} className="truncate">{j.setup}</div>
                            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, fontFamily: "var(--mono)" }}>Kill: {killRate(j)}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {!joke ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EmptyState icon={Zap} text="Select a joke to punch up" sub="Choose an item from the queue to start working." />
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: "auto", padding: 32 }} className="fade-in scrollable">
                    <div className="card" style={{ marginBottom: 24, border: "1px solid rgba(255,176,32,0.3)" }}>
                        <div className="section-header" style={{ color: "var(--amber)" }}>Working on</div>
                        <div style={{ fontSize: 15, color: "var(--text)", marginBottom: 12, lineHeight: 1.6, fontWeight: 500 }}>
                            <span style={{ color: "var(--text3)", fontSize: 11, fontFamily: "var(--mono)", marginRight: 10 }}>SETUP</span>
                            {joke.setup}
                        </div>
                        <div style={{ fontSize: 15, color: "var(--red)", borderLeft: "3px solid var(--red)", paddingLeft: 12, lineHeight: 1.6 }}>
                            <span style={{ color: "var(--text3)", fontSize: 11, fontFamily: "var(--mono)", marginRight: 10 }}>CURRENT (weak)</span>
                            {joke.punch}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                        <div>
                            <div className="section-header">Manual alternatives (write 3)</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                                {MAKERS_INFO.slice(0, 3).map((m, i) => (
                                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--bg2)", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600 }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: "var(--text3)", maxWidth: "70%", textAlign: "right", lineHeight: 1.4 }}>{m.hint}</div>
                                        </div>
                                        <input
                                            value={altPunches[i]}
                                            onChange={e => setAltPunches(p => [...p.slice(0, i), e.target.value, ...p.slice(i + 1)])}
                                            placeholder={`Draft punchline here…`}
                                            style={{ marginTop: 4 }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="section-header">AI Assistant</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "24px 20px", background: "rgba(200, 241, 53, 0.05)", borderRadius: 16, border: "1px solid rgba(200, 241, 53, 0.2)", marginBottom: 24 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>Toplyn Punch-Up Runner</div>
                                    <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>Generates 6 brutally specific alternatives using Toplyn's joke structures. (Mocked response by default if API key is not in localStorage).</div>
                                </div>
                                <Button onClick={runAI} variant="primary" icon={loading ? null : Zap} disabled={loading} style={{ alignSelf: "flex-start", transition: "all var(--trans-base)" }}>
                                    {loading ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Spinner size={16} color="#000" /> Generating…</div> : "Run AI"}
                                </Button>
                            </div>

                            {error && <div style={{ padding: "12px 16px", background: "rgba(255, 76, 76, 0.1)", border: "1px solid rgba(255, 76, 76, 0.2)", borderRadius: 8, fontSize: 13, color: "var(--red)", marginBottom: 20 }}>{error}</div>}

                            {aiResults && (
                                <div className="fade-in" style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                                    <div className="section-header" style={{ margin: 0 }}>AI generated options</div>
                                    <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>Click one to promote it as the winner.</div>

                                    {aiResults.map((r, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setWinner(r.punch)}
                                            className="hover-lift"
                                            style={{
                                                padding: "16px", borderRadius: 12,
                                                border: `1px solid ${winner === r.punch ? "var(--accent)" : "var(--border)"}`,
                                                background: winner === r.punch ? "rgba(200, 241, 53, 0.08)" : "var(--bg3)",
                                                cursor: "pointer", transition: "all var(--trans-fast)"
                                            }}
                                        >
                                            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyItems: "space-between", marginBottom: 8 }}>
                                                <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 600, textTransform: "uppercase" }}>{r.maker}</span>
                                                {r.trigger && <span style={{ fontSize: 10, background: "rgba(200, 241, 53, 0.15)", color: "var(--accent)", padding: "2px 8px", borderRadius: 20, fontFamily: "var(--mono)" }}>Trigger: {r.trigger}</span>}
                                            </div>
                                            <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{r.punch}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {winner && (
                                <div className="fade-in" style={{ padding: "20px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 12, marginBottom: 16 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontFamily: "var(--mono)", color: "var(--green)", marginBottom: 10, fontWeight: 600 }}>
                                        <Check size={14} /> WINNER SELECTED
                                    </div>
                                    <div style={{ fontSize: 15, marginBottom: 16, lineHeight: 1.6 }}>{winner}</div>
                                    <Button onClick={promoteWinner} variant="primary" style={{ background: "var(--green)", borderColor: "var(--green)" }} icon={Check}>Apply & Mark Stage-Ready</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
