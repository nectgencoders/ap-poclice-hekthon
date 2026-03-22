// ═══════════════════════════════════════════════════
// AP POLICE PORTAL — UTILITY HELPERS
// ═══════════════════════════════════════════════════
// getSLAStatus     — calculates SLA breach/warn/ok
// sendSMSWA        — notification trigger (SMS + WhatsApp)
// seededRand       — deterministic random for analytics
// getDistrictData  — builds per-district analytics data
// ═══════════════════════════════════════════════════



// ─── AUTHENTICATION HELPER (OTP BASED) ────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
}

function storeOTP(email, otp) {
  const otps = JSON.parse(localStorage.getItem('otps') || '{}');
  otps[email] = {otp, timestamp: Date.now()};
  localStorage.setItem('otps', JSON.stringify(otps));
}

function verifyOTP(email, otp) {
  const otps = JSON.parse(localStorage.getItem('otps') || '{}');
  if (!otps[email]) return false;
  const {otp: storedOtp, timestamp} = otps[email];
  const isExpired = Date.now() - timestamp > 300000; // 5 minute expiry
  return !isExpired && storedOtp === otp;
}

function saveUserAuth(user) {
  const auth = {user, loginTime: Date.now()};
  localStorage.setItem('auth', JSON.stringify(auth));
}

function getUserAuth() {
  const auth = JSON.parse(localStorage.getItem('auth') || 'null');
  if (!auth) return null;
  const isExpired = Date.now() - auth.loginTime > 86400000; // 24 hour expiry
  return isExpired ? null : auth.user;
}

function clearAuth() {
  localStorage.removeItem('auth');
}

// ─── SMS/WA NOTIFICATION HELPER ──────────────────────────────────────────────
function sendSMSWA(complaint, message, type="update"){
  // Simulated — in production this calls Twilio/MSG91 API
  const phone = complaint.anon ? null : complaint.phone;
  const log = `[${type.toUpperCase()}] To: ${phone||"Anonymous"} | Msg: ${message}`;
  console.log(log);
  return {sms: !!phone, whatsapp: !!phone, message};
}


// ─── ADMIN LOGIN MODAL ───────────────────────────────────────────────────────
function AdminLoginModal({onClose,onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const login=()=>{
    if(email==="admin@appolice.gov.in"&&pass==="admin123"){onLogin({role:"admin",name:"SP Admin",email});onClose();}
    else{setErr("Invalid credentials.");}
  };
  return(
    <div className="login-overlay" onClick={onClose}>
      <div className="login-box" onClick={e=>e.stopPropagation()}>
        <div style={{background:"linear-gradient(135deg,#1a1f2e,#2d3347)",padding:"20px 24px",textAlign:"center",borderBottom:"2px solid var(--orange)"}}>
          <div style={{fontSize:32,marginBottom:6}}>🔐</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:800,fontSize:16,color:"var(--orange)"}}>Admin Login</div>
          <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>Restricted — Authorized Personnel Only</div>
        </div>
        <div style={{padding:"24px"}}>
          {err&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"9px 12px",fontSize:12,color:"var(--danger)",marginBottom:14}}>{err}</div>}
          <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:"var(--muted)"}}>
            🔒 This portal is monitored. Unauthorized access is a criminal offence under IT Act 2000.
          </div>
          <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@appolice.gov.in"/></div>
          <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter password"/></div>
          <button className="btn btn-primary w-full" style={{background:"linear-gradient(135deg,#dc2626,#b91c1c)"}} onClick={login}>🔐 Admin Login</button>
          <div style={{marginTop:12,padding:"10px",background:"rgba(247,127,0,0.08)",border:"1px solid rgba(247,127,0,0.2)",borderRadius:8,fontSize:11,color:"var(--orange)",textAlign:"center"}}>
            Demo: admin@appolice.gov.in / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

// SLA hours by priority
const SLA_HOURS = {critical:2, high:6, medium:24, low:72};

