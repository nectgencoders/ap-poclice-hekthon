# AP Police Backend — SMS & Email Gateway

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure API Keys
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env` with:
- **Twilio:** Account SID, Auth Token, Phone Number
- **SendGrid:** API Key

### 3. Run the Server
```bash
npm start
```

Server will start on `http://localhost:3001`

### 4. Test Endpoints

**Send SMS:**
```bash
curl -X POST http://localhost:3001/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","message":"Test SMS"}'
```

**Send Email:**
```bash
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"Test","htmlContent":"<p>Hello!</p>"}'
```

**Health Check:**
```bash
curl http://localhost:3001/health
```

---

## 📡 Deployment Options

### Heroku (Free tier ending, use alternative)
```bash
heroku login
heroku create ap-police-api
git push heroku main
```

### Railway.app (Free tier, recommended)
1. Sign up at https://railway.app
2. Connect GitHub repo
3. Add environment variables in dashboard
4. Deploy automatically

### Render (Free tier, recommended)
1. Sign up at https://render.com
2. Create New → Web Service
3. Connect GitHub
4. Add environment variables
5. Deploy

---

## 📝 Environment Variables for Production

Set these on your hosting platform's dashboard:

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=+1...
SENDGRID_API_KEY=SG...
NODE_ENV=production
PORT=3000
```

---

## 🔗 Connect Frontend to Backend

In `utils/authAndApis.js`, the frontend calls:
- `POST /api/send-sms` for SMS
- `POST /api/send-email` for emails

Change the base URL if needed:
```javascript
const API_BASE = 'http://localhost:3001'; // Or your production URL
```

---

## ✅ Checklist

- [ ] `.env.example` copied to `.env`
- [ ] Twilio credentials added
- [ ] SendGrid API key added
- [ ] `npm install` completed
- [ ] `npm start` runs without errors
- [ ] Health check returns `status: active`
- [ ] Frontend points to correct backend URL
- [ ] Deployed to production hosting

---

**Support:** Contact your hosting provider for API key issues.
