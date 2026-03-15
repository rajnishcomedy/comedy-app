// Generators
export const uid = () => Math.random().toString(36).slice(2, 9);
export const today = () => new Date().toISOString().slice(0, 10);

// Formatters
export const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "2-digit"
    }) : "—";

export const killRate = (j) => j.performed > 0 ? Math.round((j.killed / j.performed) * 100) : 0;

// Collections
export const STATUS_ORDER = ["Stage-Ready", "Punch-Up Needed", "Test Carefully", "Raw", "Retired"];
export const CATEGORIES = ["Middle Class", "Family", "Delhi", "Delhi Metro", "Bihar/Identity", "Religion", "Society", "Politics", "Corporate", "Health/Hospital", "Confidence", "Relationships", "Body/Roast", "Social Media", "Motivation", "Dark/Absurd", "Pop Culture", "Language", "Smokers", "Observation", "Other"];
export const MAKERS = ["Association", "Pop Culture Link", "Question", "Play on Words", "Exaggeration", "Reversal", "State the Obvious", "Comparison", "Definition"];
export const ATTITUDES = ["Weird", "Scary", "Hard", "Stupid"];
export const VENUES_NCR = ["Laugh Store", "Lightroom", "Happy High", "Laughter Nation", "Bailley", "Guftagoo", "Depot 48", "Get Set Go Studio", "Supertalks", "Coofeana Comedy Theater", "SDA Open Mic", "Comedy Theater Gurgaon", "Other"];

// Constants
export const KEYS = { jokes: "cws_jokes", shows: "cws_shows", ideas: "cws_ideas", sets: "cws_sets", activeTab: "cws_tab" };

// Checkers
export function checkLaughTrigger(punch) {
    if (!punch || punch.trim().length < 10) return null;
    const words = punch.trim().replace(/[.!?]+$/, "").split(/\s+/);
    const last = words[words.length - 1]?.toLowerCase() ?? "";
    const weakEnders = ["the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "of", "it", "this", "that", "and", "but", "or", "so", "very", "really", "just", "also", "too", "not"];
    const isWeak = weakEnders.includes(last);
    const hasComma = punch.includes(",") && !punch.trimEnd().endsWith(",");
    return {
        isWeak,
        lastWord: words[words.length - 1],
        warning: isWeak ? `"${words[words.length - 1]}" is a weak ender — the laugh trigger should be the most surprising word, placed last.` : null
    };
}
