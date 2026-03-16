import { useAppContext } from '../context/AppContext';
import lessonsData from '../data/lessons.json';
import _storiesData from '../data/stories.json';
import vocabData from '../data/vocabulary.json';
import { Award, CheckCircle, TrendingUp, Settings, Sun, Moon, Type, Globe } from 'lucide-react';

const Profile = () => {
  const { 
    completedLessons, 
    completedStories, 
    showTashkeel, setShowTashkeel,
    showRomanization, setShowRomanization,
    theme, setTheme
  } = useAppContext();
  
  const acquiredWordsCount = JSON.parse(localStorage.getItem('parallel-arabic-acquired') || '[]').length;

  const totalLessons = lessonsData.length;
  const totalStories = (_storiesData as any[]).length;
  const totalVocab = vocabData.length;

  const lessonPercent = Math.round((completedLessons.length / totalLessons) * 100) || 0;
  const storyPercent = Math.round((completedStories.length / totalStories) * 100) || 0;
  const vocabPercent = Math.round((acquiredWordsCount / totalVocab) * 100) || 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mon Profil</h1>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '1.2rem' }}>
          Gérez vos préférences et suivez votre ascension vers la maîtrise de l'arabe.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Settings Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Settings size={22} color="var(--pk-primary)" /> Paramètres d'Aide
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Type size={18} color="var(--pk-text-secondary)" />
                <span>Afficher le Tashkīl</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={showTashkeel} onChange={() => setShowTashkeel(!showTashkeel)} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Globe size={18} color="var(--pk-text-secondary)" />
                <span>Afficher la Phonétique</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={showRomanization} onChange={() => setShowRomanization(!showRomanization)} />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {theme === 'dark' ? <Moon size={18} color="var(--pk-text-secondary)" /> : <Sun size={18} color="var(--pk-text-secondary)" />}
                <span>Mode Sombre</span>
              </div>
              <label className="switch">
                <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--pk-text-secondary)', marginTop: 'auto', borderTop: '1px solid var(--pk-border)', paddingTop: '1rem' }}>
            Vos préférences sont sauvegardées automatiquement dans votre navigateur.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <TrendingUp size={22} color="var(--pk-accent)" /> État de la Progression
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Leçons</span>
                <span style={{ fontWeight: 'bold' }}>{lessonPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--pk-surface-solid)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${lessonPercent}%`, height: '100%', background: 'var(--pk-primary)', transition: 'width 1s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Histoires</span>
                <span style={{ fontWeight: 'bold' }}>{storyPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--pk-surface-solid)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${storyPercent}%`, height: '100%', background: 'var(--pk-secondary)', transition: 'width 1s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Vocabulaire</span>
                <span style={{ fontWeight: 'bold' }}>{vocabPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--pk-surface-solid)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${vocabPercent}%`, height: '100%', background: 'var(--pk-accent)', transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Badges & History Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Award color="var(--pk-primary)" /> Dernières Leçons
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {completedLessons.length > 0 ? (
              completedLessons.slice(-4).reverse().map(id => {
                const lesson = lessonsData.find(l => l.id === id);
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: 'var(--pk-surface-solid)', borderRadius: '12px', border: '1px solid var(--pk-border)' }}>
                    <CheckCircle color="#10b981" size={18} />
                    <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{lesson?.title}</div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>Aucune leçon terminée.</p>
            )}
          </div>
        </div>

        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            ✨ Badges Débloqués
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
            <BadgeItem 
              active={completedLessons.length >= 1} 
              icon="🌟" 
              title="Novice" 
              desc="1ère leçon" 
              color="#f59e0b"
            />
            <BadgeItem 
              active={completedLessons.length >= 10} 
              icon="🔥" 
              title="Assidu" 
              desc="10 leçons" 
              color="#ef4444"
            />
            <BadgeItem 
              active={acquiredWordsCount >= 50} 
              icon="💎" 
              title="Lexique" 
              desc="50 mots" 
              color="#6366f1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BadgeItem = ({ active, icon, title, desc, color }: { active: boolean; icon: string; title: string, desc: string, color: string }) => (
  <div style={{ 
    textAlign: 'center', 
    opacity: active ? 1 : 0.2, 
    filter: active ? 'none' : 'grayscale(1)',
    transition: 'all 0.4s'
  }}>
    <div style={{ 
      background: `linear-gradient(135deg, ${color}, #00000044)`, 
      width: '70px', height: '70px', borderRadius: '50%', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: '2rem', marginBottom: '0.8rem', margin: '0 auto',
      boxShadow: active ? `0 8px 20px ${color}44` : 'none'
    }}>
      {icon}
    </div>
    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{title}</div>
    <div style={{ fontSize: '0.7rem', color: 'var(--pk-text-secondary)' }}>{desc}</div>
  </div>
);

export default Profile;
