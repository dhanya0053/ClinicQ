import React, { useState, useEffect, lazy, Suspense } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

import { FaClinicMedical } from 'react-icons/fa';

import Swal from 'sweetalert2';


 

const AdminDashboard = lazy(() => import('./components/pages/admin/AdminDashboard'));

const Login = lazy(() => import('./components/pages/auth/Login'));

const PatientLogin = lazy(() => import('./components/pages/auth/PatientLogin'));

const PatientRegister = lazy(() => import('./components/pages/auth/PatientRegister'));

const BookAppointment = lazy(() => import('./components/pages/patient/BookAppointment'));

const MyAppointments = lazy(() => import('./components/pages/patient/MyAppointments'));

const PastHistory = lazy(() => import('./components/pages/patient/PastHistory'));

const PatientToken = lazy(() => import('./components/pages/patient/PatientToken'));

const ReceptionistLogin = lazy(() => import('./components/pages/receptionist/ReceptionistLogin'));

const ReceptionistDashboard = lazy(() => import('./components/pages/receptionist/ReceptionistDashboard'));

const NowServing = lazy(() => import('./components/pages/receptionist/NowServing'));

const DoctorLogin = lazy(() => import('./components/pages/doctor/DoctorLogin'));

const DoctorDashboard = lazy(() => import('./components/pages/doctor/DoctorDashboard'));


 

const DoctorCarousel: React.FC = () => {

  const baseDocs = [

    { name: "Dr. Charlie", dept: "PEDIATRICS", rating: "4.9 ★", desc: "Specializing in neonatal care and developmental growth tracing with over 14 years of primary clinical supervision.", bg: "linear-gradient(135deg, rgba(242, 153, 74, 0.08) 0%, rgba(242, 201, 76, 0.08) 100%)", color: "#f2994a" },

    { name: "Dr. Anu", dept: "CARDIOLOGY", rating: "5.0 ★", desc: "Expert in interventional cardiovascular medicine, preventive heart therapeutics, and live arterial telemetry mechanics.", bg: "linear-gradient(135deg, rgba(106, 17, 203, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)", color: "#6a11cb" },

    { name: "Dr. Vineeta", dept: "ORTHOPEDICS", rating: "4.8 ★", desc: "Dedicated to complete joint restoration pathways, sports traumatology operations, and micro-bone skeletal alignment.", bg: "linear-gradient(135deg, rgba(32, 201, 151, 0.06) 0%, rgba(11, 234, 203, 0.06) 100%)", color: "#20c997" },

    { name: "Dr. David", dept: "GENERAL MEDICINE", rating: "4.9 ★", desc: "Specializes in complex multi-system diagnostics, chronic disease mapping, and long-term metabolic health optimization.", bg: "linear-gradient(135deg, rgba(255, 126, 95, 0.06) 0%, rgba(255, 71, 87, 0.06) 100%)", color: "#ff4757" },

    { name: "Dr. Jagan", dept: "ORTHOPEDICS", rating: "4.7 ★", desc: "Expert in reconstructive orthopedic surgery,advanced arthritic therapeutics, and live musculoskeletal stress mechanics.", bg: "linear-gradient(135deg, rgba(196, 113, 237, 0.06) 0%, rgba(255, 126, 95, 0.06) 100%)", color: "#c471ed" }

  ];



 

  const slides = [baseDocs[baseDocs.length - 1], ...baseDocs, baseDocs[0]];

  const [currentIndex, setCurrentIndex] = useState(1);

  const [isTransitioning, setIsTransitioning] = useState(true);



 

  const nextSlide = () => {

    setIsTransitioning(true);

    setCurrentIndex(prev => prev + 1);

  };


 

  const prevSlide = () => {

    setIsTransitioning(true);

    setCurrentIndex(prev => prev - 1);

  };


 

  const handleTransitionEnd = () => {

    if (currentIndex === slides.length - 1) {

      setIsTransitioning(false);

      setCurrentIndex(1);

    }

    else if (currentIndex === 0) {

      setIsTransitioning(false);

      setCurrentIndex(slides.length - 2);

    }

  };


 

  //  useEffect(() => {

  //    const autoSlide = setInterval(nextSlide, 3000);

  //    return () => clearInterval(autoSlide);

  //  }, [currentIndex]);


 

  // THE SAFETY FIX: Only trigger the auto-slide if the tab is active and visible

  useEffect(() => {

    const handleAutoRotation = () => {

      // If the doctor carousel container is hidden or undefined in memory, do not increment index

      if (document.hidden) return;

      nextSlide();

    };


 

    const autoSlide = setInterval(handleAutoRotation, 3000);

    return () => clearInterval(autoSlide);

  }, []); // Clear dependency array so a single, clean structural timer manages the loop




 

  return (

    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>


 

      <button type="button" className="carousel-arrow-btn d-none d-md-flex" onClick={prevSlide}>

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>

      </button>


 

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>

        <div

          onTransitionEnd={handleTransitionEnd}

          style={{

            display: 'flex',

            width: '100%',

            transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',

            transform: `translateX(-${currentIndex * 100}%)`

          }}

        >

          {slides.map((doc, idx) => {

            const activeDoc = doc || baseDocs[0];

            return (

              <div key={idx} className="carousel-slide-dr">

                <div

                  className="pr-fadein"

                  style={{

                    background: activeDoc.bg,

                    borderRadius: '20px',

                    padding: '44px 32px',

                    border: '1px solid rgba(0,0,0,0.02)',

                    textAlign: 'center',

                    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.5)'

                  }}

                >

                  <span className="badge rounded-pill px-3 py-2 mb-3 shadow-sm" style={{ background: '#ffffff', color: activeDoc.color, fontWeight: '700', fontSize: '11px', border: `1px solid rgba(0,0,0,0.03)` }}>

                    {activeDoc.dept} · {activeDoc.rating}

                  </span>

                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#111', marginBottom: '14px', letterSpacing: '-0.5px' }}>

                    {activeDoc.name}

                  </h3>

                  <p style={{ color: '#6c757d', fontSize: '0.96rem', maxWidth: '620px', margin: '0 auto', lineHeight: '1.75', fontWeight: 500, fontStyle: 'italic' }}>

                    "{activeDoc.desc}"

                  </p>

                </div>

              </div>


 

            )

          })}

        </div>

      </div>


 

      <button type="button" className="carousel-arrow-btn d-none d-md-flex" onClick={nextSlide}>

        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>

      </button>

    </div>

  );

};


 

