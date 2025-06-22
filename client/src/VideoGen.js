import React, { useRef, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import StarBackground from './StarBackground';
import NebulaOverlay from './NebulaOverlay';
import { API_BASE_URL } from './config';

const VideoGen = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleCardClick = () => {
    fileInputRef.current.click();
  };

  const handleUsePrompt = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }
    
    setLoading(true);
    setStatus('Generating image...');
    setError('');
    setVideoUrl('');
    setImagePreview(null);
    setImage(null);

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

  const handleGenerateVideo = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setStatus('Generating video...');
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }

      const res = await fetch(`${API_BASE_URL}/api/generate-video`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate video');
      }

      const data = await res.json();
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else if (data.video) {
        // Handle base64 video data if needed
        setVideoUrl(`data:video/mp4;base64,${data.video}`);
      }
      
      setStatus('Video generated successfully!');
    } catch (err) {
      setError(err.message || 'Error generating video');
      setStatus('');
    }
  };

  const handleGenerateAIPrompt = async () => {
    if (!image) return;
    setLoading(true);
    setStatus('Generating AI prompt...');
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      const res = await fetch(`${API_BASE_URL}/api/scan-image`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.prompt || 'Failed to generate prompt');
      }
      const data = await res.json();
      setPrompt(data.prompt);
      setStatus('AI prompt generated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to generate prompt');
      setStatus('');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
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
          <h2 className="card-title">Upload an Image to Scan <span title="Upload an image and describe what you want to see in this image.">ⓘ</span></h2>
          <div className="card-content">
            <div className="input-container">
              <div 
                className="drop-area" 
                onClick={handleCardClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="image-preview"
                  />
                ) : (
                  <div className="drop-text">
                    <div>📁</div>
                    <div>Drag & drop an image here</div>
                    <div>or click to browse</div>
                    <div className="image-format">JPEG, PNG (max 5MB)</div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  style={{ display: 'none' }}
                />
              </div>
              <div className="prompt-area">
                <div className="prompt-label">Describe what you want to see in this image</div>
                <textarea
                  className="prompt-textarea"
                  placeholder="A beautiful sunset over mountains..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button 
                  className="ai-prompt-btn"
                  onClick={handleGenerateAIPrompt}
                  disabled={!image || loading}
                >
                  Generate AI Prompt
                </button>
                <button
                  className="try-now use-own-btn"
                  type="button"
                  onClick={handleUsePrompt}
                  disabled={!image || !prompt || loading}
                >
                  {loading ? (status.includes('Generating') ? 'Generating...' : 'Loading...') : 'Generate Image'}
                </button>
              </div>
            </div>
            
            {/* Generated Image Container */}
            <div className="output-container">
              <div className="drop-area generated-image-container">
                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated content" 
                    className="image-preview"
                  />
                ) : (
                  <div className="drop-text">
                    <div>✨</div>
                    <div>Generated image will appear here</div>
                  </div>
                )}
              </div>
              <div className="prompt-area">
                <div className="prompt-label">Generated Image</div>
                {generatedImage && (
                  <a 
                    href={generatedImage} 
                    className="download-btn" 
                    download="generated-image.png"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Image
                  </a>
                )}
              </div>
            </div>
          </div>
          {status && <div className="status-message">{status}</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
        {videoUrl && !error && (
          <div className="video-preview">
            <video src={videoUrl} controls width="480" />
            <a href={videoUrl} download="generated-video.mp4" className="download-btn">Download Video</a>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoGen; 