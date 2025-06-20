import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
import StarBackground from './StarBackground';
import NebulaOverlay from './NebulaOverlay';
import './TextToImage.css';

const TextToImage = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setStatus('Generating image...');
    setError('');
    setGeneratedImage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setStatus('Image generated successfully!');
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-to-image-container">
      <StarBackground />
      <NebulaOverlay />
      <header className="header">
        <div className="logo" style={{cursor: 'pointer'}} onClick={() => navigate('/')}>futureAI</div>
        <nav className="nav-icons">
          <button className="back-button" onClick={() => navigate('/')}>← Back to Home</button>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="card-ui">
          <h2 className="card-title">Generate Image from Text</h2>
          <div className="card-content">
            <div className="prompt-area">
              <div className="prompt-label">Describe the image you want to generate</div>
              <textarea
                className="prompt-textarea"
                placeholder="A beautiful sunset over mountains with a lake in the foreground..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              <div className="button-group">
                <button 
                  className="generate-btn"
                  onClick={handleGenerateImage}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Image'}
                </button>
                {generatedImage && (
                  <button 
                    className="download-btn"
                    onClick={handleDownload}
                  >
                    Download Image
                  </button>
                )}
              </div>
              {error && <div className="error-message">{error}</div>}
              {status && !error && <div className="status-message">{status}</div>}
            </div>
            
            <div className="image-preview-container">
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated content" 
                  className="generated-image"
                />
              ) : (
                <div className="placeholder-image">
                  <div>Your generated image will appear here</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextToImage;