const HomePage: React.FC<{ setLoginRole: (role: string) => void }> = ({ setLoginRole }) => {

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<string>('home');

  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);


 

  useEffect(() => {

    const observer = new IntersectionObserver(

      ([entry]) => {

        if (entry.isIntersecting) {

          setIsAnalyticsVisible(true);

          observer.unobserve(entry.target);

        }

      },

      { threshold: 0.15 }

    );

    const target = document.getElementById('analytics-section');

    if (target) observer.observe(target);

    return () => {

      if (target) observer.unobserve(target);

    };

  }, []);




 

  React.useEffect(() => {

    const handleScrollSpy = () => {

      const sections = [

        { id: 'home', top: 0 },

        { id: 'portals', element: document.getElementById('portal-selection-section') },

        { id: 'about', element: document.getElementById('about-us-section') },

        { id: 'analytics', element: document.getElementById('analytics-section') },

        { id: 'contact', element: document.getElementById('contact-us-section') }

      ];


 

      const isAtBottom = window.innerHeight + Math.round(window.scrollY) >= document.documentElement.scrollHeight - 5;

      if (isAtBottom) {

        setActiveSection('contact');

        return;

      }

      const scrollPosition = window.scrollY + 120;


 

      for (let i = sections.length - 1; i >= 0; i--) {

        const sec = sections[i];

        if (sec.id === 'home' && scrollPosition >= 0) {

          setActiveSection('home');

          break;

        } else if (sec.element) {

          const offsetTop = sec.element.offsetTop;

          if (scrollPosition >= offsetTop) {

            setActiveSection(sec.id);

            break;

          }

        }

      }

    };


 

    window.addEventListener('scroll', handleScrollSpy);

    return () => window.removeEventListener('scroll', handleScrollSpy);

  }, []);



 

  return (

    <div style={{

      minHeight: '100vh',

      background: 'radial-gradient(135deg, #fff5f2 0%, #f8f9fa 45%, #e9ecef 100%)',

      fontFamily: "'Segoe UI', Roboto, sans-serif",

      color: '#212529',

      overflowX: 'hidden',

      position: 'relative',

      paddingTop: '68px'

    }}>

      <style>{

        //      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

        `

       .orb-l { position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0; }

       .orb-l-1 { width:620px;height:620px;background:radial-gradient(circle,rgba(255,126,95,.14) 0%,transparent 70%);top:-160px;left:-160px;animation:dL1 20s ease-in-out infinite; }

       .orb-l-2 { width:500px;height:500px;background:radial-gradient(circle,rgba(106,17,203,.07) 0%,transparent 70%);top:80px;right:-110px;animation:dL2 25s ease-in-out infinite; }

       .orb-l-3 { width:420px;height:420px;background:radial-gradient(circle,rgba(32,201,151,.08) 0%,transparent 70%);bottom:200px;left:32%;animation:dL3 18s ease-in-out infinite; }

       @keyframes dL1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}

       @keyframes dL2{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,60px)}}

       @keyframes dL3{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-40px)}}


 

       .grid-l { position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.025) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0; }


 

       .cl { position:relative;z-index:2; }


 

       .nav-l { background:rgba(255,255,255,.88);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06); }


 

       .badge-l { display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(32,201,151,.08);border:1px solid rgba(32,201,151,.25);border-radius:100px;font-size:11px;font-weight:700;color:#198754;letter-spacing:.5px;text-transform:uppercase; }

       .dot-l { width:6px;height:6px;background:#20c997;border-radius:50%;animation:pdot 2s ease-in-out infinite; }

       @keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}


 

       .hero-t { font-family:'Syne',sans-serif;font-size:clamp(44px,7vw,84px);font-weight:800;line-height:.95;letter-spacing:-3px;color:#111; }

       .hero-a { font-family:'Syne',sans-serif;font-weight:800;background:linear-gradient(135deg,#ff7e5f 0%,#ff4757 60%,#c471ed 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }


 

       .portal-c { background:rgba(255,255,255,.88);border:1px solid rgba(0,0,0,.07);border-radius:20px;padding:32px 28px;transition:all .35s cubic-bezier(.16,1,.3,1);cursor:pointer;position:relative;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.04); }

       .portal-c:hover { border-color:var(--ca);transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,.10);background:#fff; }

       .ci-w { width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:20px;transition:transform .3s ease; }

       .portal-c:hover .ci-w { transform:scale(1.1) rotate(-3deg); }

       .ct { font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:#111;margin-bottom:6px; }

       .cd { font-size:.82rem;color:#6c757d;font-weight:500;line-height:1.5;margin-bottom:24px; }

       .carr { display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:700;color:var(--ca);transition:gap .3s ease; }

       .portal-c:hover .carr { gap:10px; }


 

       .stat-i { padding:0 32px;border-right:1px solid rgba(0,0,0,.08); }

       .stat-i:last-child { border-right:none; }

       .stat-n { font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#111;line-height:1; }

       .stat-l { font-size:.72rem;color:#adb5bd;font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:.5px; }


 

       .dash-p { background:rgba(255,255,255,.92);border:1px solid rgba(0,0,0,.07);border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.06); }

       .prev-bar { background:#f8f9fa;border-bottom:1px solid rgba(0,0,0,.06);padding:12px 20px;display:flex;align-items:center;gap:8px; }

       .tdot { width:10px;height:10px;border-radius:50%; }

       .mm { background:#f8f9fa;border:1px solid rgba(0,0,0,.05);border-radius:12px;padding:16px;flex:1; }

       .mmv { font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;line-height:1; }

       .mml { font-size:.68rem;color:#adb5bd;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;font-weight:600; }

       .cb { border-radius:4px 4px 0 0;animation:growU 1.5s cubic-bezier(.16,1,.3,1) forwards;transform-origin:bottom; }

       @keyframes growU{from{transform:scaleY(0)}to{transform:scaleY(1)}}

       .wl { stroke-dasharray:300;stroke-dashoffset:300;animation:drawW 2s ease-out forwards .5s; }

       @keyframes drawW{to{stroke-dashoffset:0}}


 

       .fpill { display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(255,255,255,.92);border:1px solid rgba(0,0,0,.08);border-radius:100px;font-size:.8rem;color:#495057;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.04); }


 

       .btn-coral { background:linear-gradient(135deg,#ff7e5f,#ff4757);border:none;border-radius:12px;color:#fff;font-weight:700;font-size:.9rem;padding:14px 28px;cursor:pointer;transition:all .3s ease; }

       .btn-coral:hover { transform:translateY(-2px);box-shadow:0 8px 25px rgba(255,126,95,.35);color:#fff; }

       .btn-ghost-l { background:transparent;border:1.5px solid rgba(0,0,0,.15);border-radius:12px;color:#495057;font-weight:600;font-size:.9rem;padding:13px 24px;cursor:pointer;transition:all .3s ease; }

       .btn-ghost-l:hover { background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.25);color:#111; }

       .btn-serving { background:linear-gradient(135deg,#20c997,#0beacb);border:none;border-radius:12px;color:#fff;font-weight:700;font-size:.9rem;padding:13px 24px;cursor:pointer;transition:all .3s ease; }

       .btn-serving:hover { transform:translateY(-2px);box-shadow:0 8px 25px rgba(32,201,151,.35);color:#fff; }


 

       .logo-m { width:36px;height:36px;background:linear-gradient(135deg,#ff7e5f,#ff6b6b);border-radius:10px;display:flex;align-items:center;justify-content:center; }


 

       @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

       .fi1{animation:fadeInUp .8s cubic-bezier(.16,1,.3,1) forwards}

       .fi2{animation:fadeInUp .8s cubic-bezier(.16,1,.3,1) .15s both}

       .fi3{animation:fadeInUp .8s cubic-bezier(.16,1,.3,1) .30s both}

       .fi4{animation:fadeInUp .8s cubic-bezier(.16,1,.3,1) .45s both}

       .nav-link-l {

         color: rgba(255,255,255,0.75);

         font-weight: 600;

         font-size: 0.92rem;

         text-decoration: none;

         transition: all 0.25s cubic-bezier(0.16,1,0.3,1);

         padding: 8px 16px;

         border-radius: 10px;

       }

       .nav-link-l:hover {

         color: #ff7e5f !important;

         background: rgba(255, 255,255,0.1);

       }

       

       .nav-link-l.active-section-indicator {

         color: #ffffff !important;

         background: #ff7e5f !important;

         box-shadow: 0 4px 12px rgba(255, 126, 95, 0.25);

       }

       .carousel-track-dr {

         display: flex;

         transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

         width: 100%;

       }

       .carousel-slide-dr {

         min-width: 100%;

         box-sizing: border-box;

         padding: 10px;

       }

       .carousel-arrow-btn {

         width: 40px;

         height: 40px;

         border-radius: 50%;

         background: #ffffff;

         border: 1px solid rgba(0,0,0,0.08);

         color: #212529;

         display: flex;

         align-items: center;

         justify-content: center;

         cursor: pointer;

         transition: all 0.2s ease;

         box-shadow: 0 4px 12px rgba(0,0,0,0.05);

         z-index: 10;

       }

       .carousel-arrow-btn:hover {

         background: #ff7e5f;

         color: #ffffff;

         transform: scale(1.05);

         border-color: #ff7e5f;

       }


 

       .contact-card-l {

         background: rgba(255, 255, 255, 0.85);

         border: 1px solid rgba(0, 0, 0, 0.06);

         border-radius: 16px;

         padding: 24px;

         transition: all 0.3s ease;

       }

       .contact-card-l:hover {

         transform: translateY(-4px);

         box-shadow: 0 12px 30px rgba(0,0,0,0.05);

         border-color: #ff7e5f;

       }

       

       html { scroll-behavior: smooth; }


 

       .dark-footer-card {

         background: rgba(30, 41, 59, 0.7); /* Deep slate glaze */

         border: 1px solid rgba(255, 255, 255, 0.06);

         border-radius: 20px;

         padding: 32px;

         transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

       }

       

       .dark-footer-card:hover {

         transform: translateY(-5px);

         background: rgba(30, 41, 59, 0.9);

         border-color: #ff7e5f;

         box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);

       }


 

       .footer-directory-link {

         color: #94a3b8;

         text-decoration: none;

         font-size: 0.88rem;

         font-weight: 500;

         transition: color 0.2s ease;

         display: block;

         margin-bottom: 10px;

       }


 

       .footer-directory-link:hover {

         color: #ff7e5f;

         padding-left: 4px;

       }


 

       @keyframes statusPulse {

         0% { opacity: 0.4; transform: scale(0.95); }

         50% { opacity: 1; transform: scale(1.05); }

         100% { opacity: 0.4; transform: scale(0.95); }

       }


 

       .analytics-glow-panel {

         background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%) !important; /* Deep dark obsidian slate */

         border: 1px solid rgba(255, 255, 255, 0.08) !important;

         border-radius: 28px !important;

         overflow: hidden;

         box-shadow: 0 30px 70px rgba(15, 23, 42, 0.45) !important;

         position: relative;

       }


 

       .analytics-glow-panel::before {

         content: '';

         position: absolute;

         top: -100px;

         left: -100px;

         width: 300px;

         height: 300px;

         background: radial-gradient(circle, rgba(255, 126, 95, 0.12) 0%, transparent 75%);

         pointer-events: none;

       }


 

       .dark-mm-box {

         background: rgba(255, 255, 255, 0.03) !important;

         border: 1px solid rgba(255, 255, 255, 0.05) !important;

         border-radius: 16px !important;

         padding: 20px;

         flex: 1;

         backdrop-filter: blur(5px);

         transition: all 0.3s ease;

       }

       .dark-mm-box:hover {

         background: rgba(255, 255, 255, 0.06) !important;

         border-color: rgba(255, 255, 255, 0.15) !important;

         transform: translateY(-2px);

       }


 

       .scroll-reveal-hidden {

         opacity: 0;

         transform: translateY(40px);

         transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);

       }

       .scroll-reveal-visible {

         opacity: 1;

         transform: translateY(0);

       }

     

       .hero-graphic-container {

         position: relative;

         width: 100%;

         height: 400px;

         display: flex;

         align-items: center;

         justify-content: center;

       }


 

       .floating-base-card {

         animation: floatBase 6s ease-in-out infinite;

         box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08) !important;

       }


 

       .floating-overlay-pass {

         animation: floatPass 5s ease-in-out infinite;

         box-shadow: 0 20px 40px rgba(255, 126, 95, 0.15) !important;

       }


 

       @keyframes floatBase {

         0%, 100% { transform: translateY(0) rotate(0deg); }

         50% { transform: translateY(-12px) rotate(1deg); }

       }


 

       @keyframes floatPass {

         0%, 100% { transform: translateY(0) rotate(-2deg); }

         50% { transform: translateY(-18px) rotate(-0.5deg); }

       }


 

       /* Feature pills */

    //  .feature-pill-light {

    //    display: inline-flex;

    //    align-items: center;

    //    gap: 8px;

    //    padding: 8px 16px;

    //    background: rgba(255,255,255,0.9);

    //    border: 1px solid rgba(0,0,0,0.08);

    //    border-radius: 100px;

    //    font-size: 0.8rem;

    //    color: #495057;

    //    font-weight: 600;

    //    box-shadow: 0 2px 8px rgba(0,0,0,0.04);

    //   }

    .feature-pill-light {

       display: inline-flex;

       align-items: center;

       gap: 8px;

       padding: 8px 16px;

       background: #ffffff;

       border: 1px solid #e2e8f0;

       border-radius: 100px;

       font-size: 0.85rem;

       font-weight:600;

       color: #334155 !important;

       box-shadow: 0 4px 12px rgba(15,23,42,0.03);

       transition: al 0.3s cubic-bezier(0.16,1,0.3,1);

       user-select:none;

       white-space:nowrap;

      }

      .feature-pill-light:hover{

        transform:translateY(-3px);

        background:#ffffff;

        border-color:#20c997;

        box-shadow:0 10px 25px rgba(32,201,151,0.12);

        color:#0f172a !important;

      }

     

     `}</style>


 

      <div className="orb-l orb-l-1" />

      <div className="orb-l orb-l-2" />

      <div className="orb-l orb-l-3" />

      <div className="grid-l" />


 

      <nav

        style={{


 

          position: 'fixed',

          top: 0,

          left: 0,

          right: 0,

          padding: '0 clamp(20px,5vw,60px)',

          background: 'rgba(15, 23, 42, 0.92)',

          backdropFilter: 'blur(20px) saturate(160%)',

          WebkitBackdropFilter: 'blur(20px) saturate(160%)',

          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',

          zIndex: 99999,

          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'

        }}

      >

        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => { navigate('/home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>

            <div className="logo-m">

              <FaClinicMedical style={{ color: '#fff', fontSize: '1rem' }} />

            </div>

            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-.5px' }}>

              ClinicQ

            </span>

          </div>


 

          {/* Navigation Action Array Links */}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

            <a href="/" className={`nav-link-l ${activeSection === 'home' ? 'active-section-indicator' : ''}`}

              onClick={(e) => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>

            <a href="#portal-selection-section" className={`nav-link-l ${activeSection === 'portals' ? 'active-section-indicator' : ''}`}>Portals</a>

            <a href="#about-us-section" className={`nav-link-l ${activeSection === 'about' ? 'active-section-indicator' : ''}`}>About Us</a>

            <a href="#analytics-section" className={`nav-link-l ${activeSection === 'analytics' ? 'active-section-indicator' : ''}`}>Analytics</a>

            <a href="#contact-us-section" className={`nav-link-l ${activeSection === 'contact' ? 'active-section-indicator' : ''}`}

            >Contact Us</a>

          </div>


 

        </div>

      </nav>




 

      <div className="cl" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,8vh,80px) clamp(20px,5vw,60px) 0', minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '80px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>


 

          {/* LEFT SIDE */}

          <div>

            <div className="fi1" style={{ marginBottom: '24px' }}>

              <span className="badge-l">Healthcare Management Platform</span>

            </div>


 

            <h1 className="hero-t fi2" style={{ marginBottom: '24px' }}>

              Smart Clinic<br />

              <span className="hero-a">Management</span><br />

              System

            </h1>


 

            <p className="fi3" style={{ fontSize: 'clamp(15px,2vw,17px)', color: '#6c757d', lineHeight: 1.7, marginBottom: '40px', fontWeight: 500 }}>

              A unified platform for clinics — streamlining appointments, queues, and patient records across every role.

            </p>


 

            {/* BUTTONS CONTROLS */}

            <div className="fi4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>

              <button className="btn-coral" onClick={() => window.location.href = '/patient-login'}>

                Book an Appointment →

              </button>

              <button className="btn-serving" onClick={() => window.open('/now-serving', '_blank')}>

                📢 Check Live Queue

              </button>

            </div>


 

            {/* Feature pills */}

            <div className="fade-in-4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', overflowX: 'auto', padding: '8px 4px', marginBottom: '60px', width: '100%' }}>

              {['Queue Management', 'Walk-in Registration', 'Smart Scheduling', 'Medical History', 'Real-time Status'].map(f => (

                <span key={f} className="feature-pill-light">

                  <span style={{ color: '#20c997', fontSize: '10px', lineHeight: 1 }}>●</span>

                  {f}

                </span>

              ))}

            </div>

          </div>


 

          {/* RIGHT SIDE */}

          <div className="fi3 hero-graphic-container" style={{ animationDelay: '0.2s' }}>


 

            {/* Matrix Base Sheet */}

            <div

              className="floating-base-card"

              style={{

                width: '85%',

                height: '280px',

                background: '#d5e40d',

                border: '1px solid rgba(0,0,0,0.06)',

                borderRadius: '24px',

                padding: '24px',

                position: 'absolute',

                left: '5%',

                top: '15%',

                zIndex: 1

              }}

            >

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>

                <span style={{ fontSize: '1.2rem' }}>📅</span>

                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.3px' }}>Doctor Consultations</span>

              </div>


 

              {[

                { time: "09:30 AM", pat: "Patient #1042", status: "Serving", color: "#20c997", bg: "rgba(32,201,151,0.08)" },

                { time: "10:15 AM", pat: "Patient #1043", status: "In Queue", color: "#ff7e5f", bg: "rgba(255,126,95,0.08)" },

                { time: "11:00 AM", pat: "Patient #1044", status: "Scheduled", color: "#64748b", bg: "#f1f5f9" }

              ].map((row, i) => (

                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                    <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>{row.time}</span>

                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{row.pat}</span>

                  </div>

                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: row.color, background: row.bg, padding: '4px 10px', borderRadius: '100px' }}>{row.status}</span>

                </div>

              ))}


 

            </div>


 

            {/* Token Pass */}

            <div

              className="floating-overlay-pass"

              style={{

                width: '65%',

                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',

                borderRadius: '20px',

                padding: '24px',

                position: 'absolute',

                right: '5%',

                bottom: '10%',

                zIndex: 2,

                color: '#ffffff'

              }}

            >

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>

                <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>LIVE TOKEN PASS</span>

                <span style={{ fontSize: '1.2rem' }}>🩺</span>

              </div>

              <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600 }}>CURRENT TOKEN NO.</div>

              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, margin: '2px 0 16px' }}>TKN-08</div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div>

                  <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>EST. WAIT TIME</div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>~ 12 Mins</div>

                </div>

                <span style={{ background: '#ffffff', color: '#059669', fontSize: '0.68rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>ACTIVE</span>

              </div>

            </div>


 

          </div>

        </div>

      </div>


 

      {/* PORTAL SELECTION */}

      <div id="portal-selection-section" className="cl" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(20px,5vw,60px) 100px', scrollMarginTop: '90px' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>

          {/* <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#adb5bd', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Select Your Portal</p> */}

          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#111', letterSpacing: '-1px', margin: 0 }}>Select Your Portal</h2>

        </div>


 

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>

          {[

            {

              label: 'Admin Portal', desc: 'Manage doctors, clinic rules, and view analytics', icon: '⚙️', accent: '#6a11cb',

              action: () => { setLoginRole('Admin'); window.open('/admin-login', '_blank'); }

            },

            {

              label: 'Patient Portal', desc: 'Book appointments, view history & passes', icon: '🩺', accent: '#ff7e5f',

              action: () => { window.open('/patient-login', '_blank'); }

            },

            {

              label: 'Doctor Console', desc: 'Manage your queue and patient consultations', icon: '👨‍⚕️', accent: '#0beacb',

              action: () => { window.open('/doctor-login', '_blank'); }

            },

            {

              label: 'Reception Desk', desc: 'Walk-ins, check-ins & live queue coordination', icon: '🏥', accent: '#f2994a',

              action: () => { window.open('/receptionist-login', '_blank'); }

            }

          ].map((p, i) => (

            <div key={i} className="portal-c" style={{ '--ca': p.accent } as any} onClick={p.action}>

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg,${p.accent},${p.accent}88)`, borderRadius: '20px 20px 0 0' }} />

              <div className="ci-w" style={{ background: `${p.accent}15`, color: p.accent, marginTop: '8px' }}>{p.icon}</div>

              <div className="ct">{p.label}</div>

              <div className="cd">{p.desc}</div>

              <div className="carr">Enter Portal <span style={{ fontSize: '1rem' }}>→</span></div>

            </div>

          ))}

        </div>

      </div>


 

      {/*  ABOUT US SECTION */}

      <div id="about-us-section" className="cl" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(20px,5vw,60px) 100px' }}>

        <div style={{ marginBottom: '48px', textAlign: 'center' }}>

          <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#adb5bd', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Medical Pioneers</p>

          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#111', letterSpacing: '-1px', margin: 0 }}>Meet Our Consultants</h2>

        </div>

        <DoctorCarousel />



 

      </div>


 

      <div

        id="analytics-section"

        className={`cl scroll-reveal-hidden ${isAnalyticsVisible ? 'scroll-reveal-visible' : ''}`}

        style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(20px,5vw,60px) 100px' }}

      >

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>

          <p style={{ fontSize: '.72rem', fontWeight: 700, color: '#adb5bd', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Live Platform Telemetry</p>

          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#111', letterSpacing: '-1px', margin: 0 }}>Clinic Intelligence Dashboard</h2>

        </div>


 

        <div className="analytics-glow-panel">

          <div className="prev-bar" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', padding: '14px 24px' }}>

            <div className="tdot" style={{ background: '#ff5f57', width: 11, height: 11 }} />

            <div className="tdot" style={{ background: '#ffbd2e', width: 11, height: 11 }} />

            <div className="tdot" style={{ background: '#28c840', width: 11, height: 11 }} />

            <span style={{ marginLeft: '12px', fontSize: '.75rem', color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>dashboard_preview.json</span>


 

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>

              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b' }} />

              <span style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>SAMPLE PREVIEW</span>

            </div>

          </div>


 

          <div style={{ padding: '32px 32px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px' }}>

            {[

              { val: '142', label: 'Total Handled', color: '#ff7e5f' },

              { val: '38', label: 'Walk-in Sessions', color: '#c471ed' },

              { val: '97', label: 'Checked Out', color: '#20c997' },

              { val: '7', label: 'Unattended', color: '#ff4757' }

            ].map((m, i) => (

              <div key={i} className="dark-mm-box">

                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: m.color, lineHeight: 1 }}>{m.val}</div>

                <div style={{ fontSize: '.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: '8px', fontWeight: 600 }}>{m.label}</div>

              </div>

            ))}

          </div>



 

          <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px' }}>

              <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '20px' }}>Specialty Operational Breakdown</div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '100px', paddingBottom: '8px' }}>

                {[

                  { h: '60%', c: '#ff7e5f', l: 'GEN' },

                  { h: '90%', c: '#c471ed', l: 'CARD' },

                  { h: '40%', c: '#f2994a', l: 'ORTH' },

                  { h: '70%', c: '#20c997', l: 'PED' }

                ].map((b, i) => (

                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>

                    <div className="cb" style={{ width: '100%', height: isAnalyticsVisible ? b.h : '0%', background: `linear-gradient(180deg, ${b.c}40 0%, ${b.c}10 100%)`, borderTop: `2px solid ${b.c}`, transition: 'all 1.2s ease-out', transitionDelay: `${i * 150}ms` }} />

                    <span style={{ fontSize: '.6rem', color: '#475569', fontWeight: 700, fontFamily: 'monospace' }}>{b.l}</span>

                  </div>

                ))}

              </div>

            </div>


 

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px' }}>

              <div style={{ fontSize: '.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '20px' }}>Visits Interval Progression</div>

              <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100px' }}>

                <defs>

                  <linearGradient id="neonWaveGrad" x1="0" y1="0" x2="1" y2="0">

                    <stop offset="0%" stopColor="#ff7e5f" />

                    <stop offset="50%" stopColor="#ff4757" />

                    <stop offset="100%" stopColor="#c471ed" />

                  </linearGradient>

                </defs>

                <path d="M0,60 Q30,20 50,40 T100,25 T150,45 T200,15" fill="none" stroke="url(#neonWaveGrad)" strokeWidth="3" style={{ strokeDasharray: 300, strokeDashoffset: isAnalyticsVisible ? 0 : 300, transition: 'stroke-dashoffset 2s ease-out 0.3s' }} strokeLinecap="round" />

                <path d="M0,60 Q30,20 50,40 T100,25 T150,45 T200,15 L200,80 L0,80 Z" fill="url(#neonWaveGrad)" fillOpacity={isAnalyticsVisible ? "0.05" : "0"} style={{ transition: 'fill-opacity 1s ease 2s' }} />

              </svg>

            </div>


 

          </div>

        </div>

      </div>


 

      {/* CONTACT FOOTER PANEL */}

      <div

        id="contact-us-section"

        style={{

          background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',

          color: '#ffffff',

          padding: '80px 0 0 0',

          borderTop: '1px solid rgba(255, 255, 255, 0.05)',

          marginTop: '40px'

        }}

      >

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(20px,5vw,60px)' }}>


 

          {/* Section Header */}

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>

            <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#ff7e5f', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>

              Access Channels

            </p>

            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', margin: 0 }}>

              Connect with ClinicQ

            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '10px', fontWeight: 500 }}>

              Reach our medical assistance officers and administration desk instantly.

            </p>

          </div>


 

          {/* Column Directory Layout */}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '60px' }}>


 

            {/* Core Clinical Hours */}

            <div className="dark-footer-card">

              <div style={{ fontSize: '2rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 10px rgba(242,153,74,0.3))' }}>⏰</div>

              <h5 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Practice Hours</h5>

              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '8px', fontWeight: 500 }}>

                <strong style={{ color: '#f8fafc' }}>Mon - Fri:</strong> 08:00 AM - 08:00 PM

              </p>

              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '0', fontWeight: 500 }}>

                <strong style={{ color: '#f8fafc' }}>Sat - Sun:</strong> 09:00 AM - 04:00 PM

              </p>

            </div>


 

            {/* Direct Helplines */}

            <div className="dark-footer-card">

              <div style={{ fontSize: '2rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 10px rgba(255,126,95,0.3))' }}>📞</div>

              <h5 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Emergency Links</h5>

              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '8px', fontWeight: 500 }}>

                <strong style={{ color: '#f8fafc' }}>Primary Line:</strong> +91 44 2747 4000

              </p>

              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '0', fontWeight: 500 }}>

                <strong style={{ color: '#f8fafc' }}>Support Mail:</strong> helpdesk@clinicq.org

              </p>

            </div>


 

            <div className="dark-footer-card">

              <div style={{ fontSize: '2rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 10px rgba(32,201,151,0.3))' }}>📍</div>

              <h5 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Medical Hub</h5>

              <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>

                ClinicQ Primary Medical Hub,<br />

                Electronics City<br />

                Hosur Road<br />

                Bengaluru 560100.

              </p>

            </div>


 

            <div className="dark-footer-card">

              <div style={{ fontSize: '2rem', marginBottom: '16px', filter: 'drop-shadow(0 4px 10px rgba(99,102,241,0.3))' }}>🧭</div>

              <h5 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Quick Links</h5>

              <div style={{ transition: 'all 0.2s' }}>

                <a href="#" className="footer-directory-link" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>↑ Return to Top</a>

                <a href="#portal-selection-section" className="footer-directory-link">Clinical Portals</a>

                <a href="#about-us-section" className="footer-directory-link">Our Consultants</a>

                <a href="#analytics-section" className="footer-directory-link">Live Platform Metrics</a>

              </div>

            </div>

          </div>

        </div>


 

        <div style={{

          background: '#ff7e5f',

          color: '#ffffff',

          padding: '20px clamp(20px,5vw,60px)',

          textAlign: 'center',

          fontSize: '0.88rem',

          fontWeight: 500,

          lineHeight: '1.6',

          letterSpacing: '0.3px',

          width: '100%',

          boxSizing: 'border-box',

          marginTop: '40px',

          marginBottom: 'none',

          fontFamily: "'Segoe UI',Roboto,sans-serif",

          borderBottom: 'none'

        }}>Copyright © 2026 ClinicQ Diagnostics (ClinicQ Health and Lifestyle Limited),

          <br />All Rights Reserved.</div>

      </div>


 

    </div>

  );

};



 

const PatientPortalWrapper: React.FC = () => {

  const [patientSubView, setPatientSubView] = useState<'book' | 'my' | 'history' | 'token'>('book');

  return (

    <>

      {patientSubView === 'book' && <BookAppointment onNavigate={setPatientSubView} />}

      {patientSubView === 'my' && <MyAppointments onNavigate={setPatientSubView} />}

      {patientSubView === 'history' && <PastHistory onNavigate={setPatientSubView} />}

      {patientSubView === 'token' && <PatientToken onNavigate={setPatientSubView} />}

    </>

  );

};


 

// MAIN APP (routing)

function App() {

  const [loginRole, setLoginRole] = useState('');

  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);


 

  return (

    <Router>

      <Suspense fallback={

        <div style={{

          display: 'flex',

          flexDirection: 'column',

          alignItems: 'center',

          justifyContent: 'center',

          minHeight: '100vh',

          background: 'radial-gradient(circle at center,#f8f9fa 0%,#e9ecef 100%)',

          fontFamily: "'Segoe UI',Roboto,sans-serif"

        }}>

          <div style={{

            width: '64px',

            height: '64px',

            border: '4px solid rgba(32,201,151,0.1)',

            borderTopColor: '#20c997',

            borderRadius: '50%',

            animation: 'spin 1s linear infinite'

          }} />

          <h5 style={{ marginTop: '24px', color: '#1e293b', fontWeight: 700, letterSpacing: '-0.3px', margin: '16px 0 4px' }}>Loading ClinicQ Console</h5>

          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, fontWeight: 500 }}>Decrypting isolated system views...</p>

          <style>{`

          @keyframes spin { to { transform: rotate(360deg);}}

        `}</style>

        </div>

      }>

        <Routes>

          <Route path="/" element={<HomePage setLoginRole={setLoginRole} />} />

          <Route path="/admin-login" element={<Login onLogin={() => window.location.href = '/admin'} />} />

          <Route path="/patient-login" element={

            <PatientLogin

              onLogin={() => window.location.href = '/patient'}

              onGoToRegister={() => window.location.href = '/patient-register'}

              onReturnHome={() => window.location.href = '/'}


 

            />

          } />

          <Route path="/patient-register" element={

            <PatientRegister />

          } />

          <Route path="/doctor-login" element={<DoctorLogin onLogin={() => window.location.href = '/doctor'} />} />

          <Route path="/receptionist-login" element={<ReceptionistLogin onLogin={() => window.location.href = '/receptionist'} />} />

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/patient" element={<PatientPortalWrapper />} />

          <Route path="/doctor" element={<DoctorDashboard />} />

          <Route path="/receptionist" element={<ReceptionistDashboard />} />

          <Route path="/now-serving" element={<NowServing />} />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </Suspense>

    </Router>

  );

}


 

export default App;