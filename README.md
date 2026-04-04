# 🏋️ AURA FIT - Next-Generation Fitness Platform

A production-ready, enterprise-grade gym management system that stands out with AI-powered personalization, real-time communication, and modern architecture. Built to compete with leading fitness tech platforms.

![React](https://img.shields.io/badge/React-18.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-20+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![WebSocket](https://img.shields.io/badge/WebSocket-Socket.io-black)

## 🚀 [Live Demo](https://aurafitgymwebsite.onrender.com/)

---

## 🌟 What Makes AURA FIT Unique

### 💡 Product Innovation
Unlike traditional gym websites that rely on static templates and generic plans, AURA FIT delivers:

- **True AI Personalization**: Every workout and nutrition plan is generated in real-time by advanced AI, adapting to individual user profiles, goals, and limitations - no two plans are identical
- **Zero Hardcoded Values**: All fitness recommendations are dynamically calculated based on user data, ensuring scientifically accurate and personalized guidance
- **Real-time Engagement**: Live chat system connecting members with trainers instantly, creating a connected fitness community
- **Smart Analytics**: Data-driven insights that help both users and administrators make informed decisions about fitness progress and business growth

### 🎯 Competitive Advantages

**1. Enterprise-Grade Architecture**
- Scalable microservices-ready design
- Production-level security (JWT rotation, rate limiting, XSS protection)
- Optimized database with indexing and connection pooling
- WebSocket infrastructure for real-time features

**2. Superior User Experience**
- Smooth animations and modern glassmorphism UI
- Intuitive navigation with advanced search and autocomplete
- Mobile-responsive design that works flawlessly on all devices
- Interactive data visualizations for progress tracking

**3. Complete Business Solution**
- Integrated payment processing with automated invoicing
- Comprehensive admin dashboard with revenue analytics
- Membership management with smart recommendations
- Order tracking and customer relationship tools

**4. AI-First Approach**
- Adaptive workout generation that evolves with user progress
- Personalized nutrition calculations based on body metrics
- Smart goal tracking with predictive analytics
- Body composition analysis and recommendations

### 🏆 Market Positioning

AURA FIT bridges the gap between basic gym websites and expensive enterprise fitness platforms. It offers:

- **Professional Quality**: Features comparable to premium fitness tech platforms
- **Modern Stack**: Built with latest technologies and best practices
- **Scalability**: Ready to handle growth from startup to enterprise
- **Customizable**: Modular architecture allows easy feature additions
- **Cost-Effective**: Open-source foundation with enterprise capabilities

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
- Google Gemini AI workout plans (fully dynamic, no hardcoded values)
- Personalized nutrition calculator
- Smart membership recommendations
- Body composition tracking
- Adaptive workout generation based on user profile

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
- Personalized AI recommendations

### 🛡️ Admin Dashboard
- Modern sidebar layout
- Real-time statistics
- User & membership management
- Order tracking
- Analytics with charts

## 🎯 Highlights

- **🤖 Dynamic AI Generation**: All workout and nutrition plans are generated dynamically using AI with no hardcoded values - truly personalized for each user
- **🏗️ Scalable Architecture**: Built with enterprise-grade patterns ready for production deployment and scaling
- **⚡ Real-time Communication**: WebSocket integration for instant updates, live chat, and notifications
- **🔒 Security First**: Multiple layers of security protection including JWT rotation, rate limiting, and input sanitization
- **📊 Performance Optimized**: Database indexing, connection pooling, and efficient queries for fast response times
- **💼 Business Ready**: Complete solution with payment processing, analytics, and admin tools
- **🎨 Modern Design**: Glassmorphism UI with smooth animations that rival top fitness platforms
- **📱 Mobile First**: Fully responsive design that works seamlessly across all devices

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Framer Motion, Chart.js, Socket.io-client  
**Backend:** Node.js, Express, MongoDB, Socket.io, JWT, Helmet  
**AI:** Google Gemini API (for dynamic plan generation)  
**Security:** bcrypt, express-rate-limit, express-validator  
**Database:** MongoDB Atlas with indexing & connection pooling  
**Real-time:** WebSocket (Socket.io)  
**Payments:** Razorpay integration  
**PDF Generation:** Automated invoice system

### Why This Stack?

- **React 18**: Latest features for optimal performance and user experience
- **Vite**: Lightning-fast build tool for development and production
- **MongoDB**: Flexible schema for evolving fitness data requirements
- **Socket.io**: Industry-standard for real-time bidirectional communication
- **Gemini AI**: Cutting-edge AI for intelligent fitness recommendations
- **Express**: Proven, scalable backend framework

## � Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- MongoDB Atlas account (free tier available)
- Google Gemini API key (for AI features)
- Razorpay account (for payment processing)

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
VITE_ADMIN_PASSWORD=your_secure_password
```

**Backend (server/.env):**
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 🎯 Usage

### For Users
- **Home** (`/`) - Explore features and services
- **Sign Up** (`/signup`) - Create your personalized account
- **Login** (`/login`) - Access your dashboard
- **Shop** (`/shop`) - Browse fitness products and merchandise
- **Classes** (`/classes`) - Book and manage fitness classes
- **Pricing** (`/pricing`) - View and purchase memberships
- **Features** (`/features`) - Access AI-powered tools (workout generator, nutrition calculator, body tracker)
- **Dashboard** (`/dashboard`) - Track progress, view analytics, and manage your fitness journey

### For Administrators
- **Admin Login** (`/admin/login`) - Secure admin authentication
- **Admin Dashboard** (`/admin/dashboard`) - Comprehensive management panel with:
  - Real-time analytics and revenue tracking
  - User and membership management
  - Order processing and tracking
  - System health monitoring
  - Data export capabilities

---

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

AURA FIT implements enterprise-grade security measures:

- **JWT Authentication**: Access & refresh token rotation for secure sessions
- **Rate Limiting**: 100 requests per 15 minutes to prevent abuse
- **Helmet.js**: Comprehensive security headers protection
- **Input Sanitization**: All user inputs validated and sanitized
- **XSS Protection**: Cross-site scripting attack prevention
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Password Security**: bcrypt hashing with salt rounds
- **SQL Injection Prevention**: MongoDB parameterized queries
- **Session Management**: Secure token storage and rotation

---

## 📊 Database Optimization

Performance-focused database design:

- **Indexed Collections**: Fast query execution on frequently accessed fields
- **Connection Pooling**: Maximum 10 concurrent connections for efficiency
- **Query Optimization**: Aggregation pipelines for complex data operations
- **Performance Monitoring**: Real-time query performance tracking
- **Data Validation**: Schema validation at database level
- **Backup Strategy**: Automated backups with MongoDB Atlas

---

## 🌐 API Endpoints

**Auth:** `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`  
**Memberships:** `/api/memberships/*`  
**Orders:** `/api/orders/*`  
**Admin:** `/api/admin/*`  
**AI:** `/api/workout-plans/*`, `/api/nutrition-plans/*`

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🎓 Learning Resources

This project demonstrates:
- Full-stack JavaScript development
- RESTful API design
- Real-time WebSocket communication
- AI integration in web applications
- Enterprise security practices
- Database optimization techniques
- Modern UI/UX patterns
- Payment gateway integration

Perfect for developers looking to understand production-ready application architecture.

---

## 👨‍💻 Author

**Sumant Yadav**  
GitHub: [@Sumant3086](https://github.com/Sumant3086)

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by leading fitness technology platforms
- Designed to be a comprehensive learning resource for full-stack development

---

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review the codebase for implementation details

---

⭐ **Star this repository if you find it helpful!**  
🔄 **Fork it to build your own fitness platform!**  
📢 **Share it with developers interested in full-stack projects!**
