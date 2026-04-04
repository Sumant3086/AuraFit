# 🏋️ AURA FIT - Enterprise Fitness Platform

Modern full-stack gym management system with AI, real-time features, and enterprise security.

![React](https://img.shields.io/badge/React-18.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-20+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![WebSocket](https://img.shields.io/badge/WebSocket-Socket.io-black)

## 🚀 [Live Demo](https://aurafitgymwebsite.onrender.com/)

## ✨ Key Features

### 🎨 Modern UI/UX
- Framer Motion animations throughout
- Glassmorphism design
- Responsive & mobile-friendly
- Interactive charts & visualizations

### 🔒 Enterprise Security
- JWT refresh token rotation
- Rate limiting & API throttling
- XSS protection & input sanitization
- CORS security hardening
- Helmet.js security headers

### ⚡ Real-time Features
- WebSocket server (Socket.io)
- Live chat between users & trainers
- Real-time notifications
- Typing indicators
- Online/offline status

### 🤖 AI-Powered
- Google Gemini AI workout plans
- Personalized nutrition calculator
- Smart membership recommendations
- Body composition tracking

### 📊 Advanced Analytics
- Interactive charts (Chart.js)
- Revenue trends & forecasting
- User engagement metrics
- CSV export functionality
- Custom date range filters

### 🔍 Advanced Search
- Autocomplete suggestions
- Multi-criteria filtering
- Recent searches history
- Real-time results

### 💳 Payment System
- Razorpay integration
- PDF invoice generation
- Payment analytics
- Order tracking

### 👤 User Dashboard
- Body measurements tracking
- Progress charts
- Workout history
- Goal tracking

### 🛡️ Admin Dashboard
- Modern sidebar layout
- Real-time statistics
- User & membership management
- Order tracking
- Analytics with charts

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Framer Motion, Chart.js, Socket.io-client  
**Backend:** Node.js, Express, MongoDB, Socket.io, JWT, Helmet  
**AI:** Google Gemini API  
**Security:** bcrypt, express-rate-limit, express-validator  
**Database:** MongoDB Atlas with indexing & connection pooling  
**Real-time:** WebSocket (Socket.io)

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Google Gemini API key

### Installation

```bash
# Clone repository
git clone https://github.com/Sumant3086/AuraFit.git
cd AuraFit

# Install dependencies
npm install
cd server && npm install && cd ..

# Setup environment variables
cp .env.example .env
cp server/.env.example server/.env
# Edit .env files with your credentials

# Run application (both frontend & backend)
npm run dev
```

Visit: `http://localhost:3000`

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_EMAIL=admin@aurafit.com
VITE_ADMIN_PASSWORD=your_password
```

**Backend (server/.env):**
```env
MONGODB_URI=your_mongodb_uri
GOOGLE_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## 🎯 Usage

**User Routes:**
- `/` - Home
- `/signup` - Register
- `/login` - Login
- `/shop` - Products
- `/classes` - Book classes
- `/pricing` - Memberships
- `/features` - AI tools

**Admin Routes:**
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin panel

## 📁 Project Structure

```
AuraFit/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard
│   │   ├── chat/           # Live chat
│   │   ├── search/         # Advanced search
│   │   ├── dashboard/      # User dashboard
│   │   ├── notifications/  # Notification center
│   │   └── ...
│   ├── context/            # React context (Socket, Cart)
│   └── services/           # API services
├── server/
│   ├── middleware/         # Security, Auth
│   ├── socket/             # WebSocket server
│   ├── config/             # Database config
│   ├── services/           # PDF, AI services
│   └── routes/             # API endpoints
└── package.json
```

## 🔐 Security Features

- JWT access & refresh tokens
- Rate limiting (100 req/15min)
- Helmet.js security headers
- Input sanitization
- XSS protection
- CORS configuration
- Password hashing (bcrypt)

## 📊 Database Optimization

- Indexed collections for fast queries
- Connection pooling (max: 10)
- Query performance monitoring
- Optimized aggregation pipelines

## 🌐 API Endpoints

**Auth:** `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`  
**Memberships:** `/api/memberships/*`  
**Orders:** `/api/orders/*`  
**Admin:** `/api/admin/*`  
**AI:** `/api/workout-plans/*`, `/api/nutrition-plans/*`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 👨‍💻 Author

**Sumant Yadav**  
GitHub: [@Sumant3086](https://github.com/Sumant3086)

## 📝 License

MIT License

---

⭐ Star this repo if you find it helpful!
