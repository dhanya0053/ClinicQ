import React from 'react';

import { FaRightFromBracket } from 'react-icons/fa6';

import { FaClinicMedical } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

interface SidebarProps {

    activeTab: string;

    setActiveTab: (tab: 'scheduling' | 'rules' | 'analytics') => void;

}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {

    const navigate = useNavigate();

    return (

       

        <div className="d-flex flex-column p-3 border-end shadow-sm"

            style={{

                width: '260px',

                minHeight: '100vh',

                background: '#ffffff',

                borderColor: '#f1f3f5 !important'

            }}>

            <div className="d-flex align-items-center mb-5 ps-2 pt-2" style={{ cursor: 'pointer' }}>

                <div style={{ width:'36px',height:'36px',

                    background:'linear-gradient(135deg,#ff7e5f,#ff6b6b)',

                    borderRadius:'10px',

                    display:'flex',

                    alignItems:'center',

                    justifyContent:'center',

                    marginRight: '12px' }}>

                    <FaClinicMedical style={{ color: '#fff', fontSize: '1rem' }} />

                </div>

                <h4 className="fw-bold mb-0" style={{ color: '#111' }}>ClinicQ</h4>

            </div>

            {/*  NAVIGATION LINKS */}

            <ul className="nav flex-column gap-2">

                {[

                    { id: 'scheduling', label: 'Doctor Scheduling', icon: '📅' },

                    { id: 'rules', label: 'Clinic Rules', icon: '⚙️' },

                    { id: 'analytics', label: 'Analytics', icon: '📊' }

                ].map((item) => (

                    <li className="nav-item" key={item.id}>

                        <button

                            className="btn w-100 text-start d-flex align-items-center gap-3 px-3 py-2 border-0"

                            style={{

                                borderRadius: '14px',

                                transition: 'all 0.2s ease',

                                background: activeTab === item.id ? 'rgba(255, 126, 95, 0.1)' : 'transparent',

                                color: activeTab === item.id ? '#ff7e5f' : '#6c757d',

                                fontWeight: activeTab === item.id ? '700' : '600',

                            }}

                            onClick={() => setActiveTab(item.id as any)}>

                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>

                            <span style={{ fontSize: '0.9rem' }}>{item.label}</span>

                        </button>

                    </li>

                ))}

                {/* Log Out Button Section */}

                <li className="nav-item mt-4 pt-4 border-top" style={{ borderColor: '#f8f9fa !important' }}>

                    <button

                        onClick={() => { localStorage.removeItem("token"); navigate('/'); }}

                        className="btn w-100 text-start d-flex align-items-center gap-3 px-3 py-2 border-0 text-danger opacity-75"

                        style={{ borderRadius: '14px', transition: 'all 0.2s ease', color: '#dc3545 !important' }}

                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(227, 62, 79, 0.05)'}

                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>

                        <FaRightFromBracket style={{ fontSize: '1.1rem' }} />

                        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Log Out</span>

                    </button>

                </li>

            </ul>

            {/* footer */}

            <div className="mt-auto ps-1 pb-2">

                <div className="p-3 rounded-4" style={{ background: '#f8f9fa' }}>

                    <small className="text-muted d-block fw-bold opacity-75" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>

                        Admin Control

                    </small>

                    <small style={{ fontSize: '11px', color: '#adb5bd', fontWeight: '500' }}>

                        v2.0.4 • 2026 Stable

                    </small>

                </div>

            </div>

        </div>

    );

};

export default Sidebar;