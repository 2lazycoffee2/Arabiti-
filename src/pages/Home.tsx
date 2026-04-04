import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, Gamepad, User, Check, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Home = () => {
  const { userName, setUserName } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const navigate = useNavigate();

  const handleStart = (e: React.MouseEvent) => {
    if (!userName) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const saveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setShowModal(false);
      navigate('/alphabet');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '3rem', marginTop: '4rem' }}>

      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '1rem', color: 'var(--pk-text-primary)' }}>
          Apprenez l'Arabe de manière <span className="text-gradient">Interactive</span>
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', color: 'var(--pk-text-secondary)', marginBottom: '2rem' }}>
          Maîtrisez l'alphabet, le vocabulaire et lisez des histoires bilingues.
        </p>

        <Link 
          to="/alphabet" 
          onClick={handleStart}
          className="bg-gradient-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', color: 'white', transition: 'transform 0.2s', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}
        >
          <Sparkles size={20} /> Commencer l'Aventure <ArrowRight size={18} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', marginTop: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--pk-primary)' }}>
            <Brain size={32} />
          </div>
          <h3 style={{ color: 'var(--pk-text-primary)' }}>Répétition Espacée</h3>
          <p style={{ color: 'var(--pk-text-secondary)' }}>Mémorisez le vocabulaire efficacement et ne l'oubliez jamais.</p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--pk-secondary)' }}>
            <Gamepad size={32} />
          </div>
          <h3 style={{ color: 'var(--pk-text-primary)' }}>Apprentissage Ludique</h3>
          <p style={{ color: 'var(--pk-text-secondary)' }}>Des jeux interactifs pour tester vos connaissances.</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', maxWidth: '700px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start', textAlign: 'left' }}>
        <div style={{ color: '#f59e0b', marginTop: '0.2rem', flexShrink: 0 }}>
          <Info size={24} />
        </div>
        <p style={{ color: 'var(--pk-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: 'var(--pk-text-primary)' }}>Avertissement :</strong> Ce site web a été créé dans l'esprit de consolider vos bases de l'arabe et de permettre à son créateur de faire de même et de découvrir le vibe coding. Des petites erreurs peuvent être à prévoir, n'hésitez pas à les faire remonter.
        </p>
      </div>

      {/* Welcome Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            maxWidth: '450px', 
            width: '100%', 
            padding: '2.5rem', 
            textAlign: 'center',
            border: '1px solid var(--pk-primary)',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--pk-primary)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <User size={32} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--pk-text-primary)' }}>Bienvenue !</h2>
            <p style={{ color: 'var(--pk-text-secondary)', marginBottom: '2rem' }}>
              Pour personnaliser ton expérience, quel nom souhaites-tu utiliser pour ton profil ?
            </p>
            
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex: Amira, Karim..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                style={{
                  width: '100%',
                  padding: '1rem 1.2rem',
                  borderRadius: '12px',
                  background: 'var(--pk-surface-solid)',
                  border: '1px solid var(--pk-border)',
                  color: 'var(--pk-text-primary)',
                  fontSize: '1.1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
            
            <button 
              onClick={saveName}
              disabled={!nameInput.trim()}
              className="bg-gradient-primary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: nameInput.trim() ? 1 : 0.5,
                cursor: nameInput.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              C'est parti <Check size={20} />
            </button>
            
            <button 
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '1rem',
                color: 'var(--pk-text-secondary)',
                fontSize: '0.9rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;