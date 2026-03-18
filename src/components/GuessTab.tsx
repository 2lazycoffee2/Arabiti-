import { useState } from 'react';
import vocabData from '../data/vocabulary.json';
import { useAppContext } from '../context/AppContext';
import { Send, RotateCcw } from 'lucide-react';

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

  const removeTashkeel = (text: string) => {
    if (showTashkeel) return text;
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--pk-primary)', marginBottom: '1rem' }}>GuessKalimat 🎯</h2>
        <p style={{ color: 'var(--pk-text-secondary)' }}>Devine le mot français correspondant à l'arabe</p>
        
        <div style={{ background: 'var(--pk-surface-solid)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div className="arabic-text" style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {removeTashkeel(currentWord.arabic)}
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
                marginBottom: '1rem'
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
                width: '100%'
              }}
            >
              <Send size={20} style={{ marginRight: '0.5rem' }} />
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
                style={{ padding: '1rem 2rem', borderRadius: '12px' }}
              >
                <RotateCcw size={20} style={{ marginRight: '0.5rem' }} />
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

export default GuessTab;
