export const EmptyState = ({ icon: Icon, text, sub }) => (
    <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "64px 24px", color: "var(--text3)",
        background: "var(--bg2)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border2)",
        margin: "20px 0"
    }}>
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "50%", marginBottom: 16 }}>
            {Icon && <Icon size={32} color="var(--text2)" strokeWidth={1.5} />}
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>{text}</div>
        {sub && <div style={{ fontSize: 13, color: "var(--text2)", maxWidth: 300, lineHeight: 1.5 }}>{sub}</div>}
    </div>
);
