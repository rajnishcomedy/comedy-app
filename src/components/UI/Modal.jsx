import { X } from 'lucide-react';
import { Button } from './Button';

export const Modal = ({ open, onClose, title, children, width = 520 }) => {
    if (!open) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 16
            }}
            className="fade-in"
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border2)",
                    borderRadius: "var(--radius-lg)",
                    width: "100%", maxWidth: width,
                    maxHeight: "90vh", overflow: "hidden",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
                    display: "flex", flexDirection: "column"
                }}
                className="fade-in"
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{title}</span>
                    <Button onClick={onClose} variant="ghost" size="sm" icon={X} style={{ padding: 4 }} />
                </div>
                <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};
