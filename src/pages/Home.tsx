import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, Gamepad } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '3rem', marginTop: '4rem' }}>

      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          Apprenez l'Arabe de manière <span className="text-gradient">Interactive</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--pk-text-secondary)', marginBottom: '2rem' }}>
          Maîtrisez l'alphabet, le vocabulaire et lisez des histoires bilingues.
        </p>

        <Link to="/alphabet" className="bg-gradient-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', color: 'white', transition: 'transform 0.2s', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' }}>
          <Sparkles size={20} /> Commencer l'Aventure <ArrowRight size={18} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', marginTop: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--pk-primary)' }}>
            <Brain size={32} />
          </div>
          <h3>Répétition Espacée</h3>
          <p style={{ color: 'var(--pk-text-secondary)' }}>Mémorisez le vocabulaire efficacement et ne l'oubliez jamais.</p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '50%', color: 'var(--pk-secondary)' }}>
            <Gamepad size={32} />
          </div>
          <h3>Apprentissage Ludique</h3>
          <p style={{ color: 'var(--pk-text-secondary)' }}>Des jeux interactifs pour tester vos connaissances.</p>
        </div>
      </div>

    </div>
  );
};

export default Home;