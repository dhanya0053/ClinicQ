import React, { useEffect, useState, useCallback } from 'react';

import { FaHospitalUser, FaStethoscope, FaHeart, FaBone } from 'react-icons/fa6';

import Swal from 'sweetalert2';

import axiosInstance from '../../../services/axiosInstance';

import { useNavigate } from 'react-router-dom';

import PatientChatbot from './PatientChatbot';

import { FaClinicMedical } from 'react-icons/fa';

interface BookProps {

  onNavigate: (tab: 'book' | 'my' | 'history' | 'token') => void;

}

type Doctor = {

  id: number;

  name: string;

  location: string;

  description: string;

  days?: string[];

};

const BookAppointment: React.FC<BookProps> = ({ onNavigate }) => {

  const navigate = useNavigate();

  const [selectedSpec, setSelectedSpec] = useState("GENERAL");

  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-CA');

  const [selectedDate, setSelectedDate] = useState(today);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [reschedulingId, setReschedulingId] = useState<number | null>(null);

  const [rescheduleDate, setRescheduleDate] = useState("");

  const [rescheduleTime, setRescheduleTime] = useState("");

  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);

  const [rescheduleDoctor, setRescheduleDoctor] = useState<Doctor | null>(null);

  const [myList, setMyList] = useState<any[]>([]);

  const [maxDaysRule, setMaxDaysRule] = useState<number | null>(null);

  const [rescheduleCutoff, setRescheduleCutoff] = useState<number>(1);


 

  const formatMinutes = (totalMinutes: number) => {

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    if (hours > 0) {

      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;

    }

    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;

  };

  useEffect(() => {

    const fetchMaxDays = async () => {

      try {

        const response = await axiosInstance.get('/clinicq/patient/appointments/rules');

        setMaxDaysRule(response.data.maxDaysInAdvance || 15);

        setRescheduleCutoff(response.data.cancellationCutoffHours || 1);

      } catch (err) {

        console.error("Error fetching rules:", err);

      }

    };

    fetchMaxDays();

  }, []);


 

  const specs = [

    { name: "GENERAL", icon: <FaHospitalUser />, color: "#ff7e5f" },

    { name: "CARDIOLOGY", icon: <FaHeart />, color: "#ff75c3" },

    { name: "ORTHOPEDICS", icon: <FaBone />, color: "#ffa64d" },

    { name: "PEDIATRICS", icon: <FaStethoscope />, color: "#20c997" }

  ];



  const fetchUpcomingAppointments = useCallback(() => {

    axiosInstance.get(`/clinicq/patient/appointments/upcoming`)

      .then(res => setMyList(res.data))

      .catch(err => console.error("Error fetching appointments:", err));

  }, []);


 

  const fetchSlots = useCallback(() => {

    const currentLimit = maxDaysRule || 15;

    if (selectedDoctor && selectedDate) {

      //const today=new Date().toISOString().split('T')[0];

      if (selectedDate < today) {

        setAvailableSlots([]);

        return;

      }

      const limitDate = new Date();

      limitDate.setDate(new Date().getDate() + currentLimit);

      const maxDateString = limitDate.toLocaleDateString('en-CA');

      if (selectedDate > maxDateString) {

        setAvailableSlots([]);

        return;

      }

      axiosInstance.get(`/clinicq/patient/slots`, {

        params: { doctorId: selectedDoctor.id, date: selectedDate },

      })

        .then((res) => setAvailableSlots(res.data))

        .catch(err => {

          setAvailableSlots([]);

          console.error(err);

        });

    }

  }, [selectedDoctor, selectedDate, today, maxDaysRule]);


 

  useEffect(() => { fetchUpcomingAppointments(); }, [fetchUpcomingAppointments]);

  useEffect(() => {

    const fetchDoctors = async () => {

      try {

        const response = await axiosInstance.get(`/clinicq/patient/doctors`, {

          params: { department: selectedSpec }

        });

        const basicDoctors = response.data;

        const schedRes = await axiosInstance.get('/clinicq/admin/doctors');

        const doctorsWithDays = basicDoctors.map((doc: any) => {

          const doctorSchedules = schedRes.data.filter((s: any) => s.doctor.id === doc.id);

          const days = doctorSchedules.map((s: any) => s.dayOfWeek);

          return { ...doc, days };

        });

        setDoctors(doctorsWithDays);

        setSelectedDoctor(null);

      } catch (err) { setDoctors([]); }

    };

    if (selectedSpec) fetchDoctors();

  }, [selectedSpec]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const handleBooking = async () => {

    if (!selectedDoctor) {

      Swal.fire({ title: 'Doctor Not Selected', text: 'Please choose a doctor.', icon: 'warning', confirmButtonColor: '#ff7e5f' });

      return;

    }

    if (!activeSlot) {

      Swal.fire({ title: 'Select a Time', text: 'Please pick a slot.', icon: 'info', confirmButtonColor: '#ff7e5f' });

      return;

    }

    const selectedSlot = availableSlots.find(s => s.startTime === activeSlot);

    if (!selectedSlot) return;

    const bookingData = { patientId: 1, doctorId: selectedDoctor.id, slotId: selectedSlot?.id, reason: "General Consultation" };

    try {


 

      const response = await axiosInstance.post("/clinicq/patient/appointment", bookingData);

      if (response.status === 201) {

        Swal.fire({ title: 'Appointment Booked!', icon: 'success', confirmButtonColor: '#ff7e5f' });

        fetchUpcomingAppointments();

        setActiveSlot(null);

        fetchSlots();

      }

    } catch (err: any) {

      Swal.fire({ title: 'Booking Failed', text: err.response?.data?.errorMessage, icon: 'error' });

    }

  };


 

  const handleRescheduleClick = async (app: any) => {

    const appointmentDateTime = new Date(`${app.timeSlot.slotDate}T${app.timeSlot.startTime}`);

    const now = new Date();

    const diffInMinutes = Math.floor((appointmentDateTime.getTime() - now.getTime()) / (1000 * 60));

    const cutoffMinutes = (rescheduleCutoff || 1) * 60;

    if (diffInMinutes < cutoffMinutes) {

      const minutesLate = cutoffMinutes - diffInMinutes;

      const formattedLateTime = formatMinutes(minutesLate);

      Swal.fire({

        icon: 'error',

        title: '<span style="color:#d33; font-weight:700;">Reschedule Window Closed</span>',

        html: `<div style="font-family:'Segoe UI',sans-serif;color:#444;line-height:1.4;">

          <div style="background:#fff5f5; border-radius:12px; padding:12px;border-left:5px solid #ff4d4d;margin-bottom:10px;">

          <p style="margin: 0;font-weight:600;font-size:14px;">Clinic Policy:</p>

          <p style="margin:0;font-size:12px;">Rescheduling must be done at least <b>${rescheduleCutoff} hours</b> before the appointment.</p>

          </div>

          <p style="font-size:14px;margin-bottom:5px;">You missed the deadline by</p>

          <p style="color:#ff4d4d; font-size:18px; font-weight:700;margin:0;">${formattedLateTime}</p>

          </div>

        `,

        showConfirmButton: true,

        confirmButtonText: 'Got it',

        confirmButtonColor: '#ff7e5f',

        background: '#ffffff',

        showClass: { popup: 'animate__animated animate__fadeInDown' }

      });

      return;

    }

    setReschedulingId(app.id);

    const fullDoctorInfo = doctors.find(d => d.id === app.doctor.id);

    const docToUse = fullDoctorInfo || app.doctor;

    setRescheduleDoctor(docToUse);

    setRescheduleDate(app.timeSlot?.slotDate);

    setRescheduleTime("");

    const dayName = new Date(app.timeSlot?.slotDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const workingDays = docToUse.days || [];

    if (workingDays.includes(dayName)) {

      try {

        const response = await axiosInstance.get(`/clinicq/patient/slots?doctorId=${app.doctor?.id}&date=${app.timeSlot?.slotDate}`);

        setRescheduleSlots(response.data);

      } catch (err) { setRescheduleSlots([]); }

    } else {

      setRescheduleSlots([]);

    }

  };


 

  const handleApplyReschedule = async () => {

    if (!reschedulingId || !rescheduleTime) return;

    try {

      const response = await axiosInstance.put(`/clinicq/patient/appointments/reschedule`, null, {

        params: { appointmentId: reschedulingId, newSlotId: rescheduleTime }

      });

      if (response.status === 200) {

        Swal.fire({ title: 'Updated!', text: 'Rescheduled successfully.', icon: 'success', confirmButtonColor: '#ff7e5f' });

        setReschedulingId(null);

        fetchUpcomingAppointments();

        fetchSlots();

      }

    } catch (err: any) {

      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.errorMessage });

    }

  };


 

  const handleCancel = async (id: number) => {

    const result = await Swal.fire({ title: 'Are you sure?', text: "Cancel this appointment?", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });

    if (result.isConfirmed) {

      try {

        await axiosInstance.delete(`/clinicq/patient/appointments/cancel/${id}`);

        setMyList(prev => prev.filter(app => app.id !== id));

        fetchSlots();

        Swal.fire('Cancelled!', 'Slot is now free.', 'success');

      } catch (err) { Swal.fire('Action Failed', 'Cancellation unavailable in this timeframe', 'error'); }

    }

  };

  const handleCancelReschedule = () => {

    setReschedulingId(null);

    setRescheduleDate("");

    setRescheduleTime("");

    setRescheduleSlots([]);

    setRescheduleDoctor(null);

  };

  const handleDateSelection = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e || !e.target) return;

    const chosenDate = e.target.value;

    if (!chosenDate) return;

    if (chosenDate < today) {

      setAvailableSlots([]);

      Swal.fire({

        title: 'Invalid Date',

        text: "You cannot book appointments for a past date",

        icon: 'error',

        confirmButtonColor: '#ff7e5f'

      });

      return;

    }

    const limit = maxDaysRule || 15;

    const limitDate = new Date();

    limitDate.setDate(new Date().getDate() + limit);

    const maxDateString = limitDate.toLocaleDateString('en-CA');


 

    if (chosenDate > maxDateString) {

      setAvailableSlots([]);

      Swal.fire({

        title: 'Booking Policy',

        text: `According to current clinic rules, appointments can only be booked up to ${limit} days in advance.`,

        icon: 'warning',

        confirmButtonColor: '#ff7e5f'

      });

      return;

    }

    if (selectedDoctor && selectedDoctor.days) {

      const dayName = new Date(chosenDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      const workingDays = selectedDoctor.days || [];

      const isAvailable = workingDays.some(d => d.toUpperCase() === dayName);

      if (!isAvailable) {

        setAvailableSlots([]);

        Swal.fire({

          title: 'Doctor Unavailable',

          text: `${selectedDoctor.name} is only available on: ${workingDays.join(", ")}`,

          icon: 'info',

          confirmButtonColor: '#ff7e5f'

        });

        return;

      }

    }

    setSelectedDate(chosenDate);

  };


 

  const handleRescheduleDateChange = (dateString: string) => {

    if (!dateString || !rescheduleDoctor) return;

    setRescheduleDate(dateString);

    if (dateString < today) {

      setRescheduleSlots([]);

      Swal.fire({

        title: 'Invalid Date',

        text: "You cannot reschedule to a past date",

        icon: 'error',

        confirmButtonColor: '#ff7e5f'

      });

      return;

    }

    const limit = maxDaysRule || 15;

    const limitDate = new Date();

    limitDate.setDate(new Date().getDate() + limit);

    const maxDateString = limitDate.toLocaleDateString('en-CA');


 

    if (dateString > maxDateString) {

      setRescheduleSlots([]);

      Swal.fire({

        title: 'Reschedule Limit',

        text: `You can only reschedule within the next ${limit} days.`,

        icon: 'warning',

        confirmButtonColor: '#ff7e5f'

      });

      return;

    }


 

   

    const dayName = new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

    const workingDays = rescheduleDoctor.days || [];

    const isAvailable = workingDays.some(d => d.toUpperCase() === dayName);

    if (!isAvailable) {

      setRescheduleSlots([]);

      Swal.fire({

        title: 'Doctor Unavailable',

        text: `${rescheduleDoctor.name} is only available for rescheduling on: ${workingDays.join(", ")}`,

        icon: 'info',

        confirmButtonColor: '#ff7e5f'

      });

      return;

    }

    axiosInstance.get(`/clinicq/patient/slots`, {

      params: { doctorId: rescheduleDoctor.id, date: dateString }

    })

      .then(res => {

        setRescheduleSlots(res.data);

      })

      .catch((err) => {

        setRescheduleSlots([]);

      });

    setRescheduleDate(dateString);

  };


 

  return (

    <div className="d-flex min-vh-100 overflow-hidden" style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      <style>

        {`

          .glass-card-light { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

          .custom-scrollbar::-webkit-scrollbar { width: 6px; }

          .custom-scrollbar::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }

          .category-btn { transition: all 0.3s ease; border-radius: 20px; }

          .category-btn:hover { transform: translateY(-3px); }

          .slot-btn { transition: all 0.2s ease; border-radius: 12px !important; font-weight: 600; min-width: 85px; }

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

          .swal2-actions{

            margin-top:0.5rem !important;

          }

          .swal2-html-container{

            margin-bottom:0px !important;

          }

          .logo-m { width:36px;height:36px;background:linear-gradient(135deg,#ff7e5f,#ff6b6b);border-radius:10px;display:flex;align-items:center;justify-content:center; }

        `}

      </style>


 

      {/* SIDEBAR */}

      <div className="bg-white border-end p-3 d-flex flex-column shadow-sm" style={{ width: '240px', flexShrink: 0 }}>

        <div className="d-flex align-items-center mb-4 mt-2 ps-2" style={{ cursor: 'pointer' }}

            onClick={() => onNavigate('book')}>

            <div className="logo-m" style={{ marginRight:'12px'}}>

              <FaClinicMedical style={{ color: '#fff', fontSize: '1rem'}} />

            </div>

            <h4 className="fw-bold mb-0" style={{ color: '#111' }}>ClinicQ</h4>

        </div>


 

        <div className="nav flex-column gap-2">

          <button onClick={() => onNavigate('book')} className="btn text-start py-2 px-3 border-0 fw-bold" style={{ background: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f', borderRadius: '12px' }}>📅 Book Appointment</button>

          <button onClick={() => onNavigate('my')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">📋 My Appointments</button>

          <button onClick={() => onNavigate('history')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">🕒 History</button>

          <button onClick={() => onNavigate('token')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">🎟️ Token No</button>

          <div className="mt-auto pt-4 border-top">

            <button onClick={() => { localStorage.removeItem("token"); navigate('/'); }} className="btn w-100 d-flex align-items-center gap-2 fw-bold logout-btn text-danger border-0 py-2

            style={{fontSize:'13px'}}"><span>📤</span> Log Out</button>

          </div>

        </div>

      </div>


 

      {/* MAIN CONTENT */}

      <div className="flex-grow-1 p-4 h-100 overflow-hidden">

        <div className="row g-4 h-100">

          {/* left side */}

          <div className="col-xl-6 d-flex flex-column h-100">

            <h3 className="fw-bold mb-4">Schedule a Visit</h3>

            <div className="d-flex gap-3 mb-4">

              {specs.map(s => (

                <button key={s.name} onClick={() => setSelectedSpec(s.name)} className="btn category-btn flex-grow-1 d-flex flex-column align-items-center justify-content-center p-3"

                  style={{

                    border: `2px solid ${selectedSpec === s.name ? s.color : '#eee'}`,

                    background: selectedSpec === s.name ? `${s.color}15` : '#fff',

                  }}>

                  <span className="fs-3 mb-1" style={{ color: s.color }}>{s.icon}</span>

                  <span className="fw-bold text-uppercase" style={{ fontSize: '9px', color: selectedSpec === s.name ? s.color : '#6c757d' }}>{s.name}</span>

                </button>

              ))}

            </div>

            <div className="glass-card-light p-4 flex-grow-1 d-flex flex-column shadow-lg">

              <div className="row g-3 mb-4">

                <div className="col-6">

                  <label className="small fw-bold text-muted mb-1 d-block">DOCTOR</label>

                  <select className="form-select border-0 shadow-sm rounded-3 fw-bold bg-light" value={selectedDoctor?.id || ""}

                    onChange={(e) => setSelectedDoctor(doctors.find(d => d.id === Number(e.target.value)) || null)}>

                    <option value="">Select Professional</option>

                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}

                  </select>

                </div>


 

                <div className="col-6">

                  <label className="small fw-bold text-muted mb-1 d-block">DATE</label>

                  <input type="date"

                    className="form-control border-0 shadow-sm rounded-3 fw-bold bg-light"

                    value={selectedDate}

                    min={today}

                    max={(() => {

                      const d = new Date();

                      d.setDate(d.getDate() + (maxDaysRule || 15));

                      return d.toLocaleDateString('en-CA');

                    })()}

                    onChange={handleDateSelection} />

                </div>

              </div>


 

              {selectedDoctor && (

                <div className="p-3 mb-4 rounded-4" style={{ background: 'rgba(255, 126, 95, 0.05)', borderLeft: '4px solid #ff7e5f' }}>

                  <small className="fw-bold d-block text-uppercase" style={{ color: '#ff7e5f', fontSize: '10px' }}>{selectedDoctor.location}</small>

                  <p className="small mb-0 mt-1 italic text-muted">"{selectedDoctor.description}"</p>

                </div>


 

              )}

              <label className="small fw-bold text-muted mb-2 d-block">TIME SLOT</label>

              <div className="custom-scrollbar overflow-auto flex-grow-1 mb-3">

                <div className="d-flex flex-wrap gap-2" style={{ width: '100%' }}>

                  {availableSlots.length > 0 ? availableSlots

                    .filter(slot => {

                      if (selectedDate < today) return false;

                      if (selectedDate === today) {

                        const currentTime = new Date().toTimeString().substring(0, 5);

                        return slot.startTime > currentTime;

                      }

                      return true;

                    })

                    .map(slot => (

                      <button key={slot.id} disabled={slot.booked} onClick={() => setActiveSlot(slot.startTime)}

                        className={`btn btn-sm slot-btn ${activeSlot === slot.startTime ? 'text-white' : 'btn-outline-secondary'}`}

                        style={{ opacity: slot.booked ? 0.4 : 1, background: activeSlot === slot.startTime ? '#ff7e5f' : '', borderColor: activeSlot === slot.startTime ? '#ff7e5f' : '' }}>

                        {slot.startTime.substring(0, 5)}

                      </button>

                    )) : <p className="text-muted small">No slots found.</p>}

                </div>

              </div>

              <button onClick={handleBooking} className="btn w-100 py-3 rounded-pill fw-bold text-white shadow-lg mt-auto" style={{ background: 'linear-gradient(90deg, #ff7e5f, #ff6b6b)' }}>

                CONFIRM & BOOK

              </button>

            </div>

          </div>

          {/* right side */}

          <div className="col-xl-6 d-flex flex-column h-100">

            <h3 className="fw-bold mb-4">Patient Dashboard</h3>

            <div className="glass-card-light p-4 flex-grow-1 overflow-auto custom-scrollbar mb-4">

              <h6 className="fw-bold text-muted small text-uppercase mb-3">Upcoming</h6>

              {myList.map(app => (

                <div key={app.id} className="p-3 mb-3 rounded-4 bg-white border" style={{ border: reschedulingId === app.id ? '2px solid #ff7e5f' : '1px solid #eee' }}>

                  <div className="d-flex justify-content-between align-items-center">

                    <span className="fw-bold">{app.doctor?.name}</span>

                    <span className="badge rounded-pill bg-success-subtle text-success px-3">{app.status}</span>

                  </div>

                  <div className="small text-muted mt-1">{app.timeSlot?.slotDate} | {app.timeSlot?.startTime?.substring(0, 5)}</div>

                  {app.status === 'BOOKED' && (

                    <div className="mt-3 d-flex gap-2">

                      <button className="btn btn-sm px-3 rounded-pill fw-bold bg-warning-subtle text-warning-emphasis border-0" onClick={() => handleRescheduleClick(app)}>Reschedule</button>

                      <button className="btn btn-sm px-3 rounded-pill fw-bold bg-danger-subtle text-danger border-0" onClick={() => handleCancel(app.id)}>Cancel</button>

                    </div>

                  )}

                </div>

              ))}

            </div>

            <div className={`glass-card-light p-4 ${reschedulingId ? 'shadow-lg border-warning' : 'opacity-50'}`} style={{ border: reschedulingId ? '2px solid #ffc107' : '' }}>

              <h6 className="fw-bold mb-3 small text-warning text-uppercase">Reschedule Protocol</h6>

              <div className="row g-2">

                <div className="col-6">

                  <input type="date" className="form-control rounded-3"

                    value={rescheduleDate}

                    min={today}

                    max={maxDaysRule ? (() => {

                      const d = new Date();

                      d.setDate(d.getDate() + maxDaysRule);

                      return d.toISOString().split('T')[0];

                    })() : undefined}

                    onChange={(e) => handleRescheduleDateChange(e.target.value)} /></div>

                <div className="col-6">

                  <select className="form-select rounded-3" disabled={!reschedulingId || rescheduleSlots.length === 0} value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)}>

                    <option value="">New Time</option>

                    {/*{rescheduleSlots.map(s => <option key={s.id} value={s.id} disabled={s.booked}>{s.startTime.substring(0, 5)} {s.booked ? '(Booked)' : ''}</option>)}*/}

                    {rescheduleSlots.length > 0 ? (rescheduleSlots.filter(slot => {

                      if (rescheduleDate === today) {

                        const currentTime = new Date().toTimeString().substring(0, 5);

                        return slot.startTime > currentTime;

                      }

                      return true;

                      // else if (rescheduleDate > today) return true;

                      // const currentTime = new Date().toTimeString().substring(0, 5);

                      // return slot.startTime > currentTime;

                    })

                      .map(s => (

                        <option key={s.id} value={s.id} disabled={s.booked}>

                          {s.startTime.substring(0, 5)}{s.booked ? '(Booked)' : ''}

                        </option>

                      ))

                    ) : (

                      <option disabled>No Slots available</option>

                    )}

                  </select>

                </div>

              </div>

              <button disabled={!reschedulingId} onClick={handleApplyReschedule} className="btn w-100 mt-3 py-2 rounded-pill fw-bold text-white" style={{ background: reschedulingId ? '#ffc107' : '#dee2e6' }}>APPLY NEW TIME</button>

              <button

                type='button'

                className='btn w-100 mt-3 py-2 rounded-pill fw-bold text-white'

                style={{ background: reschedulingId ? '#d23105' : '#dee2e6', borderRadius: '12px' }}

                onClick={handleCancelReschedule}>CANCEL</button>

            </div>

          </div>

        </div>

      </div>

      <PatientChatbot />

    </div>

  );

};


 

export default BookAppointment;





 