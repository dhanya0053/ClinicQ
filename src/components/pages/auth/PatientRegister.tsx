import React, { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import {

 FaArrowLeft,

 FaUserPlus,

 FaShieldAlt,

 FaHeartbeat,

 FaUserCheck,

} from "react-icons/fa";


 

interface Props {}

const PatientRegister: React.FC<Props> = () => {

 const navigate = useNavigate();

 const [formData, setFormData] = useState({

   name: "",

   email: "",

   dateOfBirth: "",

   gender: "MALE",

   phone: "",

   password: "",

 });

 const [error, setError] = useState("");

 const [showPassword, setShowPassword] = useState(false);

 const [isValid, setIsValid] = useState(false);

 const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

 const phoneRegex = /^[0-9]{10}$/;

 const passwordRegex =

   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;



 

 const handleChange = (e: any) => {

   setFormData({ ...formData, [e.target.name]: e.target.value });

 };


 

const handleSubmit = async (e: any) => {

   e.preventDefault();

   try {

      setError("");

     const response = await axios.post(

       "http://localhost:8080/clinicq/auth/signup",

       {

         name: formData.name,

         phone: formData.phone,

         dateOfBirth: formData.dateOfBirth,

         gender: formData.gender,

         user: {

           email: formData.email,

           password: formData.password,

         },

       }

     );

     console.log(response.data);

     await Swal.fire({

      icon:'success',

      title:'Account Created Successfully!',

      text:'Please log in with your fresh credentials to manage your passes.',

      confirmButtonColor:'#10b981',

      customClass:{

        popup:'rounded-4'

      }


 

     });

     navigate("/patient-login");

   } catch (err: any) {

     console.error(err);

     const backendError = err.response?.data;

     const rawMessage=typeof backendError==='string'? backendError:(backendError?.errorMessage || backendError?.error || "Registration failed. Please Try again.");

     let finalDisplayMessage="The User with email Id Already exists.";

     if(rawMessage.includes("USER_ALREADY_PRESENT")){

      finalDisplayMessage="The User with email Id Already exists.";

     }else{

      finalDisplayMessage=rawMessage;

     }


 

     setError(finalDisplayMessage);

     Swal.fire({

      icon:'error',

      title:'Registration Blocked',

      text: finalDisplayMessage,

      confirmButtonColor:'#ef4444',

      customClass:{

        popup:'rounded-4'

      }

     });

   }

 };


 

 const isValidAge = (dobString: string) => {

   if (!dobString) return false;

   const today = new Date();

   const dob = new Date(dobString);

   let age = today.getFullYear() - dob.getFullYear();

   const m = today.getMonth() - dob.getMonth();

   if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {

     age--;

   }

   return age >= 12;

 };


 

 useEffect(() => {

   const { name, email, dateOfBirth, phone, password } = formData;

   const isOldEnough = isValidAge(dateOfBirth);

   const nameRegex = /^[a-zA-Z\s]{2,50}$/;

   const isNameOk = nameRegex.test(name);

   const isEmailOk = emailRegex.test(email);

   const isPhoneOk = phoneRegex.test(phone);

   const isPassOk = passwordRegex.test(password);

   setIsValid(

     isNameOk &&

     isOldEnough &&

     isEmailOk &&

     isPhoneOk &&

     isPassOk

   );

 }, [formData]);


 

 return (

   <div

     style={{

       minHeight: "100vh",

       display: "flex",

       fontFamily: "'DM Sans', 'Segoe UI', sans-serif",

       background: "#fafafa",

     }}

   >

     <style>{`

       @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');

       .pr-panel{

         width:420px;

         min-width:420px;

         background:linear-gradient(155deg,#047857 0%,#10b981 50%,#34d399 100%);

         padding:56px 48px;

         display:flex;

         flex-direction:column;

         justify-content:space-between;

         position:relative;

         overflow:hidden;

       }

       @media(max-width:900px){

         .pr-panel{

           display:none;

         }

       }

       .pr-panel::before{

         content:'';

         position:absolute;

         width:280px;

         height:280px;

         border-radius:50%;

         background:radial-gradient(circle,rgba(255,255,255,.15) 0%,transparent 70%);

         top:-80px;

         right:-60px;

       }

       .pr-panel::after{

         content:'';

         position:absolute;

         width:220px;

         height:220px;

         border-radius:50%;

         background:radial-gradient(circle,rgba(255,255,255,.08) 0%,transparent 70%);

         bottom:50px;

         left:-50px;

       }

       .pr-grid{

         position:absolute;

         inset:0;

         background-image:

           linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),

           linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);

         background-size:40px 40px;

       }

       .pr-feature{

         display:flex;

         align-items:center;

         gap:14px;

         padding:14px 18px;

         background:rgba(255,255,255,.08);

         border:1px solid rgba(255,255,255,.12);

         border-radius:14px;

       }

       .pr-ficon{

         width:38px;

         height:38px;

         border-radius:10px;

         display:flex;

         align-items:center;

         justify-content:center;

         font-size:.95rem;

       }

       .pr-inp{

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

       .pr-inp:focus{

         border-color:#10b981;

         box-shadow:0 0 0 4px rgba(16,185,129,.1);

       }

       .pr-inp.err{

         border-color:#ef4444;

       }

       .pr-btn{

         width:100%;

         padding:14px;

         font-size:.95rem;

         font-weight:700;

         background:linear-gradient(135deg,#10b981,#34d399);

         color:#fff;

         border:none;

         border-radius:12px;

         cursor:pointer;

         letter-spacing:.3px;

         transition:all .3s;

         font-family:inherit;

       }

       .pr-btn:hover:not(:disabled){

         transform:translateY(-2px);

         box-shadow:0 8px 24px rgba(16,185,129,.28);

       }

       .pr-btn:disabled{

         opacity:.6;

         cursor:not-allowed;

         transform:none;

         box-shadow:none;

         background:#94a3b8;

       }

       .pr-lbl{

         font-size:.73rem;

         font-weight:700;

         text-transform:uppercase;

         letter-spacing:.8px;

         color:#10b981;

         margin-bottom:7px;

         display:block;

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

       .pr-fadein{

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

      .pr-inp-no-arrow {

        appearance: none !important;

        -webkit-appearance: none !important;

        -moz-appearance: none !important;

        padding-right: 16px !important; 

      }



 

     `}</style>


 

     {/* left panel */}

     <div className="pr-panel">

       <div className="pr-grid" />

       <div style={{ position: "relative", zIndex: 2 }}>

         <div

           style={{

             display: "flex",

             alignItems: "center",

             gap: 12,

             marginBottom: 52,

           }}>

           <div

             style={{

               width: 40,

               height: 40,

               borderRadius: 12,

               background: "rgba(255,255,255,.2)",

               display: "flex",

               alignItems: "center",

               justifyContent: "center",

             }}>

             <FaHeartbeat style={{ color: "#fff", fontSize: "1.1rem" }} />

           </div>

           <span

             style={{

               fontFamily: "Playfair Display, serif",

               fontWeight: 800,

               fontSize: "1.2rem",

               color: "#fff",

             }}>

             ClinicQ

           </span>

         </div>

         <h1

           style={{

             fontFamily: "Playfair Display, serif",

             fontSize: "2.5rem",

             fontWeight: 800,

             color: "#fff",

             lineHeight: 1.1,

             marginBottom: 16,

           }}>

           Create Your

           <br />

           <span style={{ color: "#d1fae5" }}>Patient Profile</span>

         </h1>

         <p

           style={{

             color: "rgba(255,255,255,.55)",

             fontSize: ".88rem",

             lineHeight: 1.75,

             marginBottom: 40,

           }}>

           Register securely to book appointments, track your medical history and access your healthcare journey anytime.

         </p>

         <div

           style={{

             display: "flex",

             flexDirection: "column",

             gap: 10,

           }}>

           {[

             {

               icon: <FaUserPlus />,

               bg: "rgba(255,255,255,.15)",

               col: "#fff",

               label: "Quick Registration",

               sub: "Create your account instantly",

             },

             {

               icon: <FaShieldAlt />,

               bg: "rgba(209,250,229,.15)",

               col: "#d1fae5",

               label: "Secure Access",

               sub: "Protected patient authentication",

             },

             {

               icon: <FaUserCheck />,

               bg: "rgba(255,255,255,.12)",

               col: "#fff",

               label: "Health Dashboard",

               sub: "Manage appointments & records",

             },

           ].map((f, i) => (

             <div key={i} className="pr-feature">

               <div

                 className="pr-ficon"

                 style={{

                   background: f.bg,

                   color: f.col,

                 }}

               >

                 {f.icon}

               </div>

               <div>

                 <div

                   style={{

                     color: "#fff",

                     fontSize: ".85rem",

                     fontWeight: 600,

                   }}

                 >

                   {f.label}

                 </div>

                 <div

                   style={{

                     color: "rgba(255,255,255,.38)",

                     fontSize: ".73rem",

                   }}

                 >

                   {f.sub}

                 </div>

               </div>

             </div>

           ))}

         </div>

       </div>

       <div style={{ position: "relative", zIndex: 2 }}>

         <button

           onClick={() => navigate("/")}

           className='back-home-btn'>

           <FaArrowLeft /> Back to home

         </button>

       </div>

     </div>

     {/* right panel */}

     <div

       style={{

         flex: 1,

         display: "flex",

         alignItems: "center",

         justifyContent: "center",

         padding: "40px 20px",

       }}>

       <div

         className="pr-fadein"

         style={{

           width: "100%",

           maxWidth: "460px",

         }}>

         <div style={{ marginBottom: 32 }}>

           <p

             style={{

               fontSize: ".73rem",

               fontWeight: 700,

               color: "#94a3b8",

               textTransform: "uppercase",

               letterSpacing: "1px",

               marginBottom: 8,

             }}>

             Patient Registration

           </p>

           <h2

             style={{

               fontFamily: "Playfair Display, serif",

               fontSize: "2rem",

               fontWeight: 800,

               color: "#0f172a",

               margin: 0,

             }}>

             Join ClinicQ

           </h2>

           <p

             style={{

               color: "#94a3b8",

               fontSize: ".86rem",

               marginTop: 6,

               marginBottom: 0,

             }}>

             Create your secure healthcare account in seconds

           </p>

         </div>

         {error && (

           <div

             style={{

               padding: "11px 15px",

               borderRadius: 10,

               marginBottom: 20,

               fontSize: ".83rem",

               fontWeight: 600,

               background: "#fef2f2",

               border: "1px solid #fecaca",

               color: "#991b1b",

             }}>

             {error}

           </div>

         )}

         <form onSubmit={handleSubmit}>

           <div style={{ marginBottom: 16 }}>

             <label className="pr-lbl">Full Name</label>

             <input

               type="text"

               name="name"

               value={formData.name}

               onChange={handleChange}

               className={`pr-inp ${

                 formData.name &&

                 !/^[a-zA-Z\s]{2,50}$/.test(formData.name)

                   ? "err"

                   : ""

               }`}

               placeholder="John Doe"

               required

             />

             {formData.name &&

               !/^[a-zA-Z\s]{2,50}$/.test(formData.name) && (

                 <p

                   style={{

                     color: "#ef4444",

                     fontSize: ".73rem",

                     marginTop: 4,

                   }}>

                   Name should contain only letters and spaces.

                 </p>

             )}

           </div>

           <div style={{ marginBottom: 16 }}>

             <label className="pr-lbl">Email Address</label>

             <input

               type="email"

               name="email"

               value={formData.email}

               onChange={handleChange}

               className={`pr-inp ${

                 formData.email &&

                 !emailRegex.test(formData.email)

                   ? "err"

                   : ""

               }`}

               placeholder="john@example.com"

               required

             />

             {formData.email &&

               !emailRegex.test(formData.email) && (

                 <p

                   style={{

                     color: "#ef4444",

                     fontSize: ".73rem",

                     marginTop: 4,

                   }}>

                   Please enter a valid email address.

                 </p>

             )}

           </div>

           <div

             style={{

               display: "grid",

               gridTemplateColumns: "1fr 1fr",

               gap: 12,

               marginBottom: 16,

             }}>

             <div>

               <label className="pr-lbl">Date of Birth</label>

               <input

                 type="date"

                 name="dateOfBirth"

                 value={formData.dateOfBirth}

                 onChange={handleChange}

                 max={new Date().toISOString().split("T")[0]}

                 className={`pr-inp ${

                   formData.dateOfBirth &&

                   !isValidAge(formData.dateOfBirth)

                     ? "err"

                     : ""

                 }`}

                 style={{ colorScheme: "light" }}

                 required

               />

               {formData.dateOfBirth &&

                 !isValidAge(formData.dateOfBirth) && (

                   <p

                     style={{

                       color: "#ef4444",

                       fontSize: ".68rem",

                       marginTop: 4,

                     }}>

                     Patient must be at least 12 years old.

                   </p>

               )}

             </div>

             <div>

               <label className="pr-lbl">Gender</label>

               <select

                 name="gender"

                 value={formData.gender}

                 onChange={handleChange}

                 className="pr-inp pr-inp-no-arrow">

                 <option value="MALE">Male</option>

                 <option value="FEMALE">Female</option>

                 <option value="OTHER">Other</option>

               </select>

             </div>

           </div>

           <div style={{ marginBottom: 16 }}>

             <label className="pr-lbl">Contact Number</label>

             <input

               type="tel"

               name="phone"

               value={formData.phone}

               onChange={handleChange}

               maxLength={10}

               className={`pr-inp ${

                 formData.phone &&

                 !phoneRegex.test(formData.phone)

                   ? "err"

                   : ""

               }`}

               placeholder="9876543210"

               required

             />

             {formData.phone &&

               !phoneRegex.test(formData.phone) && (

                 <p

                   style={{

                     color: "#ef4444",

                     fontSize: ".73rem",

                     marginTop: 4,

                   }}>

                   Enter a valid 10-digit mobile number.

                 </p>

             )}

           </div>

           <div style={{ marginBottom: 24 }}>

             <label className="pr-lbl">Secure Password</label>

             <div

               style={{

                 display: "flex",

                 alignItems: "center",

                 border: "1.5px solid #e2e8f0",

                 borderRadius: 12,

                 overflow: "hidden",

                 background: "#fff",

               }}>

               <input

                 type={showPassword ? "text" : "password"}

                 name="password"

                 value={formData.password}

                 onChange={handleChange}

                 className="pr-inp"

                 style={{

                   border: "none",

                   boxShadow: "none",

                   borderRadius: 0,

                 }}

                 placeholder="••••••••"

                 required

               />

               <button

                 type="button"

                 onClick={() => setShowPassword(!showPassword)}

                 style={{

                   border: "none",

                   background: "#fff",

                   padding: "0 16px",

                   height: "100%",

                   color: "#10b981",

                   fontWeight: 700,

                   fontSize: ".72rem",

                   cursor: "pointer",

                 }}>

                 {showPassword ? "HIDE" : "SHOW"}

               </button>

             </div>

             {formData.password &&

               !passwordRegex.test(formData.password) && (

                 <p

                   style={{

                     color: "#ef4444",

                     fontSize: ".73rem",

                     marginTop: 4,

                   }}>

                   Use 8+ characters with letters, numbers & special characters.

                 </p>

             )}

           </div>

           <button

             type="submit"

             disabled={!isValid}

             className="pr-btn">

             Create Account →

           </button>

           <p

             style={{

               textAlign: "center",

               marginTop: 22,

               fontSize: ".84rem",

               color: "#94a3b8",

             }}>

             Already have an account?{" "}

             <button

               type="button"

               onClick={() => navigate("/patient-login")}

               style={{

                 background: "none",

                 border: "none",

                 color: "#10b981",

                 fontWeight: 700,

                 cursor: "pointer",

                 padding: 0,

                 fontFamily: "inherit",

                 fontSize: ".84rem",

               }}>

               Login

             </button>

           </p>

         </form>

         <p style={{ textAlign: "center", marginTop: 28 }}>

           <button

             onClick={() => navigate("/")}

             style={{

               background: "none",

               border: "none",

               color: "#94a3b8",

               cursor: "pointer",

               fontSize: ".78rem",

               display: "inline-flex",

               alignItems: "center",

               gap: 5,

               fontFamily: "inherit",

             }}>

             <FaArrowLeft style={{ fontSize: ".65rem" }} />

             Return to Main Entry

           </button>

         </p>

       </div>

     </div>

   </div>

 );

};


 

export default PatientRegister;