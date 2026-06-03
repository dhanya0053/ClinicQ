import axios from 'axios';

import Swal from 'sweetalert2';

import React, { useState } from 'react';

import { FaArrowLeft, FaShieldAlt, FaChartBar, FaUsers } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';


 

interface LoginProps { onLogin?: () => void; }

const Login: React.FC<LoginProps> = () => {

 const navigate = useNavigate();

 const [email, setEmail] = useState('');

 const [password, setPassword] = useState('');

 const [message, setMessage] = useState('');

 const [showResetPassword, setShowResetPassword] = useState(false);

 const [newPassword, setNewPassword] = useState('');

 const [confirmPassword, setConfirmPassword] = useState('');

 const [token, setToken] = useState('');

 const [attempts, setAttempts] = useState(0);

 const [isLocked, setIsLocked] = useState(false);

 const [timeLeft, setTimeLeft] = useState(0);

 const [emailValid, setEmailValid] = useState(true);

 const [passwordValid, setPasswordValid] = useState(true);

 const [otp, setOtp] = useState(['', '', '', '', '', '']);

 const [isOtpVerified, setIsOtpVerified] = useState(false);

 const [isSendingEmail, setIsSendingEmail] = useState(false);

 const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

 const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;



 const handleOtpChange = (element: HTMLInputElement, index: number) => {

   if (isNaN(Number(element.value))) return false;

   const n = [...otp]; n[index] = element.value; setOtp(n);

   if (element.value && element.nextSibling) (element.nextSibling as HTMLInputElement).focus();

 };


 

 const handleForgotPassword = async (e: React.FormEvent) => {

   e.preventDefault();

   if (!emailRegex.test(email)) return setMessage('Please enter a valid email first.');

   setIsSendingEmail(true); setMessage('Sending verification code...'); setShowResetPassword(true);

   const fd = new URLSearchParams(); fd.append('email', email);

   try {

     const r = await axios.post('http://localhost:8080/clinicq/auth/forgot-password', fd.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

     setToken(r.data); setIsSendingEmail(false); setMessage('Code sent to your email!');

   } catch { setShowResetPassword(false); setIsSendingEmail(false); setMessage('Failed to send email. Please check your address.'); }

 };


 

 const handleResetSubmit = async (e: React.FormEvent) => {

   e.preventDefault();

   if (newPassword !== confirmPassword) return Swal.fire('Error', 'Passwords do not match!', 'error');

   const finalOtp = otp.join('');

   try {

     await axios.post(`http://localhost:8080/clinicq/auth/reset-password?token=${finalOtp}&newPassword=${newPassword}`);

     Swal.fire({ icon: 'success', title: 'Success', text: 'Password updated!', showConfirmButton: false, timer: 2000 });

     setShowResetPassword(false); setIsOtpVerified(false); setOtp(['','','','','','']);

     setNewPassword(''); setConfirmPassword(''); setMessage('');

   } catch (err: any) { Swal.fire('Error', err.response?.data?.errorMessage || 'Failed to update password.', 'error'); }

 };


 

 const handleLogin = async (e: React.FormEvent) => {

   e.preventDefault(); if (isLocked) return;

   try {

     const r = await axios.post('http://localhost:8080/clinicq/auth/login', null, { params: { email, password, role: 'ADMIN' } });

     localStorage.setItem('token', r.data); setAttempts(0); setMessage('Login successful'); navigate('/admin');

   } catch {

     const na = attempts + 1; setAttempts(na);

     if (na >= 3) {

       setIsLocked(true); setTimeLeft(60); setMessage('Account Locked. Try after a minute.');

       const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); setIsLocked(false); setAttempts(0); setMessage(''); return 0; } return p - 1; }), 1000);

     } else { setMessage(`Invalid credentials. ${3 - na} attempts remaining.`); }

   }

 };


 

 const onEmailChange = (v: string) => { setEmail(v); setEmailValid(v === '' || emailRegex.test(v)); };

 const onPasswordChange = (v: string) => { setPassword(v); setPasswordValid(v === '' || passwordRegex.test(v)); };


 

 return (

   <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#f8fafc' }}>

     <style>{`

       @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');

       .al-panel { width:420px;min-width:420px;background:linear-gradient(155deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);padding:56px 48px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden; }

       @media(max-width:900px){.al-panel{display:none}}

       .al-panel::before{content:'';position:absolute;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,.2) 0%,transparent 70%);top:-100px;right:-80px;}

       .al-panel::after{content:'';position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%);bottom:80px;left:-50px;}

       .al-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:44px 44px;}

       .al-feature{display:flex;align-items:center;gap:14px;padding:14px 18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:14px;backdrop-filter:blur(8px);}

       .al-ficon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:.95rem;}

       .al-inp{width:100%;padding:13px 16px;font-size:.92rem;font-weight:500;background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;outline:none;transition:all .25s;color:#1e293b;font-family:inherit;box-sizing:border-box;}

       .al-inp:focus{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.1);}

       .al-inp.err{border-color:#ef4444;}

       .al-btn{width:100%;padding:14px;font-size:.95rem;font-weight:700;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;cursor:pointer;letter-spacing:.3px;transition:all .3s;font-family:inherit;}

       .al-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.35);}

       .al-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;background:#94a3b8;}

       .al-lbl{font-size:.73rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#6366f1;margin-bottom:7px;display:block;}

       .al-otp{width:46px;height:52px;border:1.5px solid #e2e8f0;border-radius:10px;text-align:center;font-size:1.3rem;font-weight:700;outline:none;transition:all .25s;background:#fff;color:#1e293b;font-family:inherit;}

       .al-otp:focus{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.1);transform:translateY(-2px);}

       .al-otp.filled{border-color:#6366f1;background:#f5f3ff;}

       .al-msg-err{background:#fef2f2;border:1px solid #fecaca;color:#991b1b;}

       .al-msg-ok{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;}

       @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

       .al-fadein{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both;}

       .back-home-btn{

        background:none;

        border:none;

        color:rgba(255,255,255,0.35);

        cursor:pointer;

        font-size:0.78rem;

        display:flex;

        align-items:center;

        gap:7px;

        padding:0;

        font-family:inherit;

        transition: color 0.2s ease-in-out;

       

       }

      .back-home-btn:hover{

        color:rgba(255,255,255,0.9);

      }

       

      .admin-return-box {

        display: inline-flex;

        align-items: center;

        gap: 8px;

        background: #312b2b;

        border: 1.5px solid #e2e8f0;

        padding: 12px 24px;

        border-radius: 12px;

        color: #c9d1dd;

        font-size: 0.85rem;

        font-weight: 600;

        cursor: pointer;

        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        font-family: inherit;

      }

      .admin-return-box:hover {

        background: #6366f1 !important; /* Transitions to matching admin Indigo */

        border-color: #6366f1 !important;

        color: #ffffff !important; /* Turns text clean white */

        transform: translateY(-2px);

        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);

      }

     `}</style>


 

     {/* left panel */}

     <div className="al-panel">

       <div className="al-grid" />

       <div style={{ position: 'relative', zIndex: 2 }}>

         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 42 }}>

           <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#ff7e5f,#ff6b6b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

             <FaShieldAlt style={{ color: '#fff', fontSize: '1rem' }} />

           </div>

           <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>ClinicQ</span>

         </div>

         <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>

           Admin<span style={{ color: '#a5b4fc' }}> Control</span><br />Center

         </h1>

         <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem', lineHeight: 1.75, marginBottom: 40 }}>

           Manage schedules, clinic rules, analytics and system access from one secure hub.

         </p>

         <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>

           {[

             { icon: <FaUsers />, bg: 'rgba(139,92,246,.2)', col: '#c4b5fd', label: 'Doctor Management', sub: 'Schedules & specializations' },

             { icon: <FaChartBar />, bg: 'rgba(245,158,11,.15)', col: '#fcd34d', label: 'Live Analytics', sub: 'Real-time clinic insights' },

             { icon: <FaShieldAlt />, bg: 'rgba(16,185,129,.15)', col: '#6ee7b7', label: 'Scheduling Constraints', sub: 'Set booking and cancellation deadlines' },

           ].map((f, i) => (

             <div key={i} className="al-feature">

               <div className="al-ficon" style={{ background: f.bg, color: f.col }}>{f.icon}</div>

               <div>

                 <div style={{ color: '#fff', fontSize: '.85rem', fontWeight: 600 }}>{f.label}</div>

                 <div style={{ color: 'rgba(255,255,255,.38)', fontSize: '.73rem' }}>{f.sub}</div>

               </div>

             </div>

           ))}

         </div>

       </div>


 

       <div style={{ position: 'relative', zIndex: 2 }}>

         <button onClick={() => navigate('/')} className='back-home-btn'>

           <FaArrowLeft /> Back to home

         </button>

       </div>

     </div>


 

     {/* right panel */}

     <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

       <div className="al-fadein" style={{ width: '100%', maxWidth: '420px' }}>

         <div style={{ marginBottom: 32 }}>

           <p style={{ fontSize: '.73rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Admin Portal</p>

           <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>

             {showResetPassword ? 'Reset Password' : 'Welcome back'}

           </h2>

           <p style={{ color: '#94a3b8', fontSize: '.86rem', marginTop: 6, marginBottom: 0 }}>

             {showResetPassword ? 'Verify your identity to continue' : 'Sign in to your administrator account'}

           </p>

         </div>


 

         {message && (

           <div className={`al-msg-${message.includes('successful') ? 'ok' : 'err'}`}

             style={{ padding: '11px 15px', borderRadius: 10, marginBottom: 20, fontSize: '.83rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>

             {isLocked && <span className="spinner-border spinner-border-sm" />}

             {message}{isLocked && timeLeft > 0 && ` (${timeLeft}s)`}

           </div>

         )}


 

         {!showResetPassword ? (

           <form onSubmit={handleLogin}>

             <div style={{ marginBottom: 16 }}>

               <label className="al-lbl">Email Address</label>

               <input className={`al-inp ${!emailValid ? 'err' : ''}`} type="email"

                 placeholder="admin@clinicq.com" value={email} onChange={e => onEmailChange(e.target.value)} required />

               {!emailValid && email && <p style={{ color: '#ef4444', fontSize: '.73rem', marginTop: 4 }}>Please enter a valid email address.</p>}

             </div>

             <div style={{ marginBottom: 10 }}>

               <label className="al-lbl">Password</label>

               <input className={`al-inp ${!passwordValid ? 'err' : ''}`} type="password"

                 placeholder="••••••••" value={password} onChange={e => onPasswordChange(e.target.value)} required />

               {!passwordValid && password && <p style={{ color: '#ef4444', fontSize: '.73rem', marginTop: 4 }}>8+ characters with letters, numbers & special chars.</p>}

             </div>

             <div style={{ textAlign: 'right', marginBottom: 24 }}>

               <button type="button" onClick={handleForgotPassword}

                 style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>

                 Forgot Password?

               </button>

             </div>

             <button type="submit" className="al-btn" disabled={!emailRegex.test(email) || !passwordRegex.test(password)}>

               Sign In to Dashboard →

             </button>

           </form>


 

         ) : !isOtpVerified ? (

           <div>

             {isSendingEmail ? (

               <div style={{ textAlign: 'center', padding: '32px 0' }}>

                 <div className="spinner-border" style={{ color: '#6366f1' }} />

                 <p style={{ marginTop: 16, color: '#64748b', fontWeight: 600, fontSize: '.88rem' }}>Sending verification code...</p>

               </div>

             ) : (

               <>

                 <p style={{ color: '#64748b', fontSize: '.86rem', marginBottom: 24 }}>Enter the 6-digit code sent to <strong style={{ color: '#1e293b' }}>{email}</strong></p>

                 <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>

                   {otp.map((d, i) => (

                     <input key={i} type="text" maxLength={1} className={`al-otp ${d ? 'filled' : ''}`}

                       value={d} onChange={e => handleOtpChange(e.target, i)} onFocus={e => e.target.select()} inputMode="numeric" />

                   ))}

                 </div>

                 <button className="al-btn" disabled={otp.some(d => d === '') || isSendingEmail}

                   onClick={async () => {

                     const finalOtp = otp.join('');

                     try {

                       await axios.get(`http://localhost:8080/clinicq/auth/verify-token?token=${finalOtp}`);

                       setIsOtpVerified(true); setMessage('');

                     } catch (err: any) {

                       const msg = err.response?.data?.errorMessage || 'Incorrect OTP.';

                       Swal.fire({ icon: 'error', title: 'Incorrect OTP', text: msg.includes('INVALID_USER') ? 'Incorrect OTP. Please try again.' : msg, confirmButtonColor: '#6366f1' });

                     }

                   }}>

                   Verify Code →

                 </button>

               </>

             )}

             <button onClick={() => { setShowResetPassword(false); setMessage(''); }}

               style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '.8rem', cursor: 'pointer', marginTop: 14, display: 'block', width: '100%', textAlign: 'center', fontFamily: 'inherit' }}>

               Cancel

             </button>

           </div>


 

         ) : (

           <form onSubmit={handleResetSubmit}>

             <div style={{ marginBottom: 16 }}>

               <label className="al-lbl">New Password</label>

               <input className="al-inp" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required />

             </div>

             <div style={{ marginBottom: 28 }}>

               <label className="al-lbl">Confirm Password</label>

               <input className="al-inp" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />

             </div>

             <div style={{ display: 'flex', gap: 12 }}>

               <button type="button" onClick={() => { setShowResetPassword(false); setAttempts(0); setMessage(''); }}

                 style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>

                 Cancel

               </button>

               <button type="submit" className="al-btn" style={{ flex: 1 }}>Update Password</button>

             </div>

           </form>

         )}


 

         <p style={{ textAlign: 'center', marginTop:36}}>

           <button onClick={() => navigate('/')} className='admin-return-box'>

             <FaArrowLeft style={{ fontSize: '.75rem' }} /> Return to Main Entry

           </button>

         </p>

       </div>

     </div>

   </div>

 );

};


 

export default Login;