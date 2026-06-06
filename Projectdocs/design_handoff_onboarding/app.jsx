/* app.jsx — ArabivoWrite onboarding flow + Tweaks.
   Depends on: data.jsx (ONB_STEPS, Mascot, Sparkles), TraceStep.jsx, tweaks-panel.jsx */

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0E7A4B", "#0A5C39", "#E7F4ED", "#D6EEE0"],
  "displayFont": "Fredoka",
  "cardStyle": "shadow",
  "mascot": false
}/*EDITMODE-END*/;

/* ---- label maps for the personalised projection ---- */
const LEVEL_FROM = ['absolute beginner', 'early beginner', 'intermediate reader', 'advanced reader'];
const GOAL_TO = ['confident basics', 'words & short phrases', 'full smooth sentences', 'beautiful handwriting'];
const TIME_LABEL = ['5 min', '10 min', '20 min', '30 min'];

function TopBar({ progress, onBack, hideBack }) {
  return (
    <div className="topbar">
      <button className="backbtn" data-hidden={hideBack} onClick={onBack} aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="progress"><span style={{ width: progress + '%' }}></span></div>
    </div>
  );
}

function Question({ step, value, onPick }) {
  return (
    <div className="step">
      <h1 className="q-title">{step.title}</h1>
      {step.sub && <p className="q-sub">{step.sub}</p>}
      <div className="options">
        {step.options.map((o, i) => (
          <button key={i} className="opt" data-selected={value === i}
                  onClick={() => onPick(i)}>
            <span className="emoji">{o.emoji}</span>
            <span className="label">{o.label}</span>
            <span className="check">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Welcome({ onGo, mascot }) {
  return (
    <div className="center-step">
      {mascot && <Mascot size={156} sign="مرحبا" style={{ marginBottom: 6 }} />}
      <div className="wordmark" style={{ fontSize: 26, marginBottom: 14 }}>
        Arabivo<b>Write</b>
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: 'clamp(24px,6.6vw,32px)', lineHeight: 1.15,
        margin: '0 0 10px', maxWidth: 440, textWrap: 'balance',
      }}>
        👋 Let’s teach your hand to <span style={{ color: 'var(--brand)' }}>write Arabic.</span>
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 17, lineHeight: 1.5, maxWidth: 380, margin: 0 }}>
        Calm, guided tracing that builds real muscle memory — one beautiful letter at a time.
      </p>
      <div className="cta-dock" style={{ position: 'static', background: 'none', marginTop: 30, padding: 0, width: '100%' }}>
        <button className="btn" onClick={onGo}>Let’s go!</button>
      </div>
      <button className="link-quiet" onClick={onGo}>Already have an account?</button>
    </div>
  );
}

function Projection({ answers, onGo }) {
  const from = LEVEL_FROM[answers.level ?? 0];
  const to = GOAL_TO[answers.goal ?? 1];
  const time = TIME_LABEL[answers.time ?? 1];
  // rising line
  const pts = [[8, 78], [24, 70], [38, 60], [52, 56], [66, 42], [80, 30], [94, 16]];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
  return (
    <div className="step" style={{ alignItems: 'center', textAlign: 'center' }}>
      <h1 className="q-title" style={{ marginTop: 24 }}>Here’s your year with ArabivoWrite ✨</h1>
      <p className="q-sub" style={{ textAlign: 'center' }}>
        You’ll go from <b style={{ color: 'var(--brand)' }}>{from}</b> to{' '}
        <b style={{ color: 'var(--amber-deep)' }}>{to}</b> with just <b style={{ color: 'var(--brand)' }}>{time}/day</b>.
      </p>

      <div className="proj-card">
        <div className="proj-plot">
          <svg viewBox="0 0 100 90" width="100%" height="200" preserveAspectRatio="none">
            {[20, 38, 56, 74].map((y) => (
              <line key={y} x1="6" y1={y} x2="96" y2={y} stroke="var(--line)" strokeWidth="0.6" />
            ))}
            <path d={d} fill="none" stroke="var(--brand)" strokeWidth="2.6"
                  strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <span className="proj-dot start" style={{ left: '8%', top: (78 / 90 * 100) + '%' }}></span>
          <span className="proj-dot end" style={{ left: '94%', top: (16 / 90 * 100) + '%' }}></span>
        </div>
        <div className="axis"><span>Today</span><span>Month 6</span><span>Month 12</span></div>
        <div className="proj-title">Your handwriting, projected</div>
      </div>

      <div className="stat-pill">
        <b>9 in 10</b> learners who trace <b>daily</b> with ArabivoWrite hit their handwriting goal within a year.
      </div>

      <div className="cta-dock">
        <button className="btn" onClick={onGo}>Create my free account</button>
      </div>
    </div>
  );
}

function SignUp({ onDone }) {
  const [form, setForm] = useState({ name: '', email: '', pass: '' });
  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email) && form.pass.length >= 6;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="step">
      <h1 className="q-title" style={{ marginTop: 22 }}>Save your progress 🔒</h1>
      <p className="q-sub">Create a free account so your streak and plan are always here.</p>

      <div className="social-row">
        <button className="social-btn" onClick={onDone}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z"/><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.5 3.2-4.4 6-4.4z"/></svg>
          Continue with Google
        </button>
        <button className="social-btn" onClick={onDone}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 1c.1 1.1-.3 2.2-1 3-.7.9-1.8 1.5-2.9 1.4-.1-1.1.4-2.2 1-2.9.8-.9 2-1.5 2.9-1.5zM20 17c-.5 1.2-.8 1.7-1.4 2.8-.9 1.5-2.1 3.3-3.7 3.3-1.4 0-1.7-.9-3.6-.9s-2.3.9-3.6.9c-1.6 0-2.8-1.6-3.7-3.1-2.4-3.9-2.7-8.5-1.2-11 1.1-1.7 2.7-2.7 4.3-2.7 1.6 0 2.6.9 3.9.9 1.3 0 2.1-.9 3.9-.9 1.4 0 2.9.8 4 2.1-3.5 1.9-2.9 6.9.8 8.6z"/></svg>
          Continue with Apple
        </button>
      </div>

      <div className="divider">or sign up with email</div>

      <div className="signup-form">
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={set('name')} placeholder="Your name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.pass} onChange={set('pass')} placeholder="At least 6 characters" />
        </div>
      </div>
      <p className="fineprint">By continuing you agree to our <a href="#">Terms</a> & <a href="#">Privacy Policy</a>.</p>

      <div className="cta-dock">
        <button className="btn" disabled={!valid} onClick={onDone}>Start my first session</button>
      </div>
    </div>
  );
}

