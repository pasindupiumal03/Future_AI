import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
import StarBackground from './StarBackground';
import NebulaOverlay from './NebulaOverlay';
import { FiDownload, FiCopy, FiRefreshCw, FiChevronDown, FiChevronUp, FiImage, FiSettings, FiZap } from 'react-icons/fi';
import './TextToImage.css';

const TextToImage = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigate = useNavigate();

  // Advanced options state
  const [options, setOptions] = useState({
    model: 'dall-e-3',
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
    seed: null,
  });

  const modelOptions = [
    { value: 'dall-e-3', label: 'DALL-E 3 (Highest Quality)' },
    { value: 'dall-e-2', label: 'DALL-E 2 (Faster)' },
  ];

  const sizeOptions = [
    { value: '1024x1024', label: 'Square (1024x1024)' },
    { value: '1024x1792', label: 'Portrait (1024x1792)' },
    { value: '1792x1024', label: 'Landscape (1792x1024)' },
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'hd', label: 'HD (Higher Quality)' },
  ];

  const styleOptions = [
    { value: 'vivid', label: 'Vivid (More dramatic, hyper-real)' },
    { value: 'natural', label: 'Natural (More accurate, less dramatic)' },
  ];



  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setStatus('Generating image... This may take 15-30 seconds.');
    setError('');
    setGeneratedImage(null);

    try {
      const requestBody = {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        model: options.model,
        size: options.size,
        quality: options.quality,
        style: options.style,
        n: options.numImages,
        seed: options.seed || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      // Handle multiple images if returned
      const imageUrls = data.imageUrl ? [data.imageUrl] : (data.images || []);
      
      if (imageUrls.length > 0) {
        setGeneratedImage(imageUrls[0]);
        
        // Add to history
        const newHistoryItem = {
          id: Date.now(),
          prompt: prompt.trim(),
          image: imageUrls[0],
          timestamp: new Date().toISOString(),
          options: { ...options }
        };
        
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Keep last 20 items
      }
      
      setStatus(`Successfully generated ${imageUrls.length} image${imageUrls.length > 1 ? 's' : ''}!`);
    } catch (err) {
      console.error('Error generating image:', err);
      const errorMessage = err.message || 'Failed to generate image. Please try again.';
      setError(errorMessage.includes('billing') ? 
        'API quota exceeded. Please check your OpenAI API key and billing status.' : 
        errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl = null) => {
    const url = imageUrl || generatedImage;
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setStatus('Prompt copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleRegenerate = () => {
    setOptions(prev => ({
      ...prev,
      seed: Math.floor(Math.random() * 1000000)
    }));
    handleGenerateImage();
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleHistorySelect = (item) => {
    setPrompt(item.prompt);
    setGeneratedImage(item.image);
    setOptions(prev => ({
      ...prev,
      ...item.options
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle drag and drop for image upload
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      // Handle image upload if needed
      console.log('Dropped file:', file);
    }
  };

  return (
    <div className="text-to-image-container" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <StarBackground />
      <NebulaOverlay />
      <header className="header">
        <div className="logo" onClick={() => navigate('/')}>futureAI</div>
        <nav className="nav-icons">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="generator-grid">
          {/* Left Column - Controls */}
          <div className="controls-section">
            <div className="card-ui">
              <h2 className="card-title">
                <FiImage className="icon" /> Text to Image
              </h2>
              
              <div className="card-content">
                <div className="prompt-area">
                  <div className="form-group">
                    <label className="form-label">Prompt</label>
                    <div className="prompt-input-container">
                      <textarea
                        className="prompt-textarea"
                        placeholder="A beautiful sunset over mountains with a lake in the foreground..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        disabled={loading}
                      />
                      <button 
                        className="icon-button copy-prompt"
                        onClick={handleCopyPrompt}
                        title="Copy prompt"
                        disabled={!prompt.trim()}
                      >
                        <FiCopy />
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Negative Prompt (Optional)</label>
                    <textarea
                      className="prompt-textarea negative"
                      placeholder="blurry, low quality, text, watermark..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      rows={2}
                      disabled={loading}
                    />
                  </div>

                  <div className="advanced-toggle" onClick={() => setAdvancedOpen(!advancedOpen)}>
                    <div className="advanced-toggle-header">
                      <FiSettings className="icon" />
                      <span>Advanced Options</span>
                      {advancedOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>

                  {advancedOpen && (
                    <div className="advanced-options">
                      <div className="options-grid">
                        <div className="form-group">
                          <label>Model</label>
                          <select 
                            value={options.model}
                            onChange={(e) => handleOptionChange('model', e.target.value)}
                            disabled={loading}
                          >
                            {modelOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Size</label>
                          <select 
                            value={options.size}
                            onChange={(e) => handleOptionChange('size', e.target.value)}
                            disabled={loading || options.model === 'dall-e-2'}
                          >
                            {sizeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Quality</label>
                          <select 
                            value={options.quality}
                            onChange={(e) => handleOptionChange('quality', e.target.value)}
                            disabled={loading || options.model === 'dall-e-2'}
                          >
                            {qualityOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Style</label>
                          <select 
                            value={options.style}
                            onChange={(e) => handleOptionChange('style', e.target.value)}
                            disabled={loading || options.model === 'dall-e-2'}
                          >
                            {styleOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="button-group">
                    <button 
                      className="generate-btn"
                      onClick={handleGenerateImage}
                      disabled={loading || !prompt.trim()}
                    >
                      {loading ? (
                        <>
                          <FiRefreshCw className="spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <FiZap /> Generate Image
                        </>
                      )}
                    </button>
                    
                    {generatedImage && (
                      <button 
                        className="secondary-btn"
                        onClick={handleRegenerate}
                        disabled={loading}
                      >
                        <FiRefreshCw /> Regenerate
                      </button>
                    )}
                  </div>

                  {(error || status) && (
                    <div className={`status-message ${error ? 'error' : ''}`}>
                      {error || status}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="history-section">
                <h3>Generation History</h3>
                <div className="history-grid">
                  {history.map(item => (
                    <div 
                      key={item.id} 
                      className="history-item"
                      onClick={() => handleHistorySelect(item)}
                      title={`Click to load: ${item.prompt.substring(0, 50)}${item.prompt.length > 50 ? '...' : ''}`}
                    >
                      <img src={item.image} alt={item.prompt} />
                      <div className="history-overlay">
                        <div className="history-prompt">
                          {item.prompt.substring(0, 60)}{item.prompt.length > 60 ? '...' : ''}
                        </div>
                        <button 
                          className="history-download"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item.image);
                          }}
                        >
                          <FiDownload size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="preview-section">
            <div className="card-ui">
              <h2 className="card-title">
                <FiImage className="icon" /> Preview
              </h2>
              
              <div className="card-content">
                <div className={`image-preview-container ${isDragging ? 'dragging' : ''}`}>
                  {generatedImage ? (
                    <div className="generated-image-container">
                      <div className="image-preview-wrapper">
                        <img 
                          src={generatedImage} 
                          alt="Generated content" 
                          className="generated-image"
                          onLoad={() => setIsImageLoaded(true)}
                        />
                        {!isImageLoaded && (
                          <div className="loading-overlay">
                            <div className="spinner"></div>
                            <p>Loading image...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="placeholder-image">
                      <FiImage size={48} className="placeholder-icon" />
                      <p>Your generated image will appear here</p>
                      <p className="small">Enter a prompt and click "Generate Image"</p>
                    </div>
                  )}
                  
                  {generatedImage && (
                    <div className="image-actions">
                      <button 
                        className="action-btn download-btn"
                        onClick={() => handleDownload()}
                        disabled={loading}
                      >
                        <FiDownload className="icon" /> Download Image
                      </button>
                    </div>
                  )}
                  
                  {isDragging && <div className="drag-overlay">Drop image here to upload</div>}
                  
                  {loading && (
                    <div className="loading-overlay">
                      <div className="spinner"></div>
                      <p>{status || 'Generating your image...'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextToImage;
