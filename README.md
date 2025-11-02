# 🎯 Brahmastra Arts & Sports Club - Backend API

Complete backend system for the Brahmastra Club Management application with MongoDB database, JWT authentication, and RESTful API.

---

## 📋 Features

✅ **User Authentication** - Secure login with JWT tokens  
✅ **Member Management** - Add, view, and delete members  
✅ **Payment Tracking** - Monthly payment status management  
✅ **Expense Management** - Track monthly expenses  
✅ **Dashboard Statistics** - Real-time analytics  
✅ **Role-Based Access** - Admin and Member roles  
✅ **Password Security** - Bcrypt hashing  
✅ **Multi-Device Access** - Login from anywhere  

---

## 🚀 Quick Deployment Guide

### **Option 1: Deploy to Railway (Recommended - FREE)**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (free)

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect this repository
   - Railway will auto-detect Node.js

3. **Setup MongoDB**
   - In Railway project, click "New"
   - Select "Database" → "MongoDB"
   - Copy the connection string

4. **Set Environment Variables**
   - Go to your backend service
   - Click "Variables" tab
   - Add:
     ```
     MONGODB_URI=<your-mongodb-connection-string>
     JWT_SECRET=your-secret-key-here
     PORT=5000
     ```

5. **Initialize Database**
   - Open Railway Terminal
   - Run: `npm run init`
   - This creates the default admin

6. **Get Your API URL**
   - Railway will give you a URL like: `https://your-app.railway.app`
   - Save this URL - you'll need it for the frontend

---

### **Option 2: Deploy to Render (Also FREE)**

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up (free tier available)

2. **Create MongoDB Database**
   - Dashboard → New → MongoDB
   - Name it "brahmastra-db"
   - Copy the connection string

3. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Settings:
     - Name: brahmastra-backend
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`

4. **Set Environment Variables**
   - In the web service page
   - Add environment variables:
     ```
     MONGODB_URI=<your-mongodb-connection-string>
     JWT_SECRET=your-secret-key-here
     ```

5. **Initialize Database**
   - After first deployment
   - Go to Shell tab
   - Run: `npm run init`

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 14+ installed
- MongoDB installed (or use MongoDB Atlas)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd club-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string

4. **Initialize database**
   ```bash
   npm run init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Test the API**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## 📡 API Endpoints

### **Authentication**
```
POST   /api/auth/login              Login with credentials
POST   /api/auth/change-password    Change user password
```

### **Members**
```
GET    /api/members                 Get all members (Admin)
GET    /api/members/me              Get current user details
POST   /api/members                 Add new member (Admin)
DELETE /api/members/:memberId       Delete member (Admin)
```

### **Payments**
```
POST   /api/payments                Update monthly payments (Admin)
GET    /api/payments/stats          Get payment statistics
```

### **Expenses**
```
GET    /api/expenses                Get all expenses
POST   /api/expenses                Add new expense (Admin)
DELETE /api/expenses/:id            Delete expense (Admin)
```

### **Dashboard**
```
GET    /api/dashboard/stats         Get dashboard statistics (Admin)
```

### **Utility**
```
GET    /api/health                  Health check
POST   /api/init                    Initialize default admin (one-time)
```

---

## 🔐 Default Credentials

After initialization, use these credentials to login:

```
User ID:  brahmastra01
Password: Accen@10090
```

⚠️ **IMPORTANT:** Change the default password immediately after first login!

---

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` or `development` |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **CORS:** Enabled for cross-origin requests

---

## 📱 Mobile App Integration

The frontend mobile app needs your backend API URL. After deployment:

1. Get your API URL from Railway/Render
2. Update the frontend `API_BASE_URL` constant
3. Example:
   ```javascript
   const API_BASE_URL = 'https://your-app.railway.app/api';
   ```

---

## 🔄 Database Schema

### Member Schema
```javascript
{
  memberId: String (unique),
  memberName: String,
  password: String (hashed),
  role: 'admin' | 'member',
  monthlyPayments: [{
    month: Number,
    year: Number,
    status: 'paid' | 'not_paid',
    amount: Number,
    paidDate: Date
  }],
  createdAt: Date
}
```

### Expense Schema
```javascript
{
  month: Number,
  year: Number,
  electricityBill: Number,
  internetBill: Number,
  miscellaneous: Number,
  totalExpense: Number,
  createdAt: Date
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
Error: MongoNetworkError
```
**Solution:** Check your MongoDB connection string and IP whitelist

### JWT Token Errors
```bash
Error: Invalid token
```
**Solution:** Token might be expired. Login again to get a new token

### Port Already in Use
```bash
Error: EADDRINUSE
```
**Solution:** Change the PORT in .env or kill the process using that port

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Contact: support@brahmastraclub.com

---

## 📄 License

MIT License - Feel free to use and modify

---

## 🎉 Deployment Checklist

- [ ] MongoDB database created
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables set
- [ ] Database initialized (`npm run init`)
- [ ] API health check passing
- [ ] Default admin login tested
- [ ] Frontend connected to backend
- [ ] Members can login from their devices

---

**Made with ❤️ for Brahmastra Arts & Sports Club, Vakkom**
