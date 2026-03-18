import { useState, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import conjugationsData from '../data/conjugations.json';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  BookOpen,
  Brain,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Conjugation {
  id: string;
  arabic: string;
  transliteration?: string;
  root: string;
  translation: string;
  type: string;
  conjugations: {
    past: {
      singular: Record<string, string>;
      dual?: Record<string, string>;
      plural?: Record<string, string>;
    };
    present: {
      singular: Record<string, string>;
      dual?: Record<string, string>;
      plural?: Record<string, string>;
    };
    future?: {
      singular: Record<string, string>;
      dual?: Record<string, string>;
      plural?: Record<string, string>;
    };
  };
}

// Constantes pour les niveaux
const LEVELS = {
  easy: { id: 'easy', label: 'Facile', description: 'Verbes de 3 lettres', color: '#10b981', questions: 10 },
  medium: { id: 'medium', label: 'Intermédiaire', description: 'Verbes de 4 lettres', color: '#f59e0b', questions: 15 },
  hard: { id: 'hard', label: 'Difficile', description: 'Verbes de 5+ lettres', color: '#ef4444', questions: 20 }
};

// Constantes pour les temps
const TENSES = {
  past: { label: 'Passé', emoji: '⏰' },
  present: { label: 'Présent', emoji: '⌛' },
  future: { label: 'Futur', emoji: '🔮' }
};

// Pronoms arabes avec leur phonétique
const PERSONS = {
  '1st': { label: '1ère personne', pronoun: 'أنا', phonetic: 'anā', translation: 'je' },
  '2nd_m': { label: '2ème personne (m)', pronoun: 'أنتَ', phonetic: 'anta', translation: 'tu (m)' },
  '2nd_f': { label: '2ème personne (f)', pronoun: 'أنتِ', phonetic: 'anti', translation: 'tu (f)' },
  '3rd_m': { label: '3ème personne (m)', pronoun: 'هو', phonetic: 'huwa', translation: 'il' },
  '3rd_f': { label: '3ème personne (f)', pronoun: 'هي', phonetic: 'hiya', translation: 'elle' }
};

type GameMode = 'menu' | 'flashcard' | 'quiz';
type Difficulty = 'easy' | 'medium' | 'hard';

// Fonction utilitaire pour extraire seulement la partie arabe (sans traduction)
const extractArabicOnly = (text: string): string => {
  if (!text) return '';
  const parts = text.split(' - ');
  return parts[0] || text;
};

// Fonction utilitaire pour enlever les tashkeel
const removeTashkeel = (text: string): string => {
  return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
};

// Fonction pour transliterator l'arabe en phonétique avec voyelles
const transliterateArabic = (text: string): string => {
  if (!text) return '';
  
  // Mapping des lettres arabes
  const arabicToLatin: Record<string, string> = {
    'ا': 'ā', 'أ': 'a', 'إ': 'i', 'آ': 'ā', 'ء': "'",
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ',
    'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ',
    'ظ': 'ẓ', 'ع': "'", 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h',
    'و': 'w', 'ي': 'y', 'ى': 'ā', 'ة': 'h', 'ئ': "'",
    'ؤ': "'", 'ٱ': 'a', 'ٳ': 'ī'
  };
  
  // Mapping des voyelles courtes (tashkeel)
  const vowelMap: Record<string, string> = {
    'َ': 'a',  // fatha
    'ِ': 'i',  // kasra
    'ُ': 'u',  // damma
    'ْ': '',   // sukun (pas de voyelle)
    'ّ': '',   // shadda (doubler la consonne - géré séparément)
    'ً': 'an', // fathatan
    'ٍ': 'in', // kasratan
    'ٌ': 'un'  // dammatan
  };
  
  let result = '';
  const chars = text.split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    // Si c'est une voyelle courte, l'ajouter
    if (vowelMap[char] !== undefined) {
      result += vowelMap[char];
      continue;
    }
    
    // Si c'est une lettre arabe, la translittérer
    if (arabicToLatin[char]) {
      // Vérifier si la lettre suivante est un shadda (doubler)
      if (chars[i + 1] === 'ّ') {
        result += arabicToLatin[char] + arabicToLatin[char];
        i++; // sauter le shadda
      } else {
        result += arabicToLatin[char];
      }
    }
  }
  
  return result;
};

