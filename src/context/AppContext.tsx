import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface AppContextType {
  showTashkeel: boolean;
  setShowTashkeel: (val: boolean) => void;
  showRomanization: boolean;
  setShowRomanization: (val: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  completedLessons: string[];
  completeLesson: (id: string) => void;
  completedStories: string[];
  completeStory: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Reading Settings
  const [showTashkeel, setShowTashkeel] = useState(() => {
    const saved = localStorage.getItem('pa-settings-tashkeel');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showRomanization, setShowRomanization] = useState(() => {
    const saved = localStorage.getItem('pa-settings-romanization');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Theme
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('pa-theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Progress
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem('pa-progress-lessons');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedStories, setCompletedStories] = useState<string[]>(() => {
    const saved = localStorage.getItem('pa-progress-stories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pa-settings-tashkeel', JSON.stringify(showTashkeel));
  }, [showTashkeel]);

  useEffect(() => {
    localStorage.setItem('pa-settings-romanization', JSON.stringify(showRomanization));
  }, [showRomanization]);

  useEffect(() => {
    localStorage.setItem('pa-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pa-progress-lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('pa-progress-stories', JSON.stringify(completedStories));
  }, [completedStories]);

  const completeLesson = (id: string) => {
    setCompletedLessons(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const completeStory = (id: string) => {
    setCompletedStories(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  return (
    <AppContext.Provider value={{ 
      showTashkeel, setShowTashkeel, 
      showRomanization, setShowRomanization,
      theme, setTheme,
      completedLessons, completeLesson,
      completedStories, completeStory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
