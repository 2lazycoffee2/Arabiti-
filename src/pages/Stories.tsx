import { useState } from 'react';
import _storiesData from '../data/stories.json';
import { useAppContext } from '../context/AppContext';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

type Segment = { arabic: string; translation: string; romanization?: string };
type Story = { id: string; title: string; difficulty: string; segments: Segment[] };
const storiesData: Story[] = _storiesData as Story[];

const Stories = () => {
  const [activeDifficulty, setActiveDifficulty] = useState<string>('Tous');
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const { showTashkeel, showRomanization, completeStory, completedStories } = useAppContext();

  const difficulties = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];

  const filteredStories = activeDifficulty === 'Tous' 
    ? storiesData 
    : storiesData.filter(s => s.difficulty === activeDifficulty);

  const toggleStory = (id: string) => {
    setExpandedStoryId(prev => (prev === id ? null : id));
  };

  const removeTashkeel = (text: string) => {
    if (showTashkeel) return text;
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="text-gradient">Histoires Courtes</h1>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.1rem' }}>
          Explorez des récits adaptés à votre niveau pour améliorer votre compréhension.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        {difficulties.map(diff => (
          <button
            key={diff}
            onClick={() => { setActiveDifficulty(diff); setExpandedStoryId(null); }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid var(--pk-border)',
              background: activeDifficulty === diff ? 'var(--pk-primary)' : 'rgba(255,255,255,0.05)',
              color: activeDifficulty === diff ? 'white' : 'var(--pk-text-secondary)',
              boxShadow: activeDifficulty === diff ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            {diff}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredStories.map((story) => {
          const isExpanded = expandedStoryId === story.id;
          const isCompleted = completedStories.includes(story.id);

          return (
            <div key={story.id} className="glass-panel" style={{ 
              overflow: 'hidden', 
              padding: isExpanded ? '2rem' : '1.5rem', 
              transition: 'all 0.3s ease',
              border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)'
            }}>
              
              <div 
                onClick={() => toggleStory(story.id)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  cursor: 'pointer', userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, color: isCompleted ? '#10b981' : 'var(--pk-text-primary)' }}>
                    <BookOpen color={isCompleted ? '#10b981' : 'var(--pk-primary)'} /> {story.title}
                  </h2>
                  {isCompleted && <CheckCircle size={20} color="#10b981" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    color: story.difficulty === 'Débutant' ? '#10b981' : story.difficulty === 'Intermédiaire' ? '#f59e0b' : '#ef4444', 
                    fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '50px' 
                  }}>
                    {story.difficulty}
                  </span>
                  {isExpanded ? <ChevronUp size={24} color="var(--pk-text-secondary)" /> : <ChevronDown size={24} color="var(--pk-text-secondary)" />}
                </div>
              </div>

              {isExpanded && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--pk-border)', paddingTop: '2rem' }}>
                  {story.segments.map((segment, index) => (
                    <div key={index} style={{ 
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', 
                      background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', 
                      borderRadius: '12px' 
                    }}>
                      <div style={{ borderRight: '1px solid var(--pk-border)', paddingRight: '2rem', textAlign: 'right' }}>
                        <p className="arabic-text" style={{ fontSize: '1.8rem', margin: 0, lineHeight: '2' }}>
                          {removeTashkeel(segment.arabic)}
                        </p>
                        {showRomanization && segment.romanization && (
                          <p style={{ color: 'var(--pk-primary)', fontSize: '1rem', marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>
                            {segment.romanization}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.1rem', margin: 0 }}>{segment.translation}</p>
                      </div>
                    </div>
                  ))}

                  {!isCompleted ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); completeStory(story.id); }}
                      className="bg-gradient-primary"
                      style={{ marginTop: '2rem', padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                    >
                      Marquer comme terminée
                    </button>
                  ) : (
                    <div style={{ marginTop: '2rem', textAlign: 'center', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                      <CheckCircle size={20} /> Histoire terminée
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stories;
