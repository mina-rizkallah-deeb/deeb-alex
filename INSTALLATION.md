# 🚀 Deeb Alex Installation Guide

## Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** v5+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn**

## Backend Setup

### 1. Clone Repository
```bash
git clone https://github.com/mina-rizkallah-deeb/deeb-alex.git
cd deeb-alex
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
```bash
cp ../.env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/deeb-alex
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
```

### 4. Start Backend Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL
Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Dev Server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## Database Setup

### Using Local MongoDB
```bash
# Start MongoDB service
mongod

# In another terminal, initialize the database
db.createCollection('users')
db.createCollection('tools')
db.createCollection('transactions')
db.createCollection('logs')
```

### Using MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create an account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tools
- `GET /api/tools/mobile` - Get mobile tools
- `GET /api/tools/desktop` - Get desktop tools
- `POST /api/tools/:toolId/execute` - Execute tool
- `POST /api/tools/:toolId/rate` - Rate tool

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/payment/initiate` - Initiate payment
- `GET /api/wallet/transactions` - Get transactions

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `GET /api/user/statistics` - Get statistics

---

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Heroku/AWS)
```bash
git push heroku main
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### CORS Issues
Update CORS in `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## Support
For issues, contact: support@deebAlex.com
