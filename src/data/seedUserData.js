import { uid, today } from '../utils';

/**
 * Seed data written to Firestore when a new user creates an account.
 * Called once on first sign-up.
 */
export function buildSeedJokes() {
  return [
    {
      id: uid(), cat: 'Delhi',
      setup: 'Delhi ki AQI kisi bhi din meri credit score se zyada nahi honi chahiye.',
      punch: 'Ek baat toh hai — dono improve nahi ho rahe.',
      tags: [
        'Sheila Dixit thi, phir Kejriwal — equal opportunity diya, sabko barbad karne ka.',
        'Sarkaarein badal jaati hain. AQI wahi ka wahi.',
        '',
      ],
      status: 'Stage-Ready', score: 9, maker: 'Comparison',
      notes: 'Works best in Delhi venues where crowd knows the AQI situation',
      created: today(), performed: 22, bitsKilled: 20,
    },
    {
      id: uid(), cat: 'Middle Class',
      setup: 'Meri family mein sabse bada investment advice yeh hai: chaar saal tak LIC bhar do.',
      punch: 'Phir agent uncle ghar pe milne nahi aate — relationship khatam.',
      tags: [
        'Financial planning ka matlab hain ki hum plan nahi karte, uncle plan karte hain.',
        'Return? Bhai, return woh dete hain jo bade log bhejte hain Diwali pe.',
        '',
      ],
      status: 'Stage-Ready', score: 8, maker: 'Reversal',
      notes: 'Middle-class crowd loves this, especially 25-35 age group',
      created: today(), performed: 15, bitsKilled: 13,
    },
    {
      id: uid(), cat: 'Corporate',
      setup: 'Hamare company ka Friday meeting hoti hai — Work from Home ke faayde discuss karne ke liye.',
      punch: 'Office mein. In person. Mandatory.',
      tags: [
        'Agenda item number 1: "How to maintain work-life balance." Duration: 3 ghante.',
        'HR ka favourite line: "Our employees are our biggest asset." Aur fir appraisal aata hai.',
        '',
      ],
      status: 'Stage-Ready', score: 8, maker: 'Reversal',
      notes: '', created: today(), performed: 18, bitsKilled: 16,
    },
    {
      id: uid(), cat: 'Bihar/Identity',
      setup: 'Log kehte hain mera accent strong hai, toh log samjhenge nahi.',
      punch: 'Bhai, Babu Bhaiya ne poore India ko "tension mat lo" sikhaya — aur uska accent kaisa tha?',
      tags: [
        'Hinglish is a language. Bihar-Hinglish is a dialect. My dialect is a superpower.',
        '', '',
      ],
      status: 'Stage-Ready', score: 9, maker: 'Pop Culture Link',
      notes: 'Gets huge reaction in Delhi crowds who know Hera Pheri well',
      created: today(), performed: 30, bitsKilled: 28,
    },
    {
      id: uid(), cat: 'Social Media',
      setup: 'Instagram pe sab log "authenticity" ki baat karte hain.',
      punch: 'Ring light, VSCO filter, caption likha "no makeup" — aur caption mein hashtag #authentic.',
      tags: [
        'Authenticity ka matlab ab hai — edited in Lightroom but raw in spirit.',
        '', '',
      ],
      status: 'Stage-Ready', score: 8, maker: 'Play on Words',
      notes: '', created: today(), performed: 8, bitsKilled: 7,
    },
  ];
}

export function buildSeedShows() {
  return [
    {
      id: uid(), date: today(), venue: 'Guftagoo',
      city: 'New Delhi', type: 'Open Mic',
      setLength: 7, crowdSize: 45, energy: 8, score: 8,
      bitsKilled: 'Delhi AQI bit, LIC uncle bit, Instagram authenticity bit',
      died: 'Tried a new corporate bit — punchline needs work',
      newBits: 'First time tried the LIC uncle bit — mixed response',
      crowdWork: 'Asked a guy his job — he was an HR, room went crazy',
      lessons: "Don't lead with new bits. Save Bihar bit for second half — more impact.",
      video: '',
    },
  ];
}

export function buildSeedIdeas() {
  return [
    {
      id: uid(),
      idea: 'Zomato delivery guy se aaj poocha — "bhai late kyun hua?" Usne bola traffic. Main 10th floor pe hoon. Elevator building mein nahi hai.',
      attitude: 'Weird', source: 'Observation',
      angle: 'Expectation vs physical reality — setup about delivery, punchline about infrastructure failure',
      promoted: false, date: today(), label: '', audioURL: null,
    },
    {
      id: uid(),
      idea: 'Meditation app ne notification diya: "Time to be mindful." Main tab toilet mein tha. Already peak mindful.',
      attitude: 'Stupid', source: 'Personal',
      angle: 'Digital wellness culture vs actual human moments',
      promoted: false, date: today(), label: '', audioURL: null,
    },
    {
      id: uid(),
      idea: 'Meri dadi ne pehli baar UPI use kiya. Boli yeh toh darr lagta hai. Main bola kyun? Boli — itni jaldi paise jaate hain, lagta hai ghar chale gaye hain.',
      attitude: 'Hard', source: 'Personal',
      angle: 'Old generation + new tech = gold. Generational currency fear.',
      promoted: false, date: today(), label: '', audioURL: null,
    },
  ];
}
