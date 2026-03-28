import { useMemo } from 'react';
import { killRate } from '../utils';
import { Target, AlertTriangle, BarChart as BarChartIcon } from 'lucide-react';

const getPerfHeatmap = (ws) => {
    if (ws >= 1.5) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, var(--bg2) 100%)';
    if (ws < 0.5) return 'linear-gradient(135deg, rgba(255, 76, 76, 0.1) 0%, var(--bg2) 100%)';
    return 'var(--bg2)';
};

export default function Analytics({ jokes, shows }) {
    const cats = [...new Set(jokes.map(j => j.cat))];

    const catData = cats.map(c => {
        const jj = jokes.filter(j => j.cat === c);
        return {
            cat: c,
            total: jj.length,
            ready: jj.filter(j => j.status === "Stage-Ready").length,
            avgKill: jj.length ? Math.round(jj.reduce((a, j) => a + killRate(j), 0) / jj.length) : 0
        };
    }).sort((a, b) => b.avgKill - a.avgKill);

    const topKillers = [...jokes].filter(j => j.performed > 0).sort((a, b) => killRate(b) - killRate(a)).slice(0, 7);
    const needsWork = [...jokes].filter(j => j.performed > 0).sort((a, b) => killRate(a) - killRate(b)).slice(0, 7);
    const untested = jokes.filter(j => j.performed === 0);

    const totalShows = shows.length;
    const avgScore = shows.length ? (shows.reduce((a, s) => a + s.score, 0) / shows.length).toFixed(1) : "—";

    // Calculate Weighted Performance from Show Results
    const jokePerformance = useMemo(() => {
        const stats = {};
        shows.forEach(s => {
            if (!s.results) return;
            Object.entries(s.results).forEach(([jid, score]) => {
                if (!stats[jid]) stats[jid] = { total: 0, count: 0 };
                stats[jid].total += score;
                stats[jid].count += 1;
            });
        });

        return jokes.map(j => {
            const st = stats[j.id];
            const weightedScore = st ? (st.total / st.count).toFixed(2) : 0;
            return { ...j, weightedScore: parseFloat(weightedScore), logCount: st?.count || 0 };
        }).filter(j => j.logCount > 0).sort((a, b) => b.weightedScore - a.weightedScore);
    }, [jokes, shows]);

    // Custom visual component for bars
    const VisualBar = ({ percent, color }) => (
        <div style={{ flex: 1, height: 8, background: "var(--bg3)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }} />
        </div>
    );

    return (
        <div style={{ padding: 40, overflowY: "auto", height: "100%" }} className="fade-in scrollable">

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                {[
                    ["Total Jokes", jokes.length, "var(--text)"],
                    ["Stage-Ready", jokes.filter(j => j.status === "Stage-Ready").length, "var(--green)"],
                    ["Avg Kill Rate", `${jokes.filter(j => j.performed > 0).length ? Math.round(jokes.filter(j => j.performed > 0).reduce((a, j) => a + killRate(j), 0) / jokes.filter(j => j.performed > 0).length) : 0}%`, "var(--accent)"],
                    ["Shows Logged", totalShows, "var(--blue)"],
                    ["Avg Show Score", avgScore, "var(--amber)"],
                    ["Untested", untested.length, "var(--text3)"],
                ].map(([l, v, c]) => (
                    <div key={l} className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 600 }}>{l}</div>
                        <div style={{ fontSize: 32, fontFamily: "var(--mono)", color: c, fontWeight: 700, lineHeight: 1.1 }}>{v}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginBottom: 32, padding: 32 }}>
                <div className="section-header" style={{ marginBottom: 24 }}><BarChartIcon size={16} /> Kill Rate by Category</div>
                <div style={{ display: "grid", gap: 16 }}>
                    {catData.map(d => (
                        <div key={d.cat} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "var(--text)", width: 140, flexShrink: 0, fontWeight: 500 }} className="truncate">{d.cat}</span>

                            <VisualBar percent={d.avgKill} color={d.avgKill >= 70 ? "var(--accent)" : d.avgKill >= 40 ? "var(--amber)" : "var(--red)"} />

                            <span style={{ fontSize: 13, fontFamily: "var(--mono)", color: d.avgKill >= 70 ? "var(--accent)" : "var(--text)", minWidth: 40, fontWeight: 600, textAlign: "right" }}>
                                {d.avgKill}%
                            </span>
                            <span style={{ fontSize: 11, color: "var(--text3)", minWidth: 60, textAlign: "right" }}>
                                {d.ready} / {d.total}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 32, padding: 32 }}>
                <div className="section-header" style={{ marginBottom: 24 }}><Target size={16} /> Performance Impact per Bit</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {jokePerformance.slice(0, 6).map(j => (
                        <div key={j.id} className="hover-lift" style={{ padding: 18, background: getPerfHeatmap(j.weightedScore), borderRadius: 12, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12, transition: "transform var(--trans-base)" }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.4 }} className="truncate-2">{j.setup}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>{j.logCount} SHOWS</span>
                                    {j.weightedScore >= 1.5 ? <span style={{ fontSize: 10, background: "var(--green)", color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>ELITE</span> :
                                     j.weightedScore >= 0.5 ? <span style={{ fontSize: 10, background: "var(--accent)", color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>SOLID</span> :
                                     <span style={{ fontSize: 10, background: "rgba(255, 76, 76, 0.15)", color: "var(--red)", border: "1px solid rgba(255, 76, 76, 0.2)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>FIX</span>}
                                </div>
                                <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: j.weightedScore >= 1 ? "var(--green)" : j.weightedScore >= 0 ? "var(--accent)" : "var(--red)", fontWeight: 700 }}>
                                    {j.weightedScore > 0 ? `+${j.weightedScore}` : j.weightedScore}
                                </div>
                            </div>
                        </div>
                    ))}
                    {jokePerformance.length === 0 && <div style={{ fontSize: 13, color: "var(--text3)", gridColumn: "1/-1" }}>Log performances in your shows to see detailed bit impact.</div>}
                </div>
            </div>

            <div className="grid-half" style={{ gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 24 }}>
                    <div className="section-header" style={{ color: "var(--green)" }}><Target size={16} /> Consistent Killers</div>
                    {topKillers.length === 0 && <div style={{ fontSize: 13, color: "var(--text3)" }}>Perform more shows to generate data.</div>}

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {topKillers.map((j, i) => (
                            <div key={j.id} style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 16, borderBottom: i < topKillers.length - 1 ? "1px solid var(--border)" : "none" }}>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 20, color: "var(--green)", minWidth: 48, fontWeight: 700 }}>{killRate(j)}%</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4, fontWeight: 500, marginBottom: 4 }} className="truncate">{j.setup}</div>
                                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{j.performed} shows · {j.cat}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div className="section-header" style={{ color: "var(--red)" }}><AlertTriangle size={16} /> Needs Rework (Bombing)</div>
                    {needsWork.length === 0 && <div style={{ fontSize: 13, color: "var(--text3)" }}>Perform more shows to generate data.</div>}

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {needsWork.map((j, i) => (
                            <div key={j.id} style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 16, borderBottom: i < needsWork.length - 1 ? "1px solid var(--border)" : "none" }}>
                                <span style={{ fontFamily: "var(--mono)", fontSize: 20, color: "var(--red)", minWidth: 48, fontWeight: 700 }}>{killRate(j)}%</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4, fontWeight: 500, marginBottom: 4 }} className="truncate">{j.setup}</div>
                                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{j.performed} shows · {j.cat}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
