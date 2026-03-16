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
  const [score, setScore] = useState<number | null>(null);
  const { showTashkeel, completeLesson, completedLessons } = useAppContext();

  const lesson = lessonsData.find(l => l.id === lessonId);
  const currentIndex = lessonsData.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessonsData[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonsData.length - 1 ? lessonsData[currentIndex + 1] : null;

  const isCompleted = lessonId ? completedLessons.includes(lessonId) : false;

  useEffect(() => {
    setActiveTab('content');
    setScore(null);
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

    lesson.exercises?.forEach((ex: any, idx: number) => {
      if (formData.get(`question-${idx}`) === ex.answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    
    if (correctCount === lesson.exercises?.length && lessonId) {
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

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--pk-border)' }}>
        <button 
          onClick={() => setActiveTab('content')}
          style={{ 
            padding: '1rem 2rem', 
            borderBottom: activeTab === 'content' ? '3px solid var(--pk-primary)' : '3px solid transparent',
            color: activeTab === 'content' ? 'white' : 'var(--pk-text-secondary)',
            fontWeight: activeTab === 'content' ? 'bold' : 'normal'
          }}
        >
          Apprentissage
        </button>
        {lesson.exercises && lesson.exercises.length > 0 && (
          <button 
            onClick={() => setActiveTab('exercises')}
            style={{ 
              padding: '1rem 2rem', 
              borderBottom: activeTab === 'exercises' ? '3px solid var(--pk-primary)' : '3px solid transparent',
              color: activeTab === 'exercises' ? 'white' : 'var(--pk-text-secondary)',
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
                  return <strong style={{ color: 'white' }} {...props} />;
                },
                code: ({node, ...props}) => (
                  <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9rem' }} {...props} />
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
              {lesson.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div>
            {score !== null ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle size={64} color={score === lesson.exercises?.length ? "var(--pk-accent)" : "#f59e0b"} style={{ margin: '0 auto 1rem auto' }} />
                <h2>{score === lesson.exercises?.length ? 'Parfait !' : 'Bien essayé !'}</h2>
                <h3>Résultat : {score} / {lesson.exercises?.length}</h3>
                {score === lesson.exercises?.length ? (
                  <p style={{ color: 'var(--pk-text-secondary)', marginTop: '1rem' }}>Cette leçon est désormais marquée comme terminée.</p>
                ) : (
                  <p style={{ color: 'var(--pk-text-secondary)', marginTop: '1rem' }}>Obtenez un score parfait pour terminer la leçon.</p>
                )}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                  <button 
                    onClick={() => setScore(null)}
                    className="bg-gradient-primary"
                    style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', color: 'white', fontWeight: 'bold' }}
                  >
                    Recommencer
                  </button>
                  <Link 
                    to="/lessons"
                    style={{ padding: '0.5rem 1.5rem', borderRadius: '50px', border: '1px solid var(--pk-border)', color: 'white', textDecoration: 'none' }}
                  >
                    Retour aux leçons
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {lesson.exercises?.map((ex: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--pk-border)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>{idx + 1}. {ex.question}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {ex.options.map((opt: string, optIdx: number) => (
                        <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', cursor: 'pointer' }}>
                          <input type="radio" name={`question-${idx}`} value={opt} required />
                          <span>{renderTextWithArabic(opt)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit" className="bg-gradient-primary" style={{ padding: '1rem', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
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
