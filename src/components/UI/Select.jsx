export const Select = ({ label, value, onChange, options, style = {} }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
        {label && (
            <label style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                {label}
            </label>
        )}
        <select value={value} onChange={e => onChange(e.target.value)}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);
