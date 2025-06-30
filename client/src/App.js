import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MdToken } from 'react-icons/md';
import VideoGen from './VideoGen';
import TextToImage from './TextToImage';
import { SplashCursor } from './SplashCursor';
import StarBackground from './StarBackground';

function Home() {
  const navigate = useNavigate();
  const feedbacks = [
    {
      id: 1,
      quote: "MotionAI has completely transformed how we create content. The AI-generated videos save us countless hours of production time while delivering stunning results.",
      name: "Alex Johnson",
      role: "Creative Director @DigitalDreams",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      quote: "As a small business owner, I was amazed by how easy it is to create professional-looking videos with MotionAI. The quality is outstanding and the interface is incredibly intuitive.",
      name: "Sarah Williams",
      role: "Founder @StartupVentures",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      quote: "The text-to-video feature is a game changer for our marketing team. We can now create engaging social media content in minutes instead of days.",
      name: "Michael Chen",
      role: "Marketing Lead @TechInnovate",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      quote: "MotionAI's technology is lightyears ahead of anything else we've tried. The ability to generate high-quality videos from simple text prompts is nothing short of magical.",
      name: "Emily Rodriguez",
      role: "Content Creator @CreativeMinds",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      quote: "The AI-powered video generation has transformed our content pipeline. What used to take days now takes minutes with stunning results.",
      name: "David Park",
      role: "Video Producer @CreativeMinds",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      quote: "MotionAI's intuitive interface makes it easy for our entire team to create professional-grade content without a steep learning curve.",
      name: "Michelle Zhang",
      role: "Design Lead @NextGenStudios",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 7,
      quote: "The quality of AI-generated assets is indistinguishable from human-created ones. Our clients are consistently impressed with the results.",
      name: "James Wilson",
      role: "Creative Director @PixelPerfect",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: 8,
      quote: "MotionAI has become an essential tool in our creative workflow. The ability to quickly iterate on ideas has been a game-changer.",
      name: "Sophia Chen",
      role: "Art Director @DigitalDreamWorks",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80"
    }
  ];
  
  // Using array of 5 duplicates for smooth infinite loop effect

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <StarBackground />
      <SplashCursor />
      <header className="header">
        <a href="#" className="logo">motionAI</a>
        <nav className="nav-icons">
          <a 
            href="https://pump.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="token-btn"
          >
            <MdToken className="token-icon" />
            <span>$MAI Is Live</span>
            <span className="arrow">›</span>
          </a>
        </nav>
      </header>
      <main className="main-content">
        <h1 className="main-title">the motion of ai</h1>
        <p className="subtitle">Our cutting-edge platform uses state-of-the-art AI algorithms to bring images to life.</p>
        <div className="cta-buttons">
          <button className="try-now" onClick={() => navigate('/generate')}>Generate from Image</button>
          <button className="try-now secondary" onClick={() => navigate('/text-to-image')}>Generate from Text</button>
        </div>
        
        {/* Creators Feedbacks Section */}
        <section className="feedback-section">
          <h2>Creators Love MotionAI</h2>
          <div className="feedback-container">
            <div className="feedback-track">
              {[...Array(5)].map((_, i) => (
                <div key={`duplicate-${i}`} className="feedback-track-inner">
                  {feedbacks.map((feedback, index) => (
                    <div 
                      key={`${feedback.id}-${index}-${i}`} 
                      className="feedback-card"
                    >
                      <div className="quote-icon">"</div>
                      <p className="feedback-quote">{feedback.quote}</p>
                      <div className="feedback-author">
                        <div className="author-avatar">
                          <img 
                            src={feedback.avatar} 
                            alt={feedback.name}
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.target.style.display = 'none';
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <span className="avatar-fallback" style={{ display: 'none' }}>
                            {feedback.name.charAt(0)}
                          </span>
                        </div>
                        <div className="author-info">
                          <div className="author-name">{feedback.name}</div>
                          <div className="author-role">{feedback.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
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
