import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Alphabet from './pages/Alphabet';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Vocabulary from './pages/Vocabulary';
import Stories from './pages/Stories';
import Profile from './pages/Profile';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/alphabet" element={<Alphabet />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/lessons/:lessonId" element={<LessonDetail />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
