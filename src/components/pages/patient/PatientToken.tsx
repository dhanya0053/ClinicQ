import React, { useState, useEffect } from 'react';

import { FaCheckCircle, FaHourglassHalf, FaClinicMedical } from 'react-icons/fa';

import axiosInstance from '../../../services/axiosInstance';

import { useNavigate } from 'react-router-dom';

interface TokenProps {

    onNavigate: (tab: 'book' | 'my' | 'history' | 'token') => void;

}



 

interface TokenData {

    patientId: string;

    name: string;

    tokenDisplay: string;

    position: number;

    status: 'BOOKED' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW';

    doctorName: string;

    department: string;

    estimatedWaitTime: number;

    timestamp: string;

    paused?: boolean | number;

}


 

const PatientToken: React.FC<TokenProps> = ({ onNavigate }) => {

    const navigate = useNavigate();

    const [tokenData, setTokenData] = useState<TokenData | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {

            setError("Please log in to view your queue status.");

            setLoading(false);

            return;

        }

        const fetchTokenStatus = async () => {

            try {

                if (loading) setLoading(true);

                const response = await axiosInstance.get(`/clinicq/patient/queue-position`);

                setTokenData(response.data);

                setError(null);

            } catch (err: any) {

                console.error("Queue positioning data fetch error:", err);

                if (err.response?.status === 404 || err.response?.status === 400) {

                    try {

                        const apptRes = await axiosInstance.get('/clinicq/patient/appointments');

                        const activeAppt = Array.isArray(apptRes.data)

                            ? apptRes.data.find((a: any) => a.status === 'BOOKED' || a.status === 'CONFIRMED')

                            : null;

                        if (activeAppt) {

                            setTokenData({

                                patientId: String(activeAppt.patient?.id || ""),

                                name: activeAppt.patient?.name || "Patient",

                                tokenDisplay: "",

                                position: 0,

                                status: 'BOOKED',

                                doctorName: activeAppt.doctor?.name || "Assigned Doctor",

                                department: activeAppt.doctor?.department || "Medical Department",

                                estimatedWaitTime: 0,

                                timestamp: activeAppt.createdAt || new Date().toISOString(),

                                paused: false

                            });

                            setError(null);

                        } else {

                            setError("No active bookings or token information found.");

                        }

                    } catch (apptErr) {

                        setError("No active consultation token tracking information found.");

                    }

                } else {

                    setError("System connection issue. Please refresh or try again.");

                }

            } finally {

                setLoading(false);

            }

        };

        fetchTokenStatus();

        // Auto updates queue position numbers every 15 seconds

        const pollInterval = setInterval(fetchTokenStatus, 15000);

        return () => clearInterval(pollInterval);

    }, []);


 

    const steps = [

        { label: 'Booked', status: 'BOOKED', icon: '📅' },

        { label: 'Waiting', status: 'WAITING', icon: '⏳' },

        { label: 'In-Consultation', status: 'IN_CONSULTATION', icon: '👨‍⚕️' },

        {

            label: tokenData?.status === 'NO_SHOW' ? 'No-Show' : 'Completed',

            status: tokenData?.status === 'NO_SHOW' ? 'NO_SHOW' : 'COMPLETED',

            icon: tokenData?.status === 'NO_SHOW' ? '❌' : '✅'

        }


 

    ];


 

    const currentStatus = tokenData?.status ? tokenData.status : 'BOOKED';


 

    const getStatusIndex = (status: string) => {

        if (!tokenData?.tokenDisplay || status === 'BOOKED') {

            return 0;

        }

        if (status === 'CHECKED_IN') return 1;

        if (status === 'NO_SHOW') return 3;

        return steps.findIndex(s => s.status === status);

    };


 

    const currentIndex = getStatusIndex(currentStatus);


 

    return (

        <div className="d-flex min-vh-100 overflow-hidden" style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

            <style>

                {`

               .glass-card-token { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

               .step-dot { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2; transition: all 0.4s ease; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

               .step-line { position: absolute; top: 20px; height: 4px; background: #dee2e6; z-index: 1; transition: all 0.4s ease; }

               .active-pulse { animation: pulseGlow 2s infinite; background: #ff7e5f !important; color: white !important; }

               @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(255, 126, 95, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(255, 126, 95, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 126, 95, 0); } }

               .logout-btn:hover { background:rgba(220,53,69,0.1) !important; color: #dc3545 !important; }

               .no-show-pulse { animation: pulseRedGlow 2s infinite; background: #decece !important; color: white !important; }

               .logo-m { width:36px;height:36px;background:linear-gradient(135deg,#ff7e5f,#ff6b6b);border-radius:10px;display:flex;align-items:center;justify-content:center; }


 

               @keyframes pulseRedGlow { 0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(255, 107, 107, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); } }


 

               `}

            </style>


 

            {/* SIDEBAR */}

            <div className="bg-white border-end p-3 d-flex flex-column shadow-sm" style={{ width: '240px' }}>

                <div className="d-flex align-items-center mb-4 mt-2 ps-2" style={{ cursor: 'pointer' }}

                    onClick={() => onNavigate('book')}>

                    <div className="logo-m" style={{ marginRight: '12px' }}>

                        <FaClinicMedical style={{ color: '#fff', fontSize: '1rem' }} />

                    </div>

                    <h4 className="fw-bold mb-0" style={{ color: '#111' }}>ClinicQ</h4>

                </div>


 

                <div className="nav flex-column gap-2">

                    <button onClick={() => onNavigate('book')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">📅 Book Appointment</button>

                    <button onClick={() => onNavigate('my')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">📋 My Appointments</button>

                    <button onClick={() => onNavigate('history')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">🕒 History</button>

                    <button onClick={() => onNavigate('token')} className="btn text-start py-2 px-3 border-0 fw-bold" style={{ background: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f', borderRadius: '12px' }}>🎟️ Token No</button>


 

                    <div className="mt-auto pt-4 border-top">

                        <button onClick={() => { localStorage.removeItem("token"); navigate('/'); }} className="btn w-100 d-flex align-items-center gap-2 fw-bold logout-btn text-danger border-0 py-2 style={{fontSize:'13px'}}" ><span>📤</span> Log Out</button>

                    </div>

                </div>

            </div>


 

            {/* content */}

            <div className="flex-grow-1 p-4 overflow-auto">

                <h3 className="fw-bold mb-4">Queue Status</h3>

                <div className="row justify-content-center mt-2">

                    <div className="col-lg-8">

                        {loading ? (

                            <div className="text-center py-5">

                                <div className="spinner-border text-warning" role="status"></div>

                                <p className="mt-2 fw-bold text-muted">Retrieving live queue position data...</p>

                            </div>

                        ) : error ? (

                            <div className="glass-card-token p-5 text-center">

                                <span className="fs-1">🎟️</span>

                                <h5 className="fw-bold mt-3 text-muted">{error}</h5>

                                <p className="small text-muted">Book an intake check-in or visit registration desk to retrieve a token status journey.</p>

                            </div>

                        ) : (

                            <>

                                {/* TICKET */}

                                <div className="glass-card-token  shadow-lg overflow-hidden position-relative mb-4">

                                    <div style={{ height: '8px', background: 'linear-gradient(90deg, #ff7e5f, #ff6b6b)' }}></div>

                                    <div className="p-5 text-center">

                                        <span className="badge rounded-pill px-3 py-2 mb-3" style={{ background: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f', fontWeight: '700', fontSize: '15px' }}>

                                            PATIENT NAME : {tokenData?.name ? tokenData.name.toUpperCase() : "RETRIEVING PROFILE..."}

                                        </span>


 

                                        {/* Checks if tokenDisplay exists AND status is not a fresh BOOKED state */}

                                        <h1 className="display-4 fw-bold mb-0 mt-2" style={{ color: (tokenData?.tokenDisplay && currentStatus !== 'BOOKED') ? '#111111' : '#ff6b6b', letterSpacing: '-1px' }}>

                                            {(tokenData?.tokenDisplay && currentStatus !== 'BOOKED') ? tokenData.tokenDisplay : "Not yet checked_in"}

                                        </h1>


 

                                        {(tokenData?.paused === true || tokenData?.paused === 1) && (

                                            <div className='animate-in'

                                                style={{

                                                    background: 'linear-gradient(135deg,rgba(239,68,68,0.1) 0%,rgba(245,158,11,0.1) 100%)',

                                                    border: '1px solid rgba(239,68,68,0.2)',

                                                    color: '#dc2626',

                                                    borderRadius: '12px',

                                                    padding: '12px 16px',

                                                    marginTop: '16px',

                                                    display: 'flex',

                                                    alignItems: 'center',

                                                    justifyContent: 'center',

                                                    gap: '10px',

                                                    fontWeight: '700',

                                                    fontSize: '0.92rem',

                                                    boxShadow: '0 4px 15px rgba(220,38,38,0.05)'

                                                }}>

                                                <span style={{

                                                    width: '8px',

                                                    height: '8px',

                                                    background: '#dc2626',

                                                    borderRadius: '50%',

                                                    display: 'inline-block'

                                                }}></span>

                                                Doctor is currently on a temporary break mode.Queue processing will resume shortly.

                                            </div>

                                        )}


 

                                        {/* queue position status */}

                                        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">

                                            <div className="badge bg-dark px-3 py-2 rounded-pill small" style={{ fontSize: '14px' }}>

                                                Position No : {(tokenData?.tokenDisplay && currentStatus !== 'BOOKED') ? tokenData.position : "Not Checked-In"}

                                            </div>

                                            <div className="badge bg-warning-subtle text-warning-emphasis px-3 py-2 rounded-pill small d-flex align-items-center gap-1" style={{ fontSize: '14px' }}>

                                                <FaHourglassHalf /> Est. Wait Time: {(tokenData?.tokenDisplay && currentStatus !== 'BOOKED') ? `${tokenData.estimatedWaitTime} mins` : "--"}

                                            </div>

                                        </div>


 

                                        <p className="text-muted small mt-3"></p>


 

                                        <div className="d-flex justify-content-center gap-4 border-top mt-4 pt-4">

                                            <div className="text-start">

                                                <small className="text-muted fw-bold d-block text-uppercase" style={{ fontSize: '9px' }}>Doctor</small>

                                                <span className="fw-bold">{tokenData?.doctorName}</span>

                                            </div>

                                            <div className="vr"></div>

                                            <div className="text-start">

                                                <small className="text-muted fw-bold d-block text-uppercase" style={{ fontSize: '9px' }}>Department</small>

                                                <span className="fw-bold">{tokenData?.department}</span>

                                            </div>

                                        </div>

                                    </div>

                                </div>


 

                                {/* TIMELINE */}

                                <div className="glass-card-token p-5 shadow-sm">

                                    <h6 className="fw-bold text-muted small text-uppercase mb-4">Visit Journey</h6>


 

                                    <div className="position-relative d-flex justify-content-between align-items-center px-2">

                                        <div className="step-line w-100"></div>

                                        <div className="step-line" style={{

                                            width: currentStatus === 'NO_SHOW'

                                                ? '100%'

                                                : currentIndex >= 0

                                                    ? `${(currentIndex / (steps.length - 1)) * 100}%`

                                                    : '0%',

                                            background: currentStatus === 'NO_SHOW' ? '#ff6b6b' : '#ff7e5f'

                                        }}

                                        ></div>

                                        {steps.map((step, index) => {

                                            // const isCompleted = index < currentIndex;

                                            const isCompleted = currentStatus === 'NO_SHOW'

                                                ? (index === 0 || index === 1) // Only Booked and Waiting are completed

                                                : index < currentIndex;


 

                                            const isActive = index === currentIndex;


 

                                            const pulseClass = isActive

                                                ? (currentStatus === 'NO_SHOW' ? 'no-show-pulse' : 'active-pulse')

                                                : '';


 

                                            return (

                                                <div key={step.status} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>

                                                    <div className={`step-dot ${pulseClass}`}

                                                        style={{

                                                            background: isCompleted ? '#ff7e5f'

                                                                : (isActive && currentStatus === 'NO_SHOW')

                                                                    ? '#ff6b6b'

                                                                    : '#fff',

                                                            color: isCompleted ? '#fff' : '#6c757d',

                                                            border: isCompleted || isActive ? 'none' : '2px solid #dee2e6'

                                                        }}>

                                                        {isCompleted ? <FaCheckCircle /> : step.icon}

                                                    </div>

                                                    <span className={`mt-3 small fw-bold ${isActive ? 'text-dark' : 'text-muted'}`}

                                                        style={{ position: 'absolute', top: '40px', whiteSpace: 'nowrap', fontSize: '10px' }}>

                                                        {step.label}

                                                    </span>

                                                </div>

                                            );

                                        })}

                                    </div>

                                </div>

                            </>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

};


 

export default PatientToken;