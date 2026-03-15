import React, { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Nav } from "./components/Layout/Nav";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { KEYS } from "./utils";
import { INITIAL_JOKES, INITIAL_SHOWS, INITIAL_IDEAS } from "./data/initialData";

import Dashboard from "./features/Dashboard";
import JokeBank from "./features/JokeBank";
import SetBuilder from "./features/SetBuilder";
import ShowLog from "./features/ShowLog";
import PunchUpWorkshop from "./features/PunchUpWorkshop";
import IdeaDump from "./features/IdeaDump";
import PremiseDrill from "./features/PremiseDrill";
import Analytics from "./features/Analytics";
import HustleTracker from "./features/HustleTracker";

export default function App() {
  const [activeTab, setActiveTab] = useLocalStorage(KEYS.activeTab, "dashboard");
  const [jokes, setJokes] = useLocalStorage(KEYS.jokes, INITIAL_JOKES);
  const [shows, setShows] = useLocalStorage(KEYS.shows, INITIAL_SHOWS);
  const [ideas, setIdeas] = useLocalStorage(KEYS.ideas, INITIAL_IDEAS);
  const [syncing, setSyncing] = useState(false);

  const syncTimeoutRef = React.useRef(null);

  const simulateSync = useCallback(() => {
    setSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => setSyncing(false), 800);
  }, []);

  useEffect(() => {
    const id = setInterval(simulateSync, 45000);
    return () => {
      clearInterval(id);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [simulateSync]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Nav active={activeTab} setActive={setActiveTab} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "url('https://www.transparenttextures.com/patterns/cubes.png') repeat", backgroundBlendMode: "overlay" }}>

        <header style={{
          height: 64,
          background: "var(--bg2)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          justifyContent: "space-between",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          flexShrink: 0
        }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 16, color: "var(--text)", fontWeight: 500, textTransform: "capitalize" }}>
            {activeTab.replace('-', ' ')}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{
              fontSize: 12,
              fontFamily: "var(--mono)",
              color: syncing ? "var(--accent)" : "var(--text3)",
              display: "flex",
              alignItems: "center",
              gap: 6
            }} className={syncing ? "pulse" : ""}>
              {syncing ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
              {syncing ? "SYNCING..." : "SYNCED"}
            </span>
            <button
              onClick={simulateSync}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text2)", cursor: "pointer", fontSize: 12, padding: "4px 8px", borderRadius: 6 }}
              className="hover-lift"
            >
              Refresh
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {activeTab === "dashboard" && <Dashboard jokes={jokes} shows={shows} ideas={ideas} setActive={setActiveTab} />}
          {activeTab === "jokes" && <JokeBank jokes={jokes} setJokes={setJokes} />}
          {activeTab === "sets" && <SetBuilder jokes={jokes} />}
          {activeTab === "shows" && <ShowLog shows={shows} setShows={setShows} />}
          {activeTab === "punchup" && <PunchUpWorkshop jokes={jokes} setJokes={setJokes} />}
          {activeTab === "ideas" && <IdeaDump ideas={ideas} setIdeas={setIdeas} setJokes={setJokes} />}
          {activeTab === "drill" && <PremiseDrill setJokes={setJokes} />}
          {activeTab === "analytics" && <Analytics jokes={jokes} shows={shows} />}
          {activeTab === "hustle" && <HustleTracker shows={shows} />}
        </main>

      </div>
    </div>
  );
}
