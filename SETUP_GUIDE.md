# 🔐 AP POLICE PORTAL - REAL AUTHENTICATION & FREE APIs SETUP GUIDE

## ✅ What's Done

- ✔️ Removed all demo credentials (no more `admin123` or hardcoded passwords)
- ✔️ Integrated Firebase Authentication (real OTP + Email login)
- ✔️ Added 6 free APIs for SMS, Maps, Weather, Email, Voice, Geolocation
- ✔️ Login modal updated to use real authentication

---

## 📋 Setup Instructions

### 1️⃣ FIREBASE AUTHENTICATION (Free)
**Free Tier:** 50,000 authentications/month

#### Setup Steps:
1. **Go to** https://console.firebase.google.com
2. **Click** "Add Project" → name it "AP Police Portal"
3. **Select** "Google Cloud" location (India region: `asia-south1`)
4. **Wait** for creation (2-3 minutes)
5. **Go to** Authentication → **Enable Phone Number sign-in**
   - Products & Solution → Authentication → Sign-in method → Phone
   - Turn ON "Phone"
   - Add test numbers (for testing without real SMS):
     - Phone: `+91-9876543210`
     - Code: `123456`

6. **Get your Firebase Config:**
   - Go to **Project Settings** (⚙️ icon, top-left)
   - Copy `config` object
   - Paste into `utils/authAndApis.js` line ~9:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",           // Copy from Firebase
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

### 2️⃣ TWILIO SMS API (Free $15/month)
**For sending real SMS OTP to citizens**

#### Setup:
1. **Go to** https://www.twilio.com/try-twilio
2. **Sign up** → Verify phone → Get free $15 credit
3. **Go to** Console → Account → Get:
   - `Account SID`
   - `Auth Token`
   - `Twilio Phone Number` (e.g., `+1234567890`)

4. **Paste into** `utils/authAndApis.js`:

```javascript
const API_KEYS = {
  twilioAccountSid: "ACxxxxxxxxxxxxxxxx",
  twilioAuthToken: "your_auth_token_here",
  twilioPhoneNumber: "+1234567890",
  // ... rest of keys
};
```

5. **Backend Setup** (Node.js required):
   - Create `backend/send-sms.js`:
   ```javascript
   const twilio = require('twilio');
   const client = twilio(accountSid, authToken);
   
   app.post('/api/send-sms', (req, res) => {
     const { phone, message } = req.body;
     client.messages.create({
       body: message,
       from: '+1234567890',
       to: '+91' + phone
     }).then(msg => res.json({sid: msg.sid}));
   });
   ```

---

### 3️⃣ GOOGLE MAPS API (Free $200/month)
**For location search & display**

#### Setup:
1. **Go to** https://console.cloud.google.com
2. **Create Project** → "AP Police Portal"
3. **Enable APIs:**
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. **Create API Key:**
   - APIs & Services → Credentials → Create → API Key
   - Copy key

5. **Paste into** `utils/authAndApis.js`:

```javascript
const API_KEYS = {
  googleMapsKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxx",
  // ...
};
```

6. **Usage in components:**
```javascript
const address = await getAddressFromCoords(lat, lng); // Get address from GPS
const results = await searchLocation("Guntur"); // Search locations
```

---

### 4️⃣ OPENWEATHER API (Free)
**For weather display in complaint context**

#### Setup:
1. **Register** https://openweathermap.org/api
2. **API Key** → Free "Current Weather Data"
3. **Copy** API Key (visible in account)

4. **Paste into** `utils/authAndApis.js`:

```javascript
const API_KEYS = {
  openWeatherKey: "abc123def456ghi789",
  // ...
};
```

5. **Usage:**
```javascript
const weather = await getWeather(lat, lng);
// Returns: {temp: 32, humidity: 65, condition: "Clear", icon: "01d"}
```

---

### 5️⃣ SENDGRID EMAIL API (Free 100/day)
**For sending complaint receipts & notifications**

#### Setup:
1. **Go to** https://sendgrid.com/free
2. **Sign up** → Verify → Free 100 emails/day
3. **Go to** Settings → API Keys → Create
4. **Copy** API Key

