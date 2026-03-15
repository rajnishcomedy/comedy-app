export const StatusTag = ({ status, className = "" }) => {
    const cls = {
        "Stage-Ready": "tag-ready",
        "Punch-Up Needed": "tag-punch",
        "Test Carefully": "tag-test",
        "Raw": "tag-raw",
        "Retired": "tag-retired"
    };
    return <span className={`tag ${cls[status] || "tag-raw"} ${className}`}>{status}</span>;
};
