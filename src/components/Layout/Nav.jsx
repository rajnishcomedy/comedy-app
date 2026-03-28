import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Library, Mic2, FileText, Zap, Lightbulb,
  Target, LineChart, Users, ChevronRight, ChevronLeft, UserCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'ideas',     label: 'Idea Dump',    icon: Lightbulb },
  { id: 'punchup',   label: 'Punch-Up',     icon: Zap },
  { id: 'drill',     label: 'Premise Drill',icon: Target },
  { id: 'jokes',     label: 'Joke Bank',    icon: Library },
  { id: 'sets',      label: 'Set Builder',  icon: FileText },
  { id: 'shows',     label: 'Show Log',     icon: Mic2 },
  { id: 'hustle',    label: 'Hustle',       icon: Users },
  { id: 'analytics', label: 'Analytics',    icon: LineChart },
  { id: 'account',   label: 'Account',      icon: UserCircle },
];

export const Nav = ({ active, setActive }) => {
  const getInitialCollapsed = () => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav style={{
      width: collapsed ? 64 : 240,
      flexShrink: 0,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', minHeight: 64 }}>
        {!collapsed && (
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--accent)',
            letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700,
          }}>Carlin</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 6, borderRadius: '50%', marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="hover-lift"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: collapsed ? '12px 0' : '10px 14px',
                borderRadius: 'var(--radius)',
                border: 'none',
                background: isActive ? 'var(--bg3)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--trans)',
                marginBottom: 4,
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 600 : 400,
                position: 'relative',
              }}
              className="hover-lift"
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
            >
              {/* Active left border */}
              {isActive && (
                <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: 'var(--accent)', borderRadius: 2 }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Bottom reminder (expanded only) */}
      {!collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', lineHeight: 1.8 }}>
            <div style={{ color: 'var(--accent)', marginBottom: 4 }}>∙ Laugh trigger = last word</div>
            <div>∙ Setup: straight truth only</div>
            <div>∙ Tags: shatter assumption</div>
          </div>
        </div>
      )}
    </nav>
  );
};
