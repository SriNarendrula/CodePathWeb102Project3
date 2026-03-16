import { useState, useCallback } from "react";

const ORIGINAL_CARDS = [
  { id: 0, question: "What is the largest planet in our solar system?", answer: "Jupiter" },
  { id: 1, question: "How long does light from the Sun take to reach Earth?", answer: "8 minutes" },
  { id: 2, question: "What is a light-year?", answer: "The distance light travels in one year" },
  { id: 3, question: "What is the name of the galaxy we live in?", answer: "Milky Way" },
  { id: 4, question: "What is a black hole?", answer: "A region where gravity is so strong nothing can escape" },
  { id: 5, question: "What planet is known as the Red Planet?", answer: "Mars" },
  { id: 6, question: "How many moons does Saturn have?", answer: "146" },
  { id: 7, question: "What is the hottest planet in our solar system?", answer: "Venus" },
  { id: 8, question: "What was the first artificial satellite launched into space?", answer: "Sputnik" },
  { id: 9, question: "What is a neutron star?", answer: "The collapsed core of a massive star" },
  { id: 10, question: "What is the Oort Cloud?", answer: "A shell of icy objects surrounding our solar system" },
  { id: 11, question: "Which mission first landed humans on the Moon?", answer: "Apollo 11" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fuzzyMatch(guess, answer) {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const g = normalize(guess);
  const a = normalize(answer);
  if (!g) return false;
  if (a.includes(g) || g.includes(a)) return true;
  const guessWords = g.split(/\s+/).filter((w) => w.length > 2);
  const answerWords = a.split(/\s+/);
  return guessWords.some((gw) => answerWords.some((aw) => aw.includes(gw) || gw.includes(aw)));
}

function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.7 + 0.2,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s) => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size} fill="white" opacity={s.opacity}
            style={{ animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite alternate` }} />
        ))}
      </svg>
    </div>
  );
}

export default function App() {
  const [deck, setDeck] = useState(ORIGINAL_CARDS);
  const [mastered, setMastered] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [guess, setGuess] = useState("");
  const [guessStatus, setGuessStatus] = useState(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const card = deck[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === deck.length - 1;

  const goTo = useCallback((index) => {
    setCurrentIndex(index);
    setIsFlipped(false);
    setGuess("");
    setGuessStatus(null);
    setCardKey((k) => k + 1);
  }, []);

  const handlePrev = () => { if (!isFirst) goTo(currentIndex - 1); };
  const handleNext = () => { if (!isLast) goTo(currentIndex + 1); };
  const handleFlip = () => setIsFlipped((f) => !f);

  const handleGuessSubmit = () => {
    if (!guess.trim() || isFlipped) return;
    const correct = fuzzyMatch(guess, card.answer);
    setGuessStatus(correct ? "correct" : "wrong");
    if (correct) {
      setIsFlipped(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setLongestStreak((prev) => Math.max(prev, newStreak));
    } else {
      setStreak(0);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleGuessSubmit(); };

  const handleShuffle = () => {
    setDeck(shuffle(deck));
    setIsShuffled(true);
    goTo(0);
  };

  const handleResetOrder = () => {
    const masteredIds = new Set(mastered.map((c) => c.id));
    setDeck(ORIGINAL_CARDS.filter((c) => !masteredIds.has(c.id)));
    setIsShuffled(false);
    goTo(0);
  };

  const handleMaster = () => {
    setMastered((prev) => [...prev, card]);
    const newDeck = deck.filter((_, i) => i !== currentIndex);
    setDeck(newDeck);
    goTo(Math.min(currentIndex, newDeck.length - 1));
  };

  const handleUnmaster = (id) => {
    const restored = mastered.find((c) => c.id === id);
    setMastered((prev) => prev.filter((c) => c.id !== id));
    setDeck((prev) => [...prev, restored].sort((a, b) => a.id - b.id));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #050a14; min-height: 100vh;
          font-family: 'Crimson Pro', serif; overflow-x: hidden;
          display: flex; justify-content: center;
        }
        @keyframes twinkle { 0%{opacity:0.2} 100%{opacity:0.9} }
        @keyframes nebula-drift {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.15}
          50%{transform:translate(-20px,15px) scale(1.05);opacity:0.22}
        }
        @keyframes float-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-glow {
          0%,100%{box-shadow:0 0 20px rgba(99,179,237,0.3),0 0 60px rgba(99,179,237,0.1)}
          50%{box-shadow:0 0 35px rgba(99,179,237,0.5),0 0 90px rgba(99,179,237,0.2)}
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
        }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }

        .nebula{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
        .nebula-1{width:600px;height:600px;background:radial-gradient(circle,rgba(59,130,246,0.4),transparent 70%);top:-150px;right:-150px;animation:nebula-drift 12s ease-in-out infinite}
        .nebula-2{width:500px;height:500px;background:radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%);bottom:-100px;left:-100px;animation:nebula-drift 15s ease-in-out infinite reverse}
        .nebula-3{width:300px;height:300px;background:radial-gradient(circle,rgba(236,72,153,0.2),transparent 70%);top:40%;left:10%;animation:nebula-drift 10s ease-in-out 2s infinite}

        .app-container {
          position:relative; min-height:100vh; width:100%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:40px 20px; z-index:1;
        }

        .header{text-align:center;margin-bottom:28px;animation:float-in 0.7s ease-out both}
        .title {
          font-family:'Cinzel',serif; font-size:clamp(1.8rem,4vw,3rem); font-weight:700;
          letter-spacing:0.12em; text-transform:uppercase;
          background:linear-gradient(135deg,#e2e8f0 0%,#93c5fd 40%,#c4b5fd 70%,#f9a8d4 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          line-height:1.2; margin-bottom:10px;
        }
        .description{font-size:1.1rem;color:rgba(148,163,184,0.9);font-style:italic;letter-spacing:0.04em;max-width:420px;line-height:1.6;margin:0 auto 10px}
        .meta-row{display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap}
        .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(99,179,237,0.1);border:1px solid rgba(99,179,237,0.25);border-radius:999px;padding:4px 14px;font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.1em;color:#93c5fd;text-transform:uppercase}
        .badge.purple{background:rgba(139,92,246,0.1);border-color:rgba(139,92,246,0.25);color:#c4b5fd}
        .badge.green{background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.25);color:#86efac}

        .streak-bar{display:flex;gap:16px;margin-bottom:20px;animation:float-in 0.7s ease-out 0.05s both}
        .streak-box{display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 20px;min-width:100px}
        .streak-num{font-family:'Cinzel',serif;font-size:1.6rem;font-weight:700;color:#fbbf24;line-height:1}
        .streak-num.current{color:#34d399}
        .streak-label{font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;color:rgba(148,163,184,0.5);margin-top:4px;font-family:'Cinzel',serif}

        .scene{width:min(540px,92vw);height:min(290px,52vw);perspective:1200px;margin-bottom:18px;animation:float-in 0.7s ease-out 0.1s both}
        .card-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.65s cubic-bezier(0.4,0,0.2,1)}
        .card-inner.flipped{transform:rotateY(180deg)}
        .card-inner.shake{animation:shake 0.4s ease}
        .card-inner.pop{animation:pop 0.3s ease}
        .card-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 36px;text-align:center}
        .card-front{background:linear-gradient(135deg,rgba(15,23,42,0.97) 0%,rgba(23,37,84,0.93) 100%);border:1px solid rgba(99,179,237,0.3);animation:pulse-glow 4s ease-in-out infinite}
        .card-back{background:linear-gradient(135deg,rgba(23,10,42,0.97) 0%,rgba(45,18,82,0.93) 100%);border:1px solid rgba(167,139,250,0.35);transform:rotateY(180deg);box-shadow:0 0 30px rgba(139,92,246,0.25),0 0 80px rgba(139,92,246,0.1)}
        .card-face::before{content:'';position:absolute;inset:1px;border-radius:19px;background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 50%);pointer-events:none}
        .card-label{font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:14px;padding:3px 12px;border-radius:999px}
        .card-front .card-label{color:#93c5fd;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.2)}
        .card-back .card-label{color:#c4b5fd;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.2)}
        .card-text{font-size:clamp(0.95rem,2.2vw,1.2rem);line-height:1.65;color:rgba(226,232,240,0.92);font-weight:300;max-width:400px}
        .card-front .card-text{font-style:italic}
        .card-hint{position:absolute;bottom:12px;font-size:0.62rem;letter-spacing:0.1em;color:rgba(148,163,184,0.3);font-family:'Cinzel',serif;text-transform:uppercase}

        .guess-section{width:min(540px,92vw);margin-bottom:18px;animation:float-in 0.7s ease-out 0.15s both}
        .guess-row{display:flex;gap:10px}
        .guess-input{flex:1;background:rgba(255,255,255,0.05);border-radius:12px;border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;font-family:'Crimson Pro',serif;font-size:1rem;padding:12px 18px;outline:none;transition:border-color 0.2s,box-shadow 0.2s;letter-spacing:0.02em}
        .guess-input::placeholder{color:rgba(148,163,184,0.35);font-style:italic}
        .guess-input:focus{border-color:rgba(99,179,237,0.5);box-shadow:0 0 0 3px rgba(99,179,237,0.1)}
        .guess-input.correct{border-color:rgba(34,197,94,0.6);box-shadow:0 0 0 3px rgba(34,197,94,0.1)}
        .guess-input.wrong{border-color:rgba(248,113,113,0.6);box-shadow:0 0 0 3px rgba(248,113,113,0.1)}
        .guess-input:disabled{opacity:0.4;cursor:not-allowed}
        .btn-submit{background:linear-gradient(135deg,rgba(59,130,246,0.25),rgba(139,92,246,0.25));border:1px solid rgba(139,92,246,0.4);color:#e2e8f0;font-family:'Cinzel',serif;font-size:0.72rem;letter-spacing:0.16em;text-transform:uppercase;padding:12px 22px;border-radius:12px;cursor:pointer;transition:all 0.25s;white-space:nowrap}
        .btn-submit:hover:not(:disabled){border-color:rgba(167,139,250,0.7);box-shadow:0 4px 20px rgba(139,92,246,0.3);transform:translateY(-1px)}
        .btn-submit:disabled{opacity:0.3;cursor:not-allowed}
        .feedback{margin-top:10px;padding:10px 16px;border-radius:10px;display:flex;align-items:center;gap:8px;font-family:'Cinzel',serif;text-transform:uppercase;font-size:0.7rem;letter-spacing:0.14em}
        .feedback.correct{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#86efac}
        .feedback.wrong{background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.25);color:#fca5a5}

        .controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;animation:float-in 0.7s ease-out 0.2s both}
        .btn{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.12));border:1px solid rgba(139,92,246,0.3);color:#e2e8f0;font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:0.14em;text-transform:uppercase;padding:11px 20px;border-radius:999px;cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden}
        .btn:hover:not(:disabled){border-color:rgba(167,139,250,0.65);transform:translateY(-2px);box-shadow:0 6px 24px rgba(139,92,246,0.25)}
        .btn:active:not(:disabled){transform:translateY(0)}
        .btn:disabled{opacity:0.22;cursor:not-allowed;transform:none;box-shadow:none}
        .btn svg{width:14px;height:14px;transition:transform 0.25s;flex-shrink:0}
        .btn.next:hover:not(:disabled) svg{transform:translateX(3px)}
        .btn.prev:hover:not(:disabled) svg{transform:translateX(-3px)}
        .btn.shuffle{border-color:rgba(251,191,36,0.3)}
        .btn.shuffle:hover:not(:disabled){border-color:rgba(251,191,36,0.65);box-shadow:0 6px 24px rgba(251,191,36,0.18)}
        .btn.master{border-color:rgba(34,197,94,0.3)}
        .btn.master:hover:not(:disabled){border-color:rgba(34,197,94,0.65);box-shadow:0 6px 24px rgba(34,197,94,0.18)}
        .btn.flip-btn{border-color:rgba(99,179,237,0.3)}
        .card-counter{font-family:'Cinzel',serif;font-size:0.66rem;letter-spacing:0.14em;color:rgba(148,163,184,0.4);text-transform:uppercase;min-width:70px;text-align:center}

        .mastered-section{width:min(540px,92vw);margin-top:16px;animation:float-in 0.7s ease-out 0.25s both}
        .mastered-title{font-family:'Cinzel',serif;font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(134,239,172,0.55);margin-bottom:8px;display:flex;align-items:center;gap:8px}
        .mastered-list{display:flex;flex-direction:column;gap:6px}
        .mastered-item{display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.13);border-radius:10px;padding:8px 14px;font-size:0.88rem;color:rgba(148,163,184,0.65)}
        .mastered-q{font-style:italic;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .btn-unmaster{background:none;border:1px solid rgba(148,163,184,0.18);color:rgba(148,163,184,0.4);border-radius:6px;padding:3px 10px;font-size:0.62rem;font-family:'Cinzel',serif;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s;text-transform:uppercase;white-space:nowrap}
        .btn-unmaster:hover{border-color:rgba(248,113,113,0.4);color:#fca5a5}

        .flip-tip{margin-top:8px;font-size:0.66rem;color:rgba(148,163,184,0.28);letter-spacing:0.1em;font-family:'Cinzel',serif;text-transform:uppercase}
        .empty-state{text-align:center;color:rgba(148,163,184,0.65);font-style:italic;font-size:1.1rem;margin-bottom:24px;line-height:1.8}

        @media(max-width:480px){
          .scene{height:220px}
          .card-face{padding:20px 18px}
          .btn{padding:9px 14px;font-size:0.64rem}
          .streak-bar{gap:10px}
          .streak-box{min-width:80px;padding:8px 14px}
        }
      `}</style>

      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <StarField />

      <div className="app-container">
        {/* HEADER */}
        <header className="header">
          <h1 className="title">Cosmos</h1>
          <p className="description">Journey through the universe — one cosmic mystery at a time</p>
          <div className="meta-row">
            <span className="badge">{deck.length} cards remaining</span>
            {mastered.length > 0 && <span className="badge green">✦ {mastered.length} mastered</span>}
            {isShuffled && <span className="badge purple">⇄ shuffled</span>}
          </div>
        </header>

        {/* STREAK COUNTERS */}
        <div className="streak-bar">
          <div className="streak-box">
            <span className="streak-num current">{streak}</span>
            <span className="streak-label">Current Streak</span>
          </div>
          <div className="streak-box">
            <span className="streak-num">{longestStreak}</span>
            <span className="streak-label">Best Streak</span>
          </div>
        </div>

        {deck.length > 0 ? (
          <>
            {/* CARD */}
            <div className="scene">
              <div
                key={cardKey}
                className={`card-inner${isFlipped ? " flipped" : ""}${guessStatus === "wrong" ? " shake" : ""}${guessStatus === "correct" ? " pop" : ""}`}
              >
                <div className="card-face card-front">
                  <span className="card-label">Question</span>
                  <p className="card-text">{card.question}</p>
                  <span className="card-hint">— type a guess below or click Flip —</span>
                </div>
                <div className="card-face card-back">
                  <span className="card-label">Answer</span>
                  <p className="card-text">{card.answer}</p>
                  <span className="card-hint">— click Flip to return —</span>
                </div>
              </div>
            </div>

            {/* GUESS INPUT */}
            <div className="guess-section">
              <div className="guess-row">
                <input
                  className={`guess-input${guessStatus === "correct" ? " correct" : guessStatus === "wrong" ? " wrong" : ""}`}
                  type="text"
                  placeholder="Type your answer here…"
                  value={guess}
                  onChange={(e) => { setGuess(e.target.value); setGuessStatus(null); }}
                  onKeyDown={handleKeyDown}
                  disabled={isFlipped}
                  aria-label="Your answer"
                />
                <button
                  className="btn-submit"
                  onClick={handleGuessSubmit}
                  disabled={isFlipped || !guess.trim()}
                >
                  Submit
                </button>
              </div>
              {guessStatus === "correct" && (
                <div className="feedback correct">✦ Correct! Well done, explorer.</div>
              )}
              {guessStatus === "wrong" && (
                <div className="feedback wrong">✗ Not quite — try again or flip the card.</div>
              )}
            </div>

            {/* NAVIGATION + ACTIONS */}
            <div className="controls">
              <button className="btn prev" onClick={handlePrev} disabled={isFirst} aria-label="Previous card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Prev
              </button>

              <span className="card-counter">{currentIndex + 1} / {deck.length}</span>

              <button className="btn next" onClick={handleNext} disabled={isLast} aria-label="Next card">
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button className="btn flip-btn" onClick={handleFlip}>
                ⟳ Flip
              </button>

              <button className="btn shuffle" onClick={isShuffled ? handleResetOrder : handleShuffle}>
                ⇄ {isShuffled ? "Unshuffle" : "Shuffle"}
              </button>

              <button className="btn master" onClick={handleMaster} disabled={deck.length <= 1}>
                ✦ Master
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            🎉 You've mastered all the cards!<br />
            <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>Unmaster some below to keep studying.</span>
          </div>
        )}

        {/* MASTERED LIST */}
        {mastered.length > 0 && (
          <div className="mastered-section">
            <div className="mastered-title">✦ Mastered Cards</div>
            <div className="mastered-list">
              {mastered.map((c) => (
                <div className="mastered-item" key={c.id}>
                  <span className="mastered-q">{c.question}</span>
                  <button className="btn-unmaster" onClick={() => handleUnmaster(c.id)}>Unmaster</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="flip-tip">✦ Fuzzy matching on · Partial answers count ✦</p>
      </div>
    </>
  );
}