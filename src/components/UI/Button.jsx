import { Loader2 } from 'lucide-react';

export const Button = ({ children, onClick, variant = "default", size = "md", disabled, className = "", style = {}, icon: Icon }) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: "8px",
    fontFamily: "var(--sans)",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all var(--trans-fast)",
    border: "1px solid",
    opacity: disabled ? 0.6 : 1,
  };
  
  const sizes = {
    sm: { fontSize: 12, padding: "6px 12px" },
    md: { fontSize: 14, padding: "8px 16px" },
    lg: { fontSize: 15, padding: "12px 24px" }
  };
  
  const variants = {
    default:  { background: "var(--bg3)", borderColor: "var(--border2)", color: "var(--text)" },
    primary:  { background: "var(--accent)", borderColor: "var(--accent)", color: "#0A0A0A", fontWeight: 600, boxShadow: "0 4px 12px var(--accent-glow)" },
    ghost:    { background: "transparent", borderColor: "transparent", color: "var(--text2)" },
    danger:   { background: "rgba(255, 76, 76, 0.1)", borderColor: "rgba(255, 76, 76, 0.3)", color: "var(--red)" },
    accent:   { background: "rgba(200, 241, 53, 0.1)", borderColor: "rgba(200, 241, 53, 0.3)", color: "var(--accent)" },
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      className={`hover-lift ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};