5. **Paste into** `utils/authAndApis.js`:

```javascript
const API_KEYS = {
  sendGridKey: "SG.xxxxxxxxxxxxxxxx",
  sendGridEmail: "noreply@appolice.gov.in",
  // ...
};
```

6. **Backend** (`backend/send-email.js`):
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-email', async (req, res) => {
  const msg = {
    to: req.body.to,
    from: 'noreply@appolice.gov.in',
    subject: req.body.subject,
    html: req.body.htmlContent,
  };
  await sgMail.send(msg);
  res.json({messageId: msg.id});
});
```

---

### 6️⃣ GOOGLE SPEECH-TO-TEXT (Free 60 min/month)
**For voice complaint filing**

#### Setup:
1. **Uses** Web Speech API (built-in browser, NO SETUP NEEDED)
2. **Works on** Chrome, Edge, Safari
3. **Usage:**
```javascript
const {text} = await startVoiceRecording();
// Returns transcribed text from user's voice
```

---

### 7️⃣ GEOLOCATION API (Free, Built-in)
**For auto-detecting user location or fallback IP location**

#### Usage:
```javascript
// Method 1: GPS (requires permission)
const loc = await getUserLocation();
// {latitude, longitude, accuracy}

// Method 2: IP-based fallback (no permission needed)
const loc = await getLocationFromIP();
// {city, region, country, latitude, longitude}
```

---

## 🚀 Deploying This Setup

### Option 1: Free Hosting (Vercel/Netlify)
- Upload this folder to GitHub
- Connect to Vercel → Auto-deploys on push
- Firebase auth works on live domain

### Option 2: Node.js Backend (Required for SMS/Email)
- CreateBackend server (`backend/server.js`):

```javascript
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

const app = express();
app.use(cors());
app.use(express.json());

// SMS endpoint
app.post('/api/send-sms', (req, res) => {
  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  client.messages.create({
    body: req.body.message,
    from: TWILIO_NUMBER,
    to: '+91' + req.body.phone
  }).then(msg => res.json({sid: msg.sid}));
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  sgMail.setApiKey(SENDGRID_KEY);
  await sgMail.send(req.body);
  res.json({success: true});
});

app.listen(3001);
```

- Deploy to Heroku/Railway (free tier available)

---

## 🔑 Complete API Keys Configuration

**File:** `utils/authAndApis.js` (Lines 9-25)

```javascript
const FIREBASE_CONFIG = {
  apiKey: "From Firebase Console",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... 5 more fields
};

const API_KEYS = {
  twilioAccountSid: "ACxxxxxxxx",           // Twilio Console
  twilioAuthToken: "your_token",            // Twilio Console
  twilioPhoneNumber: "+1234567890",         // Twilio Console
  googleMapsKey: "AIzaSy...",               // Google Cloud Console
  openWeatherKey: "abc123...",              // OpenWeather Account
  sendGridKey: "SG.xxx...",                 // SendGrid API Keys
  sendGridEmail: "noreply@appolice.gov.in", // Your email
  googleCloudKey: "AIzaSy...",              // Google Cloud (speech)
};
```

---

## ✅ Testing

1. **Citizen Login (OTP):**
   - Mobile: `+91-9876543210`
   - Code: `123456` (test number)
   - OR Real SMS via Twilio

2. **Officer/Admin Login:**
   - Use your Firebase email accounts
   - Create accounts in Firebase Console → Users

3. **Location Services:**
   - Allow browser permission for GPS
   - Falls back to IP-based geolocation

4. **Voice Filing:**
   - Click mic in complaint form
   - Speak → Auto-transcribed to text

---

## 🎯 Next Steps

- [ ] Set up Firebase project
- [ ] Add Twilio credentials
- [ ] Add Google Maps API key
- [ ] Set up SendGrid for emails
- [ ] Test OTP login
- [ ] Deploy backend (Node.js)
- [ ] Go live! 🚀

---

**Need Help?**
- Firebase Docs: https://firebase.google.com/docs
- Twilio Docs: https://www.twilio.com/docs
- Google Maps: https://developers.google.com/maps
