import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';

import { useNavigate } from 'react-router-dom';

import { FaClinicMedical } from 'react-icons/fa';


 

interface MyProps {

  onNavigate: (tab: 'book' | 'my' | 'history' | 'token') => void;

}


 

const MyAppointments: React.FC<MyProps> = ({ onNavigate }) => {

  const navigate=useNavigate();

  const [appointments, setAppointments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);


 

  useEffect(() => {

    const fetchAllAppointments = async () => {

      try {

        const response = await axiosInstance.get(`/clinicq/patient/appointments`);

        setAppointments(response.data);

      } catch (err) {

        console.error("error fetching all appointments");

      } finally {

        setLoading(false);

      }

    };

    fetchAllAppointments();

  }, []);


 

  return (

    <div className="d-flex min-vh-100 overflow-hidden"

      style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      <style>

        {`

          .glass-ticket {

            background: rgba(255, 255, 255, 0.7);

            backdrop-filter: blur(25px);

            -webkit-backdrop-filter: blur(25px);

            border: 1px solid rgba(0, 0, 0, 0.05);

            border-radius: 24px;

            transition: transform 0.2s ease, box-shadow 0.2s ease;

            min-height: 140px;

          }

          .glass-ticket:hover {

            transform: translateY(-3px);

            box-shadow: 0 12px 30px rgba(0,0,0,0.06);

          }

          .perforation-top, .perforation-bottom {

            position: absolute;

            width: 24px;

            height: 24px;

            background: #f1f3f5;

            border-radius: 50%;

            left: 31%;

            z-index: 2;

          }

          .perforation-top { top: -12px; }

          .perforation-bottom { bottom: -12px; }

          .ticket-divider {

            border-left: 2px dashed rgba(0,0,0,0.1);

            height: 70%;

          }

          .logout-btn{

            transition: all 0.2s ease;

            border-radius:12px !important;

            background:transparent;

          }

          .logout-btn:hover{

            background:rgba(220,53,69,0.1) !important;

            color: #dc3545 !important;

          }

          .logout-btn:active{

            background: rgba(220,53,69,0.2) !important ;

            transform:scale(0.96);

          }

          .logo-m { width:36px;height:36px;background:linear-gradient(135deg,#ff7e5f,#ff6b6b);border-radius:10px;display:flex;align-items:center;justify-content:center; }

       

        `}

      </style>


 

      {/* SIDEBAR */}

      <div className="bg-white border-end p-3 d-flex flex-column shadow-sm" style={{ width: '240px' }}>

        <div className="d-flex align-items-center mb-4 mt-2 ps-2" style={{ cursor: 'pointer' }}

            onClick={() => onNavigate('book')}>

            <div className="logo-m" style={{ marginRight:'12px'}}>

              <FaClinicMedical style={{ color: '#fff', fontSize: '1rem'}} />

            </div>

            <h4 className="fw-bold mb-0" style={{ color: '#111' }}>ClinicQ</h4>

        </div>

        <div className="nav flex-column gap-2">

          <button onClick={() => onNavigate('book')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">📅 Book Appointment</button>

          <button onClick={() => onNavigate('my')} className="btn text-start py-2 px-3 border-0 fw-bold" style={{ background: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f', borderRadius: '12px' }}>📋 My Appointments</button>

          <button onClick={() => onNavigate('history')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">🕒 History</button>

          <button onClick={() => onNavigate('token')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">🎟️ Token No</button>

          <div className="mt-auto pt-4 border-top">

            <button onClick={() => { localStorage.removeItem("token"); navigate('/') }} className="btn w-100 d-flex align-items-center gap-2 fw-bold logout-btn text-danger border-0 py-2 style={{fontSize:'13px'}}"

              ><span>📤</span> Log Out</button>

          </div>

        </div>

      </div>


 

      {/* MAIN CONTENT */}

      <div className="flex-grow-1 p-4 h-100 overflow-auto">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2 className="fw-bold m-0" style={{ color: '#111' }}>My Virtual Passes</h2>

          <button onClick={() => onNavigate('book')} className="btn rounded-pill px-4 fw-bold shadow-sm text-white" style={{ background: '#ff7e5f' }}>+ NEW BOOKING</button>

        </div>

        {loading ? (

          <div className="text-center mt-5 py-5">

            <div className="spinner-border" style={{ color: '#ff7e5f' }} role="status"></div>

            <p className="mt-3 text-muted fw-bold">Retrieving your passes...</p>

          </div>

        ) : (

          <div className="d-flex flex-column gap-4" style={{ maxWidth: '950px' }}>

            {appointments.length > 0 ? (

              appointments.map((app) => (

                <div key={app.id} className="position-relative d-flex glass-ticket p-0 overflow-hidden">

                  <div className="perforation-top"></div>

                  <div className="perforation-bottom"></div>

                  <div className="row w-100 m-0">

                    <div className="col-md-4 p-4 d-flex flex-column justify-content-center">

                      <small className="fw-bold text-uppercase mb-1" style={{ color: '#ff7e5f', fontSize: '10px', letterSpacing: '1.5px' }}>

                        {app.doctor?.department || 'GENERAL'}

                      </small>

                      <h4 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>{app.doctor?.name}</h4>

                      <small className="text-muted mt-2">ClinicQ Certified Professional</small>

                    </div>


 

                    {/* DATE/TIME */}

                    <div className="col-md-4 p-4 d-flex align-items-center justify-content-center position-relative">

                      <div className="ticket-divider d-none d-md-block position-absolute start-0"></div>

                      <div className="text-center">

                        <div className="fw-bold fs-4 mb-1" style={{ color: '#111' }}>{app.timeSlot?.slotDate || (app.createdAt?app.createdAt.split('T')[0]:'N/A')}</div>

                        <div className="badge px-3 py-2 rounded-pill" style={{ background: 'rgba(0,0,0,0.05)', color: '#495057', fontSize: '0.9rem' }}>

                          🕒 {app.timeSlot?.startTime

                          ? app.timeSlot.startTime.substring(0,5):(app.createdAt && app.createdAt.includes('T')? app.createdAt.split('T')[1].substring(0,5):'N/A')}

                        </div>

                      </div>

                      <div className="ticket-divider d-none d-md-block position-absolute end-0"></div>

                    </div>


 

                    {/* STATUS */}

                    <div className="col-md-4 p-4 d-flex flex-column align-items-center justify-content-center">

                      <span className={`badge rounded-pill px-4 py-2 mb-3 shadow-sm border`}

                        style={{

                          background: app.status === 'BOOKED' ? '#e3f2fd' :

                            app.status === 'COMPLETED' ? '#e8f5e9' : '#fff5f5',

                          color: app.status === 'BOOKED' ? '#007bff' :

                            app.status === 'COMPLETED' ? '#2e7d32' : '#e53935',

                          borderColor: 'rgba(0,0,0,0.05)',

                          letterSpacing: '1px'

                        }}>

                        {app.status}

                      </span>


 

                      <div className='text-center'>

                        {app.status === 'CHECKED_IN' && app.token ? (

                          <>

                            <small className='d-block text-uppercase fw-bold'

                              style={{ fontSize: '10px', color: '#ff7e5f' }}>Queue Token</small>

                            <div className='fw-bold fs-5' style={{ color: '#111', lineHeight: '1.2' }}>

                              #{app.token.tokenNumber || app.token.token_display}

                            </div>

                          </>

                        ) : (

                          <>

                            <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '9px' }}>Pass ID</small>

                            <code className="fw-bold" style={{ color: '#adb5bd' }}>CQ-{app.id}</code>

                          </>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))

            ) : (

              <div className="text-center py-5 glass-ticket mt-4">

                <div className="fs-1 mb-3">🎫</div>

                <h5 className="text-muted">No appointments found.</h5>

                <p className="small text-muted mb-4">Your upcoming health visits will appear here as passes.</p>

                <button onClick={() => onNavigate('book')} className="btn btn-outline-secondary rounded-pill px-4 fw-bold">Book your first visit</button>

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

};


 

export default MyAppointments;