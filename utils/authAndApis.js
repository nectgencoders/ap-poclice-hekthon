// ═══════════════════════════════════════════════════
// FIREBASE AUTH SETUP + FREE APIs INTEGRATION
// ═══════════════════════════════════════════════════
// Setup Guide: https://console.firebase.google.com
// ═══════════════════════════════════════════════════

// ─── STEP 1: FIREBASE CONFIG ──────────────────────────────────────────────────
// Replace with your Firebase project credentials from console.firebase.google.com
const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ─── API KEYS (Get free tier) ──────────────────────────────────────────────────
const API_KEYS = {
  // Twilio SMS: https://www.twilio.com/try-twilio (free $15/month)
  twilioAccountSid: "YOUR_TWILIO_ACCOUNT_SID",
  twilioAuthToken: "YOUR_TWILIO_AUTH_TOKEN",
  twilioPhoneNumber: "+1234567890", // Your Twilio number
  
  // Google Maps: https://console.cloud.google.com (free $200/month)
  googleMapsKey: "YOUR_GOOGLE_MAPS_API_KEY",
  
  // OpenWeather: https://openweathermap.org/api (free tier: 5 calls/min, 60/hour)
  openWeatherKey: "YOUR_OPENWEATHER_API_KEY",
  
  // SendGrid Email: https://sendgrid.com (free: 100 emails/day)
  sendGridKey: "YOUR_SENDGRID_API_KEY",
  sendGridEmail: "noreply@appolice.gov.in",
  
  // Google Cloud Speech-to-Text: https://cloud.google.com/speech-to-text (free: 60 minutes/month)
  googleCloudKey: "YOUR_GOOGLE_CLOUD_API_KEY",
};

// ─── FIREBASE AUTH HELPER ──────────────────────────────────────────────────────
async function initFirebase() {
  // Firebase SDK should be loaded via index.html (compat layer)
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK not loaded. Check index.html includes firebase-app-compat.js and firebase-auth-compat.js');
  }

  // Initialize Firebase app (once)
  if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  // Ensure auth module is present with compat API
  if (!firebase.auth) {
    throw new Error('Firebase Auth not available. Check firebase-auth-compat.js is loaded.');
  }

  return firebase;
}

async function loginWithPhone(phone) {
  const fb = await initFirebase();
  const auth = fb.auth();
  
  // Send OTP via SMS (Firebase Phone Auth)
  const appVerifier = window.recaptchaVerifier;
  try {
    const confirmationResult = await auth.signInWithPhoneNumber('+91' + phone, appVerifier);
    window.confirmationResult = confirmationResult;
    return {success: true, message: `OTP sent to +91${phone}`};
  } catch (err) {
    return {success: false, error: err.message};
  }
}

async function verifyOTP(otp) {
  try {
    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;
    return {
      success: true,
      user: {
        role: 'citizen',
        uid: user.uid,
        phone: user.phoneNumber,
        name: 'Citizen User'
      }
    };
  } catch (err) {
    return {success: false, error: 'Invalid OTP'};
  }
}

async function loginWithEmail(email, password) {
  const fb = await initFirebase();
  const auth = fb.auth();
  
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    const user = result.user;
    return {
      success: true,
      user: {
        role: email.includes('admin') ? 'admin' : email.includes('officer') ? 'officer' : 'citizen',
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'User'
      }
    };
  } catch (err) {
    return {success: false, error: err.message};
  }
}

async function logout() {
  const fb = await initFirebase();
  await fb.auth().signOut();
  localStorage.removeItem('userAuth');
}

// ─── TWILIO SMS API ──────────────────────────────────────────────────────────
async function sendSMS(phone, message) {
  // Note: Call from backend (Node.js) for security
  // Frontend cannot call Twilio directly (exposes API key)
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({phone, message})
    });
    const data = await response.json();
    return {success: true, sid: data.sid};
  } catch (err) {
    console.log('[SMS]', err.message);
    return {success: false, error: err.message};
  }
}

// ─── GOOGLE MAPS GEOLOCATION + LOCATION SEARCH ──────────────────────────────────
async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      err => reject(err)
    );
  });
}

async function getAddressFromCoords(lat, lng) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEYS.googleMapsKey}`
    );
    const data = await res.json();
    if (data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (err) {
    console.log('[Geocode]', err.message);
    return null;
  }
}

async function searchLocation(query) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${API_KEYS.googleMapsKey}`
    );
    const data = await res.json();
    return data.predictions || [];
  } catch (err) {
    console.log('[Search Location]', err.message);
    return [];
  }
}

// ─── OPENWEATHER API ──────────────────────────────────────────────────────────
async function getWeather(lat, lng) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEYS.openWeatherKey}`
    );
    const data = await res.json();
    if (data.main) {
      return {
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        visibility: (data.visibility / 1000).toFixed(1) + ' km'
      };
    }
    return null;
  } catch (err) {
    console.log('[Weather]', err.message);
    return null;
  }
}

// ─── SENDGRID EMAIL API ──────────────────────────────────────────────────────
async function sendEmail(to, subject, htmlContent) {
  // Note: Call from backend (Node.js) for security
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({to, subject, htmlContent})
    });
    const data = await response.json();
    return {success: true, messageId: data.messageId};
  } catch (err) {
    console.log('[Email]', err.message);
    return {success: false, error: err.message};
  }
}

// ─── GOOGLE SPEECH-TO-TEXT ──────────────────────────────────────────────────────
async function startVoiceRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return {success: false, error: 'Speech Recognition not supported in your browser'};
  }
  
  const recognition = new SpeechRecognition();
  recognition.language = 'en-IN';
  recognition.continuous = true;
  recognition.interimResults = true;
  
  return new Promise((resolve, reject) => {
    let transcript = '';
    
    recognition.onstart = () => {
      transcript = '';
    };
    
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
    };
    
    recognition.onerror = (err) => {
      reject(err);
    };
    
    recognition.onend = () => {
      resolve({success: true, text: transcript.trim()});
    };
    
    recognition.start();
    
    // Auto-stop after 30 seconds
    setTimeout(() => recognition.stop(), 30000);
  });
}

// ─── GEOLOCATION (IP-based fallback) ──────────────────────────────────────────
async function getLocationFromIP() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (err) {
    console.log('[IP Geolocation]', err.message);
    return null;
  }
}

// ─── EXPORT FOR USE IN OTHER MODULES ──────────────────────────────────────────
console.log('📡 API Helpers loaded. Configure API keys in this file before use.');
