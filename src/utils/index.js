// Generators
export const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
};

export const today = () => new Date().toISOString().slice(0, 10);

// Formatters
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: '2-digit'
  }) : '—';

export const killRate = (j) => {
  const perf = Number(j.performed) || 0;
  const kill = Number(j.killed) || 0;
  return perf > 0 ? Math.round((kill / perf) * 100) : 0;
};

// Collections
export const STATUS_ORDER = [
  'Stage-Ready', 'Punch-Up Needed', 'Test Carefully', 'Raw', 'Retired'
];

export const CATEGORIES = [
  'Middle Class', 'Family', 'Delhi', 'Delhi Metro', 'Bihar/Identity',
  'Religion', 'Society', 'Politics', 'Corporate', 'Health/Hospital',
  'Confidence', 'Relationships', 'Body/Roast', 'Social Media',
  'Motivation', 'Dark/Absurd', 'Pop Culture', 'Language', 'Smokers',
  'Observation', 'Other'
];

export const MAKERS = [
  'Association', 'Pop Culture Link', 'Question', 'Play on Words',
  'Exaggeration', 'Reversal', 'State the Obvious', 'Comparison', 'Definition'
];

export const ATTITUDES = ['Weird', 'Scary', 'Hard', 'Stupid'];

export const ATTITUDE_COLORS = {
  Weird:  '#2E90FF',
  Scary:  '#FF4C4C',
  Hard:   '#FFB020',
  Stupid: '#B57BFF',
};

export const VENUES_NCR = [
  'Laugh Store', 'Lightroom', 'Happy High', 'Laughter Nation', 'Bailley',
  'Guftagoo', 'Depot 48', 'Get Set Go Studio', 'Supertalks',
  'Coofeana Comedy Theater', 'SDA Open Mic', 'Comedy Theater Gurgaon', 'Other'
];

// LocalStorage keys
export const KEYS = {
  jokes: 'cws_jokes',
  shows: 'cws_shows',
  ideas: 'cws_ideas',
  sets:  'cws_sets',
  activeTab: 'cws_tab',
  tasks: 'cws_tasks',
  profile: 'cws_profile',
  seeded: 'cws_seeded',
};

// Laugh trigger validator
export function checkLaughTrigger(punch) {
  if (!punch || punch.trim().length < 10) return null;
  const words = punch.trim().replace(/[.!?]+$/, '').split(/\s+/);
  const last = words[words.length - 1]?.toLowerCase() ?? '';
  const weak = [
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at',
    'to', 'of', 'it', 'this', 'that', 'and', 'but', 'or', 'so', 'very',
    'really', 'just', 'also', 'too', 'not',
  ];
  return {
    isWeak: weak.includes(last),
    lastWord: words[words.length - 1],
    warning: weak.includes(last)
      ? `"${words[words.length - 1]}" is a weak ender — laugh trigger must be the very last word.`
      : null,
  };
}

// Greeting by time of day
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Late night grind';
}
