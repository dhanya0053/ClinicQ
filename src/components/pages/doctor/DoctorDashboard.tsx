import React, { useState, useEffect, useCallback } from 'react';

import Swal from 'sweetalert2';

import axiosInstance from '../../../services/axiosInstance';

import { useNavigate } from 'react-router-dom';

interface Patient {

  id: number;

  appointmentId: number;

  token: string;

  name: string;

  time: string;

  status: 'COMPLETED' | 'IN_CONSULTATION' | 'WAITING' | 'BOOKED' | 'NO_SHOW';

  age: number | string;

  phone: string;

}


 

interface PrescriptionForm {

  diagnosis: string;

  notes: string;

  bloodPressure: string,

  heartRate: string,

  medicines: {

    medicineName: string;

    dosage: string;

    frequency: string;

    duration: string;

  }[];

}


 

const DoctorDashboard: React.FC = () => {

  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(true);


 

  const[activePatient,setActivePatient]=useState<Patient | null>(null);

  const [breakMode, setBreakMode] = useState(false);

  const [breakSeconds, setBreakSeconds] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<'queue' | 'prescription'>('queue');


 

  const currentPatient = patients.find(p => p.status === 'IN_CONSULTATION') || patients.find(p => p.status === 'WAITING');

  const upcomingList = patients.filter(p => p.status === 'WAITING' && p.appointmentId !== activePatient?.appointmentId);

  const nextPatient = upcomingList.length > 0 ? upcomingList[0] : null;

  const completedToday = patients.filter(p => p.status === 'COMPLETED');


 

  const [prescriptionData, setPrescriptionData] = useState<PrescriptionForm>({

    diagnosis: '',

    notes: '',

    bloodPressure: '',

    heartRate: '',

    medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '' }]

  });


 



  const fetchSchedule = useCallback(async () => {

    setLoading(true);

    try {

      const response = await axiosInstance.get(`/clinicq/doctor/schedule`);

      const mappedData = response.data.map((t: any) => ({

        id: t.id,

        appointmentId: t.appointment?.id,

        token: `TKN-${t.tokenNumber}`,

        name: t.patient?.name || "Unknown Patient",

        time: t.appointment?.timeSlot?.startTime?.substring(0, 5) || "00:00",

        status: t.status,

        phone: t.patient?.phone || "N/A",

        age: t.patient?.dateOfBirth ? new Date().getFullYear() - new Date(t.patient.dateOfBirth).getFullYear() : "N/A"


 

      }));

      setPatients(mappedData);


 

      let currentActive=mappedData.find((p:any)=>p.status==='IN_CONSULTATION');

      if(!currentActive){

        currentActive=mappedData.find((p:any)=>p.status==='WAITING');

      }

      setActivePatient(currentActive || null);

    } catch (err) {

      console.error("Failed to load schedule", err);

    } finally {

      setLoading(false);

    }

  }, []);


 

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);


 

  const updateStatus = async (patientId:number, newStatus: string) => {

    // const patient = patients.find(p => p.token === tokenString);

    // if (!patient) return;

    try {

      await axiosInstance.put(`/clinicq/doctor/token/${patientId}/status`, null, {

        params: { status: newStatus }

      });

      fetchSchedule();

    } catch (err) {

      console.error("Status update failed:", err);

    }

  };


 

  const handleAddMedicine = () => {

    setPrescriptionData(prev => ({

      ...prev,

      medicines: [...prev.medicines, { medicineName: '', dosage: '', frequency: '', duration: '' }]

    }));

  };


 

  const handleRemoveMedicine = (index: number) => {

    const newMedicines = prescriptionData.medicines.filter((_, i) => i !== index);

    setPrescriptionData(prev => ({ ...prev, medicines: newMedicines }));

  };


 

  const handleMedicineChange = (index: number, field: string, value: string) => {

    setPrescriptionData(prev => {

      const newMedicines = [...prev.medicines];

      newMedicines[index] = { ...newMedicines[index], [field]: value };

      return { ...prev, medicines: newMedicines };

    });

  };


 

  const submitPrescription = async () => {

    if (!activePatient || !activePatient.appointmentId) {

      return Swal.fire('Error', 'No active consultation found for this patient', 'error');

    }

    const payload = {

      appointmentId: activePatient.appointmentId,

      diagnosis: prescriptionData.diagnosis || "No diagnosis provided",

      notes: prescriptionData.notes || "",

      bloodPressure: prescriptionData.bloodPressure || "",

      heartRate: prescriptionData.heartRate || "",

      status: "FINAL",

      medicines: prescriptionData.medicines

        .filter(med => med.medicineName.trim() !== '')

        .map(med => ({

          medicineName: med.medicineName,

          dosage: med.dosage || "N/A",

          frequency: med.frequency || "N/A",

          duration: med.duration || "N/A"

        }))

    };

    try {

      const response = await axiosInstance.post(`/clinicq/doctor/prescription`, payload);

      if (response.status === 200 || response.status === 201) {

        Swal.fire({

          icon: 'success',

          title: 'Prescription Submitted',

          showConfirmButton: false,

          timer: 1500

        });

        setPrescriptionData({

          diagnosis: '',

          notes: '',

          bloodPressure: '',

          heartRate: '',

          medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '' }]

        });

        setActiveTab('queue');

        fetchSchedule();

      }

    } catch (err) {

      Swal.fire('Error', 'Failed to save prescription', 'error');

    }

  };


 

  useEffect(() => {

    let timerId: any = null;

    if (breakMode) {

     

      if (timerId) clearInterval(timerId);

      timerId=setInterval(()=>{

        setBreakSeconds(prev=>prev+1);

      },1000);

    }

    return()=>{

      if(timerId){

        clearInterval(timerId);

        timerId=null;

      }

    };

  }, [breakMode]);


 

  const handleStartBreak=async()=>{

    try{

      await axiosInstance.put('/clinicq/doctor/pause');

      setBreakMode(true);

      setBreakSeconds(0);

    }catch(err){

      console.error("Failed to initialize doctor break session:",err);

      Swal.fire('Connection Error','Could not sync break mode with server.','error');

    }

  };


 

  const handleEndBreak = async () => {

    try {

      await axiosInstance.put('/clinicq/doctor/resume');

      setBreakMode(false);

      setBreakSeconds(0);

      Swal.fire({

        icon: 'success',

        title: 'Practice Resumed',

        text: 'Live patient queues synchronized successfully.',

        timer: 1500,

        showConfirmButton: false

      });

    } catch (err) {

      console.error("Failed to submit break metric context:", err);

      setBreakMode(false);

      setBreakSeconds(0);

    }

  };


 

  const formatTimerDisplay = (totalSecs: number) => {

    const hrs = Math.floor(totalSecs / 3600);

    const mins = Math.floor((totalSecs % 3600) / 60);

    const secs = totalSecs % 60;

    return [

      hrs > 0 ? String(hrs).padStart(2, '0') : null,

      String(mins).padStart(2, '0'),

      String(secs).padStart(2, '0')

    ].filter(Boolean).join(':');

  };


 

  return (

    <div className="d-flex min-vh-100 overflow-hidden"

      style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      <style>

        {`

         .glass-panel-dr { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }

         .sidebar-dr { width: 260px; background: #ffffff; border-right: 1px solid #eee; display: flex; flex-direction: column; padding: 24px; }

         .nav-btn-dr { width: 100%; text-align: left; padding: 12px 16px; border-radius: 12px; border: none; background: transparent; font-weight: 600; color: #6c757d; margin-bottom: 8px; transition: all 0.2s; }

         .nav-btn-active { background: rgba(32, 201, 151, 0.1); color: #198754; }

         .custom-table-dr thead th { color: #adb5bd; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f8f9fa; }

         .animate-in { animation: slideUp 0.4s ease-out forwards; }

         @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

         .form-input-dr { background: white !important; border: 1px solid #eee !important; border-radius: 12px; padding: 12px; transition: 0.3s; }

         .form-input-dr:focus { border-color: #20c997 !important; box-shadow: 0 0 0 4px rgba(32, 201, 151, 0.1) !important; outline: none; }

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

        .btn-delete-med{

          width:40px;

          height:40px;

          border-radius:50%;

          border:1px solid rgba(237, 72, 72, 0.1);

          background:rgba(61, 1, 7, 0.05);

          color:#dc3545;

          display:flex;

          align-items:center;

          justify-content:center;

          transition:all 0.2s ease;

          cursor:pointer;

          font-size:14px;

        }

        .btn-delete-med:hover{

          background:#dc3545;

          color:white;

          transform:scale(1.1);

          box-shadow:0 4px 10px rgba(241, 66, 84, 0.3);

        }

        .btn-delete-med:active{

          transform:scale(0.95);

        }

       `}

      </style>


 

      {/* SIDEBAR */}

      <div className="sidebar-dr shadow-sm">

        <div className="d-flex align-items-center mb-5 ps-2">

          <div className="rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"

            style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #0beacb, #20c997)' }}>🩺</div>

          <div>

            <h5 className="mb-0 fw-bold">ClinicQ <span style={{ color: '#20c997' }}>MD</span></h5>

            <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>PHYSICIAN CONSOLE</small>

          </div>

        </div>

        <div className="flex-grow-1">

          <button onClick={() => setActiveTab('queue')} className={`nav-btn-dr ${activeTab === 'queue' ? 'nav-btn-active' : ''}`}>📅 Today's Queue</button>

          <button onClick={() => setActiveTab('prescription')} className={`nav-btn-dr ${activeTab === 'prescription' ? 'nav-btn-active' : ''}`}>📝 Prescriptions</button>

          <button className={`nav-btn-dr mt-4 ${breakMode ? 'bg-danger-subtle text-danger' : ''}`} onClick={handleStartBreak}>

            {breakMode ? '☕ On Break' : '☕ Break Mode'}

          </button>

          {/* <button className="btn w-100 d-flex align-items-center gap-2 fw-bold text-danger border-0 py-3 px-3 mt-auto"

           onClick={() => window.location.reload()}>📤 Log Out</button> */}

          <button className="btn w-100 d-flex align-items-center gap-2 fw-bold logout-btn text-danger border-0 py-3 px-3 ms-auto"

            style={{

              fontSize: '16px',

              display: 'flex',

              alignItems: 'center',

              gap: '8px'

            }}

            onClick={() => { localStorage.removeItem("token"); navigate('/'); }}>📤 Log Out</button>

        </div>

      </div>


 

      {/* content */}

      <div className="flex-grow-1 p-4 overflow-hidden">

        {activeTab === 'queue' && (

          <div className="row g-4 h-100 animate-in">

            {/* LIVE QUEUE */}

            <div className="col-lg-7 d-flex flex-column h-100">

              <div className="glass-panel-dr p-4 mb-4 d-flex flex-column overflow-hidden" style={{ flex: '2' }}>

                <div className="d-flex justify-content-between align-items-center mb-4">

                  <h5 className="fw-bold m-0" style={{ color: '#20c997' }}>Live Patient Queue</h5>

                  <span className="badge bg-success-subtle text-success rounded-pill px-3">● Real-time</span>

                </div>

                <div className="table-responsive flex-grow-1 overflow-auto">

                  <table className="table custom-table-dr align-middle mb-0">

                    <thead><tr><th>Time</th><th>Patient Identity</th><th className="text-end">Status</th></tr></thead>

                    <tbody>

                      {!loading && patients.map((p, i) => (

                        <tr key={p.id || i}>

                          <td className="fw-bold text-dark">{p.time}</td>

                          <td>

                            <div className="fw-bold" style={{ color: '#2c3e50' }}>{p.name}</div>

                            <small className="text-muted fw-bold" style={{ fontSize: '9px' }}>{p.token}</small>

                          </td>

                          <td className="text-end">

                            <span className={`badge rounded-pill px-3 py-2 border ${p.status === 'WAITING' ? 'bg-info-subtle text-info border-info' : 'bg-primary text-white border-0'}`} style={{ fontSize: '10px' }}>{p.status}</span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>


 

              <div className="glass-panel-dr p-4" style={{ flex: '1' }}>

                <h6 className="fw-bold text-muted small text-uppercase mb-3">Upcoming Appointments</h6>

                <div className="row row-cols-1 row-cols-md-2 g-2 overflow-auto">

                  {upcomingList.map(p => (

                    <div className="col" key={p.token}>

                      <div className="p-3 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">

                        <div>

                          <div className="fw-bold small">{p.name}</div>

                          <small className="text-info fw-bold" style={{ fontSize: '9px' }}>{p.token}</small>

                        </div>

                        <div className="text-muted fw-bold small">{p.time}</div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>


 

            {/* Active call */}

            <div className="col-lg-5 d-flex flex-column gap-3 h-100">

              <div className="p-4 rounded-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #2c3e50, #000000)', color: 'white' }}>

                <small className="fw-bold opacity-50 text-uppercase ls-1">Active Consultation</small>

                {currentPatient ? (

                  <div className="mt-4 text-center text-md-start">

                    <h1 className="fw-bold mb-1 display-6">{currentPatient.name}</h1>

                    <div className="badge bg-white bg-opacity-10 text-white rounded-pill border border-white border-opacity-10 mb-4 px-3 py-2">{currentPatient.token}</div>

                    <div className="d-flex flex-column gap-2">

                      {currentPatient.status !== 'IN_CONSULTATION' ? (

                        <>

                          <button className="btn btn-light py-3 rounded-pill fw-bold" onClick={() => updateStatus(currentPatient.id, 'IN_CONSULTATION')}>▶ START CONSULTATION</button>

                          <button className="btn btn-outline-danger py-2 rounded-pill fw-bold border-0 opacity-75" onClick={() => updateStatus(currentPatient.id, 'NO_SHOW')}>Mark No-Show</button>

                        </>

                      ) : (

                        <button className="btn py-3 rounded-pill fw-bold text-white shadow-glow" style={{ background: '#20c997' }} onClick={() => updateStatus(currentPatient.id, 'COMPLETED')}>✓ MARK AS COMPLETED</button>

                      )}

                    </div>

                  </div>

                ) : <div className="py-5 text-center opacity-50 italic">Waiting for next patient...</div>}

              </div>


 

              <div className="glass-panel-dr p-3 d-flex align-items-center justify-content-between border-start border-4 shadow-sm" style={{ borderLeftColor: '#0beacb' }}>

                <div>

                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '9px' }}>Next in Line</small>

                  <h6 className="fw-bold mb-0" style={{ color: '#111' }}>{nextPatient?.name || "No pending queue"}</h6>

                </div>

                {nextPatient && (

                  <div className="text-end">

                    <div className="badge bg-light text-dark rounded-pill px-3">{nextPatient.time}</div>

                    <div className="text-info fw-bold d-block mt-1" style={{ fontSize: '9px' }}>{nextPatient.token}</div>

                  </div>

                )}

              </div>

              <div className="glass-panel-dr p-4 flex-grow-1 overflow-hidden d-flex flex-column">

                <h6 className="fw-bold text-success small text-uppercase mb-3">Completed Today</h6>

                <div className="overflow-auto flex-grow-1">

                  <table className="table table-sm align-middle mb-0">

                    <tbody style={{ fontSize: '12px' }}>

                      {completedToday.length > 0 ? (

                        completedToday.map(p => (

                          <tr key={p.token} className="completed-row">

                            <td className="fw-bold text-success py-3" style={{ width: '80px' }}>{p.token}</td>

                            <td className="fw-bold">{p.name}</td>

                            <td className="text-end text-success">✅</td>

                          </tr>

                        ))

                      ) : (

                        <tr><td colSpan={3} className="text-center py-5 text-muted opacity-50 italic">No records yet.</td></tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>

        )}


 

        {/* prescription */}

        {activeTab === 'prescription' && (

          <div className="glass-panel-dr p-5 d-flex flex-column overflow-auto h-100 animate-in">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <h4 className="fw-bold m-0" style={{ color: '#20c997' }}>Digital Prescription</h4>

              <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => setActiveTab('queue')}>← Close</button>

            </div>

            <div className="p-4 rounded-4 mb-4 d-flex justify-content-between align-items-center shadow-sm"

              style={{ background: 'linear-gradient(135deg, #20c997, #0beacb)', color: 'white' }}>

              <div>

                <h5 className="fw-bold mb-0">{activePatient?.name || "Select a Patient"}</h5>

                <small className="opacity-75">Age: {activePatient?.age || "N/A"} Years</small>

              </div>

              <div className="text-end">

                <small className="opacity-75 d-block">Contact Number</small>

                <span className="fw-bold">{activePatient?.phone || "N/A"}</span>

              </div>

            </div>

            <div className="row g-3 mb-4">

              <div className="col-md-6">

                <label className="small fw-bold text-muted mb-2">DIAGNOSIS</label>

                <textarea className="form-control form-input-dr" rows={2} placeholder="Type diagnosis here..." value={prescriptionData.diagnosis} onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))} />

              </div>

              <div className="col-md-6">

                <label className="small fw-bold text-muted mb-2">ADVICE / NOTES</label>

                <textarea className="form-control form-input-dr" rows={2} placeholder="Additional instructions..." value={prescriptionData.notes} onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))} />

              </div>

            </div>

            <div className="row g-3 mb-4">

              <div className='col-md-6'>

                <label className="small fw-bold text-muted mb-2 text-uppercase">Blood pressure</label>

                <div className="input-group shadow-sm rounded-3 overflow-hidden">

                  <input type='text' className="form-control form-input-dr border-0" placeholder="e.g. 120/80" value={prescriptionData.bloodPressure} onChange={(e) => setPrescriptionData(prev => ({ ...prev, bloodPressure: e.target.value }))} />

                  <span className="input-group-text bg-white border-0 text-muted small">mmHg</span>

                </div>

              </div>

              <div className="col-md-6">

                <label className="small fw-bold text-muted mb-2 text-uppercase">Heart Rate</label>

                <div className='input-group shadow-sm rounded-3 overflow-hidden'>

                  <input type="text" className="form-control form-input-dr border-0" placeholder="e.g. 72" value={prescriptionData.heartRate} onChange={(e) => setPrescriptionData(prev => ({ ...prev, heartRate: e.target.value }))} />

                  <span className='input-group-text bg-white border-0 text-muted small'>BPM</span>

                </div>

              </div>

            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">

              <h6 className="fw-bold text-muted m-0">MEDICATIONS</h6>

              <button className="btn btn-sm text-white rounded-pill px-3 fw-bold shadow-sm" style={{ background: '#20c997' }} onClick={handleAddMedicine}>+ Add Medicine</button>

            </div>

            <div className="table-responsive mb-4">

              <table className="table table-borderless align-middle">

                <thead>

                  <tr className="text-muted small">

                    <th>MEDICINE NAME</th><th>DOSAGE</th><th>FREQUENCY</th><th>DURATION</th><th></th>

                  </tr>

                </thead>

                <tbody>

                  {prescriptionData.medicines.map((med, idx) => (

                    <tr key={idx} className="animate-in">

                      <td><input type="text" className="form-control form-input-dr py-2" placeholder="Name" value={med.medicineName} onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)} /></td>

                      <td><input type="text" className="form-control form-input-dr py-2" placeholder="500mg" value={med.dosage} onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)} /></td>

                      <td><input type="text" className="form-control form-input-dr py-2" placeholder="1-1-1" value={med.frequency} onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)} /></td>

                      <td><input type="text" className="form-control form-input-dr py-2" placeholder="5d" value={med.duration} onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)} /></td>

                      <td><button className="btn-delete-med mx-auto" title='Remove Medicine' onClick={() => handleRemoveMedicine(idx)}>🗑️</button></td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            <div className="d-flex gap-3 justify-content-end mt-auto">

              <button className="btn btn-light rounded-pill px-5 fw-bold" onClick={() => setPrescriptionData({ diagnosis: '', notes: '', bloodPressure: '', heartRate: '', medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '' }] })}>RESET</button>

              <button

                className="btn text-white rounded-pill px-5 fw-bold shadow-glow"

                style={{

                  background: activePatient?.status === 'IN_CONSULTATION' ? '#20c997' : '#adb5bd',

                  cursor: activePatient?.status === 'IN_CONSULTATION' ? 'pointer' : 'not-allowed'

                }}

                disabled={activePatient?.status !== 'IN_CONSULTATION'}

                onClick={submitPrescription}>SUBMIT PRESCRIPTION</button>

            </div>

          </div>

        )}

      </div>



      {breakMode && (

        <div 

          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center animate-in"

          style={{

            background: 'rgba(15, 23, 42, 0.85)',

            backdropFilter: 'blur(30px) saturate(150%)',

            WebkitBackdropFilter: 'blur(30px) saturate(150%)',

            zIndex: 99999,

            userSelect: 'none'

          }}>

          <div 

            className="text-center p-5 rounded-5 border shadow-2xl"

            style={{ 

              background: '#ffffff', 

              maxWidth: '460px', 

              width: '90%', 

              borderColor: 'rgba(0,0,0,0.05)',

              boxShadow: '0 25px 70px rgba(0,0,0,0.3)'

            }}>

            <div 

              className="mx-auto mb-4 d-flex align-items-center justify-content-center"

              style={{

                width: '80px',

                height: '80px',

                background: 'rgba(32, 201, 151, 0.1)',

                color: '#20c997',

                borderRadius: '50%',

                fontSize: '2rem',

                animation: 'pulseGlow 2s infinite'

              }}>

              ☕

            </div>

           

            <h3 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Console on Break</h3>

            <p className="text-muted small mb-4">You are currently paused. Patient wait times are adapting automatically.</p>

           

            <div 

              className="display-4 fw-bold mb-5 font-monospace"

              style={{ color: '#2c3e50', letterSpacing: '1px' }}>

              {formatTimerDisplay(breakSeconds)}

            </div>

           

            <button 

              className="btn w-100 py-3 rounded-pill text-white fw-bold border-0 shadow-sm"

              style={{ 

                background: 'linear-gradient(135deg, #20c997 0%, #0beacb 100%)',

                letterSpacing: '0.5px'

              }}

              onClick={handleEndBreak}>

              RESUME PRACTICE →

            </button>

          </div>

         

          <style>{`

            @keyframes pulseGlow {

              0% { box-shadow: 0 0 0 0 rgba(32, 201, 151, 0.4); }

              70% { box-shadow: 0 0 0 15px rgba(32, 201, 151, 0); }

              100% { box-shadow: 0 0 0 0 rgba(32, 201, 151, 0); }

            }

          `}</style>

        </div>

      )}

    </div>

  );

};


 

export default DoctorDashboard;



 