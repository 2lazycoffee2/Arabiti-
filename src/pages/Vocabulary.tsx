import { useState, useEffect } from 'react';
import vocabData from '../data/vocabulary.json';
import { useAppContext } from '../context/AppContext';
import { Check, X, Filter, BarChart, Send, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import expressionsData from '../data/expressions.json';
import ExpandTab from '../components/ExpandTab';

type Tab = 'categories' | 'guess' | 'expand' | 'expressions';

const allCategories = ['Tous', ...Array.from(new Set(vocabData.map(w => w.category)))];

/* ─── helpers ─────────────────────────────────────────────────────────── */
function removeTashkeel(text: string, show: boolean) {
  return show ? text : text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
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
    className={`glass-panel ${active ? 'bg-gradient-primary text-white' : ''}`}
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
  const progressPercent = Math.round((acquiredWords.size / vocabData.length) * 100) || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => setViewMode('flashcards')} className={`glass-panel ${viewMode === 'flashcards' ? 'bg-gradient-primary text-white' : ''}`} style={{ padding: '0.7rem 1.8rem', borderRadius: '8px', fontWeight: 'bold', color: viewMode === 'flashcards' ? 'white' : 'var(--pk-text-secondary)' }}>Révision</button>
        <button onClick={() => setViewMode('dashboard')} className={`glass-panel ${viewMode === 'dashboard' ? 'bg-gradient-primary text-white' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.8rem', borderRadius: '8px', fontWeight: 'bold', color: viewMode === 'dashboard' ? 'white' : 'var(--pk-text-secondary)' }}><BarChart size={18} /> Maîtrise</button>
      </div>

      {viewMode === 'flashcards' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '720px' }}>
            <span style={{ color: 'var(--pk-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}><Filter size={16} /> Filtre :</span>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentIndex(0); setIsFlipped(false); }}
                style={{ padding: '0.35rem 0.9rem', borderRadius: '50px', fontSize: '0.85rem', cursor: 'pointer', border: activeCategory === cat ? '1px solid var(--pk-primary)' : '1px solid var(--pk-border)', background: activeCategory === cat ? 'var(--pk-primary)' : 'transparent', color: activeCategory === cat ? 'white' : 'var(--pk-text-secondary)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {allCategories.filter(cat => cat !== 'Tous').map(cat => {
              const catWords = vocabData.filter(w => w.category === cat);
              const catMastered = catWords.filter(w => acquiredWords.has(w.id));
              const catProgress = catWords.length > 0 ? Math.round((catMastered.length / catWords.length) * 100) : 0;
              return (
                <div key={cat} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ color: 'var(--pk-primary)', marginBottom: '1rem' }}>{cat}</h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--pk-accent)', marginBottom: '0.5rem' }}>{catProgress}%</div>
                  <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>{catMastered.length} / {catWords.length} mots</p>
                  <div style={{ width: '100%', height: '8px', background: 'var(--pk-surface-solid)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.8rem' }}>
                    <div style={{ width: `${catProgress}%`, height: '100%', background: 'linear-gradient(90deg,var(--pk-primary),var(--pk-secondary))', transition: 'width 0.8s ease-out' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
        <TabBtn active={tab === 'categories'} onClick={() => setTab('categories')} icon={<BarChart size={16} />} label="Par Catégorie" />
        <TabBtn active={tab === 'guess'} onClick={() => setTab('guess')} icon={<Filter size={16} />} label="GuessKalimat 🎯" />
        <TabBtn active={tab === 'expand'} onClick={() => setTab('expand')} icon={<BarChart size={16} />} label="Expand" />
        <TabBtn active={tab === 'expressions'} onClick={() => setTab('expressions')} icon={<Filter size={16} />} label="Expressions" />
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

/* ══════════════════════════════════════════════════════════════════════════
   TAB 2 — GuessKalimat (Deviner le mot)
══════════════════════════════════════════════════════════════════════════ */
const GuessTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [currentWord, setCurrentWord] = useState(vocabData[0]);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const getRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * vocabData.length);
    setCurrentWord(vocabData[randomIndex]);
    setUserInput('');
    setShowResult(false);
    setIsCorrect(false);
  };

  const checkAnswer = () => {
    const correct = userInput.toLowerCase().trim() === currentWord.translation.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    setAttempts(attempts + 1);
    if (correct) {
      setScore(score + 1);
    }
  };

  const rt = (t: string) => removeTashkeel(t, showTashkeel);

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--pk-primary)', marginBottom: '1rem' }}>GuessKalimat 🎯</h2>
        <p style={{ color: 'var(--pk-text-secondary)' }}>Devine le mot français correspondant à l'arabe</p>
        
        <div style={{ background: 'var(--pk-surface-solid)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div className="arabic-text" style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {rt(currentWord.arabic)}
          </div>
          {showRomanization && (
            <div style={{ fontSize: '1.2rem', color: 'var(--pk-text-secondary)', marginBottom: '0.5rem' }}>
              {currentWord.transliteration}
            </div>
          )}
          <div style={{ fontSize: '1.3rem', color: 'var(--pk-text-primary)', fontWeight: 'bold' }}>
            Catégorie: {currentWord.category}
          </div>
        </div>

        {!showResult ? (
          <div>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Écris ta réponse en français..."
              style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '1.1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--pk-border)',
                background: 'var(--pk-surface-solid)',
                marginBottom: '1rem',
                color: 'var(--pk-text-primary)'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  checkAnswer();
                }
              }}
            />
            <button 
              onClick={checkAnswer}
              className="bg-gradient-primary"
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: '12px', 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Send size={20} />
              Vérifier
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: isCorrect ? '#10b981' : '#ef4444'
            }}>
              {isCorrect ? '✅ Correct !' : '❌ Incorrect !'}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--pk-text-secondary)' }}>Ta réponse:</span>
                <div style={{ 
                  padding: '0.8rem', 
                  background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px',
                  color: isCorrect ? '#10b981' : '#ef4444'
                }}>
                  {userInput}
                </div>
              </div>
              
              <div>
                <span style={{ color: 'var(--pk-text-secondary)' }}>Bonne réponse:</span>
                <div style={{ 
                  padding: '0.8rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: '8px',
                  color: '#10b981'
                }}>
                  {currentWord.translation}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <button 
                onClick={getRandomWord}
                className="action-btn"
                style={{ padding: '1rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RotateCcw size={20} />
                Mot suivant
              </button>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--pk-text-secondary)' }}>
              Score: {score}/{attempts} {attempts > 0 && `(${Math.round((score/attempts) * 100)}%)`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



/* ══════════════════════════════════════════════════════════════════════════
   TAB 4 — Expressions (Expressions courantes)
══════════════════════════════════════════════════════════════════════════ */
const ExpressionsTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentExpression = expressionsData[currentIndex];

  const rt = (t: string) => removeTashkeel(t, showTashkeel);

  const nextExpression = () => {
    setCurrentIndex((prev) => (prev + 1) % expressionsData.length);
  };

  const prevExpression = () => {
    setCurrentIndex((prev) => (prev - 1 + expressionsData.length) % expressionsData.length);
  };

  const shuffleExpressions = () => {
    setCurrentIndex(Math.floor(Math.random() * expressionsData.length));
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--pk-primary)', marginBottom: '1rem' }}>Expressions 💬</h2>
        <p style={{ color: 'var(--pk-text-secondary)' }}>Apprenez les expressions courantes en arabe</p>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        padding: '1rem',
        background: 'var(--pk-surface-solid)',
        borderRadius: '12px'
      }}>
        <button 
          onClick={prevExpression}
          className="glass-panel"
          style={{ padding: '0.5rem', borderRadius: '8px' }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <span style={{ fontSize: '1.1rem', color: 'var(--pk-text-primary)' }}>
          Expression {currentIndex + 1} / {expressionsData.length}
        </span>
        
        <button 
          onClick={nextExpression}
          className="glass-panel"
          style={{ padding: '0.5rem', borderRadius: '8px' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="arabic-text" style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: 'var(--pk-primary)', 
            marginBottom: '1.5rem',
            lineHeight: 1.3 
          }}>
            {rt(currentExpression.arabic)}
          </div>
          
          {showRomanization && (
            <div style={{ 
              fontSize: '1.2rem', 
              color: 'var(--pk-text-secondary)', 
              marginBottom: '1rem',
              fontStyle: 'italic'
            }}>
              {currentExpression.transliteration}
            </div>
          )}
          
          <div style={{ 
            fontSize: '1.6rem', 
            color: 'var(--pk-text-primary)', 
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            {currentExpression.translation}
          </div>
          
          <div style={{ 
            fontSize: '1rem', 
            color: 'var(--pk-text-secondary)', 
            marginBottom: '1rem',
            background: 'var(--pk-surface)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            {currentExpression.context}
          </div>
          
          {currentExpression.example && (
            <div style={{ 
              textAlign: 'left',
              background: 'var(--pk-surface-solid)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--pk-border)',
              marginTop: '1rem'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', marginBottom: '0.5rem' }}>
                <strong>Exemple :</strong>
              </div>
              <div className="arabic-text" style={{ fontSize: '1.3rem', color: 'var(--pk-primary)', marginBottom: '0.5rem' }}>
                {rt(currentExpression.example)}
              </div>
              {showRomanization && (
                <div style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  {currentExpression.transliteration}
                </div>
              )}
              <div style={{ fontSize: '1rem', color: 'var(--pk-text-primary)' }}>
                {currentExpression.example}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button 
          onClick={shuffleExpressions}
          className="bg-gradient-primary"
          style={{ 
            padding: '1rem 2rem', 
            borderRadius: '12px', 
            color: 'white', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RotateCcw size={20} />
          Expression aléatoire
        </button>
      </div>
    </div>
  );
};

export default Vocabulary;