function getSLAStatus(complaint) {
  const hrs = SLA_HOURS[complaint.priority] || 24;
  // parse rough time
  let elapsedHrs = 1;
  const t = complaint.time || "";
  if(t.includes("Just now")) elapsedHrs = 0.1;
  else if(t.includes("hr")) elapsedHrs = parseInt(t) || 1;
  else if(t.includes("day")) elapsedHrs = (parseInt(t)||1) * 24;
  else if(t.includes("month")) elapsedHrs = (parseInt(t)||1) * 720;
  const pct = Math.min(100, (elapsedHrs / hrs) * 100);
  if(pct >= 100) return {status:"breach", pct:100, label:"SLA Breached", remaining:"Overdue"};
  if(pct >= 75) return {status:"warn", pct, label:"SLA Warning", remaining:Math.round((hrs-elapsedHrs))+"h left"};
  return {status:"ok", pct, label:"Within SLA", remaining:Math.round((hrs-elapsedHrs))+"h left"};
}

function seededRand(seed,min,max){let x=Math.sin(seed+1)*10000;x=x-Math.floor(x);return Math.floor(x*(max-min+1))+min;}
function getDistrictData(state,district){
  const seed=(state+district).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const total=seededRand(seed,18,140);
  const resolved=seededRand(seed+1,Math.floor(total*0.55),Math.floor(total*0.92));
  const active=total-resolved;
  const critical=seededRand(seed+2,0,Math.min(active,6));
  const slaNum=seededRand(seed+3,72,97);
  const avgTime=(seededRand(seed+4,10,58)/10).toFixed(1);
  const rating=(seededRand(seed+5,38,50)/10).toFixed(1);
  const stations=[
    {name:"Central PS",total:seededRand(seed+10,8,38),resolved:seededRand(seed+11,5,30),active:seededRand(seed+12,1,10),sla:seededRand(seed+13,74,97)+"%",rating:(seededRand(seed+14,38,50)/10).toFixed(1),officer:"SI Kumar"},
    {name:"East PS",total:seededRand(seed+20,6,30),resolved:seededRand(seed+21,4,25),active:seededRand(seed+22,1,8),sla:seededRand(seed+23,76,96)+"%",rating:(seededRand(seed+24,37,49)/10).toFixed(1),officer:"SI Sharma"},
    {name:"West PS",total:seededRand(seed+30,5,28),resolved:seededRand(seed+31,3,22),active:seededRand(seed+32,1,9),sla:seededRand(seed+33,75,95)+"%",rating:(seededRand(seed+34,36,50)/10).toFixed(1),officer:"SI Rao"},
    {name:"Women PS",total:seededRand(seed+40,4,22),resolved:seededRand(seed+41,3,18),active:seededRand(seed+42,1,6),sla:seededRand(seed+43,80,98)+"%",rating:(seededRand(seed+44,40,50)/10).toFixed(1),officer:"SI Anitha"},
    {name:"Cyber Cell",total:seededRand(seed+50,6,35),resolved:seededRand(seed+51,3,24),active:seededRand(seed+52,2,12),sla:seededRand(seed+53,68,90)+"%",rating:(seededRand(seed+54,35,48)/10).toFixed(1),officer:"SI Priya"},
  ];
  const crimeBreakdown={Theft:seededRand(seed+60,4,32),Harassment:seededRand(seed+61,2,22),Cybercrime:seededRand(seed+62,3,28),DomesticV:seededRand(seed+63,1,15),Missing:seededRand(seed+64,0,10),Property:seededRand(seed+65,1,14),Traffic:seededRand(seed+66,2,20)};
  const advice=slaNum>=90?"All units operating within SLA. No immediate action required.":slaNum>=80?"SLA compliance needs monitoring — 2 stations below target.":"⚠ SLA compliance critical — "+state+" SP office review recommended.";
  return {total,resolved,active,critical,slaNum,avgTime,rating,stations,crimeBreakdown,advice};
}
