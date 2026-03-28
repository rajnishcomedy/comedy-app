import { useState } from 'react';
import { LayoutDashboard, Library, FileText, Menu, X, Mic2, Zap, Lightbulb, Target, LineChart, Users, UserCircle } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'ideas',     label: 'Idea Dump',    icon: Lightbulb },
  { id: 'punchup',   label: 'Punch-Up',     icon: Zap },
  { id: 'drill',     label: 'Premise Drill',icon: Target },
  { id: 'shows',     label: 'Show Log',     icon: Mic2 },
  { id: 'hustle',    label: 'Hustle',       icon: Users },
  { id: 'analytics', label: 'Analytics',    icon: LineChart },
  { id: 'account',   label: 'Account',      icon: UserCircle },
];

export const MobileNav = ({ active, setActive }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const TABS = [
    { id: 'dashboard', label: 'Dash', icon: LayoutDashboard },
    { id: 'jokes',     label: 'Jokes', icon: Library },
    { id: 'sets',      label: 'Sets',  icon: FileText },
  ];

  return (
    <>
      <nav 
        className="mobile-only" 
        style={{
          width: '100%',
          height: 64,
          background: 'var(--bg2)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 100,
          flexShrink: 0
        }}
      >
        {TABS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setMenuOpen(false); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, background: 'transparent', border: 'none', cursor: 'pointer',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                flex: 1, padding: '8px 0',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontFamily: 'var(--sans)', fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, background: 'transparent', border: 'none', cursor: 'pointer',
            color: menuOpen ? 'var(--accent)' : 'var(--text2)',
            flex: 1, padding: '8px 0',
            transition: 'all 0.2s'
          }}
        >
          {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={1.5} />}
          <span style={{ fontSize: 10, fontFamily: 'var(--sans)', fontWeight: menuOpen ? 600 : 500 }}>More</span>
        </button>
      </nav>

      {/* Slide-up Menu Drawer */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 64,
          background: 'rgba(0,0,0,0.8)', zIndex: 90,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease forwards'
        }} onClick={() => setMenuOpen(false)}>
          <div style={{
            background: 'var(--bg)', borderTop: '1px solid var(--border)',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '24px 16px', maxHeight: '70vh', overflowY: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, paddingLeft: 8 }}>
              Tools & Settings
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {MENU_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActive(item.id); setMenuOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: isActive ? 'var(--bg3)' : 'transparent',
                      border: 'none', borderRadius: 12, padding: '16px 20px',
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                      fontSize: 15, fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    <Icon size={20} color={isActive ? 'var(--accent)' : 'var(--text2)'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
