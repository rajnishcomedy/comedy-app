import { killRate, fmtDate } from '../utils';
import { Button } from '../components/UI';
import {
    PenTool, Zap, Lightbulb, FileText, Mic2, Target, CheckCircle2, TrendingUp, AlertCircle
} from 'lucide-react';

const StatCard = ({ label, value, sub, color = "var(--accent)" }) => (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: color, filter: "blur(40px)", opacity: 0.15, borderRadius: "50%" }} />
        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--mono)", color, lineHeight: 1.1, textShadow: `0 0 20px ${color}44` }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{sub}</div>}
    </div>
);

const QuickAction = ({ icon: Icon, label, tab, color = "var(--text)", setActive }) => (
    <div
        onClick={() => setActive(tab)}
        className="card hover-lift"
        style={{
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer", transition: "all var(--trans-base)",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)"
        }}
    >
        <div style={{
            width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.1)"
        }}>
            <Icon size={20} color={color} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{label}</span>
    </div>
);

export default function Dashboard({ jokes, shows, ideas, setActive }) {
    const ready = jokes.filter(j => j.status === "Stage-Ready").length;
    const punch = jokes.filter(j => j.status === "Punch-Up Needed").length;
    const avgKill = jokes.length ? Math.round(jokes.reduce((a, j) => a + killRate(j), 0) / jokes.length) : 0;

    // Guard against no tested jokes for top killer
    const testedJokes = jokes.filter(j => j.performed > 0);
    const topJoke = testedJokes.length > 0 ? [...testedJokes].sort((a, b) => killRate(b) - killRate(a))[0] : null;

    const recentShow = shows.length > 0 ? [...shows].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

    return (
        <div style={{ padding: 32, overflowY: "auto", height: "100%" }} className="fade-in scrollable">
            <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--sans)", fontSize: 28, color: "var(--text)", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>
                        Good evening, <span style={{ color: "var(--accent)" }}>Comic.</span>
                    </h1>
                    <p style={{ color: "var(--text2)", fontSize: 14 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                <StatCard label="Total Jokes" value={jokes.length} sub={`${ready} stage-ready`} />
                <StatCard label="Kill Rate Avg" value={`${avgKill}%`} sub="across all material" color="var(--green)" />
                <StatCard label="Shows Logged" value={shows.length} sub="in show log" color="var(--purple)" />
                <StatCard label="Raw Ideas" value={ideas.filter(i => !i.promoted).length} sub="waiting in dump" color="var(--blue)" />
                <StatCard label="Need Punch-Up" value={punch} sub="in the queue" color={punch > 0 ? "var(--amber)" : "var(--text3)"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                {topJoke && (
                    <div className="card" style={{ position: "relative" }}>
                        <div className="section-header" style={{ color: "var(--green)" }}><TrendingUp size={14} /> Top killer</div>
                        <div style={{ fontSize: 15, color: "var(--text)", marginBottom: 12, lineHeight: 1.6, fontWeight: 500 }}>"{topJoke.setup}"</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div style={{ fontFamily: "var(--mono)", fontSize: 24, color: "var(--green)", fontWeight: 700 }}>{killRate(topJoke)}%</div>
                            <div style={{ fontSize: 12, color: "var(--text2)", display: "flex", flexDirection: "column" }}>
                                <span>Kill Rate</span>
                                <span>{topJoke.performed} performances</span>
                            </div>
                        </div>
                    </div>
                )}
                {recentShow && (
                    <div className="card">
                        <div className="section-header" style={{ color: "var(--blue)" }}><Mic2 size={14} /> Last show</div>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{recentShow.venue}</div>
                        <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="pill">{fmtDate(recentShow.date)}</span>
                            <span className="pill">{recentShow.city}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text)", background: "rgba(16, 185, 129, 0.1)", padding: 10, borderRadius: 8, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                            <span style={{ color: "var(--green)", fontWeight: 600, marginRight: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Killed:</span>
                            {recentShow.killed?.slice(0, 60) || "—"}
                        </div>
                    </div>
                )}
            </div>

            <div className="section-header"><CheckCircle2 size={16} /> Quick actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                <QuickAction icon={PenTool} label="Write a new joke" tab="jokes" color="var(--accent)" setActive={setActive} />
                <QuickAction icon={Zap} label="Punch up a weak bit" tab="punchup" color="var(--amber)" setActive={setActive} />
                <QuickAction icon={Lightbulb} label="Dump a new idea" tab="ideas" color="var(--blue)" setActive={setActive} />
                <QuickAction icon={FileText} label="Build tonight's set" tab="sets" color="var(--purple)" setActive={setActive} />
                <QuickAction icon={Mic2} label="Log last night's show" tab="shows" color="var(--green)" setActive={setActive} />
                <QuickAction icon={Target} label="Run a premise drill" tab="drill" color="var(--red)" setActive={setActive} />
            </div>

            <div style={{ marginTop: 32 }} className="card">
                <div className="section-header"><AlertCircle size={16} /> Framework quick-ref</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                        ["Laugh Trigger", "MUST be the last word. Not second-to-last. Last."],
                        ["Setup Rule", "Active present tense. Never attempt funny in setup."],
                        ["Tag Mechanic", "Shatter same / different / new assumption. No new setup."],
                        ["Attitude Formula", "Weird · Scary · Hard · Stupid — pick one angle per premise."],
                    ].map(([k, v]) => (
                        <div key={k} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--accent)", marginBottom: 4, fontWeight: 600, letterSpacing: "0.05em" }}>{k}</div>
                            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
