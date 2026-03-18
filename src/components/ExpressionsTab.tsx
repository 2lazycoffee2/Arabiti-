import { useState } from 'react';
import expressionsData from '../data/expressions.json';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const ExpressionsTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentExpression = expressionsData[currentIndex];

  const removeTashkeel = (text: string) => {
    if (showTashkeel) return text;
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

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
            {removeTashkeel(currentExpression.arabic)}
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
                {removeTashkeel(currentExpression.example)}
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

export default ExpressionsTab;
