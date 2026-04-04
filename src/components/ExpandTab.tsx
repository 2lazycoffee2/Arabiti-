import { useState, useEffect } from 'react';
import vocabData from '../data/vocabulary.json';
import { useAppContext } from '../context/AppContext';
import { ChevronDown, ChevronUp, RotateCcw, CheckCircle } from 'lucide-react';

const ExpandTab = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [acquiredWords, setAcquiredWords] = useState<Set<string>>(new Set());

  // Load acquired from localstorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('parallel-arabic-acquired') || '[]');
      setAcquiredWords(new Set(stored));
    } catch(e) {}
  }, []);

  const saveAcquired = (newSet: Set<string>) => {
    setAcquiredWords(newSet);
    localStorage.setItem('parallel-arabic-acquired', JSON.stringify(Array.from(newSet)));
  };

  const toggleAcquired = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(acquiredWords);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    saveAcquired(newSet);
  };

  const allCategories = Array.from(new Set(vocabData.map(w => w.category)));
  
  const toggleCategory = (cat: string) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(cat);
      setFlippedCards(new Set());
    }
  };

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const rt = (t: string) => showTashkeel ? t : t.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div>
        <h1 className="text-gradient">Vocabulaire 📚</h1>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.1rem' }}>
          Cliquez sur une rubrique thématique (Transport, etc.) pour interagir avec les cartes et marquer celles que vous maîtrisez !
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {allCategories.map(cat => {
          const isExpanded = expandedCategory === cat;
          const words = vocabData.filter(w => w.category === cat);
          const acquiredCount = words.filter(w => acquiredWords.has(w.id)).length;
          
          let emoji = '📌';
          if (cat === 'Nourriture') emoji = '🍲';
          if (cat === 'Transports') emoji = '🚗';
          if (cat === 'Salutations') emoji = '👋';
          if (cat === 'Lieux') emoji = '🏛️';
          if (cat === 'Temps') emoji = '⏳';
          if (cat === 'Boissons') emoji = '☕';
          if (cat === 'Objets') emoji = '📦';
          if (cat === 'Adjectifs') emoji = '✨';
          if (cat === 'Émotions') emoji = '❤️';
          if (cat === 'Personnes') emoji = '👥';
          if (cat === 'Famille') emoji = '👨‍👩‍👧‍👦';
          if (cat === 'Nombres') emoji = '🔢';
          if (cat === 'Verbes') emoji = '✅';
          
          return (
            <section key={cat} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleCategory(cat)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1.5rem 2rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                  borderBottom: isExpanded ? '1px solid var(--pk-border)' : 'none'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.4rem' }}>
                    <span>{emoji}</span> {cat}
                    {acquiredCount === words.length && <CheckCircle size={20} color="#10b981" />}
                  </h2>
                  <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    {acquiredCount} / {words.length} mots acquis
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={24} color="var(--pk-text-secondary)" /> : <ChevronDown size={24} color="var(--pk-text-secondary)" />}
              </div>

              {isExpanded && (
                <div className="animate-fade-in" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                  {words.map(word => {
                    const isFlipped = flippedCards.has(word.id);
                    const acquired = acquiredWords.has(word.id);

                    return (
                      <div 
                        key={word.id} 
                        style={{ perspective: '1000px', cursor: 'pointer', height: '220px', position: 'relative' }}
                      >
                        <div style={{
                          width: '100%', height: '100%', position: 'relative',
                          transition: 'transform 0.6s', transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}>
                          {/* Recto */}
                          <div className="glass-panel hover-lift" 
                               onClick={(e) => toggleFlip(word.id, e)}
                               style={{ 
                                position: 'absolute', inset: 0, backfaceVisibility: 'hidden', 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                padding: '1.5rem', border: acquired ? '2px solid #10b981' : '2px solid var(--pk-primary)', 
                                borderRadius: '15px'
                          }}>
                            <button 
                              onClick={(e) => toggleAcquired(word.id, e)}
                              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <CheckCircle size={28} color={acquired ? '#10b981' : 'var(--pk-text-secondary)'} opacity={acquired ? 1 : 0.3} />
                            </button>
                            <span className="arabic-text" style={{ fontSize: '3.5rem', fontWeight: 'bold', color: acquired ? '#10b981' : 'var(--pk-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                              {rt(word.arabic)}
                            </span>
                            <div style={{ position: 'absolute', bottom: '15px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-text-secondary)', fontSize: '0.8rem', opacity: 0.8 }}>
                              <RotateCcw size={14} /> Retourner
                            </div>
                          </div>
                          
                          {/* Verso */}
                          <div className="glass-panel" 
                               onClick={(e) => toggleFlip(word.id, e)}
                               style={{ 
                                position: 'absolute', inset: 0, backfaceVisibility: 'hidden', 
                                transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', 
                                alignItems: 'center', justifyContent: 'center', padding: '1.5rem', 
                                background: 'var(--pk-surface-solid)', border: '2px solid var(--pk-secondary)', borderRadius: '15px'
                          }}>
                             <button 
                              onClick={(e) => toggleAcquired(word.id, e)}
                              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <CheckCircle size={28} color={acquired ? '#10b981' : 'var(--pk-text-secondary)'} opacity={acquired ? 1 : 0.3} />
                            </button>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--pk-text-primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                              {word.translation}
                            </span>
                            {showRomanization && word.transliteration && (
                               <span style={{ fontSize: '1.3rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>
                                 {word.transliteration}
                               </span>
                            )}
                            <div style={{ position: 'absolute', bottom: '15px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-text-secondary)', fontSize: '0.8rem', opacity: 0.8 }}>
                              <RotateCcw size={14} /> Retourner
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ExpandTab;
