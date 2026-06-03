import React from 'react';

import { useNavigate } from 'react-router-dom';

import { FaClinicMedical } from 'react-icons/fa';

interface NavbarProps {

    activeTab: string;

    onNavigate: (tab: 'book' | 'my' | 'history' | 'token') => void;

}

const PatientNavbar: React.FC<NavbarProps> = ({ activeTab, onNavigate }) => {

    const navigate = useNavigate();

    return (

        <nav className="navbar navbar-expand-lg sticky-top shadow-sm"

            style={{

                background: 'rgba(255, 255, 255, 0.8)',

                backdropFilter: 'blur(20px)',

                WebkitBackdropFilter: 'blur(20px)',

                borderBottom: '1px solid rgba(0, 0, 0, 0.05)'

            }}>

            <div className="container px-4">

                {/* LOGO - Matching Landing Page Branding */}

                {/* <div className="navbar-brand d-flex align-items-center"

                    style={{ cursor: 'pointer' }}

                    onClick={() => onNavigate('book')}>


 

                    <div className="logo-m">

                        <FaClinicMedical style={{ color: '#fff', fontSize: '1rem' }} />

                    </div>

                    <span className="fw-bold" style={{ color: '#111', letterSpacing: '0.5px' }}>ClinicQ</span>

                </div> */}


 

                {/* Brand Logo Anchor */}

                <div className="navbar-brand d-flex align-items-center"

                    style={{ cursor: 'pointer' }}

                    onClick={() => onNavigate('book')}>

                    <div className="logo-m">

                        <FaClinicMedical style={{ color: '#fff', fontSize: '1rem' }} />

                    </div>

                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-.5px' }}>

                        ClinicQ

                    </span>

                </div>

                {/* MOBILE MENU BUTTON */}

                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#patientNav">

                    <span className="navbar-toggler-icon"></span>

                </button>

                {/* NAV LINKS */}

                <div className="collapse navbar-collapse" id="patientNav">

                    <ul className="navbar-nav ms-auto gap-2 align-items-center">

                        <li className="nav-item">

                            <button

                                className="nav-link btn border-0 px-3 py-2"

                                onClick={() => onNavigate('book')}

                                style={{

                                    borderRadius: '10px',

                                    transition: 'all 0.3s ease',

                                    color: activeTab === 'book' ? '#ff7e5f' : '#6c757d',

                                    fontWeight: activeTab === 'book' ? '700' : '500',

                                    background: activeTab === 'book' ? 'rgba(255, 126, 95, 0.08)' : 'transparent'

                                }}>

                                📅 Book Appointment

                            </button>

                        </li>

                        <li className="nav-item">

                            <button

                                className="nav-link btn border-0 px-3 py-2"

                                onClick={() => onNavigate('my')}

                                style={{

                                    borderRadius: '10px',

                                    transition: 'all 0.3s ease',

                                    color: activeTab === 'my' ? '#ff7e5f' : '#6c757d',

                                    fontWeight: activeTab === 'my' ? '700' : '500',

                                    background: activeTab === 'my' ? 'rgba(255, 126, 95, 0.08)' : 'transparent'

                                }}>

                                📋 My Appointments

                            </button>

                        </li>

                        {/* 3. HISTORY TAB */}

                        <li className="nav-item">

                            <button

                                className="nav-link btn border-0 px-3 py-2"

                                onClick={() => onNavigate('history')}

                                style={{

                                    borderRadius: '10px',

                                    transition: 'all 0.3s ease',

                                    color: activeTab === 'history' ? '#ff7e5f' : '#6c757d',

                                    fontWeight: activeTab === 'history' ? '700' : '500',

                                    background: activeTab === 'history' ? 'rgba(255, 126, 95, 0.08)' : 'transparent'

                                }}>

                                🕒 History

                            </button>

                        </li>

                        {/* 4. TOKEN NO TAB */}

                        <li className="nav-item">

                            <button

                                className="nav-link btn border-0 px-3 py-2"

                                onClick={() => onNavigate('token')}

                                style={{

                                    borderRadius: '10px',

                                    transition: 'all 0.3s ease',

                                    color: activeTab === 'token' ? '#ff7e5f' : '#6c757d',

                                    fontWeight: activeTab === 'token' ? '700' : '500',

                                    background: activeTab === 'token' ? 'rgba(255, 126, 95, 0.08)' : 'transparent'

                                }}>

                                🎟️ Token No

                            </button>

                        </li>

                        {/* Profile Indicator */}

                        <li className="nav-item ms-lg-3">

                            <div className="rounded-circle border d-flex align-items-center justify-content-center"

                                id='profileDropdown'

                                data-bs-toggle="dropdown"

                                aria-expanded="false"

                                style={{

                                    width: '38px',

                                    height: '38px',

                                    background: '#f8f9fa',

                                    cursor: 'pointer',

                                    transition: 'all 0.2s'

                                }}

                                onMouseOver={(e) => e.currentTarget.style.background = '#eee'}

                                onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}

                            >

                                <span style={{ fontSize: '1.1rem' }}>👤</span>

                            </div>

                            {/* <ul className='dropdown-menu dropdown-menu-end border-0 shadow mt-2 p-2'

                            aria-labelledby='profileDropdown'

                            style={{ borderRadius:'12px',minWidth:'150px'}}>

                                <li>

                                    <button className='dropdown-item btn text-danger fw-bold rounded-3 py-2 d-flex align-items-center gap-2'

                                    onClick={handleLogOut}

                                    style={{ fontSize:'13px'}}>

                                        <span>📤</span> Log Out

                                    </button>

                                </li>

                            </ul> */}

                        </li>

                    </ul>

                </div>

            </div>

        </nav>

    );

};


 

export default PatientNavbar;