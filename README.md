# Elevate AI Image Application

AI-powered image enhancement app that uses advanced algorithms to improve image quality and resolution.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ibrahimnajah768-gif/images.git
   cd images
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   - Cloudinary credentials (for image storage)
   - Supabase credentials (for database)

5. **Start the application:**
   ```bash
   # Terminal 1 - Start backend server
   cd backend
   node server.js

   # Terminal 2 - Start frontend
   cd frontend
   npm start
   ```

6. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
images/
├── frontend/          # React/Electron app
│   ├── public/        # Static assets
│   ├── src/          # React components
│   └── package.json
├── backend/          # Node.js API server
│   ├── server.js     # Main server file
│   └── package.json
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env` with:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=5000
```

### Getting API Keys
- **Cloudinary:** Sign up at [cloudinary.com](https://cloudinary.com)
- **Supabase:** Create project at [supabase.com](https://supabase.com)

## 🛠 Development

### Available Scripts

**Frontend:**
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

**Backend:**
```bash
cd backend
node server.js     # Start server
```

### Building Desktop App
```bash
cd frontend
npm run dist       # Create executable for your platform
```

## 📝 Notes

- Keep `.env` files secure and never commit them
- The app uses AI models that require significant computational resources
- For production deployment, consider using PM2 or Docker

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.