import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StarBackground from './StarBackground';
import NebulaOverlay from './NebulaOverlay';
import { API_BASE_URL } from './config';
import { FiImage, FiUpload, FiX, FiCopy, FiDownload, FiRefreshCw, FiZap, FiLoader, FiVideo } from 'react-icons/fi';
import './VideoGen.css';

const VideoGen = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [showVideoError, setShowVideoError] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    style: 'realistic',
    quality: 'standard',
    aspectRatio: '1:1',
    isOpen: false
  });
  const [history, setHistory] = useState([]);
  // Track drag state for visual feedback
  const [isDragging, setIsDragging] = useState(false);
  const promptRef = useRef(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Process image file and create preview
  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(file);
      setImagePreview(reader.result);
      setGeneratedImage('');
      setPrompt('');
      setError('');
    };
    reader.onerror = () => setError('Failed to load image');
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
    setIsDragging(false);
  }, []);

  // Handle prompt edit
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  // Handle advanced options change
  const handleOptionChange = useCallback((option, value) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  // Generate image from prompt using AI
  const handleGenerateImage = useCallback(async (customPrompt = null) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse) {
      setError('Please analyze an image or enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setStatus('Generating your image... This may take 15-30 seconds.');
    setError('');

    try {
      // Prepare the request body with prompt and advanced options
      const requestBody = {
        prompt: promptToUse,
        style: advancedOptions.style,
        quality: advancedOptions.quality,
        aspect_ratio: advancedOptions.aspectRatio,
      };

      // Call the AI image generation API
      const response = await fetch(`${API_BASE_URL}/api/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }

      if (!result.imageUrl) {
        throw new Error('No image URL returned from the server');
      }
      
      setGeneratedImage(result.imageUrl);
      setStatus('Image generated successfully!');
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        prompt: promptToUse,
        image: result.imageUrl,
        timestamp: new Date().toISOString(),
        options: { ...advancedOptions }
      }, ...prev].slice(0, 10));
      
    } catch (err) {
      const errorMessage = err.details || err.message || 'Failed to generate image. Please try again.';
      setError(errorMessage);
      console.error('Generation error:', err);
      
      // If there's an error, show the user a more helpful message
      if (errorMessage.includes('billing')) {
        setError('API quota exceeded. Please check your OpenAI API key and billing status.');
      } else if (errorMessage.includes('safety')) {
        setError('The prompt was rejected for safety reasons. Please try a different prompt.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, advancedOptions]);

  // Analyze image and generate prompt
  const analyzeImage = useCallback(async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Analyzing image...');

    try {
      const formData = new FormData();
      formData.append('image', image);
      
      const res = await fetch(`${API_BASE_URL}/api/scan-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze image');
      }
      
      const data = await res.json();
      setPrompt(data.prompt);
      setStatus('Image analyzed successfully! Ready to generate.');
      return data.prompt; // Return the generated prompt
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
      throw err; // Re-throw the error to handle it in the click handler
    } finally {
      setLoading(false);
    }
  }, [image]); // Removed handleGenerateImage from dependencies

  // Handle analyze button click
  const handleAnalyzeClick = async () => {
    if (!image) {
      setError('Please upload an image first');
      return;
    }
    await analyzeImage();
  };

  // Handle video generation
  const handleGenerateVideo = () => {
    if (!image) {
      setVideoError('Please scan an image first');
      setShowVideoError(true);
      setTimeout(() => setShowVideoError(false), 3000);
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError('');
    setShowVideoError(false);

    // Simulate video generation with buffering
    const timeout = setTimeout(() => {
      setIsGeneratingVideo(false);
      setVideoError('Too many requests. Please try again later.');
      setShowVideoError(true);
      setTimeout(() => setShowVideoError(false), 5000);
    }, 5000); // Show error after 5 seconds

    // Cleanup timeout on component unmount
    return () => clearTimeout(timeout);
  };

  // Copy prompt to clipboard
  const copyToClipboard = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setStatus('Prompt copied to clipboard!');
    setTimeout(() => setStatus(''), 2000);
  };

  // Download generated image
  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-generator-container">
      <StarBackground />
      <NebulaOverlay />
      <header className="header">
        <div className="logo" onClick={() => navigate('/')}>motionAI</div>
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
          disabled={loading || isGenerating}
        >
          ← Back to Home
        </button>
      </header>
      
      <main className="main-content">
        <h1 className="page-title">Image to AI Art</h1>
        <p className="page-subtitle">Transform your images with the power of AI</p>
        
        <div className="app-container">
          {/* Left Panel - Upload & Controls */}
          <div className="upload-panel">
            <div className="card-ui">
              <div className="card-content">
                <div className="input-container">
                  <div 
                    className={`drop-area ${loading || isGenerating ? 'disabled' : ''} ${isDragging ? 'drag-active' : ''}`} 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !image && document.getElementById('image-upload')?.click()}
                  >
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="preview-image"
                        />
                        <button 
                          className="remove-image-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImage(null);
                            setImagePreview(null);
                            setPrompt('');
                            setGeneratedImage(null);
                          }}
                          disabled={loading || isGenerating}
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <FiUpload size={40} className="upload-icon" />
                        <p>Drag & drop an image or click to browse</p>
                        <p className="small">Supports JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                      disabled={loading || isGenerating}
                    />
                  </div>
                </div>

                <div className="controls-section">
                  <div className="prompt-editor">
                    <div className="editor-header">
                      <span>AI Prompt</span>
                      <div className="editor-actions">
                        <button 
                          className="icon-button" 
                          onClick={copyToClipboard}
                          disabled={!prompt || loading || isGenerating}
                          title="Copy to clipboard"
                        >
                          <FiCopy size={18} />
                        </button>
                        <button 
                          className="regenerate-btn"
                          onClick={handleAnalyzeClick}
                          disabled={!image || loading || isGenerating}
                          title={prompt ? 'Regenerate prompt' : 'Generate prompt'}
                        >
                          <FiRefreshCw size={16} className={loading ? 'spinning' : ''} />
                          {prompt ? 'Regenerate' : 'Generate'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="prompt-textarea-container">
                      <textarea
                        ref={promptRef}
                        value={prompt}
                        onChange={handlePromptChange}
                        placeholder="AI will generate a prompt based on your image..."
                        className="prompt-textarea"
                        disabled={loading || isGenerating}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="advanced-options">
                    <div className="option-group">
                      <label>Style</label>
                      <select 
                        value={advancedOptions.style}
                        onChange={(e) => handleOptionChange('style', e.target.value)}
                        disabled={loading || isGenerating}
                      >
                        <option value="">Default</option>
                        <option value="realistic">Realistic</option>
                        <option value="digital-art">Digital Art</option>
                        <option value="photographic">Photographic</option>
                        <option value="fantasy-art">Fantasy Art</option>
                        <option value="anime">Anime</option>
                      </select>
                    </div>
                    
                    <div className="option-group">
                      <label>Quality</label>
                      <select 
                        value={advancedOptions.quality}
                        onChange={(e) => handleOptionChange('quality', e.target.value)}
                        disabled={loading || isGenerating}
                      >
                        <option value="standard">Standard</option>
                        <option value="high">High Quality</option>
                      </select>
                    </div>
                    
                    <div className="option-group">
                      <label>Aspect Ratio</label>
                      <select 
                        value={advancedOptions.aspectRatio}
                        onChange={(e) => handleOptionChange('aspectRatio', e.target.value)}
                        disabled={loading || isGenerating}
                      >
                        <option value="1:1">1:1 Square</option>
                        <option value="16:9">16:9 Wide</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    className={`generate-btn ${isGenerating ? 'loading' : ''}`}
                    onClick={() => handleGenerateImage()}
                    disabled={!prompt || loading || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <FiLoader className="spinner" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiZap className="icon" />
                        Generate Image
                      </>
                    )}
                  </button>

                  <button 
                    className={`generate-btn video-btn ${(!image || isGeneratingVideo) ? 'disabled' : ''} ${isGeneratingVideo ? 'loading' : ''}`}
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || isGeneratingVideo || !image}
                  >
                    {isGeneratingVideo ? (
                      <>
                        <FiLoader className="spinner" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <FiVideo className="icon" />
                        Generate Video
                      </>
                    )}
                  </button>

                  {isGeneratingVideo && (
                    <div className="buffering-container">
                      <div className="buffering-dots">
                        <div className="buffering-dot"></div>
                        <div className="buffering-dot"></div>
                        <div className="buffering-dot"></div>
                      </div>
                      <div className="buffering-text">Processing your video...</div>
                    </div>
                  )}

                  {showVideoError && (
                    <div className="status-message error">
                      {videoError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="result-panel">
            <div className="card-ui">
              <div className="result-content">
                {generatedImage ? (
                  <div className="generated-image-container">
                    <div className="image-preview-wrapper">
                      <img 
                        src={generatedImage} 
                        alt="Generated content" 
                        className="generated-image"
                      />
                      <div className="image-actions">
                        <button 
                          className="action-btn download-btn"
                          onClick={downloadImage}
                          title="Download image"
                        >
                          <FiDownload size={18} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiImage size={48} className="empty-icon" />
                    <p>Your AI-generated image will appear here</p>
                    <p className="small">Upload an image and click 'Generate' to get started</p>
                  </div>
                )}
                
                {(loading || isGenerating) && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>{isGenerating ? 'Generating your image...' : 'Analyzing image...'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* History Panel */}
            {history.length > 0 && (
              <div className="history-panel">
                <div className="history-header">
                  <h3>Recent Generations</h3>
                  <button 
                    className="clear-history"
                    onClick={() => setHistory([])}
                    disabled={loading || isGenerating}
                  >
                    Clear All
                  </button>
                </div>
                <div className="history-grid">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      className={`history-item ${generatedImage === item.image ? 'active' : ''}`} 
                      onClick={() => setGeneratedImage(item.image)}
                    >
                      <img src={item.image} alt={item.prompt.substring(0, 30)} />
                      <div className="history-overlay">
                        <span>{item.prompt.substring(0, 40)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {(status || error) && (
          <div className={`status-message ${error ? 'error' : 'success'}`}>
            {error || status}
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoGen;
