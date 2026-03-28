
const INITIAL_JOKES = [
  {
    id: 'joke-01', cat: 'Delhi',
    setup: 'Delhi ki AQI kisi bhi din meri credit score se zyada nahi honi chahiye.',
    punch: 'Ek baat toh hai — dono improve nahi ho rahe.',
    tags: [
      'Sheila Dixit thi, phir Kejriwal — equal opportunity diya, sabko barbad karne ka.',
      'Sarkaarein badal jaati hain. AQI wahi ka wahi.',
    ],
    status: 'Stage-Ready', score: 9, maker: 'Comparison',
    notes: 'Works best in Delhi venues where crowd knows the AQI situation',
    created: '2024-11-01', performed: 22, killed: 20,
  },
  {
    id: "initial-id-1", cat: 'Middle Class',
    setup: 'Meri family mein sabse bada investment advice yeh hai: chaar saal tak LIC bhar do.',
    punch: 'Phir agent uncle ghar pe milne nahi aate — relationship khatam.',
    tags: [
      'Financial planning ka matlab hain ki hum plan nahi karte, uncle plan karte hain.',
      'Return? Bhai, return woh dete hain jo bade log bhejte hain Diwali pe.',
    ],
    status: 'Stage-Ready', score: 8, maker: 'Reversal',
    notes: 'Middle-class crowd loves this, especially 25-35 age group',
    created: '2024-11-05', performed: 15, killed: 13,
  },
  {
    id: "initial-id-2", cat: 'Corporate',
    setup: 'Hamare company ka Friday meeting hoti hai — Work from Home ke faayde discuss karne ke liye.',
    punch: 'Office mein. In person. Mandatory.',
    tags: [
      'Agenda item number 1: "How to maintain work-life balance." Duration: 3 ghante.',
      'HR ka favourite line: "Our employees are our biggest asset." Aur fir appraisal aata hai.',
    ],
    status: 'Stage-Ready', score: 8, maker: 'Reversal',
    notes: '', created: '2024-11-10', performed: 18, killed: 16,
  },
  {
    id: "initial-id-3", cat: 'Bihar/Identity',
    setup: 'Log kehte hain mera accent strong hai, toh log samjhenge nahi.',
    punch: 'Bhai, Babu Bhaiya ne poore India ko "tension mat lo" sikhaya — aur uska accent kaisa tha?',
    tags: [
      'Hinglish is a language. Bihar-Hinglish is a dialect. My dialect is a superpower.',
    ],
    status: 'Stage-Ready', score: 9, maker: 'Pop Culture Link',
    notes: 'Gets huge reaction in Delhi crowds who know Hera Pheri well',
    created: '2024-11-12', performed: 30, killed: 28,
  },
  {
    id: "initial-id-4", cat: 'Relationships',
    setup: 'Meri girlfriend kehti hai main use samjhta nahi.',
    punch: 'Maine kaha samjhna nahi chahta — comprehension test nahi diya tha toh relationship start ki thi.',
    tags: [
      'Woh boli: "Tum sochte kuch nahi." Maine socha — aur isliye kuch bola nahi.',
    ],
    status: 'Punch-Up Needed', score: 7, maker: 'Reversal',
    notes: 'Tag needs work, landing is inconsistent', created: '2024-11-14', performed: 10, killed: 7,
  },
  {
    id: "initial-id-5", cat: 'Delhi Metro',
    setup: 'Delhi metro mein "priority seating" hota hai — elderly, pregnant, disabled ke liye.',
    punch: 'Poora compartment us seat ke saamne khara rehta hai, aankhein band karke, phone pe busy.',
    tags: [
      'Priority nahi rehti kisi ka bhi — system priority rehta hai sirf dhundhne ki.',
    ],
    status: 'Stage-Ready', score: 8, maker: 'State the Obvious',
    notes: '', created: '2024-11-16', performed: 12, killed: 11,
  },
  {
    id: "initial-id-6", cat: 'Social Media',
    setup: 'Instagram pe sab log "authenticity" ki baat karte hain.',
    punch: 'Ring light, VSCO filter, caption likha "no makeup" — aur caption mein hashtag #authentic.',
    tags: [
      'Authenticity ka matlab ab hai — edited in Lightroom but raw in spirit.',
    ],
    status: 'Stage-Ready', score: 8, maker: 'Play on Words',
    notes: '', created: '2024-11-18', performed: 8, killed: 7,
  },
  {
    id: "initial-id-7", cat: 'Religion',
    setup: 'India mein ek hi cheez hai jo har caste, religion, class ko ek karti hai.',
    punch: 'Laal batti waali gaadi — sab raste dete hain, sab gaaliyan dete hain.',
    tags: [
      'Secularism ka sachcha roop: ek hi gaali, alag alag bhashao mein.',
    ],
    status: 'Test Carefully', score: 7, maker: 'Association',
    notes: 'Might alienate in smaller venues, works in urban/metro crowds',
    created: '2024-11-20', performed: 5, killed: 3,
  },
  {
    id: "initial-id-8", cat: 'Health/Hospital',
    setup: 'Government hospital mein doctor sahab mile — cool dude, laptop, chai pee rahe the.',
    punch: 'Maine bola problem hai. Unhone bola — appointment lelo. Main GOVERNMENT hospital mein tha.',
    tags: [
      'Private hospital mein koi bhi nahi sunta — wahan bhi nahi sunta, lekin bills aate hain.',
    ],
    status: 'Raw', score: 6, maker: 'Reversal',
    notes: 'Needs tighter punchline, setup is strong',
    created: '2024-11-22', performed: 0, killed: 0,
  },
  {
    id: "initial-id-9", cat: 'Motivation',
    setup: '"Fail fast, learn fast" — yeh startup culture hai.',
    punch: 'Bhai, main 4 saal se fail ho raha hoon — still waiting for the learning part.',
    tags: [
      'Mentor ne bola: "Failure is just feedback." Tab se feedback sunna band kar diya.',
    ],
    status: 'Punch-Up Needed', score: 7, maker: 'Exaggeration',
    notes: '', created: '2024-11-24', performed: 6, killed: 4,
  },
];

