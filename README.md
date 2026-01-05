# 🏋️ AURA FIT - AI-Powered Gym Management System

A modern, full-stack gym management platform with AI-powered features, stunning UI, and comprehensive admin dashboard.

![React](https://img.shields.io/badge/React-18.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### 🤖 AI-Powered Features (Unique)
- **AI Workout Generator** - Personalized workout plans using Google Gemini AI
- **AI Nutrition Calculator** - Custom meal plans based on user goals
- **AI Membership Recommender** - Smart membership suggestions
- **Body Tracker** - BMI calculator with health insights

### 👥 User Management
- Secure authentication with bcrypt
- User profiles and dashboards
- Order history tracking
- Membership management

### 💼 Admin Dashboard
- Modern glassmorphism UI with gradients
- Real-time statistics and analytics
- User and membership management
- Order tracking system
- Revenue analytics

### 🛒 E-Commerce
- Product catalog
- Shopping cart
- Order management
- Payment gateway integration (Razorpay)

### 📅 Class Booking
- Multiple fitness classes (Yoga, HIIT, Zumba, etc.)
- Real-time enrollment tracking
- Instructor information
- Capacity management

### 💳 Membership System
- Multiple tiers (Basic, Pro, Premium)
- Free day pass/trial
- Admin approval workflow
- Automatic expiry tracking

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **React Icons** - Icon library
- **CSS3** - Styling with glassmorphism

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **Google Gemini AI** - AI features

### DevOps (Planned)
- **Docker** - Containerization
- **Jenkins** - CI/CD pipeline
- **Git** - Version control

## 📦 Installation

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone Repository
```bash
git clone https://github.com/Sumant3086/ReactAuraFit.git
cd ReactAuraFit
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Environment Setup

**Important: Never commit .env files to Git!**

Create environment files from examples:
```bash
# Frontend environment
cp .env.example .env

# Backend environment  
cp server/.env.example server/.env
```

Edit the `.env` files with your actual credentials:

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ADMIN_EMAIL=your_admin_email
REACT_APP_ADMIN_PASSWORD=your_admin_password
REACT_APP_RAZORPAY_LINK=your_razorpay_link
```

**Backend (server/.env):**
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_gemini_api_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
```

### 4. Seed Database (Optional)

Add sample users:
```bash
cd server
node seedUsers.js
```

Add custom user:
```bash
node addUser.js
```

### 5. Run Application

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
npm run dev
```

Visit: `http://localhost:5173`

## 🎯 Usage

### User Access
1. **Signup:** `/signup` - Create new account
2. **Login:** `/login` - Access your dashboard
3. **Shop:** `/shop` - Browse products
4. **Classes:** `/classes` - Book fitness classes
5. **Pricing:** `/pricing` - Purchase memberships
6. **Features:** `/features` - AI-powered tools

### Admin Access
1. **Login:** `/admin/login`
   - Email: `sumant@gmail.com`
   - Password: `sumant3086`
2. **Dashboard:** `/admin/new-dashboard`

## 📁 Project Structure

```
ReactAuraFit/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard
│   │   ├── auth/           # Login/Signup
│   │   ├── features/       # AI features
│   │   ├── shop/           # E-commerce
│   │   ├── classes/        # Class booking
│   │   ├── orders/         # Order management
│   │   └── ...
│   ├── context/            # React context
│   ├── services/           # API services
│   └── App.jsx
├── server/
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── server.js
└── package.json
```

## 🎨 Key Features Showcase

### Modern Admin Dashboard
- Glassmorphism design
- Real-time statistics
- Gradient animations
- Responsive layout

### AI Integration
- Google Gemini API
- Personalized recommendations
- Natural language processing
- Smart algorithms

### Security
- Password hashing
- Protected routes
- Admin authentication
- Input validation

## 🐳 Docker Deployment (Coming Soon)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

### Memberships
- `GET /api/memberships` - Get all memberships
- `POST /api/memberships/purchase` - Purchase membership
- `PATCH /api/memberships/:id/approve` - Approve membership

### Orders
- `GET /api/orders/user/email/:email` - Get user orders
- `POST /api/orders` - Create order

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sumant Yadav**
- GitHub: [@Sumant3086](https://github.com/Sumant3086)
- Project: [ReactAuraFit](https://github.com/Sumant3086/ReactAuraFit)

## 🙏 Acknowledgments

- Google Gemini AI for AI features
- MongoDB Atlas for cloud database
- React community for amazing tools
- All contributors and supporters

## 📞 Support

For support, email sumantyadav3086@gmail.com or open an issue.

---

⭐ Star this repo if you find it helpful!
