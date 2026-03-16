import { Link } from 'react-router-dom';
import { useState } from 'react';
import lessonsData from '../data/lessons.json';
import { useAppContext } from '../context/AppContext';
import { PlayCircle, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import './Lessons.css';

const Lessons = () => {
  const { completedLessons } = useAppContext();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Débutant']);

  const categories = [
    { key: 'Débutant', title: 'Niveau Débutant', description: 'Les bases fondamentales de la langue arabe.' },
    { key: 'Intermédiaire', title: 'Niveau Intermédiaire', description: 'Grammaire, verbes et structures de phrases.' },
    { key: 'Conversation', title: 'Niveau Conversation', description: 'Pratiquez avec des dialogues et du vocabulaire thématique.' },
    { key: 'Avancé', title: 'Niveau Avancé', description: 'Maîtrise finale et bilan.' }
  ];

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      <div>
        <h1 className="text-gradient">Parcours d'Apprentissage</h1>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.1rem' }}>
          Suivez ces leçons structurées pour maîtriser l'arabe pas à pas.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {categories.map((cat) => {
          const filteredLessons = lessonsData.filter(l => l.category === cat.key);
          if (filteredLessons.length === 0) return null;
          const isExpanded = expandedCategories.includes(cat.key);
          const completedInCategory = filteredLessons.filter(l => completedLessons.includes(l.id)).length;

          return (
            <section key={cat.key} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleCategory(cat.key)}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1.5rem 2rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                  borderBottom: isExpanded ? '1px solid var(--pk-border)' : 'none'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {cat.title}
                    {completedInCategory === filteredLessons.length && <CheckCircle size={20} color="#10b981" />}
                  </h2>
                  <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    {cat.description} • {completedInCategory}/{filteredLessons.length} leçons finies
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={24} color="var(--pk-text-secondary)" /> : <ChevronDown size={24} color="var(--pk-text-secondary)" />}
              </div>

              {isExpanded && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', padding: '2rem' }}>
                  {filteredLessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <Link 
                        to={`/lessons/${lesson.id}`} 
                        key={lesson.id} 
                        className={`lesson-card ${isCompleted ? 'completed' : ''}`}
                        style={{ 
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                          padding: '1.5rem', textDecoration: 'none', transition: 'all 0.3s',
                          border: isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px', background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)'
                        }}
                      >
                        <div>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: isCompleted ? '#10b981' : 'var(--pk-text-primary)', marginBottom: '0.5rem', margin: 0 }}>
                            <PlayCircle size={20} color={isCompleted ? '#10b981' : 'var(--pk-primary)'} />
                            {lesson.title}
                            {isCompleted && <CheckCircle size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
                          </h3>
                          <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginTop: '0.8rem' }}>
                            {lesson.description}
                          </p>
                        </div>
                        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: isCompleted ? '#10b981' : 'var(--pk-primary)', fontWeight: 'bold' }}>
                          {isCompleted ? 'Revoir la leçon' : 'Commencer →'}
                        </div>
                      </Link>
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

export default Lessons;