const INITIAL_SHOWS = [
  {
    id: "initial-id-10", date: '2024-12-14', venue: 'Guftagoo',
    city: 'New Delhi', type: 'Open Mic',
    setLength: 7, crowdSize: 45, energy: 8, score: 8,
    killed: 'Delhi AQI bit, Metro priority seating, Bihar accent Hera Pheri ref',
    died: 'Motivation startup bit — punchline didn\'t land, needs rework',
    newBits: 'First time tried the LIC uncle bit — mixed response',
    crowdWork: 'Asked a guy his job — he was an HR, room went crazy',
    lessons: 'Don\'t lead with motivation bits. Save Bihar bit for second half — more impact.',
    video: '',
  },
  {
    id: "initial-id-11", date: '2024-12-07', venue: 'Laugh Store',
    city: 'New Delhi', type: 'Showcase',
    setLength: 10, crowdSize: 80, energy: 9, score: 9,
    killed: 'Hera Pheri accent bit — 28/30 crowd reacted. Corporate WFH reversal — 16/18.',
    died: 'Religion laal batti bit — too subtle for this crowd',
    newBits: 'Relationships comprehension bit — first run, needs tags tightened',
    crowdWork: 'Girl in front laughed before the punchline — called it out, got bigger laugh',
    lessons: 'Map the energy arc. Saturday 9pm crowd is warmer. Start strong, end stronger.',
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: "initial-id-12", date: '2024-11-30', venue: 'Comedy Theater Gurgaon',
    city: 'Gurugram', type: 'Paid Gig',
    setLength: 15, crowdSize: 120, energy: 7, score: 7,
    killed: 'Instagram authenticity bit — huge in Gurgaon. Delhi AQI + credit score.',
    died: 'Hospital government bit — not polished enough, killed the energy',
    newBits: 'Tried all 10 jokes — stress test night',
    crowdWork: 'Walked into crowd, grabbed a mic stand, crowd loved the energy shift',
    lessons: 'Gurgaon corporate crowd responds to corporate + social media bits. Test carefully on religion.',
    video: '',
  },
];

const INITIAL_IDEAS = [
  {
    id: "initial-id-13", idea: 'Zomato delivery guy se aaj poocha — "bhai late kyun hua?" Usne bola traffic. Main 10th floor pe hoon. Elevator building mein nahi hai.',
    attitude: 'Weird', source: 'Observation', angle: 'Expectation vs physical reality — setup about delivery, punchline about infrastructure failure',
    promoted: false, date: '2024-12-01', label: '',
  },
  {
    id: "initial-id-14", idea: 'Meditation app ne notification diya: "Time to be mindful." Main tab toilet mein tha. Already peak mindful.',
    attitude: 'Stupid', source: 'Personal', angle: 'Digital wellness culture vs actual human moments',
    promoted: false, date: '2024-12-01', label: '',
  },
  {
    id: "initial-id-15", idea: 'Indian weddings mein "no phone" policy announce karte hain. Phir photographer ka assistant drone fly karta hai.',
    attitude: 'Weird', source: 'Observation', angle: 'Hypocrisy of rules. Official vs unofficial. Could tag into anything government/institution related.',
    promoted: false, date: '2024-12-01', label: '',
  },
  {
    id: "initial-id-16", idea: 'Meri dadi ne pehli baar UPI use kiya. Boli yeh toh darr lagta hai. Main bola kyun? Boli — itni jaldi paise jaate hain, lagta hai ghar chale gaye hain.',
    attitude: 'Hard', source: 'Personal', angle: 'Old generation + new tech = gold. Generational currency fear.',
    promoted: false, date: '2024-12-01', label: '',
  },
  {
    id: "initial-id-17", idea: '"Hustle culture" ka matlab hai 20 saal mein retire karo. Problem yeh hai, 20 saal mein mere paas ek LinkedIn post aur ek side hustle failure hai.',
    attitude: 'Scary', source: 'Observation', angle: 'Millennial anxiety about the hustle-to-retire promise vs reality.',
    promoted: false, date: '2024-12-01', label: '',
  },
];

export { INITIAL_JOKES, INITIAL_SHOWS, INITIAL_IDEAS };
