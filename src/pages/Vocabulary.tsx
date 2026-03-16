import { useState, useEffect, useRef } from 'react';
import vocabData from '../data/vocabulary.json';
import synonymsData from '../data/synonyms.json';
import expressionsData from '../data/expressions.json';
import { useAppContext } from '../context/AppContext';
import { Check, X, Filter, BarChart, BookOpen, Layers, MessageSquare, ChevronLeft, ChevronRight, RotateCcw, Send } from 'lucide-react';

type Tab = 'categories' | 'guess' | 'expand' | 'expressions';

const allCategories = ['Tous', ...Array.from(new Set(vocabData.map(w => w.category)))];

/* ─── helpers ─────────────────────────────────────────────────────────── */
function removeTashkeel(text: string, show: boolean) {
  return show ? text : text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ─── FlipCard base component ─────────────────────────────────────────── */
const FlipCard = ({
  front, back, flipped, onClick, height = 260
}: { front: React.ReactNode; back: React.ReactNode; flipped: boolean; onClick: () => void; height?: number }) => (
  <div style={{ perspective: '1000px', width: '100%', maxWidth: '480px', height, cursor: 'pointer' }} onClick={onClick}>
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      transition: 'transform 0.6s', transformStyle: 'preserve-3d',
      transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
    }}>
      <div className="glass-panel" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        {front}
      </div>
      <div className="glass-panel" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--pk-surface-solid)' }}>
        {back}
      </div>
    </div>
  </div>
);

/* ─── Tab button ──────────────────────────────────────────────────────── */
const TabBtn = ({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`glass-panel ${active ? 'bg-gradient-primary' : ''}`}
    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', borderRadius: '10px', fontWeight: 'bold', color: active ? 'white' : 'var(--pk-text-secondary)', transition: 'all 0.2s' }}
  >
    {icon} {label}
  </button>
);