function Done({ mascot, onRestart }) {
  return (
    <div className="center-step">
      <Sparkles show={true} />
      {mascot && <Mascot size={150} sign="أحسنت" style={{ marginBottom: 8 }} />}
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600,
                   fontSize: 'clamp(26px,6.6vw,34px)', margin: '0 0 8px', textWrap: 'balance' }}>
        You’re all set! 🎉
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 17, lineHeight: 1.5, maxWidth: 360, margin: 0 }}>
        Your personalised tracing plan is ready. Let’s write something beautiful.
      </p>
      <div className="tally">
        <span className="chip" style={{ animationDelay: '0s' }}>Plan ready</span>
        <span className="chip" style={{ animationDelay: '.08s' }}>Day 1 unlocked</span>
        <span className="chip" style={{ animationDelay: '.16s' }}>1 letter traced</span>
      </div>
      <div className="cta-dock" style={{ position: 'static', background: 'none', marginTop: 26, padding: 0, width: '100%' }}>
        <button className="btn" onClick={onRestart}>Start my first session →</button>
      </div>
      <button className="link-quiet" onClick={onRestart}>Replay onboarding</button>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState('welcome'); // welcome|q|trace|projection|signup|done
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState({});

  // apply tweaks -> CSS vars
  useEffect(() => {
    const r = document.documentElement.style;
    const [brand, deep, tint, tint2] = t.palette;
    r.setProperty('--brand', brand);
    r.setProperty('--brand-deep', deep);
    r.setProperty('--brand-tint', tint);
    r.setProperty('--brand-tint-2', tint2);
    r.setProperty('--font-display', `'${t.displayFont}', system-ui, sans-serif`);
    if (t.cardStyle === 'flat') {
      r.setProperty('--card-shadow', 'none');
      r.setProperty('--card-border', '1.5px solid var(--line)');
    } else if (t.cardStyle === 'outline') {
      r.setProperty('--card-shadow', 'none');
      r.setProperty('--card-border', '2px solid #cfe1d7');
    } else {
      r.setProperty('--card-shadow', '0 1px 0 rgba(21,35,28,.04), 0 8px 24px -12px rgba(21,35,28,.18)');
      r.setProperty('--card-border', '1.5px solid var(--line)');
    }
  }, [t]);

  const flowKeys = ['q0', 'q1', 'q2', 'q3', 'q4', 'trace', 'projection'];
  const currentKey = screen === 'q' ? 'q' + qi : screen;
  const flowIdx = flowKeys.indexOf(currentKey);
  const progress = flowIdx >= 0 ? ((flowIdx + 1) / flowKeys.length) * 100 : 0;

  const pick = (i) => {
    const id = ONB_STEPS[qi].id;
    setAnswers((a) => ({ ...a, [id]: i }));
    // auto-advance after a beat (Fureezu-style requires Continue; we keep Continue but allow it)
  };

  const next = () => {
    if (screen === 'welcome') { setScreen('q'); setQi(0); }
    else if (screen === 'q') {
      if (qi < ONB_STEPS.length - 1) setQi(qi + 1);
      else setScreen('trace');
    }
    else if (screen === 'trace') setScreen('projection');
    else if (screen === 'projection') setScreen('signup');
    else if (screen === 'signup') setScreen('done');
  };

  const back = () => {
    if (screen === 'q') {
      if (qi > 0) setQi(qi - 1);
      else setScreen('welcome');
    }
    else if (screen === 'trace') { setScreen('q'); setQi(ONB_STEPS.length - 1); }
    else if (screen === 'projection') setScreen('trace');
    else if (screen === 'signup') setScreen('projection');
    else if (screen === 'done') setScreen('signup');
  };

  const restart = () => { setScreen('welcome'); setQi(0); setAnswers({}); };

  const showTopBar = screen === 'q' || screen === 'projection' || screen === 'signup';
  const curStep = ONB_STEPS[qi];
  const curVal = curStep ? answers[curStep.id] : undefined;

  return (
    <div className="stage">
      <div className="frame">
        {showTopBar && <TopBar progress={progress} onBack={back} hideBack={false} />}

        {screen === 'welcome' && <Welcome onGo={next} mascot={t.mascot} />}

        {screen === 'q' && (
          <React.Fragment>
            <Question step={curStep} value={curVal} onPick={pick} />
            <div className="cta-dock">
              <button className="btn" disabled={curVal === undefined} onClick={next}>Continue</button>
            </div>
          </React.Fragment>
        )}

        {screen === 'trace' && <TraceStep onDone={next} />}

        {screen === 'projection' && <Projection answers={answers} onGo={next} />}

        {screen === 'signup' && <SignUp onDone={next} />}

        {screen === 'done' && <Done mascot={t.mascot} onRestart={restart} />}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand" />
        <TweakColor label="Emerald" value={t.palette}
          options={[
            ['#0E7A4B', '#0A5C39', '#E7F4ED', '#D6EEE0'],
            ['#0B5C39', '#073D26', '#E4F1E9', '#CFE6D8'],
            ['#12A05F', '#0C7A48', '#E6F7EE', '#CDEED9'],
            ['#0E8A7A', '#0A655A', '#E4F5F2', '#CDEBE5'],
          ]}
          onChange={(v) => setTweak('palette', v)} />
        <TweakToggle label="Show mascot" value={t.mascot} onChange={(v) => setTweak('mascot', v)} />
        <TweakSection label="Style" />
        <TweakSelect label="Display font" value={t.displayFont}
          options={['Fredoka', 'Baloo 2', 'Quicksand']}
          onChange={(v) => setTweak('displayFont', v)} />
        <TweakRadio label="Cards" value={t.cardStyle}
          options={['shadow', 'flat', 'outline']}
          onChange={(v) => setTweak('cardStyle', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
