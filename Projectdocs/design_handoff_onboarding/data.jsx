/* data.jsx — onboarding content + placeholder mascot.
   Exports to window: ONB_STEPS, Mascot, Sparkles */

// ----- Question steps (single-select) -----
const ONB_STEPS = [
  {
    id: 'level',
    title: 'How much Arabic can you read right now?',
    sub: "Be honest — there's a perfect starting point for everyone.",
    options: [
      { emoji: '🌱', label: "I can't read it yet" },
      { emoji: '🔤', label: 'I know some letters' },
      { emoji: '📖', label: 'I can read slowly' },
      { emoji: '🦉', label: 'I read pretty fluently' },
    ],
  },
  {
    id: 'why',
    title: 'Why do you want to write Arabic?',
    sub: 'This shapes the words you’ll trace first.',
    options: [
      { emoji: '🕌', label: 'Read & write the Quran' },
      { emoji: '🫶', label: 'Reconnect with my heritage' },
      { emoji: '✈️', label: 'Travel & everyday life' },
      { emoji: '🎓', label: 'Study or work' },
    ],
  },
  {
    id: 'experience',
    title: 'Have you ever written Arabic by hand?',
    sub: 'No wrong answers — we meet you where you are.',
    options: [
      { emoji: '🆕', label: 'Never, totally new' },
      { emoji: '🏫', label: 'A little, back in school' },
      { emoji: '✍️', label: 'I practise now and then' },
      { emoji: '🔁', label: 'I write fairly regularly' },
    ],
  },
  {
    id: 'time',
    title: 'How much time can you give it each day?',
    sub: 'Small, steady reps beat long cramming.',
    options: [
      { emoji: '⏱️', label: '5 min' },
      { emoji: '⌛', label: '10 min' },
      { emoji: '⏰', label: '20 min' },
      { emoji: '🔥', label: '30 min+' },
    ],
  },
  {
    id: 'goal',
    title: 'Where do you want to be in a year?',
    sub: 'Your daily plan adapts to this goal.',
    options: [
      { emoji: '📝', label: 'Write my name & the basics' },
      { emoji: '💬', label: 'Write words & short phrases' },
      { emoji: '📄', label: 'Write full sentences smoothly' },
      { emoji: '🎨', label: 'Beautiful, flowing handwriting' },
    ],
  },
];

// ----- Placeholder mascot: "Qalam", a friendly ink-drop -----
// (You have no logo yet — swap this SVG for your real character anytime.)
function Mascot({ size = 150, sign = 'مرحبا', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200"
         style={style} aria-label="Arabivo mascot" role="img">
      <defs>
        <linearGradient id="drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1aa066"/>
          <stop offset="1" stopColor="#0c6f43"/>
        </linearGradient>
      </defs>
      {/* soft shadow */}
      <ellipse cx="100" cy="182" rx="46" ry="9" fill="#0c6f43" opacity=".14"/>
      {/* ink-drop body */}
      <path d="M100 24
               C128 70 154 96 154 128
               a54 54 0 0 1 -108 0
               C46 96 72 70 100 24 Z"
            fill="url(#drop)"/>
      {/* belly highlight */}
      <path d="M100 60 C120 92 138 108 138 130 a38 38 0 0 1 -22 34
               C128 150 118 120 100 96 Z" fill="#ffffff" opacity=".12"/>
      {/* cheeks */}
      <circle cx="74" cy="138" r="9" fill="#ff8fa3" opacity=".55"/>
      <circle cx="126" cy="138" r="9" fill="#ff8fa3" opacity=".55"/>
      {/* eyes */}
      <g>
        <circle cx="82" cy="120" r="11" fill="#fff"/>
        <circle cx="118" cy="120" r="11" fill="#fff"/>
        <circle cx="84" cy="122" r="5.5" fill="#15231C"/>
        <circle cx="120" cy="122" r="5.5" fill="#15231C"/>
        <circle cx="86" cy="120" r="1.8" fill="#fff"/>
        <circle cx="122" cy="120" r="1.8" fill="#fff"/>
      </g>
      {/* smile */}
      <path d="M90 140 q10 9 20 0" fill="none" stroke="#15231C"
            strokeWidth="3.2" strokeLinecap="round"/>
      {/* little reed-pen arm holding a sign */}
      <g transform="rotate(-12 150 110)">
        <rect x="150" y="84" width="40" height="26" rx="6" fill="#caa46a"/>
        <rect x="150" y="84" width="40" height="26" rx="6" fill="none" stroke="#a9854f" strokeWidth="2"/>
        <text x="170" y="102" textAnchor="middle"
              fontFamily="'Noto Naskh Arabic', serif" fontSize="15" fill="#5a4220">{sign}</text>
        <rect x="146" y="94" width="10" height="5" rx="2.5" fill="#0c6f43"/>
      </g>
    </svg>
  );
}

// Decorative sparkle burst (used on the trace success)
function Sparkles({ show }) {
  if (!show) return null;
  const bits = [
    { x: -60, y: -10, d: 0 }, { x: 60, y: -20, d: .05 },
    { x: -40, y: -60, d: .1 }, { x: 44, y: -54, d: .15 },
    { x: 0, y: -80, d: .08 }, { x: -75, y: -45, d: .12 },
    { x: 78, y: -40, d: .18 },
  ];
  return (
    <div className="sparkles">
      {bits.map((b, i) => (
        <span key={i} style={{
          '--tx': b.x + 'px', '--ty': b.y + 'px',
          animationDelay: b.d + 's',
        }}>✦</span>
      ))}
    </div>
  );
}

Object.assign(window, { ONB_STEPS, Mascot, Sparkles });
