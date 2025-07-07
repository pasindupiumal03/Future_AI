# Motion AI - AI-Powered Image Generation Platform

A modern web application that leverages OpenAI's DALL-E API to generate stunning images from text prompts or enhance existing images with AI. Built with React, Node.js, and Express.

![Motion AI Demo](https://via.placeholder.com/1200x600/0a0618/ffffff?text=Motion+AI+Demo)

## 🌟 Features

- **Text-to-Image Generation**: Create unique images from text descriptions
- **Image Enhancement**: Upload and enhance existing images with AI
- **Modern UI**: Responsive design that works on all devices
- **Fast & Efficient**: Optimized for performance and speed
- **Secure**: Server-side API key handling

## 🛠️ Tech Stack

- **Frontend**: React, React Router, CSS3
- **Backend**: Node.js, Express
- **AI**: OpenAI DALL-E API
- **Deployment**: Vercel
- **Version Control**: Git, GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/future-ai.git
   cd future-ai
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env` in the `server` directory
   - Add your OpenAI API key to `server/.env`
   ```env
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=your_mongodb_connection_string (optional)
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the development server**
   ```bash
   # In server directory
   npm start
   
   # In a new terminal, from client directory
   cd client
   npm start
   ```

   The app will be available at `http://localhost:3000`

## 🌐 Deployment

### Vercel Deployment

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the project on Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/)

## 📂 Project Structure

```
future-ai/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React components and logic
│       ├── components/     # Reusable components
│       ├── App.js          # Main App component
│       └── index.js        # Entry point
├── server/                # Backend server
│   ├── index.js           # Express server setup
│   └── package.json       # Server dependencies
├── .env.example           # Example environment variables
└── vercel.json           # Vercel configuration
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their amazing DALL-E API
- All the open-source libraries and tools used in this project
- The amazing developer community

---

Made with ❤️ by [Your Name] | [GitHub](https://github.com/yourusername) | [Twitter](https://twitter.com/yourusername)
npm start
```

## Project Structure

```
future-ai/
├── client/             # React frontend
├── server/             # Node.js backend
├── .env               # Environment variables (not in repo)
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 