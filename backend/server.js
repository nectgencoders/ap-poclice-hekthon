// ═══════════════════════════════════════════════════
// BACKEND SERVER — SMS & EMAIL GATEWAY
// ═══════════════════════════════════════════════════
// Required: Node.js installed
// Usage: node backend/server.js
// Then load http://localhost:3001 (or deploy to Heroku/Railway)
// ═══════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

const app = express();

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── ENVIRONMENT VARIABLES ──────────────────────────────────────────────────
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';
const TWILIO_PHONE = process.env.TWILIO_PHONE || '+1234567890';
const SENDGRID_KEY = process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_KEY';

// ─── TWILIO SMS API ──────────────────────────────────────────────────────────
app.post('/api/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message required' });
    }
    
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const msg = await client.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: '+91' + phone.replace(/\D/g, '').slice(-10)
    });
    
    console.log(`[SMS] Sent to ${phone}: ${msg.sid}`);
    res.json({ success: true, sid: msg.sid });
  } catch (err) {
    console.error('[SMS Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── SENDGRID EMAIL API ──────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;
    
    if (!to || !subject || !htmlContent) {
      return res.status(400).json({ error: 'Email, subject, and content required' });
    }
    
    sgMail.setApiKey(SENDGRID_KEY);
    const msg = {
      to,
      from: 'complaints@appolice.gov.in',
      replyTo: 'support@appolice.gov.in',
      subject,
      html: htmlContent,
    };
    
    const result = await sgMail.send(msg);
    console.log(`[EMAIL] Sent to ${to}: ${result[0].statusCode}`);
    
    res.json({ success: true, messageId: result[0].headers['x-message-id'] });
  } catch (err) {
    console.error('[EMAIL Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── OTP VERIFICATION (Optional backend validation) ──────────────────────────
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  
  // In production, validate OTP against Firebase or your OTP service
  console.log(`[OTP] Verifying ${otp} for ${phone}`);
  
  // Mock validation (replace with real logic)
  if (otp.length === 6 && /^\d+$/.test(otp)) {
    res.json({ success: true, message: 'OTP verified' });
  } else {
    res.status(400).json({ error: 'Invalid OTP format' });
  }
});

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'active',
    sms: !!TWILIO_ACCOUNT_SID,
    email: !!SENDGRID_KEY,
    timestamp: new Date().toISOString()
  });
});

// ─── SERVER ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n📡 AP Police Backend Server running on http://localhost:${PORT}`);
  console.log(`✅ SMS API: ${TWILIO_ACCOUNT_SID ? '✓' : '✗'} (POST /api/send-sms)`);
  console.log(`✅ Email API: ${SENDGRID_KEY ? '✓' : '✗'} (POST /api/send-email)`);
  console.log(`🔐 Health: http://localhost:${PORT}/health\n`);
  
  if (!TWILIO_ACCOUNT_SID || !SENDGRID_KEY) {
    console.warn('⚠️  Missing API keys. Set environment variables:');
    console.warn('   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE');
    console.warn('   SENDGRID_API_KEY');
  }
});
