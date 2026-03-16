import React, { useState, useEffect, useMemo } from 'react';

type AlphabetEntry = {
  id: string;
  name: string;
  letter: string;
  pronunciation: string;
  category: string;
};

interface AlphabetGamesProps {
  data: AlphabetEntry[];
}

type GameMode = 'son-to-lettre' | 'lettre-to-son';

const AlphabetGames: React.FC<AlphabetGamesProps> = ({ data }) => {
  const letters = useMemo(() => data.filter(item => item.category === 'Lettres'), [data]);
  const [gameMode, setGameMode] = useState<GameMode>('lettre-to-son');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [options, setOptions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const [masteredLetters, setMasteredLetters] = useState<string[]>(() => {
    const saved = localStorage.getItem('masteredLetters');
    return saved ? JSON.parse(saved) : [];
  });

  const nextQuestion = () => {
    const nextIndex = Math.floor(Math.random() * letters.length);
    setCurrentLetterIndex(nextIndex);
    
    // Generate options
    const currentLetter = letters[nextIndex];
    const otherLetters = letters.filter(l => l.id !== currentLetter.id);
    const shuffledOthers = [...otherLetters].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    let newOptions;
    if (gameMode === 'lettre-to-son') {
      newOptions = [...shuffledOthers.map(l => l.pronunciation), currentLetter.pronunciation];
    } else {
      newOptions = [...shuffledOthers.map(l => l.letter), currentLetter.letter];
    }
    
    setOptions(newOptions.sort(() => 0.5 - Math.random()));
    setFeedback({ message: '', type: null });
  };

  useEffect(() => {
    nextQuestion();
  }, [letters, gameMode]);

  const handleAnswer = (answer: string) => {
    const currentLetter = letters[currentLetterIndex];
    const isCorrect = gameMode === 'lettre-to-son' 
      ? answer === currentLetter.pronunciation 
      : answer === currentLetter.letter;

    if (isCorrect) {
      setFeedback({ message: 'Excellent ! ✨', type: 'success' });
      
      if (!masteredLetters.includes(currentLetter.id)) {
        const newMastered = [...masteredLetters, currentLetter.id];
        setMasteredLetters(newMastered);
        localStorage.setItem('masteredLetters', JSON.stringify(newMastered));
      }

      setTimeout(nextQuestion, 1500);
    } else {
      const correctVal = gameMode === 'lettre-to-son' ? currentLetter.pronunciation : currentLetter.letter;
      setFeedback({ message: `Pas tout à fait. C'était "${correctVal}"`, type: 'error' });
      setTimeout(nextQuestion, 2000);
    }
  };

  const currentLetter = letters[currentLetterIndex];
  const progressPercent = Math.round((masteredLetters.length / letters.length) * 100);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => setGameMode('lettre-to-son')}
          className={`glass-panel ${gameMode === 'lettre-to-son' ? 'bg-gradient-primary text-white' : ''}`}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.9rem', color: gameMode === 'lettre-to-son' ? 'white' : 'var(--pk-text-secondary)' }}
        >
          Son de la lettre
        </button>
        <button
          onClick={() => setGameMode('son-to-lettre')}
          className={`glass-panel ${gameMode === 'son-to-lettre' ? 'bg-gradient-primary text-white' : ''}`}
          style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.9rem', color: gameMode === 'son-to-lettre' ? 'white' : 'var(--pk-text-secondary)' }}
        >
          Trouver la lettre
        </button>
      </div>

      {/* Progress Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Maîtrise de l'Alphabet</h3>
          <span style={{ fontWeight: 'bold', color: 'var(--pk-primary)' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '10px', background: 'var(--pk-border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            background: 'linear-gradient(90deg, var(--pk-primary), var(--pk-secondary))',
            transition: 'width 0.5s ease'
          }} />
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--pk-text-secondary)', marginTop: '0.5rem', textAlign: 'center' }}>
          {masteredLetters.length === letters.length 
            ? "Félicitations ! Vous avez appris l'alphabet complet ! 🎉" 
            : `${masteredLetters.length} sur ${letters.length} lettres apprises`}
        </p>
      </div>

      {/* Game Card */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem', position: 'relative' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          {gameMode === 'lettre-to-son' ? "Quel est le son de cette lettre ?" : `Quelle lettre correspond au son "${currentLetter?.pronunciation}" ?`}
        </div>
        
        {gameMode === 'lettre-to-son' ? (
          <div className="arabic-text" style={{ fontSize: '8rem', color: 'var(--pk-primary)', lineHeight: 1.2, margin: '1rem 0' }}>
            {currentLetter?.letter}
          </div>
        ) : (
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--pk-primary)', margin: '2rem 0' }}>
            {currentLetter?.pronunciation}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '2rem' }}>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={feedback.type !== null}
              className="glass-panel"
              style={{
                padding: '1.2rem',
                fontSize: gameMode === 'lettre-to-son' ? '1.2rem' : '2rem',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                background: feedback.type === 'success' && (gameMode === 'lettre-to-son' ? opt === currentLetter.pronunciation : opt === currentLetter.letter)
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : feedback.type === 'error' && (gameMode === 'lettre-to-son' ? opt === currentLetter.pronunciation : opt === currentLetter.letter)
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'var(--pk-surface)',
                border: feedback.type === 'success' && (gameMode === 'lettre-to-son' ? opt === currentLetter.pronunciation : opt === currentLetter.letter)
                  ? '2px solid var(--pk-accent)'
                  : '1px solid var(--pk-border)',
                color: 'var(--pk-text-primary)'
              }}
            >
              <span className={gameMode === 'son-to-lettre' ? 'arabic-text' : ''}>{opt}</span>
            </button>
          ))}
        </div>

        {feedback.message && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            borderRadius: '12px',
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: feedback.type === 'success' ? '#10b981' : '#ef4444',
            fontWeight: 'bold',
            animation: 'fadeIn 0.3s ease'
          }}>
            {feedback.message}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
         <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>
            Apprenez chaque lettre pour débloquer votre badge de Maîtrise !
         </p>
      </div>
    </div>
  );
};

export default AlphabetGames;
