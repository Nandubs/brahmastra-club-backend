# API Testing Examples

Use these examples to test your API endpoints using curl, Postman, or Thunder Client.

## Base URL
Local: `http://localhost:5000/api`
Production: `https://your-app.railway.app/api`

---

## 1. Health Check

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Brahmastra Club Management API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 2. Initialize Database (One-time)

```bash
curl -X POST http://localhost:5000/api/init
```

**Response:**
```json
{
  "message": "Default admin created successfully"
}
```

---

## 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "brahmastra01",
    "password": "Accen@10090"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "memberId": "brahmastra01",
    "memberName": "Admin User",
    "role": "admin"
  }
}
```

**Save the token** - you'll need it for authenticated requests!

---

## 4. Get All Members (Admin)

```bash
curl http://localhost:5000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 5. Add New Member (Admin)

```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "memberId": "member001",
    "memberName": "Rajesh Kumar",
    "password": "rajesh123",
    "role": "member"
  }'
```

---

## 6. Get Current User Details

```bash
curl http://localhost:5000/api/members/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 7. Update Monthly Payments (Admin)

```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "month": 11,
    "year": 2024,
    "payments": [
      {
        "memberId": "member001",
        "status": "paid",
        "amount": 100
      },
      {
        "memberId": "member002",
        "status": "not_paid",
        "amount": 100
      }
    ]
  }'
```

---

## 8. Add New Expense (Admin)

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "month": 11,
    "year": 2024,
    "electricityBill": 1500,
    "internetBill": 800,
    "miscellaneous": 500
  }'
```

---

## 9. Get All Expenses

```bash
curl http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 10. Get Dashboard Statistics (Admin)

```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 11. Change Password

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "Accen@10090",
    "newPassword": "NewSecurePassword123"
  }'
```

---

## 12. Delete Member (Admin)

```bash
curl -X DELETE http://localhost:5000/api/members/member001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes:

1. Replace `YOUR_TOKEN_HERE` with the actual token from login response
2. Replace `http://localhost:5000` with your deployed URL
3. Tokens expire after 7 days - login again if expired
4. Admin routes require admin role
5. All requests must include proper headers

---

## Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "Brahmastra Club API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"brahmastra01\",\n  \"password\": \"Accen@10090\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/auth/login",
          "host": ["{{base_url}}"],
          "path": ["auth", "login"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

**Happy Testing! 🚀**
