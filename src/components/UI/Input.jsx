export const Input = ({ label, value, onChange, placeholder, multiline, rows = 3, type = "text", style = {}, className = "", onKeyDown }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }} className={className}>
        {label && (
            <label style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--text3)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                {label}
            </label>
        )}
        {multiline ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                onKeyDown={onKeyDown}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                onKeyDown={onKeyDown}
            />
        )}
    </div>
);
