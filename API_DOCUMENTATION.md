# 📚 Deeb Alex API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All requests (except auth endpoints) require:
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}

Response 201:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response 200:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

---

## 🛠️ Tools Endpoints

### Get Mobile Tools
```http
GET /tools/mobile

Response 200:
{
  "success": true,
  "category": "mobile",
  "count": 15,
  "tools": [ ... ]
}
```

### Get Desktop Tools
```http
GET /tools/desktop

Response 200:
{
  "success": true,
  "category": "desktop",
  "count": 15,
  "tools": [ ... ]
}
```

### Execute Tool
```http
POST /tools/:toolId/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": "example.com"
}

Response 200:
{
  "success": true,
  "tool": { ... },
  "output": { ... },
  "executionTime": 1234
}
```

### Rate Tool
```http
POST /tools/:toolId/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent tool!"
}

Response 200:
{
  "success": true,
  "message": "Review submitted successfully"
}
```

---

## 💳 Wallet Endpoints

### Get Balance
```http
GET /wallet/balance
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "balance": 150.00,
  "subscription": "premium",
  "subscriptionExpiry": "2026-12-31"
}
```

### Initiate Payment
```http
POST /wallet/payment/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "subscription",
  "plan": "monthly",
  "amount": 4.99,
  "method": "stripe"
}

Response 200:
{
  "success": true,
  "transactionId": "txn_123",
  "paymentUrl": "https://stripe.com/..."
}
```

### Get Transactions
```http
GET /wallet/transactions
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "count": 5,
  "transactions": [ ... ]
}
```

---

## 👤 User Endpoints

### Get Profile
```http
GET /user/profile
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "user": { ... }
}
```

### Update Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "language": "en"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Change Password
```http
POST /user/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

Response 200:
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Get Statistics
```http
GET /user/statistics
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "statistics": {
    "totalToolUses": 42,
    "topTools": [ ... ],
    "recentActivity": [ ... ]
  }
}
```

---

## 🔧 Admin Endpoints

### Add Credits (Admin Only)
```http
POST /admin/manual-credit
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "amount": 50,
  "reason": "Manual credit for support"
}

Response 200:
{
  "success": true,
  "message": "Added 50 credits to user@example.com"
}
```

### Activate Subscription (Admin Only)
```http
POST /admin/activate-subscription
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "plan": "yearly"
}

Response 200:
{
  "success": true,
  "message": "Activated yearly subscription"
}
```

### Get Platform Statistics (Admin Only)
```http
GET /admin/statistics
Authorization: Bearer <admin_token>

Response 200:
{
  "success": true,
  "statistics": {
    "totalUsers": 1500,
    "premiumUsers": 250,
    "totalToolUses": 15000,
    "totalRevenue": 5000
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Premium tool - Upgrade to use this feature"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Tool not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

**Last Updated**: September 2026
