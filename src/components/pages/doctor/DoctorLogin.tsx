import React, { useState } from 'react';

import Swal from 'sweetalert2';

import axios from "axios";

import {

  FaArrowLeft,

  FaUserMd,

  FaNotesMedical,

  FaHeartbeat,

  FaClipboardList

} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';


 

const DoctorLogin: React.FC<{ onLogin: () => void }> = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [showResetPassword, setShowResetPassword] = useState(false);

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [token, setToken] = useState('');

  const [attempts, setAttempts] = useState(0);

  const [isLocked, setIsLocked] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);

  const [emailValid, setEmailValid] = useState(true);

  const [passwordValid, setPasswordValid] = useState(true);


 

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;


 

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [isSendingEmail, setIsSendingEmail] = useState(false);


 

  const handleOtpChange = (element: HTMLInputElement, index: number) => {

    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];

    newOtp[index] = element.value;

    setOtp(newOtp);

    if (element.value !== "" && element.nextSibling) {

      (element.nextSibling as HTMLInputElement).focus();

    }

  };

  const handleForgotPassword = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!emailRegex.test(email))

      return setMessage("Please enter a valid email first.");

    setIsSendingEmail(true);

    setMessage("Sending verification code...");

    setShowResetPassword(true);

    const formData = new URLSearchParams();

    formData.append('email', email);

    try {

      const response = await axios.post(

        'http://localhost:8080/clinicq/auth/forgot-password',

        formData.toString(),

        {

          headers: {

            'Content-Type': 'application/x-www-form-urlencoded'

          }

        }

      );

      setToken(response.data);

      setIsSendingEmail(false);

      setMessage("Code sent to your email!");

    } catch (error) {

      console.error('Forgot Password error:', error);

      setShowResetPassword(false);

      setIsSendingEmail(false);

      setMessage('Failed to send email. Please check your address.');

    }

  };


 

  const handleResetSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (newPassword !== confirmPassword) {

      return Swal.fire("Error", "Passwords do not match!", "error");

    }

    const finalOtp = otp.join('');

    try {

      await axios.post(

        `http://localhost:8080/clinicq/auth/reset-password?token=${finalOtp}&newPassword=${newPassword}`

      );

      Swal.fire({

        icon: 'success',

        title: 'Success',

        text: 'Password updated successfully!',

        showConfirmButton: false,

        timer: 2000

      });

      setShowResetPassword(false);

      setIsOtpVerified(false);

      setOtp(['', '', '', '', '', '']);

      setNewPassword('');

      setConfirmPassword('');

      setMessage("");

    } catch (error: any) {

      const serverMessage =

        error.response?.data?.errorMessage ||

        "Failed to update password.";

      Swal.fire("Error", serverMessage, "error");

    }

  };


 

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    if (isLocked) return;

    try {

      const response = await axios.post(

        "http://localhost:8080/clinicq/auth/login",

        null,

        {

          params: {

            email: email,

            password: password,

            role: "DOCTOR"

          }

        }

      );

      const tokenData = response.data;

      localStorage.setItem("token", tokenData);

      setAttempts(0);

      setMessage("Login successful");

      navigate('/doctor');

    } catch (error: any) {

      const newAttempts = attempts + 1;

      setAttempts(newAttempts);

      if (newAttempts >= 3) {

        setIsLocked(true);

        setTimeLeft(60);

        setMessage(

          "Account Locked due to multiple failed attempts. Try after a minute."

        );

        const timer = setInterval(() => {

          setTimeLeft((prev) => {

            if (prev <= 1) {

              clearInterval(timer);

              setIsLocked(false);

              setAttempts(0);

              setMessage("");

              return 0;

            }

            return prev - 1;

          });

        }, 1000);

      } else {

        console.error(error);

        setMessage(

          `Invalid credentials. ${3 - newAttempts} attempts remaining.`

        );

      }

    }

  };


 

  return (

    <div

      style={{

        minHeight: '100vh',

        display: 'flex',

        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",

        background: '#fafafa'

      }}>

      <style>{`

       @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');

       .dl-panel{

         width:420px;

         min-width:420px;

         background:linear-gradient(155deg,#064e3b 0%,#0f766e 50%,#14b8a6 100%);

         padding:56px 48px;

         display:flex;

         flex-direction:column;

         justify-content:space-between;

         position:relative;

         overflow:hidden;

       }

       @media(max-width:900px){

         .dl-panel{

           display:none;

         }

       }

       .dl-panel::before{

         content:'';

         position:absolute;

         width:280px;

         height:280px;

         border-radius:50%;

         background:radial-gradient(circle,rgba(255,255,255,.12) 0%,transparent 70%);

         top:-80px;

         right:-60px;

       }

       .dl-panel::after{

         content:'';

         position:absolute;

         width:220px;

         height:220px;

         border-radius:50%;

         background:radial-gradient(circle,rgba(20,184,166,.25) 0%,transparent 70%);

         bottom:40px;

         left:-40px;

       }

       .dl-grid{

         position:absolute;

         inset:0;

         background-image:

           linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),

           linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);

         background-size:40px 40px;

       }

       .dl-feature{

         display:flex;

         align-items:center;

         gap:14px;

         padding:14px 18px;

         background:rgba(255,255,255,.08);

         border:1px solid rgba(255,255,255,.12);

         border-radius:14px;

       }

       .dl-ficon{

         width:38px;

         height:38px;

         border-radius:10px;

         display:flex;

         align-items:center;

         justify-content:center;

         font-size:.95rem;

       }

       .dl-input{

         width:100%;

         padding:13px 16px;

         font-size:.92rem;

         font-weight:500;

         background:#fff;

         border:1.5px solid #e2e8f0;

         border-radius:12px;

         outline:none;

         transition:all .25s;

         color:#1e293b;

         font-family:inherit;

         box-sizing:border-box;

       }

       .dl-input:focus{

         border-color:#14b8a6;

         box-shadow:0 0 0 4px rgba(20,184,166,.1);

       }

       .dl-input.err{

         border-color:#ef4444;

       }

       .dl-btn{

         width:100%;

         padding:14px;

         font-size:.95rem;

         font-weight:700;

         background:linear-gradient(135deg,#14b8a6,#0f766e);

         color:#fff;

         border:none;

         border-radius:12px;

         cursor:pointer;

         letter-spacing:.3px;

         transition:all .3s;

         font-family:inherit;

       }

       .dl-btn:hover:not(:disabled){

         transform:translateY(-2px);

         box-shadow:0 8px 24px rgba(20,184,166,.3);

       }

       .dl-btn:disabled{

         opacity:.5;

         cursor:not-allowed;

         transform:none;

         box-shadow:none;

         background:#94a3b8;

       }

       .dl-label{

         font-size:.73rem;

         font-weight:700;

         text-transform:uppercase;

         letter-spacing:.8px;

         color:#0f766e;

         margin-bottom:7px;

         display:block;

       }

       .dl-otp{

         width:46px;

         height:52px;

         border:1.5px solid #e2e8f0;

         border-radius:10px;

         text-align:center;

         font-size:1.3rem;

         font-weight:700;

         outline:none;

         transition:all .25s;

         background:#fff;

         color:#1e293b;

         font-family:inherit;

       }

       .dl-otp:focus{

         border-color:#14b8a6;

         box-shadow:0 0 0 4px rgba(20,184,166,.1);

         transform:translateY(-2px);

       }

       .dl-otp.filled{

         border-color:#14b8a6;

         background:#f0fdfa;

       }

       @keyframes fadeUp{

         from{

           opacity:0;

           transform:translateY(18px);

         }

         to{

           opacity:1;

           transform:translateY(0);

         }

       }

       .dl-fadein{

         animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both;

       }

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

          background: rgba(3, 141, 97, 0.94) !important; /* Transitions to matching admin Indigo */

          border-color: rgba(3, 141, 97, 0.94) !important;

          color: #ffffff !important; /* Turns text clean white */

          transform: translateY(-2px);

          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.2);

        }

     `}</style>


 

      <div className="dl-panel">

        <div className="dl-grid" />

        <div style={{ position: 'relative', zIndex: 2 }}>

          <div

            style={{

              display: 'flex',

              alignItems: 'center',

              gap: 12,

              marginBottom: 52

            }}>

            <div

              style={{

                width: 40,

                height: 40,

                borderRadius: 12,

                background: 'rgba(255,255,255,.2)',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center'

              }}>

              <FaUserMd style={{ color: '#fff', fontSize: '1rem' }} />

            </div>

            <span

              style={{

                fontFamily: 'Playfair Display, serif',

                fontWeight: 800,

                fontSize: '1.2rem',

                color: '#fff'

              }}>

              ClinicQ MD

            </span>

          </div>

          <h1

            style={{

              fontFamily: 'Playfair Display, serif',

              fontSize: '2.5rem',

              fontWeight: 800,

              color: '#fff',

              lineHeight: 1.1,

              marginBottom: 16

            }}>

            Physician<br />

            <span style={{ color: '#99f6e4' }}>Control Center</span>

          </h1>

          <p

            style={{

              color: 'rgba(255,255,255,.55)',

              fontSize: '.88rem',

              lineHeight: 1.75,

              marginBottom: 40

            }}>

            Access consultations, monitor appointments and manage patient care from one unified dashboard.

          </p>

          <div

            style={{

              display: 'flex',

              flexDirection: 'column',

              gap: 10

            }}>

            {[

              {

                icon: <FaClipboardList />,

                bg: 'rgba(153,246,228,.15)',

                col: '#99f6e4',

                label: 'Queue Management',

                sub: 'Monitor live consultations'

              },

              {

                icon: <FaNotesMedical />,

                bg: 'rgba(255,255,255,.1)',

                col: '#fff',

                label: 'Medical Records',

                sub: 'Add and manage prescriptions'

              },

              {

                icon: <FaHeartbeat />,

                bg: 'rgba(153,246,228,.15)',

                col: '#5eead4',

                label: 'Break Mode',

                sub: 'Freeze screen to start break timer'

              }

            ].map((f, i) => (

              <div key={i} className="dl-feature">

                <div

                  className="dl-ficon"

                  style={{

                    background: f.bg,

                    color: f.col

                  }}

                >

                  {f.icon}

                </div>

                <div>

                  <div

                    style={{

                      color: '#fff',

                      fontSize: '.85rem',

                      fontWeight: 600

                    }}>

                    {f.label}

                  </div>

                  <div

                    style={{

                      color: 'rgba(255,255,255,.38)',

                      fontSize: '.73rem'

                    }}>

                    {f.sub}

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>

          <button

            onClick={() => navigate('/')}

            className='back-home-btn'>

            <FaArrowLeft /> Back to home

          </button>

        </div>

      </div>


 

      <div

        style={{

          flex: 1,

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          padding: '40px 20px'

        }}>

        <div

          className="dl-fadein"

          style={{

            width: '100%',

            maxWidth: '420px'

          }}>


 

          <div style={{ marginBottom: 32 }}>

            <p

              style={{

                fontSize: '.73rem',

                fontWeight: 700,

                color: '#94a3b8',

                textTransform: 'uppercase',

                letterSpacing: '1px',

                marginBottom: 8

              }}>

              Doctor Portal

            </p>

            <h2

              style={{

                fontFamily: 'Playfair Display, serif',

                fontSize: '2rem',

                fontWeight: 800,

                color: '#0f172a',

                margin: 0

              }}>

              {showResetPassword ? 'Reset Password' : 'Welcome Doctor'}

            </h2>

            <p

              style={{

                color: '#94a3b8',

                fontSize: '.86rem',

                marginTop: 6,

                marginBottom: 0

              }}>

              {showResetPassword

                ? 'Verify your identity to continue'

                : 'Securely access your physician dashboard'}

            </p>

          </div>


 

          {message && (

            <div

              style={{

                padding: '11px 15px',

                borderRadius: 10,

                marginBottom: 20,

                fontSize: '.83rem',

                fontWeight: 600,

                display: 'flex',

                alignItems: 'center',

                gap: 8,

                background: message.includes('successful')

                  ? '#f0fdf4'

                  : '#fef2f2',

                border: `1px solid ${message.includes('successful')

                    ? '#bbf7d0'

                    : '#fecaca'

                  }`,

                color: message.includes('successful')

                  ? '#166534'

                  : '#991b1b'

              }}>

              {isLocked && (

                <span className="spinner-border spinner-border-sm" />

              )}

              {message}

              {isLocked && timeLeft > 0 && ` (${timeLeft}s)`}

            </div>

          )}


 

          {!showResetPassword ? (

            <form onSubmit={handleLogin}>

              <div style={{ marginBottom: 16 }}>

                <label className="dl-label">Doctor Email</label>

                <input

                  className={`dl-input ${!emailValid ? 'err' : ''}`}

                  type="email"

                  placeholder="doctor@clinicq.com"

                  value={email}

                  onChange={(e) => {

                    setEmail(e.target.value);

                    setEmailValid(

                      e.target.value === "" ||

                      emailRegex.test(e.target.value)

                    );

                  }}

                  required

                />

                {!emailValid && email && (

                  <p

                    style={{

                      color: '#ef4444',

                      fontSize: '.73rem',

                      marginTop: 4

                    }}>

                    Please enter a valid email address.

                  </p>

                )}

              </div>

              <div style={{ marginBottom: 10 }}>

                <label className="dl-label">Password</label>

                <input

                  className={`dl-input ${!passwordValid ? 'err' : ''}`}

                  type="password"

                  placeholder="••••••••"

                  value={password}

                  onChange={(e) => {

                    setPassword(e.target.value);

                    setPasswordValid(

                      e.target.value === "" ||

                      passwordRegex.test(e.target.value)

                    );

                  }}

                  required

                />

                {!passwordValid && password && (

                  <p

                    style={{

                      color: '#ef4444',

                      fontSize: '.73rem',

                      marginTop: 4

                    }}>

                    8+ characters with letters, numbers & special chars.

                  </p>

                )}

              </div>

              <div

                style={{

                  textAlign: 'right',

                  marginBottom: 24

                }}>

                <button

                  type="button"

                  onClick={handleForgotPassword}

                  style={{

                    background: 'none',

                    border: 'none',

                    color: '#0f766e',

                    fontSize: '.82rem',

                    fontWeight: 600,

                    cursor: 'pointer',

                    padding: 0,

                    fontFamily: 'inherit'

                  }}>

                  Forgot Password?

                </button>

              </div>

              <button

                type="submit"

                className="dl-btn"

                disabled={

                  !emailRegex.test(email) ||

                  !passwordRegex.test(password)

                }>

                Access Dashboard →

              </button>

            </form>

          ) : !isOtpVerified ? (

            <div>

              {isSendingEmail ? (

                <div

                  style={{

                    textAlign: 'center',

                    padding: '32px 0'

                  }}>

                  <div

                    className="spinner-border"

                    style={{ color: '#14b8a6' }} />

                  <p

                    style={{

                      marginTop: 16,

                      color: '#64748b',

                      fontWeight: 600,

                      fontSize: '.88rem'

                    }}>

                    Sending verification code...

                  </p>

                </div>

              ) : (

                <>

                  <p

                    style={{

                      color: '#64748b',

                      fontSize: '.86rem',

                      marginBottom: 24

                    }}>

                    Enter the 6-digit code sent to{' '}

                    <strong style={{ color: '#1e293b' }}>

                      {email}

                    </strong>

                  </p>

                  <div

                    style={{

                      display: 'flex',

                      gap: 8,

                      justifyContent: 'center',

                      marginBottom: 28

                    }}>

                    {otp.map((d, i) => (

                      <input

                        key={i}

                        type="text"

                        maxLength={1}

                        className={`dl-otp ${d ? 'filled' : ''}`}

                        value={d}

                        onChange={e => handleOtpChange(e.target, i)}

                        onFocus={e => e.target.select()}

                        inputMode="numeric"

                      />

                    ))}

                  </div>

                  <button

                    className="dl-btn"

                    disabled={

                      otp.some(d => d === '') ||

                      isSendingEmail

                    }

                    onClick={async () => {

                      const finalOtp = otp.join('');

                      try {

                        await axios.get(

                          `http://localhost:8080/clinicq/auth/verify-token?token=${finalOtp}`

                        );

                        setIsOtpVerified(true);

                        setMessage("");

                      } catch (error: any) {

                        console.error(

                          "Early OTP Check Error:",

                          error.response

                        );

                        const serverMessage =

                          error.response?.data?.errorMessage ||

                          "Incorrect OTP.";

                        Swal.fire({

                          icon: 'error',

                          title: 'Incorrect OTP',

                          text: serverMessage.includes("INVALID_USER")

                            ? "Incorrect OTP. Please enter the correct OTP."

                            : serverMessage,

                          confirmButtonColor: '#0f766e'

                        });

                        setIsOtpVerified(false);

                      }

                    }}>

                    Verify Code →

                  </button>

                </>

              )}

              <button

                onClick={() => {

                  setShowResetPassword(false);

                  setMessage("");

                }}

                style={{

                  background: 'none',

                  border: 'none',

                  color: '#94a3b8',

                  fontSize: '.8rem',

                  cursor: 'pointer',

                  marginTop: 14,

                  display: 'block',

                  width: '100%',

                  textAlign: 'center',

                  fontFamily: 'inherit'

                }}>

                Cancel

              </button>

            </div>

          ) : (

            <form onSubmit={handleResetSubmit}>

              <div style={{ marginBottom: 16 }}>

                <label className="dl-label">New Password</label>

                <input

                  className="dl-input"

                  type="password"

                  value={newPassword}

                  onChange={(e) => setNewPassword(e.target.value)}

                  placeholder="Enter new password"

                  required />

              </div>

              <div style={{ marginBottom: 28 }}>

                <label className="dl-label">

                  Confirm Password

                </label>

                <input

                  className="dl-input"

                  type="password"

                  value={confirmPassword}

                  onChange={(e) => setConfirmPassword(e.target.value)}

                  placeholder="Confirm new password"

                  required />

              </div>

              <div

                style={{

                  display: 'flex',

                  gap: 12

                }}>

                <button

                  type="button"

                  onClick={() => {

                    setIsOtpVerified(false);

                    setShowResetPassword(false);

                  }}

                  style={{

                    flex: 1,

                    padding: '13px',

                    borderRadius: 12,

                    border: '1.5px solid #e2e8f0',

                    background: '#fff',

                    color: '#64748b',

                    fontWeight: 600,

                    cursor: 'pointer',

                    fontFamily: 'inherit'

                  }}>

                  Cancel

                </button>

                <button

                  type="submit"

                  className="dl-btn"

                  style={{ flex: 1 }}>

                  Update Password

                </button>

              </div>

            </form>

          )}

          <p

            style={{

              textAlign: 'center',

              marginTop: 36

            }}>

            <button

              onClick={() => navigate('/')}

              className='admin-return-box'>

              <FaArrowLeft style={{ fontSize: '.75rem' }} />

              Return to Main Entry

            </button>

          </p>

        </div>

      </div>

    </div>

  );

};


 

export default DoctorLogin;