const Conjugaison = () => {
  const { showTashkeel, showRomanization } = useAppContext();
  
  // États principaux
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  
  // États pour le verbe actuel - utilisent useRef pour persister entre les re-renders
  const currentVerbRef = useRef<Conjugation | null>(null);
  const [currentVerbDisplay, setCurrentVerbDisplay] = useState<Conjugation | null>(null);
  const currentTenseRef = useRef<'past' | 'present' | 'future'>('past');
  const [currentTenseDisplay, setCurrentTenseDisplay] = useState<'past' | 'present' | 'future'>('past');
  const currentPersonRef = useRef<string>('1st');
  const [currentPersonDisplay, setCurrentPersonDisplay] = useState<string>('1st');
  
  // États pour le quiz
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [quizProgress, setQuizProgress] = useState({ current: 1, total: 10 });
  const [quizOptions, setQuizOptions] = useState<string[]>([]); // STABILISE les options
  
  // États pour les flashcards
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [filteredVerbs, setFilteredVerbs] = useState<Conjugation[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [masteredVerbs, setMasteredVerbs] = useState<Set<string>>(new Set());

  // Synchroniser les refs avec l'affichage quand on change de mode/question
  const updateDisplayFromRefs = useCallback(() => {
    setCurrentVerbDisplay(currentVerbRef.current);
    setCurrentTenseDisplay(currentTenseRef.current);
    setCurrentPersonDisplay(currentPersonRef.current);
  }, []);

  // Fonction pour filtrer les verbes par niveau (basé sur le type de verbe)
  const getVerbsByDifficulty = useCallback((level: Difficulty): Conjugation[] => {
    if (!conjugationsData) return [];
    
    return (conjugationsData as Conjugation[]).filter(verb => {
      switch (level) {
        case 'easy':
          // Verbes sonores (réguliers) = faciles
          return verb.type === 'sound';
        case 'medium':
          // Verbes creux (hollow) = intermédiaires
          return verb.type === 'hollow';
        case 'hard':
          // Verbes faibles (defective) ou avec futur = difficiles
          return verb.type === 'defective' || verb.type === 'weak' || !!verb.conjugations.future;
        default:
          return true;
      }
    });
  }, []);

  // Fonction pour obtenir un verbe aléatoire selon le niveau
  const getRandomVerb = useCallback((level: Difficulty): Conjugation | null => {
    const verbs = getVerbsByDifficulty(level);
    if (verbs.length === 0) return null;
    return verbs[Math.floor(Math.random() * verbs.length)];
  }, [getVerbsByDifficulty]);

  // Fonction pour générer une nouvelle question
  const generateNewQuestion = useCallback((level: Difficulty) => {
    const verb = getRandomVerb(level);
    if (!verb) return;

    let availableTenses: ('past' | 'present' | 'future')[] = ['past', 'present'];
    if (level === 'hard' && verb.conjugations.future) {
      availableTenses.push('future');
    }

    const tense = availableTenses[Math.floor(Math.random() * availableTenses.length)];
    const persons = Object.keys(PERSONS);
    const person = persons[Math.floor(Math.random() * persons.length)];

    // Mettre à jour les refs
    currentVerbRef.current = verb;
    currentTenseRef.current = tense;
    currentPersonRef.current = person;
    
    // Mettre à jour l'affichage
    updateDisplayFromRefs();
    
    // Générer les options
    const options = generateQuizOptions(verb, tense, person);
    setQuizOptions(options);
    
    setSelectedAnswer('');
    setShowResult(false);
  }, [getRandomVerb, updateDisplayFromRefs]);

  // Démarrer le quiz
  const startQuiz = useCallback((level: Difficulty) => {
    setDifficulty(level);
    setQuizProgress({ current: 1, total: LEVELS[level].questions });
    setScore(0);
    setAttempts(0);
    setGameMode('quiz');
    generateNewQuestion(level);
  }, [generateNewQuestion]);

  // Démarrer les flashcards
  const startFlashcards = useCallback((level: Difficulty) => {
    setDifficulty(level);
    const verbs = getVerbsByDifficulty(level);
    setFilteredVerbs(verbs);
    setFlashcardIndex(0);
    setFlippedCards(new Set());
    setGameMode('flashcard');
    if (verbs.length > 0) {
      currentVerbRef.current = verbs[0];
      updateDisplayFromRefs();
    }
  }, [getVerbsByDifficulty, updateDisplayFromRefs]);

  // Obtenir la réponse correcte
  const getCurrentAnswer = useCallback((): string => {
    const verb = currentVerbRef.current;
    if (!verb) return '';
    const conjugation = verb.conjugations[currentTenseRef.current];
    return conjugation?.singular?.[currentPersonRef.current] || '';
  }, []);

  // Générer les options du quiz - mauvaises réponses du même temps seulement
  const generateQuizOptions = (verb: Conjugation, tense: 'past' | 'present' | 'future', person: string): string[] => {
    if (!verb) return [];
    
    const conjugation = verb.conjugations[tense];
    const correctAnswer = conjugation?.singular?.[person] || '';
    if (!correctAnswer) return [];
    
    const options = [correctAnswer];
    const wrongOptions: string[] = [];
    
    // Récupérer uniquement les conjugaisons du même temps (pour plus de cohérence)
    (conjugationsData as Conjugation[]).forEach((v) => {
      const conj = v.conjugations[tense];
      if (conj?.singular) {
        Object.values(conj.singular).forEach((val) => {
          if (val && val !== correctAnswer) {
            wrongOptions.push(val as string);
          }
        });
      }
      // Ajouter aussi les formes plurielles du même temps pour plus de variété
      if (conj?.plural) {
        Object.values(conj.plural).forEach((val) => {
          if (val && val !== correctAnswer) {
            wrongOptions.push(val as string);
          }
        });
      }
    });
    
    // Ajouter 2 mauvaises réponses aléatoires
    const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 2 && i < shuffled.length; i++) {
      options.push(shuffled[i]);
    }
    
    return options.filter(opt => opt && opt.trim() !== '').sort(() => Math.random() - 0.5);
  };

  // Gestion de la réponse
  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    setAttempts(prev => prev + 1);
    
    if (answer === getCurrentAnswer()) {
      setScore(prev => prev + 1);
    }
  }, [getCurrentAnswer]);

  // Question suivante
  const nextQuestion = useCallback(() => {
    if (quizProgress.current < quizProgress.total) {
      setQuizProgress(prev => ({ ...prev, current: prev.current + 1 }));
      generateNewQuestion(difficulty);
    } else {
      setGameMode('menu');
    }
  }, [quizProgress.current, quizProgress.total, difficulty, generateNewQuestion]);

  // Navigation flashcards - réinitialise les cartes retournées
  const nextFlashcard = useCallback(() => {
    const nextIndex = (flashcardIndex + 1) % filteredVerbs.length;
    setFlashcardIndex(nextIndex);
    setFlippedCards(new Set()); // Réinitialiser les cartes retournées
    currentVerbRef.current = filteredVerbs[nextIndex];
    updateDisplayFromRefs();
  }, [flashcardIndex, filteredVerbs, updateDisplayFromRefs]);

  const prevFlashcard = useCallback(() => {
    const prevIndex = (flashcardIndex - 1 + filteredVerbs.length) % filteredVerbs.length;
    setFlashcardIndex(prevIndex);
    setFlippedCards(new Set()); // Réinitialiser les cartes retournées
    currentVerbRef.current = filteredVerbs[prevIndex];
    updateDisplayFromRefs();
  }, [flashcardIndex, filteredVerbs, updateDisplayFromRefs]);

  // Flip une carte
  const toggleFlip = useCallback((person: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(person)) {
        newSet.delete(person);
      } else {
        newSet.add(person);
      }
      return newSet;
    });
  }, []);

  // Marquer comme maîtrisé
  const toggleMastered = useCallback((verbId: string) => {
    setMasteredVerbs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(verbId)) {
        newSet.delete(verbId);
      } else {
        newSet.add(verbId);
      }
      return newSet;
    });
  }, []);

  // Rendu d'une option de quiz (sans traduction française)
  const renderQuizOption = (text: string) => {
    const arabicOnly = extractArabicOnly(text);
    const displayText = showTashkeel ? arabicOnly : removeTashkeel(arabicOnly);
    const transliteration = transliterateArabic(displayText);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <span className="arabic-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {displayText}
        </span>
        {showRomanization && transliteration && (
          <span style={{ fontSize: '1rem', color: 'var(--pk-primary)', fontStyle: 'italic', fontWeight: 500 }}>
            [{transliteration}]
          </span>
        )}
      </div>
    );
  };

  // Affichage du verbe principal (stable quand on toggle les options)
  const displayVerbArabic = useCallback((text: string | undefined) => {
    if (!text) return '';
    return showTashkeel ? text : removeTashkeel(text);
  }, [showTashkeel]);

  // ===== MENU PRINCIPAL =====
  if (gameMode === 'menu') {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/vocabulary" className="action-btn" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit3 size={28} style={{ color: 'var(--pk-primary)' }} />
              Conjugaison Arabe
            </h1>
            <p style={{ color: 'var(--pk-text-secondary)', margin: '0.5rem 0 0 0' }}>
              Maîtrisez les verbes arabes à travers la pratique
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Carte Flash Card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={32} style={{ color: 'var(--pk-primary)' }} />
              <h2 style={{ margin: 0 }}>Mode Flash Card</h2>
            </div>
            <p style={{ color: 'var(--pk-text-secondary)', lineHeight: 1.6 }}>
              Explorez les verbes et leurs conjugaisons de manière interactive.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button 
                  key={level}
                  onClick={() => startFlashcards(level)}
                  className="glass-panel hover-lift"
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    border: `1px solid ${LEVELS[level].color}`,
                    background: `${LEVELS[level].color}20`,
                    color: LEVELS[level].color,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {LEVELS[level].label}
                </button>
              ))}
            </div>
          </div>

          {/* Carte Quiz */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Brain size={32} style={{ color: 'var(--pk-secondary)' }} />
              <h2 style={{ margin: 0 }}>Mode Quiz</h2>
            </div>
            <p style={{ color: 'var(--pk-text-secondary)', lineHeight: 1.6 }}>
              Testez vos connaissances avec un quiz interactif.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button 
                  key={level}
                  onClick={() => startQuiz(level)}
                  className="glass-panel hover-lift"
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    border: `1px solid ${LEVELS[level].color}`,
                    background: `${LEVELS[level].color}20`,
                    color: LEVELS[level].color,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{LEVELS[level].label}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{LEVELS[level].questions} Q</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MODE FLASHCARD =====
  if (gameMode === 'flashcard' && currentVerbDisplay) {
    const verb = currentVerbDisplay;
    const progress = `${flashcardIndex + 1}/${filteredVerbs.length}`;
    const isMastered = masteredVerbs.has(verb.id);
    
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setGameMode('menu')} className="action-btn" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ margin: 0 }}>Flash Cards</h1>
              <span style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>
                {LEVELS[difficulty].label} • {progress}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => toggleMastered(verb.id)}
            style={{ 
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: `2px solid ${isMastered ? '#10b981' : 'var(--pk-border)'}`,
              background: isMastered ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: isMastered ? '#10b981' : 'var(--pk-text-secondary)',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isMastered ? '✓ Acquis' : 'Marquer acquis'}
          </button>
        </div>

        {/* Verbe principal */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center', border: '2px solid var(--pk-primary)' }}>
          <div className="arabic-text" style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--pk-primary)' }}>
            {displayVerbArabic(verb.arabic)}
          </div>
          {showRomanization && verb.transliteration && (
            <div style={{ fontSize: '1.2rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic', marginBottom: '0.3rem' }}>
              {verb.transliteration}
            </div>
          )}
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--pk-text-primary)' }}>
            {verb.translation}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <span style={{ background: 'var(--pk-surface-solid)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.85rem' }}>
              Racine: {verb.root}
            </span>
            <span style={{ background: 'var(--pk-surface-solid)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.85rem' }}>
              {getRootLength(verb)} lettres
            </span>
          </div>
        </div>

        {/* Flash Cards des conjugaisons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {Object.entries(verb.conjugations.past.singular).map(([person, conjugation]) => {
            const personInfo = PERSONS[person as keyof typeof PERSONS];
            const isFlipped = flippedCards.has(`past-${person}`);
            const arabicConj = extractArabicOnly(conjugation);
            
            return (
              <div 
                key={`past-${person}`}
                onClick={() => toggleFlip(`past-${person}`)}
                style={{ 
                  perspective: '1000px',
                  cursor: 'pointer',
                  height: '160px'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  {/* Recto */}
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    border: '2px solid var(--pk-primary)',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--pk-text-secondary)', marginBottom: '0.3rem' }}>
                      Passé
                    </span>
                    <span className="arabic-text" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--pk-primary)' }}>
                      {personInfo?.pronoun}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-secondary)', marginTop: '0.3rem' }}>
                      {personInfo?.phonetic}
                    </span>
                  </div>
                  
                  {/* Verso */}
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    background: 'var(--pk-surface-solid)',
                    border: '2px solid #10b981',
                    borderRadius: '12px'
                  }}>
                    <span className="arabic-text" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                      {showTashkeel ? arabicConj : removeTashkeel(arabicConj)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--pk-text-secondary)', marginTop: '0.5rem' }}>
                      {personInfo?.translation}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {Object.entries(verb.conjugations.present.singular).map(([person, conjugation]) => {
            const personInfo = PERSONS[person as keyof typeof PERSONS];
            const isFlipped = flippedCards.has(`present-${person}`);
            const arabicConj = extractArabicOnly(conjugation);
            
            return (
              <div 
                key={`present-${person}`}
                onClick={() => toggleFlip(`present-${person}`)}
                style={{ 
                  perspective: '1000px',
                  cursor: 'pointer',
                  height: '160px'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  {/* Recto */}
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    border: '2px solid var(--pk-secondary)',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--pk-text-secondary)', marginBottom: '0.3rem' }}>
                      Présent
                    </span>
                    <span className="arabic-text" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--pk-secondary)' }}>
                      {personInfo?.pronoun}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pk-text-secondary)', marginTop: '0.3rem' }}>
                      {personInfo?.phonetic}
                    </span>
                  </div>
                  
                  {/* Verso */}
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    background: 'var(--pk-surface-solid)',
                    border: '2px solid #10b981',
                    borderRadius: '12px'
                  }}>
                    <span className="arabic-text" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                      {showTashkeel ? arabicConj : removeTashkeel(arabicConj)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--pk-text-secondary)', marginTop: '0.5rem' }}>
                      {personInfo?.translation}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={prevFlashcard} className="action-btn" style={{ padding: '1rem 2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronLeft size={20} /> Précédent
          </button>
          <button onClick={() => setFlippedCards(new Set())} className="action-btn" style={{ padding: '1rem', borderRadius: '8px' }}>
            <RotateCcw size={20} />
          </button>
          <button onClick={nextFlashcard} className="bg-gradient-primary" style={{ padding: '1rem 2rem', borderRadius: '8px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Suivant <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ===== MODE QUIZ =====
  if (gameMode === 'quiz' && currentVerbDisplay) {
    const verb = currentVerbDisplay;
    const personInfo = PERSONS[currentPersonDisplay as keyof typeof PERSONS];
    const tenseInfo = TENSES[currentTenseDisplay];
    
    return (
      <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setGameMode('menu')} className="action-btn" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0 }}>Quiz - {LEVELS[difficulty].label}</h1>
          </div>
        </div>

        {/* Progression */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 'bold' }}>
              Question {quizProgress.current}/{quizProgress.total}
            </span>
            <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>
              Score: {score}/{attempts}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--pk-surface-solid)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(quizProgress.current / quizProgress.total) * 100}%`, 
              height: '100%', 
              background: LEVELS[difficulty].color,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Question */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          {/* Verbe */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'var(--pk-surface-solid)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--pk-text-secondary)', marginBottom: '0.5rem' }}>
              Verbe à conjuguer
            </div>
            <div className="arabic-text" style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--pk-primary)' }}>
              {displayVerbArabic(verb.arabic)}
            </div>
            {showRomanization && verb.transliteration && (
              <div style={{ fontSize: '1rem', color: 'var(--pk-text-secondary)', fontStyle: 'italic' }}>
                {verb.transliteration}
              </div>
            )}
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.3rem' }}>
              {verb.translation}
            </div>
          </div>

          {/* Instruction */}
          <div style={{ 
            background: `linear-gradient(135deg, ${LEVELS[difficulty].color}20, ${LEVELS[difficulty].color}10)`, 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: `2px solid ${LEVELS[difficulty].color}`,
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              {tenseInfo.emoji} Conjugue au <strong>{tenseInfo.label}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span className="arabic-text" style={{ fontSize: '1.5rem', color: 'var(--pk-primary)' }}>
                {personInfo?.pronoun}
              </span>
              <span style={{ color: 'var(--pk-text-secondary)' }}>({personInfo?.phonetic})</span>
              <span style={{ color: 'var(--pk-text-secondary)' }}>→ "{personInfo?.translation}"</span>
            </div>
          </div>
        </div>

        {/* Options ou Résultat */}
        {!showResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ textAlign: 'center', color: 'var(--pk-text-secondary)' }}>
              Choisis la bonne conjugaison :
            </p>
            {quizOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className="glass-panel"
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  border: '2px solid var(--pk-border)',
                  background: 'var(--pk-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {renderQuizOption(option)}
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {/* Feedback */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              background: selectedAnswer === getCurrentAnswer() ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${selectedAnswer === getCurrentAnswer() ? '#10b981' : '#ef4444'}`
            }}>
              {selectedAnswer === getCurrentAnswer() ? (
                <CheckCircle size={28} color="#10b981" />
              ) : (
                <XCircle size={28} color="#ef4444" />
              )}
              <h3 style={{ margin: 0, color: selectedAnswer === getCurrentAnswer() ? '#10b981' : '#ef4444' }}>
                {selectedAnswer === getCurrentAnswer() ? 'Correct !' : 'Incorrect'}
              </h3>
            </div>

            {/* Réponses - sans traduction française */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--pk-surface-solid)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--pk-text-secondary)', marginBottom: '0.5rem' }}>
                  Ta réponse
                </div>
                <span className="arabic-text" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {showTashkeel ? extractArabicOnly(selectedAnswer) : removeTashkeel(extractArabicOnly(selectedAnswer))}
                </span>
              </div>
              
              {selectedAnswer !== getCurrentAnswer() && (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>
                  <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '0.5rem' }}>
                    La bonne réponse
                  </div>
                  <span className="arabic-text" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                    {showTashkeel ? extractArabicOnly(getCurrentAnswer()) : removeTashkeel(extractArabicOnly(getCurrentAnswer()))}
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={nextQuestion}
              className="bg-gradient-primary"
              style={{ 
                padding: '1.2rem', 
                borderRadius: '12px', 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                marginTop: '1.5rem',
                width: '100%'
              }}
            >
              {quizProgress.current < quizProgress.total ? 'Question suivante →' : 'Terminer le quiz'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Conjugaison;
