import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import VideoGen from './VideoGen';
import TextToImage from './TextToImage';
import { SplashCursor } from './SplashCursor';
import StarBackground from './StarBackground';

function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <StarBackground />
      <SplashCursor />
      <header className="header">
        <div className="logo">futureAI</div>
        <nav className="nav-icons">
          {/* Placeholder for icons */}
        </nav>
      </header>
      <main className="main-content">
        <h1 className="main-title">the future of ai</h1>
        <p className="subtitle">Our cutting-edge platform uses state-of-the-art AI algorithms to bring images to life.</p>
        <div className="cta-buttons">
          <button className="try-now" onClick={() => navigate('/generate')}>Generate from Image</button>
          <button className="try-now secondary" onClick={() => navigate('/text-to-image')}>Generate from Text</button>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<VideoGen />} />
        <Route path="/text-to-image" element={<TextToImage />} />
      </Routes>
    </Router>
  );
}

export default App;
