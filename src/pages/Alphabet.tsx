import { useState } from 'react';
import alphabetData from '../data/alphabet.json';
import AlphabetGames from '../components/AlphabetGames';

type AlphabetEntry = {
  id: string;
  name: string;
  letter: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  pronunciation: string;
  type: string;
  category: string;
  description?: string;
  example?: string;
};

const data = alphabetData as AlphabetEntry[];

const Alphabet = () => {
  const [activeSegment, setActiveSegment] = useState<'table' | 'practice'>('table');
  const [selectedCategory, setSelectedCategory] = useState('Lettres');
  const [selectedLetter, setSelectedLetter] = useState<AlphabetEntry>(data[0]);

  const categories = Array.from(new Set(data.map(l => l.category)));
  const filteredData = data.filter(l => l.category === selectedCategory);
  const isLongVowel = selectedLetter.category === 'Voyelles Longues';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient">L'Alphabet et la Phonétique</h1>
          <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.1rem' }}>
            Maîtrisez les 28 lettres, le Tashkeel et les voyelles longues.
          </p>
        </div>

        {/* Top Navigation Switch */}
        <div style={{ 
          display: 'flex', 
          background: 'var(--pk-surface-solid)', 
          padding: '0.4rem', 
          borderRadius: '12px',
          border: '1px solid var(--pk-border)'
        }}>
          <button
            onClick={() => setActiveSegment('table')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              background: activeSegment === 'table' ? 'var(--pk-primary)' : 'transparent',
              color: activeSegment === 'table' ? 'white' : 'var(--pk-text-secondary)',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            Tableau
          </button>
          <button
            onClick={() => setActiveSegment('practice')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              background: activeSegment === 'practice' ? 'var(--pk-primary)' : 'transparent',
              color: activeSegment === 'practice' ? 'white' : 'var(--pk-text-secondary)',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            Pratique
          </button>
        </div>
      </div>

      {activeSegment === 'table' ? (
        <>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  const firstOfCat = data.find(l => l.category === cat);
                  if (firstOfCat) setSelectedLetter(firstOfCat);
                }}
                className={`glass-panel ${selectedCategory === cat ? 'bg-gradient-primary text-white' : ''}`}
                style={{ 
                  padding: '0.6rem 1.5rem', 
                  borderRadius: '50px', 
                  color: selectedCategory === cat ? 'white' : 'var(--pk-text-secondary)', 
                  fontWeight: 'bold',
                  border: selectedCategory === cat ? 'none' : '1px solid var(--pk-border)',
                  background: selectedCategory === cat ? '' : 'var(--pk-surface)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '2rem' }}>
            {/* Detail panel */}
            <div className="glass-panel" style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="arabic-text" style={{ fontSize: isLongVowel ? '4rem' : '7.rem', color: 'var(--pk-primary)', display: 'block', lineHeight: 1.2 }}>
                  {selectedLetter.letter}
                </span>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{selectedLetter.name}</h2>
                <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.05rem', marginTop: '0.3rem' }}>
                  Prononciation : <strong style={{ color: 'var(--pk-text-primary)' }}>{selectedLetter.pronunciation}</strong>
                </p>
              </div>

              {/* Formes (Lettres only) */}
              {selectedLetter.category === 'Lettres' && (
                <div style={{ background: 'var(--pk-surface-solid)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--pk-border)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--pk-text-secondary)', marginBottom: '1rem' }}>Formes d'écriture</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                    <div><span className="arabic-text" style={{ fontSize: '1.8rem', color: 'var(--pk-text-primary)' }}>{selectedLetter.isolated}</span><br /><small style={{ color: 'var(--pk-text-secondary)' }}>Isolée</small></div>
                    <div><span className="arabic-text" style={{ fontSize: '1.8rem', color: 'var(--pk-text-primary)' }}>{selectedLetter.initial}</span><br /><small style={{ color: 'var(--pk-text-secondary)' }}>Initiale</small></div>
                    <div><span className="arabic-text" style={{ fontSize: '1.8rem', color: 'var(--pk-text-primary)' }}>{selectedLetter.medial}</span><br /><small style={{ color: 'var(--pk-text-secondary)' }}>Médiane</small></div>
                    <div><span className="arabic-text" style={{ fontSize: '1.8rem', color: 'var(--pk-text-primary)' }}>{selectedLetter.final}</span><br /><small style={{ color: 'var(--pk-text-secondary)' }}>Finale</small></div>
                  </div>
                </div>
              )}

              {/* Voyelles longues — description + example */}
              {isLongVowel && selectedLetter.description && (
                <div style={{ background: 'var(--pk-surface-solid)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--pk-border)' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comment ça marche</h3>
                    <p style={{ color: 'var(--pk-text-primary)', fontSize: '1rem', lineHeight: 1.6 }}>{selectedLetter.description}</p>
                  </div>
                  {selectedLetter.example && (
                    <div style={{ borderTop: '1px solid var(--pk-border)', paddingTop: '1rem' }}>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exemples</h3>
                      <p className="arabic-text" style={{ fontSize: '1.4rem', lineHeight: 2, color: 'var(--pk-text-primary)' }}>{selectedLetter.example}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Type badge */}
              <div style={{ padding: '1rem', border: '1px solid var(--pk-border)', borderRadius: '8px', background: 'var(--pk-surface)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', margin: 0 }}>
                  <strong style={{ color: 'var(--pk-text-primary)' }}>Type :</strong> {selectedLetter.type}
                </p>
              </div>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isLongVowel
                ? 'repeat(auto-fill, minmax(200px, 1fr))'
                : 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '1rem',
              alignContent: 'start'
            }}>
              {filteredData.map(letter => (
                  <button
                    key={letter.id}
                    onClick={() => setSelectedLetter(letter)}
                    className="glass-panel"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: isLongVowel ? '2rem 1.5rem' : '1.5rem',
                      border: selectedLetter.id === letter.id ? '2px solid var(--pk-primary)' : '1px solid var(--pk-border)',
                      transform: selectedLetter.id === letter.id ? 'scale(1.05)' : '',
                      background: selectedLetter.id === letter.id ? 'var(--pk-surface-solid)' : 'var(--pk-surface)',
                      color: 'var(--pk-text-primary)'
                    }}
                  >
                    <span className="arabic-text" style={{ fontSize: isLongVowel ? '2.2rem' : '2.5rem', marginBottom: '0.4rem', color: selectedLetter.id === letter.id ? 'var(--pk-primary)' : 'var(--pk-text-primary)' }}>{letter.letter}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--pk-text-secondary)', fontWeight: 'bold', textAlign: 'center' }}>{letter.name}</span>
                    {isLongVowel && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--pk-primary)', marginTop: '0.3rem', fontStyle: 'italic' }}>{letter.isolated}</span>
                    )}
                  </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <AlphabetGames data={data} />
      )}
    </div>
  );
};

export default Alphabet;
