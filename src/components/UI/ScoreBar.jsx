export const ScoreBar = ({ score, max = 10 }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: "var(--bg4)", borderRadius: 2, overflow: "hidden" }}>
            <div
                style={{
                    width: `${(score / max) * 100}%`,
                    height: "100%",
                    background: score >= 8 ? "var(--accent)" : score >= 6 ? "var(--amber)" : "var(--red)",
                    borderRadius: 2,
                    transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            />
        </div>
        <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--text2)", minWidth: 20, fontWeight: 500 }}>
            {score}
        </span>
    </div>
);
