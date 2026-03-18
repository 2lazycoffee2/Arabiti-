import { useState } from 'react';
import vocabData from '../data/vocabulary.json';
import { useAppContext } from '../context/AppContext';
import { Check } from 'lucide-react';

const ExpandTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const currentWord = vocabData[currentIndex];
  const allCategories = Array.from(new Set(vocabData.map(w => w.category)));
  const wordsByCategory = allCategories.reduce((acc, cat) => {
    acc[cat] = vocabData.filter(w => w.category === cat);
    return acc;
  }, {} as Record<string, typeof vocabData>);

  const removeTashkeel = (text: string) => {
    if (showTashkeel) return text;
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const nextWord = () => {
    setCurrentIndex((prev) => (prev + 1) % vocabData.length);
  };

  const prevWord = () => {
    setCurrentIndex((prev) => (prev - 1 + vocabData.length) % vocabData.length);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--pk-primary)', marginBottom: '1rem' }}>Expand 📚</h2>
        <p style={{ color: 'var(--pk-text-secondary)' }}>Explorez le vocabulaire par catégories avec cartes extensibles</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '1rem',
          padding: '1rem',
          background: 'var(--pk-surface-solid)',
          borderRadius: '12px'
        }}>
          <button 
            onClick={prevWord}
            className="glass-panel"
            style={{ padding: '0.5rem', borderRadius: '8px' }}
          >
            ← Précédent
          </button>
          
          <span style={{ fontSize: '1.1rem', color: 'var(--pk-text-primary)' }}>
            Mot {currentIndex + 1} / {vocabData.length}
          </span>
          
          <button 
            onClick={nextWord}
            className="glass-panel"
            style={{ padding: '0.5rem', borderRadius: '8px' }}
          >
            Suivant →
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="arabic-text" style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--pk-primary)' }}>
              {removeTashkeel(currentWord.arabic)}
            </span>
            {showRomanization && (
              <div style={{ fontSize: '1.2rem', color: 'var(--pk-text-secondary)', marginTop: '0.5rem' }}>
                {currentWord.transliteration}
              </div>
            )}
            <div style={{ 
              fontSize: '1.4rem', 
              color: 'var(--pk-text-primary)', 
              fontWeight: 'bold',
              marginTop: '1rem'
            }}>
              {currentWord.translation}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: 'var(--pk-text-secondary)', 
              marginTop: '0.5rem',
              background: 'var(--pk-surface)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              {currentWord.category}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {Object.entries(wordsByCategory).map(([category, words]) => (
          <div key={category} className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ 
              color: 'var(--pk-primary)', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {words.slice(0, 3).map((word) => (
                <div 
                  key={word.id}
                  className="glass-panel"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: expandedCards.has(words.indexOf(word)) ? '2px solid var(--pk-primary)' : '1px solid var(--pk-border)'
                  }}
                  onClick={() => toggleCardExpansion(words.indexOf(word))}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="arabic-text" style={{ fontSize: '1.5rem', color: 'var(--pk-text-primary)' }}>
                        {removeTashkeel(word.arabic)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', marginLeft: '0.5rem' }}>
                        {word.translation}
                      </span>
                    </div>
                    <Check 
                      size={16} 
                      color={expandedCards.has(words.indexOf(word)) ? 'var(--pk-primary)' : 'var(--pk-text-secondary)'} 
                    />
                  </div>
                  
                  {expandedCards.has(words.indexOf(word)) && (
                    <div style={{ 
                      marginTop: '0.8rem', 
                      paddingTop: '0.8rem', 
                      borderTop: '1px solid var(--pk-border)',
                      fontSize: '0.85rem',
                      color: 'var(--pk-text-secondary)'
                    }}>
                      {showRomanization && (
                        <div style={{ marginBottom: '0.3rem', fontStyle: 'italic' }}>
                          {word.transliteration}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {words.length > 3 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '0.5rem', 
                  color: 'var(--pk-text-secondary)',
                  fontSize: '0.8rem'
                }}>
                  ... et {words.length - 3} autres mots
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandTab;
