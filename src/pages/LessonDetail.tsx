import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import lessonsData from '../data/lessons.json';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [activeTab, setActiveTab] = useState<'content' | 'exercises'>('content');
  const [activeSublesson, setActiveSublesson] = useState<string>('main');
  const [score, setScore] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showReview, setShowReview] = useState(false);
  const { showTashkeel, completeLesson, completedLessons } = useAppContext();

  const lesson = lessonsData.find(l => l.id === lessonId);
  const currentIndex = lessonsData.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessonsData[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonsData.length - 1 ? lessonsData[currentIndex + 1] : null;

  const isCompleted = lessonId ? completedLessons.includes(lessonId) : false;
  
  // Get current content based on active sublesson
  const getCurrentContent = () => {
    if (activeSublesson === 'main') {
      return lesson;
    }
    const sublesson = lesson?.sublessons?.find(sl => sl.id === activeSublesson);
    return sublesson || lesson;
  };
  
  const currentContent = getCurrentContent()!;

  useEffect(() => {
    setActiveTab('content');
    setActiveSublesson('main');
    setScore(null);
    setUserAnswers({});
    setShowReview(false);
    window.scrollTo(0, 0);
  }, [lessonId]);

  if (!lesson) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Leçon introuvable. <Link to="/lessons">Retour</Link></div>;
  }

  const removeTashkeel = (text: string) => {
    if (showTashkeel) return text;
    return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
  };

  const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let correctCount = 0;
    const answers: Record<number, string> = {};

    currentContent.exercises?.forEach((ex: any, idx: number) => {
      const selected = formData.get(`question-${idx}`) as string;
      answers[idx] = selected;
      if (selected === ex.answer) {
        correctCount++;
      }
    });

    setUserAnswers(answers);
    setScore(correctCount);
    
    if (correctCount === currentContent.exercises?.length && lessonId) {
      completeLesson(lessonId);
    }
  };
  const renderTextWithArabic = (children: React.ReactNode): React.ReactNode => {
    const arabicRegex = /([\u0600-\u06FF]+(?:[\s\u0600-\u06FF]*[\u0600-\u06FF]+)*)/g;

    if (typeof children === 'string') {
      const parts = children.split(arabicRegex);
      return parts.map((part, i) => {
        if (arabicRegex.test(part)) {
          return (
            <span key={i} className="arabic-text" style={{ fontSize: '1.3rem', lineHeight: '1.8' }}>
              {removeTashkeel(part)}
            </span>
          );
        }
        return part;
      });
    }

    if (Array.isArray(children)) {
      return children.map((child, i) => <span key={i}>{renderTextWithArabic(child)}</span>);
    }

    return children;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/lessons" className="action-btn" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {lesson.title}
              {isCompleted && <Award size={24} color="var(--pk-accent)" />}
            </h1>
            <span style={{ color: 'var(--pk-text-secondary)', fontSize: '0.9rem' }}>{lesson.description}</span>
          </div>
        </div>
        {isCompleted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <CheckCircle size={16} /> Complétée
          </div>
        )}
      </div>

      {/* Sublesson tabs */}
      {lesson.sublessons && lesson.sublessons.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveSublesson('main')}
            style={{ 
              padding: '0.5rem 1rem', 
              background: activeSublesson === 'main' ? 'var(--pk-primary)' : 'var(--pk-surface-solid)',
              color: activeSublesson === 'main' ? 'white' : 'var(--pk-text-secondary)',
              border: '1px solid var(--pk-border)',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: activeSublesson === 'main' ? 'bold' : 'normal'
            }}
          >
            Principal
          </button>
          {lesson.sublessons.map((sublesson) => (
            <button 
              key={sublesson.id}
              onClick={() => setActiveSublesson(sublesson.id)}
              style={{ 
                padding: '0.5rem 1rem', 
                background: activeSublesson === sublesson.id ? 'var(--pk-primary)' : 'var(--pk-surface-solid)',
                color: activeSublesson === sublesson.id ? 'white' : 'var(--pk-text-secondary)',
                border: '1px solid var(--pk-border)',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: activeSublesson === sublesson.id ? 'bold' : 'normal'
              }}
            >
              {sublesson.title.replace(/.*:\s*/, '')}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--pk-border)' }}>
        <button 
          onClick={() => setActiveTab('content')}
          style={{ 
            padding: '1rem 2rem', 
            borderBottom: activeTab === 'content' ? '3px solid var(--pk-primary)' : '3px solid transparent',
            color: activeTab === 'content' ? 'var(--pk-text-primary)' : 'var(--pk-text-secondary)',
            fontWeight: activeTab === 'content' ? 'bold' : 'normal'
          }}
        >
          Apprentissage
        </button>
        {currentContent.exercises && currentContent.exercises.length > 0 && (
          <button 
            onClick={() => setActiveTab('exercises')}
            style={{ 
              padding: '1rem 2rem', 
              borderBottom: activeTab === 'exercises' ? '3px solid var(--pk-primary)' : '3px solid transparent',
              color: activeTab === 'exercises' ? 'var(--pk-text-primary)' : 'var(--pk-text-secondary)',
              fontWeight: activeTab === 'exercises' ? 'bold' : 'normal'
            }}
          >
            Exercices
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ minHeight: '400px', padding: '2rem' }}>
        {activeTab === 'content' ? (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({node, ...props}) => <h2 style={{ color: 'var(--pk-primary)', marginTop: '2rem', marginBottom: '1rem' }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ color: 'var(--pk-secondary)', marginTop: '1.5rem', marginBottom: '0.8rem' }} {...props} />,
                p: ({node, ...props}) => (
                  <p style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: 'var(--pk-text-secondary)' }}>
                    {renderTextWithArabic(props.children)}
                  </p>
                ),
                li: ({node, ...props}) => (
                  <li style={{ marginBottom: '0.5rem', color: 'var(--pk-text-secondary)' }}>
                    {renderTextWithArabic(props.children)}
                  </li>
                ),
                strong: ({node, ...props}) => {
                  const content = String(props.children);
                  const isArabic = /[\u0600-\u06FF]/.test(content);
                  if (isArabic) {
                    return <strong className="arabic-text" style={{ fontSize: '1.4rem', fontWeight: 'bold', lineHeight: '2' }}>{removeTashkeel(content)}</strong>;
                  }
                  return <strong style={{ color: 'var(--pk-text-primary)' }} {...props} />;
                },
                code: ({node, ...props}) => (
                  <code style={{ background: 'var(--pk-surface-solid)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9rem', color: 'var(--pk-text-primary)' }} {...props} />
                ),
                table: ({node, ...props}) => (
                  <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }} {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => (
                  <thead style={{ background: 'rgba(99, 102, 241, 0.15)' }} {...props} />
                ),
                tr: ({node, ...props}) => (
                  <tr style={{ borderBottom: '1px solid var(--pk-border)' }} {...props} />
                ),
                th: ({node, ...props}) => (
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--pk-text-primary)', fontWeight: '600', whiteSpace: 'nowrap' }} {...props} />
                ),
                td: ({node, ...props}) => (
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--pk-text-secondary)', verticalAlign: 'middle' }} {...props} />
                ),
              }}
            >
              {currentContent.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div>
            {score !== null ? (
              <>
                {!showReview ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ 
                      position: 'relative', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: '2rem',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: score / (currentContent.exercises?.length || 1) <= 0.6 ? '#ef4444' : 
                                 score === currentContent.exercises?.length ? '#10b981' : '#f59e0b',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      border: '4px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <span style={{ 
                          fontSize: '2.2rem', 
                          fontWeight: '900', 
                          lineHeight: '1',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {Math.round((score / (currentContent.exercises?.length || 1)) * 100)}%
                        </span>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          textTransform: 'uppercase', 
                          fontWeight: '800',
                          marginTop: '4px',
                          letterSpacing: '0.05em',
                          opacity: 0.9
                        }}>
                          Score
                        </div>
                      </div>
                      
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '0', 
                        right: '0', 
                        background: 'white',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        color: score / (currentContent.exercises?.length || 1) <= 0.6 ? '#ef4444' : 
                               score === currentContent.exercises?.length ? '#10b981' : '#f59e0b'
                      }}>
                        {score / (currentContent.exercises?.length || 1) <= 0.6 ? (
                          <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>✕</span>
                        ) : (
                          <CheckCircle size={20} />
                        )}
                      </div>
                    </div>
                    
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--pk-text-primary)' }}>
                      {score === currentContent.exercises?.length ? 'Parfait ! 🎉' : 
                       score / (currentContent.exercises?.length || 1) <= 0.6 ? 'Réessaie encore !' : 'Bien tenté !'}
                    </h2>
                    <h3 style={{ color: 'var(--pk-text-secondary)', marginBottom: '2rem' }}>
                      Tu as obtenu {score} / {currentContent.exercises?.length} bonnes réponses.
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
                      {score < (currentContent.exercises?.length || 0) && (
                        <button 
                          onClick={() => setShowReview(true)}
                          className="action-btn"
                          style={{ padding: '1rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          Voir mes erreurs
                        </button>
                      )}
                      
                      {score === currentContent.exercises?.length && nextLesson && (
                        <Link 
                          to={`/lessons/${nextLesson.id}`}
                          className="bg-gradient-primary"
                          style={{ padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          Leçon suivante <ChevronRight size={20} />
                        </Link>
                      )}

                      <button 
                        onClick={() => {
                          setScore(null);
                          setUserAnswers({});
                          setShowReview(false);
                        }}
                        className={score === lesson.exercises?.length ? "action-btn" : "bg-gradient-primary"}
                        style={{ padding: '1rem', borderRadius: '12px', color: score === lesson.exercises?.length ? 'var(--pk-text-primary)' : 'white', fontWeight: 'bold' }}
                      >
                        Recommencer le quiz
                      </button>

                      <Link 
                        to="/lessons"
                        style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--pk-border)', color: 'var(--pk-text-secondary)', textDecoration: 'none' }}
                      >
                        Retour aux leçons
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <button onClick={() => setShowReview(false)} className="action-btn" style={{ borderRadius: '50%', width: '40px', height: '40px' }}>
                        <ArrowLeft size={20} />
                      </button>
                      <h2 style={{ margin: 0 }}>Révision des erreurs</h2>
                    </div>

                    {currentContent.exercises?.map((ex: any, idx: number) => {
                      const isCorrect = userAnswers[idx] === ex.answer;
                      return (
                        <div key={idx} style={{ 
                          background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
                          padding: '1.5rem', 
                          borderRadius: '12px', 
                          border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', flex: 1 }}>{idx + 1}. {ex.question}</h3>
                            {isCorrect ? <CheckCircle size={20} color="#10b981" /> : <div style={{ color: '#ef4444', fontWeight: 'bold' }}>✕</div>}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)' }}>Ta réponse :</div>
                            <div style={{ 
                              padding: '0.75rem', 
                              background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                              borderRadius: '8px',
                              color: isCorrect ? '#10b981' : '#ef4444',
                              fontWeight: '500'
                            }}>
                              {renderTextWithArabic(userAnswers[idx] || "(Pas de réponse)")}
                            </div>
                            
                            {!isCorrect && (
                              <>
                                <div style={{ fontSize: '0.9rem', color: 'var(--pk-text-secondary)', marginTop: '0.5rem' }}>Réponse correcte :</div>
                                <div style={{ 
                                  padding: '0.75rem', 
                                  background: 'rgba(16, 185, 129, 0.1)', 
                                  borderRadius: '8px',
                                  color: '#10b981',
                                  fontWeight: 'bold'
                                }}>
                                  {renderTextWithArabic(ex.answer)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button 
                      onClick={() => {
                        setScore(null);
                        setUserAnswers({});
                        setShowReview(false);
                      }}
                      className="bg-gradient-primary"
                      style={{ padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', marginTop: '1rem' }}
                    >
                      Réessayer le quiz
                    </button>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {currentContent.exercises?.map((ex: any, idx: number) => (
                  <div key={idx} style={{ background: 'var(--pk-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--pk-border)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--pk-text-primary)' }}>{idx + 1}. {ex.question}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {ex.options.map((opt: string, optIdx: number) => (
                        <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--pk-surface-solid)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-lift">
                          <input type="radio" name={`question-${idx}`} value={opt} required style={{ transform: 'scale(1.2)' }} />
                          <span style={{ fontSize: '1.05rem' }}>{renderTextWithArabic(opt)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit" className="bg-gradient-primary" style={{ padding: '1rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                  Valider mes réponses
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '2rem', 
        padding: '2rem 0',
        borderTop: '1px solid var(--pk-border)'
      }}>
        {prevLesson ? (
          <Link 
            to={`/lessons/${prevLesson.id}`}
            className="action-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
          >
            <ChevronLeft size={20} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--pk-text-secondary)', textTransform: 'uppercase' }}>Précédent</span>
              <span style={{ fontWeight: 'bold' }}>{prevLesson.title.split(':')[0]}</span>
            </div>
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link 
            to={`/lessons/${nextLesson.id}`}
            className="bg-gradient-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Suivant</span>
              <span>{nextLesson.title.split(':')[0]}</span>
            </div>
            <ChevronRight size={20} />
          </Link>
        ) : <div />}
      </div>

    </div>
  );
};

export default LessonDetail;
