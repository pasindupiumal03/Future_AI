require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://*.vercel.app',
    'https://future-ai-frontend.vercel.app'
  ],
  optionsSuccessStatus: 200
};

app.use(cors());
app.use(express.json());

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not defined in environment variables');
  process.exit(1);
}

// Multer setup
const upload = multer();

// API Keys from environment variables
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
if (!STABILITY_API_KEY) {
  console.warn('Warning: STABILITY_API_KEY is not defined. Video generation features will be disabled.');
}

// ✅ Generate video from prompt using Stability.ai
app.post('/api/generate-video', upload.single('image'), async (req, res) => {
  if (!STABILITY_API_KEY) {
    return res.status(501).json({ 
      error: 'Video generation is not enabled. STABILITY_API_KEY is required for this feature.' 
    });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  try {
    // Resize image to 1024x576 if not already a supported size
    let imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();
    const allowedSizes = [
      { width: 1024, height: 576 },
      { width: 576, height: 1024 },
      { width: 768, height: 768 },
    ];
    const isAllowed = allowedSizes.some(
      (size) => size.width === metadata.width && size.height === metadata.height
    );
    if (!isAllowed) {
      // Default to 1024x576 (landscape)
      imageBuffer = await sharp(imageBuffer)
        .resize(1024, 576)
        .toFormat('png')
        .toBuffer();
    }

    // Prepare form data
    const data = new FormData();
    data.append('image', imageBuffer, req.file.originalname);
    data.append('seed', 0);
    data.append('cfg_scale', 1.8);
    data.append('motion_bucket_id', 127);

    // Start generation
    const startResponse = await axios.request({
      url: 'https://api.stability.ai/v2beta/image-to-video',
      method: 'post',
      headers: {
        authorization: `Bearer ${STABILITY_API_KEY}`,
        ...data.getHeaders(),
      },
      data: data,
    });

    const generationId = startResponse.data.id;
    if (!generationId) {
      return res.status(500).json({ error: 'Failed to start video generation.' });
    }

    // Poll for result
    let attempts = 0;
    let videoBuffer = null;
    let status = 202;
    while (status === 202 && attempts < 20) { // up to ~3 minutes
      await new Promise(r => setTimeout(r, 10000)); // wait 10 seconds
      const pollResponse = await axios.request({
        url: `https://api.stability.ai/v2beta/image-to-video/result/${generationId}`,
        method: 'get',
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: 'video/*',
        },
        validateStatus: undefined,
      });
      status = pollResponse.status;
      if (status === 200) {
        videoBuffer = pollResponse.data;
        break;
      }
      attempts++;
    }

    if (videoBuffer) {
      // Serve the video as a base64 string
      const base64Video = Buffer.from(videoBuffer).toString('base64');
      res.json({ video: base64Video, prompt: req.body.prompt });
    } else {
      res.status(500).json({ error: 'Video generation timed out or failed.' });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate video.' });
  }
});

// ✅ Scan image and generate a prompt using GPT-4 Vision
app.post('/api/scan-image', upload.single('image'), async (req, res) => {
  try {
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in one sentence.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'low',
                },
              },
            ],
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const prompt = response.data.choices[0].message.content;
    res.json({ prompt });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ prompt: 'Failed to generate prompt.' });
  }
});

// ✅ Generate image from prompt using OpenAI's DALL-E
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image', details: error.message });
  }
});

// Generate AI Image with DALL-E
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, style, quality, aspect_ratio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Map aspect ratio to DALL-E compatible size
    const getSize = (ratio) => {
      switch (ratio) {
        case '16:9': return '1024x1024'; // DALL-E 3 doesn't support 16:9, using square as fallback
        case '1:1': return '1024x1024';
        case '9:16': return '1024x1024'; // DALL-E 3 doesn't support 9:16, using square as fallback
        default: return '1024x1024';
      }
    };

    // Map quality to DALL-E quality parameter
    const getQuality = (quality) => {
      return quality === 'high' ? 'hd' : 'standard';
    };

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: `${style ? style + ' style: ' : ''}${prompt}. ${quality ? 'High quality, detailed, ' + quality + ' quality. ' : ''}`,
        n: 1,
        size: getSize(aspect_ratio),
        quality: getQuality(quality),
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageUrl = response.data.data[0].url;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ✅ Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Handle SIGTERM (for Render)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