/* ══════════════════════════════════════════════════════════════════════════
   TAB 1 — Catégories (existing flashcard + dashboard)
══════════════════════════════════════════════════════════════════════════ */
const CategoriesTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<'flashcards' | 'dashboard'>('flashcards');
  const [acquiredWords, setAcquiredWords] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('parallel-arabic-acquired');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ learned: 0, toReview: 0 });

  useEffect(() => {
    localStorage.setItem('parallel-arabic-acquired', JSON.stringify(Array.from(acquiredWords)));
  }, [acquiredWords]);

  const filteredWords = activeCategory === 'Tous' ? vocabData : vocabData.filter(w => w.category === activeCategory);
  const safeIndex = currentIndex >= filteredWords.length ? 0 : currentIndex;
  const currentWord = filteredWords[safeIndex];

  const nextWord = (learned: boolean) => {
    if (learned && currentWord) setAcquiredWords(prev => new Set([...prev, currentWord.id]));
    setSessionStats(prev => ({ learned: prev.learned + (learned ? 1 : 0), toReview: prev.toReview + (learned ? 0 : 1) }));
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev + 1) % filteredWords.length), 200);
  };

  const rt = (t: string) => removeTashkeel(t, showTashkeel);
  const masteredWords = vocabData.filter(w => acquiredWords.has(w.id));
  const toReviewWords = vocabData.filter(w => !acquiredWords.has(w.id));
  const progressPercent = Math.round((acquiredWords.size / vocabData.length) * 100) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => setViewMode('flashcards')} className={`glass-panel ${viewMode === 'flashcards' ? 'bg-gradient-primary' : ''}`} style={{ padding: '0.7rem 1.8rem', borderRadius: '8px', fontWeight: 'bold', color: 'white' }}>Révision</button>
        <button onClick={() => setViewMode('dashboard')} className={`glass-panel ${viewMode === 'dashboard' ? 'bg-gradient-primary' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.8rem', borderRadius: '8px', fontWeight: 'bold', color: 'white' }}><BarChart size={18} /> Maîtrise</button>
      </div>

      {viewMode === 'flashcards' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '720px' }}>
            <span style={{ color: 'var(--pk-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}><Filter size={16} /> Filtre :</span>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentIndex(0); setIsFlipped(false); }}
                style={{ padding: '0.35rem 0.9rem', borderRadius: '50px', fontSize: '0.85rem', cursor: 'pointer', border: activeCategory === cat ? '1px solid var(--pk-primary)' : '1px solid var(--pk-border)', background: activeCategory === cat ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeCategory === cat ? 'white' : 'var(--pk-text-secondary)' }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#10b981' }}>Acquis (session) : <strong>{sessionStats.learned}</strong></span>
            <span style={{ color: '#ef4444' }}>À revoir (session) : <strong>{sessionStats.toReview}</strong></span>
          </div>
          {filteredWords.length > 0 && currentWord ? (
            <>
              <FlipCard
                flipped={isFlipped}
                onClick={() => setIsFlipped(!isFlipped)}
                front={
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="arabic-text" style={{ fontSize: '4rem', color: 'var(--pk-primary)' }}>{rt(currentWord.arabic)}</span>
                    {showRomanization && <span style={{ fontSize: '1.1rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>{currentWord.transliteration}</span>}
                    <span style={{ color: 'var(--pk-text-secondary)', fontSize: '0.8rem' }}>Cliquez pour la traduction</span>
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.75rem', color: 'var(--pk-text-secondary)', background: 'var(--pk-background)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{currentWord.category}</span>
                  </div>
                }
                back={
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{currentWord.translation}</h2>
                    {acquiredWords.has(currentWord.id) && <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem' }}><Check size={14} /> Déjà maîtrisé</div>}
                  </div>
                }
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={e => { e.stopPropagation(); nextWord(false); }} className="glass-panel" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><X size={18} /> À revoir</button>
                <button onClick={e => { e.stopPropagation(); nextWord(true); }} className="glass-panel" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} /> Acquis</button>
              </div>
              <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>Mot {safeIndex + 1} / {filteredWords.length}</p>
            </>
          ) : <p style={{ color: 'var(--pk-text-secondary)' }}>Aucun mot dans cette catégorie.</p>}
        </>
      )}

      {viewMode === 'dashboard' && (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Tableau de Maîtrise</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, maxWidth: '400px', height: '12px', background: 'var(--pk-surface-solid)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', transition: 'width 0.8s ease-out' }} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--pk-accent)' }}>{progressPercent}%</span>
            </div>
            <p style={{ color: 'var(--pk-text-secondary)' }}>Vous avez maîtrisé <strong>{masteredWords.length}</strong> mots sur {vocabData.length}.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <h3 style={{ borderLeft: '5px solid #10b981', paddingLeft: '1.2rem', color: '#10b981', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Maîtrisés</h3>
              {masteredWords.length === 0 ? <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Continuez à réviser !</p> :
                Array.from(new Set(masteredWords.map(w => w.category))).sort().map(cat => (
                  <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--pk-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>{cat}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.6rem' }}>
                      {masteredWords.filter(w => w.category === cat).map(word => (
                        <div key={word.id} className="glass-panel" style={{ padding: '0.7rem', border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)' }}>
                          <div className="arabic-text" style={{ fontSize: '1.1rem', color: '#10b981' }}>{rt(word.arabic)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'white' }}>{word.translation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            <div>
              <h3 style={{ borderLeft: '5px solid #6366f1', paddingLeft: '1.2rem', color: '#6366f1', fontSize: '1.4rem', marginBottom: '1.5rem' }}>À Apprendre</h3>
              {Array.from(new Set(toReviewWords.map(w => w.category))).sort().map(cat => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: 'var(--pk-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>{cat}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.6rem' }}>
                    {toReviewWords.filter(w => w.category === cat).map(word => (
                      <div key={word.id} className="glass-panel" style={{ padding: '0.7rem', opacity: 0.8 }}>
                        <div className="arabic-text" style={{ fontSize: '1.1rem', color: 'var(--pk-primary)' }}>{rt(word.arabic)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--pk-text-secondary)' }}>{word.translation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid var(--pk-border)', paddingTop: '1.5rem' }}>
            <button onClick={() => { if (window.confirm('Réinitialiser toute votre progression ?')) setAcquiredWords(new Set()); }} style={{ color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }}>Réinitialiser ma progression</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   TAB 2 — GuessHoufouf
══════════════════════════════════════════════════════════════════════════ */
const GuessTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [deck, setDeck] = useState(() => shuffleArray(vocabData));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = deck[idx % deck.length];
  const rt = (t: string) => removeTashkeel(t, showTashkeel);

  const check = () => {
    const ans = input.trim().toLowerCase();
    const expected = current.translation.toLowerCase();
    if (ans === expected || expected.includes(ans) && ans.length >= 3) {
      setStatus('correct');
      setScore(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setStatus('wrong');
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const goNext = () => {
    setIdx(i => i + 1);
    setInput('');
    setStatus('idle');
    setShowAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const restart = () => {
    setDeck(shuffleArray(vocabData));
    setIdx(0); setInput(''); setStatus('idle'); setShowAnswer(false);
    setScore({ correct: 0, wrong: 0 });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && status === 'idle') check();
    if (e.key === 'Enter' && status !== 'idle') goNext();
  };

  const cardNum = (idx % deck.length) + 1;
  const total = deck.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      {/* Header & score */}
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>GuessHoufouf 🎯</h2>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1rem' }}>Devinez la traduction du mot arabe affiché.</p>
      </div>
      <div style={{ display: 'flex', gap: '2rem', fontSize: '1rem' }}>
        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ {score.correct}</span>
        <span style={{ color: 'var(--pk-text-secondary)' }}>{cardNum} / {total}</span>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ {score.wrong}</span>
      </div>

      {/* Card face (always front — word in arabic) */}
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', border: status === 'correct' ? '2px solid #10b981' : status === 'wrong' ? '2px solid #ef4444' : '1px solid var(--pk-border)', transition: 'border 0.3s' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-secondary)', alignSelf: 'flex-end' }}>{current.category}</span>
        <span className="arabic-text" style={{ fontSize: '4.5rem', color: 'var(--pk-primary)', lineHeight: 1.2 }}>{rt(current.arabic)}</span>
        {showRomanization && <span style={{ fontSize: '1.1rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>{current.transliteration}</span>}
        {showAnswer && <div style={{ textAlign: 'center', marginTop: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: 'white', fontSize: '1.2rem' }}>➜ {current.translation}</div>}
      </div>

      {/* Input & actions */}
      {status === 'idle' ? (
        <div style={{ display: 'flex', gap: '0.8rem', width: '100%', maxWidth: '480px' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tapez la traduction en français..."
            autoFocus
            style={{ flex: 1, padding: '0.85rem 1.2rem', borderRadius: '10px', background: 'var(--pk-surface-solid)', border: '1px solid var(--pk-border)', color: 'white', fontSize: '1rem', outline: 'none' }}
          />
          <button onClick={check} className="glass-panel bg-gradient-primary" style={{ padding: '0.85rem 1.4rem', borderRadius: '10px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Send size={18} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem', fontWeight: 'bold', color: status === 'correct' ? '#10b981' : '#ef4444' }}>
            {status === 'correct' ? <><Check size={22} /> Bravo ! C'est correct !</> : <><X size={22} /> "{input}" — Réponse : <em>{current.translation}</em></>}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={goNext} className="glass-panel bg-gradient-primary" style={{ padding: '0.8rem 2rem', borderRadius: '10px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronRight size={20} /> Carte suivante
            </button>
            <button onClick={restart} className="glass-panel" style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', color: 'var(--pk-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RotateCcw size={16} /> Recommencer
            </button>
          </div>
        </div>
      )}

      {/* Skip & reveal */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {status === 'idle' && !showAnswer && (
          <button onClick={() => setShowAnswer(true)} style={{ background: 'none', border: 'none', color: 'var(--pk-text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
            Voir la réponse
          </button>
        )}
        {status === 'idle' && (
          <button onClick={goNext} style={{ background: 'none', border: 'none', color: 'var(--pk-text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ChevronRight size={14} /> Passer
          </button>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   TAB 3 — Expand (synonymes)
══════════════════════════════════════════════════════════════════════════ */
const ExpandTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const rt = (t: string) => removeTashkeel(t, showTashkeel);
  const card = synonymsData[idx];

  const go = (dir: number) => {
    setFlipped(false);
    setTimeout(() => setIdx(i => (i + dir + synonymsData.length) % synonymsData.length), 180);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Expand — Synonymes 📚</h2>
        <p style={{ color: 'var(--pk-text-secondary)' }}>Découvrez les nuances entre mots de même sens.</p>
      </div>

      <FlipCard
        flipped={flipped}
        onClick={() => setFlipped(!flipped)}
        height={300}
        front={
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.8rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.theme}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {card.words.map((w, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <span className="arabic-text" style={{ fontSize: '2.2rem', color: 'var(--pk-primary)', display: 'block' }}>{rt(w)}</span>
                  {showRomanization && <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>{card.transliterations[i]}</span>}
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.75rem', marginTop: '1.5rem' }}>Cliquez pour les traductions & nuances</p>
          </div>
        }
        back={
          <div style={{ width: '100%' }}>
            <p style={{ color: 'var(--pk-primary)', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>{card.theme}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {card.words.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.8rem', borderRadius: '8px', background: 'rgba(99,102,241,0.08)' }}>
                  <span className="arabic-text" style={{ fontSize: '1.4rem', color: 'var(--pk-primary)', minWidth: '3rem', textAlign: 'right' }}>{rt(w)}</span>
                  <span style={{ fontSize: '0.95rem', color: 'white' }}>— {card.translations[i]}</span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={() => go(-1)} className="glass-panel" style={{ padding: '0.7rem', borderRadius: '50%', display: 'flex' }}><ChevronLeft size={22} /></button>
        <span style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>{idx + 1} / {synonymsData.length}</span>
        <button onClick={() => go(1)} className="glass-panel" style={{ padding: '0.7rem', borderRadius: '50%', display: 'flex' }}><ChevronRight size={22} /></button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   TAB 4 — Expressions
══════════════════════════════════════════════════════════════════════════ */
const ExpressionsTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const rt = (t: string) => removeTashkeel(t, showTashkeel);
  const card = expressionsData[idx];

  const go = (dir: number) => {
    setFlipped(false);
    setTimeout(() => setIdx(i => (i + dir + expressionsData.length) % expressionsData.length), 180);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Expressions Arabes 💬</h2>
        <p style={{ color: 'var(--pk-text-secondary)' }}>Des expressions du quotidien, authentiques et variées.</p>
      </div>

      <FlipCard
        flipped={flipped}
        onClick={() => setFlipped(!flipped)}
        height={320}
        front={
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
            <span className="arabic-text" style={{ fontSize: '3rem', color: 'var(--pk-primary)', lineHeight: 1.3 }}>{rt(card.arabic)}</span>
            {showRomanization && <span style={{ fontSize: '1rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>{card.transliteration}</span>}
            <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Cliquez pour la signification</p>
          </div>
        }
        back={
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>{card.translation}</h3>
            <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', borderLeft: '3px solid var(--pk-primary)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', lineHeight: 1.6 }}>{card.context}</p>
            </div>
            {card.example && (
              <p style={{ fontSize: '0.85rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>Ex. : {card.example}</p>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={() => go(-1)} className="glass-panel" style={{ padding: '0.7rem', borderRadius: '50%', display: 'flex' }}><ChevronLeft size={22} /></button>
        <span style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>{idx + 1} / {expressionsData.length}</span>
        <button onClick={() => go(1)} className="glass-panel" style={{ padding: '0.7rem', borderRadius: '50%', display: 'flex' }}><ChevronRight size={22} /></button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN VOCABULARY PAGE
══════════════════════════════════════════════════════════════════════════ */
const Vocabulary = () => {
  const [tab, setTab] = useState<Tab>('categories');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="text-gradient">Vocabulaire</h1>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.1rem' }}>Quatre manières d'enrichir votre vocabulaire arabe.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        <TabBtn active={tab === 'categories'} onClick={() => setTab('categories')} icon={<BookOpen size={16} />} label="Par Catégorie" />
        <TabBtn active={tab === 'guess'} onClick={() => setTab('guess')} icon={<MessageSquare size={16} />} label="GuessHoufouf 🎯" />
        <TabBtn active={tab === 'expand'} onClick={() => setTab('expand')} icon={<Layers size={16} />} label="Expand" />
        <TabBtn active={tab === 'expressions'} onClick={() => setTab('expressions')} icon={<MessageSquare size={16} />} label="Expressions" />
      </div>

      {/* Tab content */}
      <div style={{ minHeight: '500px' }}>
        {tab === 'categories' && <CategoriesTab />}
        {tab === 'guess' && <GuessTab />}
        {tab === 'expand' && <ExpandTab />}
        {tab === 'expressions' && <ExpressionsTab />}
      </div>
    </div>
  );
};

export default Vocabulary;
