import React, { useState, useEffect, useCallback } from 'react';

import Swal from 'sweetalert2';

import axiosInstance from '../../../services/axiosInstance';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { useNavigate } from 'react-router-dom';


 

interface Token {

  id: number;

  tokenNumber: number;

  status: string;

  checkInTime: string;

  patient: { id: number; name: string; phone: string; dateOfBirth: string; };

  doctor: { id: number; name: string; };

  appointment?: { type: string; };

}


 

interface Appointment {

  id: number;

  patient: {

    id: number;

    name: string;

    phone: string;

    dateOfBirth: string;

  };

  doctor: {

    id: number;

    name: string;

    department: string;

  };

  timeSlot: {

    id: number;

    startTime: string;

    endTime: string;

    slotDate: string;

  };

  status: string;

  reason?: string;

  createdAt: string;

}


 

export interface Patient {

  id: any;

  name: string;

  age: number;

  phone?: string;

  contact?: string;

  dateOfBirth?: string;

  reason: string;

  queueNumber: string;

  doctor?: string;

  timestamp: Date;

  type: 'walk-in' | 'appointment';

  appointmentId?: string;

  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'NO_SHOW';

  position: number;

}


 

export interface Doctor {

  id: string;

  name: string;

  specialization?: string;

  department: string;

}


 

const ReceptionistDashboard: React.FC = () => {

  const navigate=useNavigate();



  const [patients, setPatients] = useState<any[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [activeTab, setActiveTab] = useState<'walk-in' | 'appointments' | 'queue-management' | 'search'>('walk-in');

  const [queueCounter, setQueueCounter] = useState<{ [key: string]: number }>({});

  const [showSearchResults, setShowSearchResults] = useState(false);

  const DEPARTMENTS = ["GENERAL", "CARDIOLOGY", "ORTHOPEDICS", "PEDIATRICS"];

  const [selectedDept, setSelectedDept] = useState<string>('');

  const [searchKeyword, setSearchKeyword] = useState('');

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [formData, setFormData] = useState({

    name: '', dob: '', gender: 'MALE', contact: '', email: '', password: '', doctor: '', reason: ''

  });


 

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [isFormValid, setIsFormValid] = useState(false);

  const [filterStartTime, setFilterStartTime] = useState("00:00");

  const [filterEndTime, setFilterEndTime] = useState("23:59");

  const [queueDept, setQueueDept] = useState('');

  const [queueDoctorId, setQueueDoctorId] = useState('');

  const [queueDoctors, setQueueDoctors] = useState<Doctor[]>([]);

  const [allPatients, setAllPatients] = useState<any[]>([]);

  const [qmDept, setQmDept] = useState('');

  const [qmDoctorId, setQmDoctorId] = useState('');

  const [qmDoctors, setQmDoctors] = useState<Doctor[]>([]);

  const [qmSearch, setQmSearch] = useState('');

  const [isReorderMode, setIsReorderMode] = useState(false);

  const [tempQueue, setTempQueue] = useState<any[]>([]);



  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const phoneRegex = /^[0-9]{10}$/;


 

  const isValidAge = (dobString: string) => {

    if (!dobString) return false;

    const today = new Date();

    const dob = new Date(dobString);

    return dob <= today;

  };


 

  const fetchDoctorsForQueue = async (deptName: string) => {

    if (!deptName) {

      setQueueDoctors([]);

      return;

    }

    try {

      const response = await axiosInstance.get(`/clinicq/patient/doctors`, { params: { department: deptName } });

      setQueueDoctors(response.data);

    } catch (err) { setQueueDoctors([]); }

  };


 



  const fetchAppointments = useCallback(async () => {

    try {

      const res = await axiosInstance.get('/clinicq/receptionist/today');

      setAppointments(res.data);

    } catch (err) { console.error("Error fetching appointments:", err); }

  }, []);


 

  const fetchAllQueues = useCallback(async () => {

    try {

      const res=await axiosInstance.get('/clinicq/receptionist/queue/all');

      //allTokens.sort((a, b) => new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime());

      setAllPatients(Array.isArray(res.data)?res.data:[]);

    } catch (err) {

      console.error("Global Queue Fetch Error:", err);

    }

  }, []);



 

  useEffect(() => {

    fetchAppointments();

    fetchAllQueues();

    const backgroundSync=setInterval(()=>{

      fetchAppointments();

      fetchAllQueues();

    },10000);

    return ()=>clearInterval(backgroundSync);

  }, [fetchAppointments, fetchAllQueues]);



 

  const fetchLiveQueue = useCallback(async (docId?: string) => {

    const doctorToFetch = docId || formData.doctor;

    if (!doctorToFetch) return;

    const token = localStorage.getItem('token');

    try {

      const res = await axiosInstance.get(`/clinicq/receptionist/queue/${doctorToFetch}`, {

        headers: { 'Authorization': `Bearer ${token}` }

      });

      setPatients(res.data);

    } catch (err) {

      setPatients([]);

      console.error("Fetch Queue Error", err);

    }

  }, [formData.doctor]);

   useEffect(()=>{

    if(formData.doctor){

      fetchLiveQueue(formData.doctor);

    }

  },[formData.doctor,fetchLiveQueue]);


 

  const fetchDoctorsByDepartment = async (deptName: string) => {

    try {

      const response = await axiosInstance.get(`/clinicq/patient/doctors`, { params: { department: deptName } });

      setDoctors(response.data);

    } catch (err) { setDoctors([]); }

  };


 

  useEffect(() => {

    const { name = "", dob = "", contact = "", email = "", password = "", doctor = "" } = formData;

    const isNameOk = name && name.trim().length >= 2;

    const isDobOk = isValidAge(dob);

    const isEmailOk = email && emailRegex.test(email);

    const isPassOk = password && passwordRegex.test(password);

    const isPhoneOk = contact && phoneRegex.test(contact);

    const isSelectionOk = selectedDept !== "" && doctor !== "";

    // call this whenever selectedDays or the form state might change

    setIsFormValid(!!(isNameOk && isDobOk && isPhoneOk && isEmailOk && isPassOk && isSelectionOk));

  }, [formData, selectedDept]);


 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {

    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

  };


 

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (formData.password.length < 6) return alert("Password must be at least 6 characters.");

    const patientDTO = {

      name: formData.name,

      dateOfBirth: formData.dob,

      gender: formData.gender,

      phone: formData.contact,

      user: {

        email: formData.email,

        password: formData.password,

        role: "PATIENT"

      }

    };


 

    try {

      const response = await axiosInstance.post(`/clinicq/receptionist/walkin/${formData.doctor}`, patientDTO);

      const tokenToShow = response.data.tokenDisplay || `${response.data.tokenNumber}`;

      Swal.fire({

        title: 'Token Generated!',

        html: ` <div style="padding: 10px;">

        <p style="color: #666; margin-bottom: 15px;">Walk-in registration complete.</p>

        <div style="background: rgba(242, 153, 74, 0.1); border: 2px dashed #f2994a; border-radius: 15px; padding: 20px;">

        <small style="text-transform: uppercase; color: #f2994a; font-weight: bold; letter-spacing: 1px;">Queue ID</small>

        <h2 style="color: #f2994a; font-size: 3rem; margin: 10px 0; font-weight: 800;">${tokenToShow}</h2>

        </div>

        </div> `,

        icon: 'success',

        confirmButtonColor: '#f2994a'

      });

      setFormData({ name: '', dob: '', gender: 'MALE', contact: '', email: '', password: '', doctor: '', reason: '' });

      fetchLiveQueue();

      setTimeout(async()=>{ await fetchAllQueues(); await fetchAppointments();},300);


 

    } catch (error: any) { Swal.fire('Registration Failed', 'Doctor not available today', 'error'); }

  };


 

  const handleCheckIn = async (appointmentId: number) => {

    try {

      const response = await axiosInstance.post(`/clinicq/receptionist/checkin/${appointmentId}`);

      await fetchLiveQueue();

      await fetchAppointments();

     

      const tokenNum = response.data.tokenDisplay;

      Swal.fire({

        title: '<span style="color: #f2994a; font-family: sans-serif;">Check-In Successful</span>',

        html: ` <div style="padding: 10px;"> <p style="color: #666; margin-bottom: 20px;">Patient has been added to the live queue.</p>

         <div style="background: rgba(242, 153, 74, 0.1); border: 2px dashed #f2994a; border-radius: 15px; padding: 20px;">

         <small style="text-transform: uppercase; letter-spacing: 1px; color: #f2994a; font-weight: bold;">Token Number</small>

         <h1 style="color: #f2994a; font-size: 3.5rem; margin: 10px 0; font-weight: 800;">#${tokenNum}</h1>

          </div>

          <p style="margin-top: 20px; font-weight: 500; color: #333;">Generated Successfully</p>

          </div> `,

        icon: 'success',

        confirmButtonColor: '#f2994a',

        confirmButtonText: 'Done',

        background: '#fff'

      });

      await fetchAllQueues();


 

    } catch (error: any) {

      console.error("Check-in Error:", error);

      Swal.fire({

        title: 'Check-In Failed',

        text: error.response?.data?.errorMessage || 'Could not process check-in.',

        icon: 'error',

        confirmButtonColor: '#dc3545'

      });

    }

  };


 

  const updatePatientStatus = async (tokenId: string, newStatus: string) => {

    const statusMap: any = { 'Waiting': 'WAITING', 'In Consultation': 'IN_CONSULTATION', 'Completed': 'COMPLETED', 'No Show': 'NO_SHOW' };

    try {

      await axiosInstance.put(`/clinicq/doctor/token/${tokenId}/status`, null, { params: { status: statusMap[newStatus] } });

      setTimeout(() => fetchLiveQueue(), 300);

    } catch (err) { console.error(err); }

  };


 

  const handleSearch = async () => {

    if (!searchKeyword.trim()) return;

    try {

      const res = await axiosInstance.get(`/clinicq/receptionist/search`, { params: { keyword: searchKeyword } });

      setSearchResults(res.data);

      setShowSearchResults(true);

    } catch (err) {

      console.error(err);

      setSearchResults([]);

    }

  };



  const handleViewPatientHistory = (data: any) => {

    if (!data) return;

    let displayDate = data.slotDate;

    let displayTime = data.startTime && data.endTime ? `${data.startTime.substring(0, 5)} - ${data.endTime.substring(0, 5)}` : "Walk-in";

    if (!displayDate && data.checkInTime) {

      const [datePart, timePart] = data.checkInTime.split('T');

      displayDate = datePart;

      displayTime = `${timePart.substring(0, 5)}`;

    }

    Swal.fire({

      title: `<span style="color:#f2994a;font-family:sans-serif;">Visit Record: ${data.tokenDisplay || 'N/A'}</span>`,

      html: `

      <div style="text-align:left;padding:10px;font-family:sans-serif;line-height:1.8;">

      <div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">

      <h6 style="font-weight:700;color:#333;margin:0;font-size:20px">${data.patientName}</h6>

      <small class="text-muted">Contact : ${data.phone}</small>

      </div>


 

      <p><strong> Date : </strong>${displayDate || 'N/A'}</p>

      <p><strong> Time Slot : </strong><span style="color:#f2994a;font-weight:600;">${displayTime}</span></p>

      <p><strong> Doctor Name : </strong>${data.doctorName || 'N/A'}</p>

      <p><strong> Type : </strong><span class="badge bg-light text-dark border">${data.appointmentType}</span></p>


 

      <div style="margin-top:15px;">

      <strong>Status : </strong>

      <span class="badge rounded-pill px-3 py-2 ms-2" style="background:#f2994a;color:white;">

      ${data.appointmentStatus}</span>

      </div>

      </div>

      `,

      showCloseButton: true,

      confirmButtonColor: '#f2994a',

      confirmButtonText: 'Close',

      background: '#fff',

      customClass: {

        popup: 'rounded-4 shadow-lg'

      }

    });

  };


 

  const handleMovePatient = async (token: any) => {

    const { value: dept } = await Swal.fire({

      title: '<span style="font-size: 1.2rem; font-weight: 800; color: #333;">Move Patient</span>',

      html: `<div style="text-align: center; margin-bottom: 20px;">

         <div style="background: #fff5e6; color: #f2994a; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 24px;">🔄</div>

         <p style="color: #666; font-size: 0.9rem;">Move <b>${token.patient.name}</b> to a new department.</p>

       </div>

      `,

      input: 'select',

      inputOptions: DEPARTMENTS.reduce((acc: any, curr) => { acc[curr] = curr; return acc; }, {}),

      inputPlaceholder: 'Choose Destination Department',

      showCancelButton: true,

      confirmButtonColor: '#f2994a',

      confirmButtonText: 'View Doctors →',

      cancelButtonText: 'Cancel',

      inputValidator: (value) => !value ? 'Select a department to continue' : null,

      customClass: {

       popup: 'rounded-4 border-0 shadow-lg',

       input: 'swal2-select'

     }


 

    });


 

    if (dept) {

      try {

        const res = await axiosInstance.get(`/clinicq/patient/doctors`, {

          params: {

            department: dept

          }

        });

        const doctorOptions = res.data.reduce((acc: any, d: any) => { acc[d.id] = d.name; return acc; }, {});

        if (Object.keys(doctorOptions).length === 0) {

          return Swal.fire({

           title: 'No Availability',

           text: `There are currently no active doctors in the ${dept} department.`,

           icon: 'info',

           confirmButtonColor: '#f2994a'

          });

        }

        const { value: newDocId } = await Swal.fire({

          title: `<span style="font-size: 1.2rem; font-weight: 800; color: #333;">Assign Doctor</span>`,

          html: `<div style="text-align: center; margin-bottom: 20px;">

              <p style="color: #666; font-size: 0.9rem;">Select an available consultant in <span style="color: #f2994a; font-weight: bold;">${dept}</span></p>

              </div>

          `,

          input: 'select',

          inputOptions: doctorOptions,

          inputPlaceholder: 'Select Doctor',

          showCancelButton: true,

          confirmButtonColor: '#20c997', // Success green for the final step

         confirmButtonText: 'Confirm Transfer',

         inputValidator: (value) => !value ? 'You need to select a doctor!' : null,

         customClass: {

           popup: 'rounded-4 border-0 shadow-lg'

         }

        });

        if (newDocId) {

          await axiosInstance.put(`/clinicq/receptionist/move`, null, {

            params: { tokenId: token.id, newDoctorId: newDocId }

          });

          Swal.fire({

            icon: 'success',

            title: 'Success!',

            text: `${token.patient.name} moved successfully!`,

            showConfirmButton: false,

            timer: 2000,

            background: 'linear-gradient(to right,#ffffff,#fff5e6)',

            customClass: { popup: 'rounded-4 shadow' }


 

          });

          fetchAllQueues();

        }

      } catch (err) {

        Swal.fire('Error', 'Failed to move patient. Try again.', 'error');

      }

    }

  };


 

  const enterReorderMode = (filteredList: any[]) => {

    setIsReorderMode(true);

    setTempQueue([...filteredList]);


 

  };


 

  const moveItem = (index: number, direction: 'up' | 'down') => {

    const newQueue = [...tempQueue];

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQueue.length) return;


 

    const [movedItem] = newQueue.splice(index, 1);

    newQueue.splice(targetIndex, 0, movedItem);

    setTempQueue(newQueue);

  };



 

  const onDragEnd = (result: any) => {

    if (!result.destination) return;

    if (result.destination.index === result.source.index) return;


 

    const items = Array.from(tempQueue);

    const [reorderedItem] = items.splice(result.source.index, 1);

    items.splice(result.destination.index, 0, reorderedItem);

    setTempQueue(items);

  };


 

  const savenewOrder = async () => {

    if (!qmDoctorId) return;

    try {

      const tokenIds = tempQueue.map(t => t.id);

      await axiosInstance.put(`/clinicq/receptionist/reorder/${qmDoctorId}`, tokenIds);

      setAllPatients(prevPatients => {

        const otherPatients = prevPatients.filter(p => String(p.doctor?.id) !== String(qmDoctorId));

        const updateDoctorQueue = tempQueue.map((patient, index) => ({

          ...patient,

          position: index + 1

        }));

        const combined = [...otherPatients, ...updateDoctorQueue];

        return combined.sort((a, b) => {

          if (a.doctor?.id === b.doctor?.id && a.position && b.position) {

            return a.position - b.position;

          }

          return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();

        });

      });

      Swal.fire({

        icon: 'success',

        title: 'Queue Reordered',

        text: 'The new sequence has been saved.',

        timer: 1500,

        showConfirmButton: false

      });

      setIsReorderMode(false);

      //fetchAllQueues();

    } catch (err) {

      console.error("Reorder API Error:", err);

      Swal.fire('Error', 'Failed to update queue order', 'error');

    }

  };


 

  const calculateAge = (dob: string) => dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 'N/A';

  const formatTime = (ts: string) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';


 

  return (

    <div className="d-flex min-vh-100 overflow-hidden"

      style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      <style>

        {`

          .glass-card-rec { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

          .sidebar-rec { width: 280px; background: #ffffff; border-right: 1px solid #eee; display: flex; flex-direction: column; padding: 24px; }

          .nav-btn-rec { width: 100%; text-align: left; padding: 14px 20px; border-radius: 14px; border: none; background: transparent; font-weight: 700; color: #6c757d; margin-bottom: 8px; transition: 0.2s; }

          .nav-btn-active { background: rgba(242, 153, 74, 0.1); color: #f2994a; }

          .form-control-rec { background: #ffffff !important; border: 1px solid #dee2e6 !important; border-radius: 10px; padding: 10px 15px; font-weight: 500; }

          .form-control-rec:focus { border-color: #f2994a; box-shadow: 0 0 0 3px rgba(242, 153, 74, 0.1); outline: none; }

          .table-rec thead th { color: #adb5bd; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px; border-bottom: 2px solid #f1f3f5; }

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

          .animate-in{

            animation:slideUp 0.4s ease-out forwards;

          }

          @keyframes slideUp{

            from{opacity:0;transform:translateY(20px);}

            to{opacity:1;transform:translateY(0);}

          }

          .swal2-popup{

            border-radius:24px !important;

            font-family:'Segoe UI',sans-serif !important;

          }

          .swal2-select{

            appearance: none !important;

            -webkit-appearance: none !important;

            -moz-appearance:none !important;  

            border-radius:12px !important;

            border:1px solid #dee2e6 !important;

            padding:10px !important;

          }


 

          .swal2-select-custom {

          border-radius: 12px !important;

          border: 1px solid #eee !important;

          padding: 12px !important;

          font-weight: 600 !important;

          color: #444 !important;

          box-shadow: 0 2px 5px rgba(0,0,0,0.02) !important;

          }


 

          .swal2-confirm {

          border-radius: 12px !important;

          padding: 12px 30px !important;

          font-weight: 700 !important;

          text-transform: uppercase !important;

          letter-spacing: 0.5px !important;

          }


 

          .swal2-cancel {

          border-radius: 12px !important;

          font-weight: 600 !important;

          }


 

        `}

      </style>


 

      {/* SIDEBAR */}

      <div className="sidebar-rec shadow-sm" style={{ flexShrink:0 }}>

        <div className="d-flex align-items-center mb-5 ps-2">

          <div className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"

            style={{ width: '45px', height: '45px', background: '#f2994a' }}>👥</div>

          <h5 className="mb-0 fw-bold">ClinicQ <span style={{ color: '#f2994a' }}>Staff</span></h5>

        </div>


 

        <div className="flex-grow-1">

          <button onClick={() => setActiveTab('walk-in')} className={`nav-btn-rec ${activeTab === 'walk-in' ? 'nav-btn-active' : ''}`}>📝 Walk-in Reg</button>

          <button onClick={() => setActiveTab('appointments')} className={`nav-btn-rec ${activeTab === 'appointments' ? 'nav-btn-active' : ''}`}>📅 Today's Bookings</button>

          <button onClick={() => setActiveTab('queue-management')} className={`nav-btn-rec ${activeTab === 'queue-management' ? 'nav-btn-active' : ''}`}>🔄 Queue Management</button>

          {/* <button onClick={() => setActiveTab('now-serving')} className={`nav-btn-rec ${activeTab === 'now-serving' ? 'nav-btn-active' : ''}`}>📢 Now Serving</button> */}

          <button onClick={() => setActiveTab('search')} className={`nav-btn-rec ${activeTab === 'search' ? 'nav-btn-active' : ''}`}>🔍 Search Patients</button>

          <button className="btn w-100 d-flex align-items-center gap-2 fw-bold logout-btn text-danger border-0 py-3 px-3 ms-auto"

            style={{

              fontSize: '16px',

              display: 'flex',

              alignItems: 'center',

              gap: '8px'

            }}

            onClick={() =>{localStorage.removeItem("token"); navigate('/');}}>📤 Log Out</button>

        </div>

      </div>


 

      {/* content */}

      <div className="flex-grow-1 p-4 overflow-auto">

        {/* walk-in reg */}

        {activeTab === 'walk-in' && (

          <div className="glass-card-rec p-5 animate-in">

            <h4 className="fw-bold mb-4" style={{ color: '#f2994a' }}>Walk-in Intake</h4>

            <form onSubmit={handleSubmit}>

              <div className="row g-4">

                <div className="col-md-6"><label className="small fw-bold text-muted mb-2">FULL NAME</label>

                  <input type="text" placeholder='Enter patient name...' className="form-control form-control-rec" name="name" value={formData.name} onChange={handleInputChange} required />

                  {formData.name && formData.name.length < 2 && (

                    <small className='text-danger' style={{ fontSize: '9px' }}>* Name should be at least 2 letters.</small>

                  )}

                </div>


 

                <div className="col-md-3">

                  <label className="small fw-bold text-muted mb-2">GENDER</label>

                  <select

                    className="form-select form-control-rec"

                    name="gender"

                    value={formData.gender}

                    onChange={handleInputChange}>

                    <option value="MALE">Male</option>

                    <option value="FEMALE">Female</option>

                  </select>

                </div>


 

                <div className="col-md-3">

                  <label className="small fw-bold text-muted mb-2">DOB</label>

                  <input type="date" className="form-control form-control-rec" name="dob" value={formData.dob} onChange={handleInputChange} max={new Date().toISOString().split("T")[0]} required />

                  {formData.dob && new Date(formData.dob) > new Date() && (

                    <small className='text-danger' style={{ fontSize: '9px' }}>* Future dates not allowed.</small>

                  )}

                </div>


 

                <div className="col-md-6">

                  <label className="small fw-bold text-muted mb-2">PHONE</label>

                  <input type="tel" placeholder='Enter phone no...' className="form-control form-control-rec" name="contact" value={formData.contact} onChange={handleInputChange} maxLength={10} required />

                  {formData.contact && !phoneRegex.test(formData.contact) && (

                    <small className='text-danger' style={{ fontSize: '9px' }}>* Enter 10 digits</small>

                  )}

                </div>


 

                <div className="col-md-6">

                  <label className="small fw-bold text-muted mb-2">EMAIL</label>

                  <input type="email" placeholder='Enter email id...' className="form-control form-control-rec" name="email" value={formData.email} onChange={handleInputChange} required />

                  {formData.email && !emailRegex.test(formData.email) && (

                    <small className='text-danger' style={{ fontSize: '9px' }}>* Enter a valid email</small>

                  )}

                </div>


 

                <div className="col-12"><label className="small fw-bold text-muted mb-2">SECURE PASSWORD</label>

                  <input type="password" placeholder='Enter password here' name="password" className="form-control form-control-rec" value={formData.password} onChange={handleInputChange} required />

                  {formData.password && !passwordRegex.test(formData.password) && (

                    <small className='text-danger' style={{ fontSize: '9px' }}>* Use 8+ characters with letters,numbers and special characters.</small>

                  )}

                </div>


 

                <div className='col-12'>

                  <label className='small fw-bold text-muted mb-2'>REASON FOR VISIT (OPTIONAL)</label>

                  <textarea className='form-control form-control-rec'

                    name='reason'

                    value={formData.reason}

                    onChange={handleInputChange}

                    rows={2}

                    placeholder='e.g. Regular checkup, mild fever, etc.' />

                </div>


 

                <div className="col-md-6">

                  <label className="small fw-bold text-muted mb-2">DEPARTMENT</label>

                  <select className="form-select form-control-rec" onChange={(e) => { setSelectedDept(e.target.value); fetchDoctorsByDepartment(e.target.value); }} required>

                    <option value="">Select Dept</option>

                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}

                  </select>

                </div>


 

                <div className="col-md-6">

                  <label className="small fw-bold text-muted mb-2">ASSIGN DOCTOR</label>

                  <select className="form-select form-control-rec" name="doctor" value={formData.doctor} onChange={handleInputChange} required disabled={!selectedDept}>

                    <option value="">Select Doctor</option>

                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}

                  </select>

                </div>

              </div>


 

              <button type="submit"

                disabled={!isFormValid}

                className="btn w-100 py-3 mt-4 text-white fw-bold shadow border-0"

                style={{

                  background: !isFormValid ? '#adb5bd' : '#f2994a',

                  borderRadius: '12px',

                  cursor: !isFormValid ? 'not-allowed' : 'pointer'

                }}>GENERATE TOKEN</button>

            </form>

          </div>

        )}


 

        {/* TODAY'S APPOINTMENTS */}

        {activeTab === 'appointments' && (

          <div className="glass-card-rec p-4 animate-in">

            <h4 className="fw-bold mb-4" style={{ color: '#f2994a' }}>Today's Bookings</h4>


 

            <div className="glass-card-rec p-3 mb-4 border-0 shadow-sm" style={{ background: 'rgba(242, 153, 74, 0.05)' }}>

              <div className="row g-3 align-items-end">

                <div className="col-md-2">

                  <label className="small fw-bold text-muted mb-1">START TIME</label>

                  <input type="time" className="form-control form-control-rec"

                    value={filterStartTime} onChange={(e) => setFilterStartTime(e.target.value)} />

                </div>

                <div className="col-md-2">

                  <label className="small fw-bold text-muted mb-1">END TIME</label>

                  <input type="time" className="form-control form-control-rec"

                    value={filterEndTime} onChange={(e) => setFilterEndTime(e.target.value)} />

                </div>

                <div className="col-md-3">

                  <label className="small fw-bold text-muted mb-1">DEPARTMENT</label>

                  <select className="form-select form-control-rec"

                    value={selectedDept}

                    onChange={(e) => { setSelectedDept(e.target.value); fetchDoctorsByDepartment(e.target.value); }}>

                    <option value="">All Departments</option>

                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}

                  </select>

                </div>

                <div className="col-md-3">

                  <label className="small fw-bold text-muted mb-1">DOCTOR</label>

                  <select className="form-select form-control-rec"

                    name="doctor" value={formData.doctor} onChange={handleInputChange}>

                    <option value="">All Doctors</option>

                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}

                  </select>

                </div>

                <div className="col-md-2">

                  <button className="btn btn-outline-secondary w-100 fw-bold rounded-3"

                    onClick={() => {

                      setSelectedDept('');

                      setFormData(p => ({ ...p, doctor: '' }));

                      setFilterStartTime("00:00");

                      setFilterEndTime("23:59");

                      fetchAppointments();

                    }}>

                    RESET </button>

                </div>

              </div>

            </div>


 

            <div className="table-responsive">

              <table className="table table-rec align-middle">

                <thead>

                  <tr>

                    <th>Time</th>

                    <th>Patient</th>

                    <th>Doctor</th>

                    <th>Department</th>

                    <th>Reason</th>

                    <th>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {appointments

                    .filter((a: any) => {

                     

                      const appTime = a.timeSlot?.startTime?.substring(0, 5);

                      const matchesTime = !appTime || (appTime >= filterStartTime && appTime <= filterEndTime);

                      const matchesDept = !selectedDept || a.doctor?.department === selectedDept;

                      const matchesDoc = !formData.doctor || String(a.doctor?.id) === String(formData.doctor);

                      return matchesTime && matchesDept && matchesDoc;

                    })

                    .sort((a, b) => {

                      const timeA = a.timeSlot.startTime || "";

                      const timeB = b.timeSlot.startTime || "";

                      return timeA.localeCompare(timeB);


 

                    })

                    .map((a: any) => (

                      <tr key={a.id}>

                        <td>

                          <span className="fw-bold" style={{ color: '#f2994a' }}>

                            {a.timeSlot?.startTime?.substring(0, 5)}

                          </span>

                        </td>

                        <td>

                          <div className="fw-bold">{a.patient?.name}</div>

                          <small className="text-muted">{a.patient?.phone}</small>

                        </td>

                        <td>{a.doctor?.name}</td>

                        <td>

                          <span className="badge bg-light text-dark border">{a.doctor?.department}</span>

                        </td>

                        <td className="small text-muted">{a.reason || 'General'}</td>

                        <td>

                          {a.status === 'BOOKED' ? (

                            <button

                              className="btn btn-sm text-white px-3 fw-bold shadow-sm"

                              style={{ background: '#f2994a', borderRadius: '8px' }}

                              onClick={() => handleCheckIn(a.id)}>

                              CHECK IN

                            </button>

                          ) : (

                            <span className={`badge px-3 py-2 ${

                              a.status === 'CHECKED_IN'

                              ? 'bg-primary-subtle text-primary border-primary'

                               : a.status === 'IN_CONSULTATION'

                                ? 'bg-info-subtle text-info border-info'

                                : a.status === 'COMPLETED'

                                ? 'bg-secondary-subtle text-secondary border-secondary'

                                : a.status === 'NO_SHOW'

                                ? 'bg-danger-subtle text-danger border-danger'

                                : 'bg-light text-dark'

                              }`}

                              style={{fontSize:'11px',letterSpacing:'0.3px'}}>

                              {a.status.replace('_',' ')}

                            </span>

                          )}

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>

        )}


 

        {/* Queue Management */}

        {activeTab === 'queue-management' && (

          <div className="glass-card-rec p-5 animate-in">

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h3 className='fw-bold mb-1'>Queue <span style={{ color: '#f2994a' }}>Management</span></h3>

                <p className='text-muted small'>Organize and reorder waiting patients for specific consultants.</p>

              </div>

              <div className="d-flex gap-2 align-items-center">

                {!isReorderMode ? (

                  <>

                    <select className="form-select form-control-rec shadow-sm border-0"

                      style={{ width: '180px', background: '#fff' }}

                      value={qmDept}

                      onChange={(e) => {

                        setQmDept(e.target.value);

                        fetchDoctorsByDepartment(e.target.value).then(() => {

                          axiosInstance.get(`/clinicq/patient/doctors`,

                            {

                              params: {

                                department: e.target.value

                              }

                            }

                          )

                            .then(res => setQmDoctors(res.data));


 

                        });


 

                      }}>

                      <option value="">Select Department</option>

                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}

                    </select>

                    <select className='form-select form-control-rec shadow-sm border-0'

                      style={{ width: '220px', background: '#fff' }}

                      disabled={!qmDept}

                      value={qmDoctorId}

                      onChange={(e) => setQmDoctorId(e.target.value)}>

                      <option value="">Select Doctor</option>

                      {qmDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}

                    </select>

                    {/* reset button */}

                    <button className='btn btn-outline-secondary rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-1'

                      style={{ transition: 'all 0.3s ease', height: '42px' }}

                      onClick={() => {

                        setQmDept('');

                        setQmDoctorId('');

                        setQmDoctors([]);

                        setQmSearch('');

                        fetchAllQueues();

                      }} >

                      <span style={{ fontSize: '1.2rem', lineHeight: '0' }}>↺</span> Reset </button>

                  </>

                ) : (

                  <div className='d-flex gap-2'>

                    <button className='btn btn-success rounded-pill px-4 fw-bold shadow-sm' onClick={savenewOrder}>SAVE CHANGES</button>

                    <button className='btn btn-outline-danger rounded-pill px-4 fw-bold' onClick={() => setIsReorderMode(false)}>CANCEL</button>

                  </div>

                )}

              </div>

            </div>


 

            {!isReorderMode && (

              <div className='mb-4'>

                <div className='input-group shadow-sm rounded-4 overflow-hidden border bg-white'>

                  <span className='input-group-text bg-transparent border-0 ps-3'>🔍</span>

                  <input type='text'

                    className='form-control border-0 py-2 bg-transparent'

                    placeholder='Search by name or contact...'

                    value={qmSearch}

                    onChange={(e) => setQmSearch(e.target.value)} />

                  {qmDoctorId && (

                    <button className='btn btn-dark px-4 fw-bold' onClick={() => {

                      const filtered = allPatients.filter(p => String(p.doctor?.id) === String(qmDoctorId) && p.status === 'WAITING');

                      enterReorderMode(filtered);

                    }}>EDIT ORDER</button>

                  )}

                </div>

              </div>


 

            )}


 

            <div className='table-responsive'>

              <DragDropContext onDragEnd={onDragEnd}>

                <Droppable droppableId='queue-list'>

                  {(provided) => (

                    <table className='table table-rec align-middle'>

                      <thead>

                        <tr>

                          {isReorderMode && <th style={{ width: '50px' }}>Move</th>}

                          <th>Patient Details</th>

                          <th>Type</th>

                          <th>Current Status</th>

                          {!isReorderMode && <th className='text-end'>Actions</th>}

                        </tr>

                      </thead>

                      <tbody {...provided.droppableProps} ref={provided.innerRef}>

                        {(isReorderMode ? tempQueue : allPatients.filter(p => {

                          const matchesDoc = !qmDoctorId || String(p.doctor?.id) === String(qmDoctorId);

                          const matchesDept = !qmDept || p.doctor?.department === qmDept;

                          const matchesSearch = !qmSearch || p.patient?.name?.toLowerCase().includes(qmSearch.toLowerCase());

                          return matchesDoc && matchesDept;

                        })

                          .sort((a, b) => (a.position || 0) - (b.position || 0))

                        )

                          .map((p: any, index: number) => (

                            <Draggable key={`drag-${p.id}`} draggableId={String(p.id)} index={index} isDragDisabled={!isReorderMode}>

                              {(provided, snapshot) => (

                                <tr ref={provided.innerRef}

                                  {...provided.draggableProps}

                                  style={{

                                    ...provided.draggableProps.style,

                                    background: snapshot.isDragging ? 'rgba(242,153,74,0.2)' : 'transparent',

                                    display: snapshot.isDragging ? 'table' : 'table-row',

                                    zIndex: snapshot.isDragging ? 9999 : 'auto',

                                  }}>

                                  {isReorderMode && (

                                    <td {...provided.dragHandleProps} style={{ cursor: 'grab', textAlign: 'center', color: '#f2994a' }}>

                                      <span style={{ fontSize: '20px', userSelect: 'none' }}>☰</span>

                                    </td>

                                  )}

                                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>

                                    <div className='fw-bold'>{p.patient?.name}</div>

                                    <small className='text-muted'>{p.patient?.phone}</small>

                                  </td>

                                  <td>

                                    <span className={`badge rounded-pill px-3 border ${p.appointment?.type === 'PRE_BOOKED' ? 'bg-info-subtle text-info border-info-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'}`}>


 

                                      {p.appointment?.type==='PRE_BOOKED' ? 'PRE-BOOKED' : 'WALK-IN'}

                                    </span>

                                  </td>

                                  <td>

                                    <span className='badge bg-warning-subtle text-warning border border-warning-subtle px-2'>WAITING</span>

                                  </td>

                                  {!isReorderMode && (

                                    <td className='text-end'>

                                      <button className='btn btn-sm text-white rounded-pill px-3 fw-bold'

                                        style={{ background: 'linear-gradient(135deg,#f2994a 0%,#f2c94c 100%)' }}

                                        onClick={() => handleMovePatient(p)}>Move</button>

                                    </td>

                                  )}

                                </tr>

                              )}

                            </Draggable>

                          ))}

                        {provided.placeholder}

                      </tbody>

                    </table>

                  )}

                </Droppable>

              </DragDropContext>


 

            </div>

          </div>

        )}




 

        {/* search tab */}

        {activeTab === 'search' && (

          <div className="glass-card-rec p-5 animate-in">

            <h3 className="fw-bold mb-4">Patient Registry</h3>

            <div className="input-group mb-5 shadow-sm rounded-pill overflow-hidden border">

              <input type="text" className="form-control border-0 px-4 py-3" placeholder="Search by patient name or phone..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />

              <button className="btn px-5 fw-bold text-white border-0" style={{ background: '#f2994a' }} onClick={handleSearch}>SEARCH</button>

            </div>

            {showSearchResults && (

              <div className="table-responsive">

                <table className="table table-rec align-middle">

                  <thead><tr>

                    <th>Name</th>

                    <th>Contact</th>

                    <th>Age</th>

                    <th>Status</th>

                    <th className="text-end">Actions</th></tr></thead>

                  <tbody>

                    {Array.isArray(searchResults) && searchResults.length>0?(

                    searchResults.map((item: any) => {

                     

                      const status = item.latestAppointmentStatus || item.status || item.appointmentStatus;


 

                      return (

                        <tr key={item.id}>

                          <td className="fw-bold">{item.patientName || item.name}</td>

                          <td className="text-muted">{item.phone || item.contact}</td>

                          <td>{calculateAge(item.dateOfBirth)}</td>

                          <td>

                            {status ? (

                              <span className={`badge px-3 py-2 rounded-pill border ${status === 'COMPLETED' ? 'bg-success-subtle text-success border-success' :

                                status === 'CHECKED_IN' ? 'bg-primary-subtle text-primary border-primary' :

                                  status === 'BOOKED' ? 'bg-warning-subtle text-warning border-warning' :

                                    status === 'NO_SHOW' ? 'bg-danger-subtle text-danger border-danger' :

                                      'bg-secondary-subtle text-secondary border-secondary'

                                }`} style={{ fontSize: '10px' }}>

                                {status.replace('_', ' ')}

                              </span>

                            ) : (

                              <span className="text-muted small italic">No Recent Activity</span>

                            )}

                          </td>

                          <td className="text-end">

                            <div className="d-flex gap-2 justify-content-end">

                              <button

                                className="btn btn-sm btn-dark rounded-pill px-3 fw-bold shadow-sm"

                                onClick={() => handleViewPatientHistory(item)}

                              >

                                View

                              </button>

                              <button

                                className="btn btn-sm btn-outline-warning rounded-pill px-3 fw-bold shadow-sm"

                                onClick={() => {

                                  console.log("Patient data for new visit:", item);

                                  setFormData({

                                    name: item.name || item.patientName || "",

                                    contact: item.phone || item.contact || "",

                                    dob: item.dateOfBirth || "",

                                    gender: String(item.gender || "MALE").toUpperCase(),

                                    email: item.email || item.user?.email || "",

                                    password: "",

                                    doctor: "",

                                    reason: ""

                                  });

                                  setSelectedDept("");

                                  setActiveTab('walk-in');

                                  window.scrollTo({ top: 0, behavior: 'smooth' });

                                }}

                              >

                                New Visit

                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    })

                    ):(

                      <tr>

                        <td colSpan={5} className='text-center py-5' style={{ background:'rgba(0,0,0,0.01)'}}>

                          <div style={{ fontSize:'1.8rem',marginBottom:'8px'}}></div>

                          <h6 className='fw-bold text-secondary mb-1'>Patient not found</h6>

                          <p className='text-muted small mb-0'>Verify the spelling or register them as a new walk-in patient.</p>

                        </td>

                      </tr>

                    )

                  }

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}


 

        {/* Global Live Queue Footer */}

        <div className="glass-card-rec p-4 mt-5">

          {/* <h5 className="fw-bold mb-4"><span style={{ color: '#f2994a' }}>Live</span> Global Queue</h5> */}

          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0"><span style={{ color: '#f2994a' }}>Live</span> Global Queue</h5>


 

            <div className="d-flex gap-2 align-items-center bg-light p-2 rounded-4 shadow-sm border">

              <select

                className="form-select border-0 bg-transparent fw-bold text-muted small"

                style={{ width: '160px' }}

                value={queueDept}

                onChange={(e) => { setQueueDept(e.target.value); fetchDoctorsForQueue(e.target.value); }}>

                <option value="">All Depts</option>

                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}

              </select>


 

              <div className="vr mx-1" style={{ height: '30px' }}></div>


 

              <select

                className="form-select border-0 bg-transparent fw-bold text-muted small"

                style={{ width: '180px' }}

                disabled={!queueDept}

                value={queueDoctorId}

                onChange={(e) => setQueueDoctorId(e.target.value)}>

                <option value="">All Doctors</option>

                {queueDoctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}

              </select>


 

              <button

                className="btn btn-sm px-3 fw-bold text-white rounded-pill shadow-sm"

                style={{ background: 'linear-gradient(135deg,#f2994a 0%,#f2c94c 100%)' }}

                onClick={() => {

                  setQueueDept('');

                  setQueueDoctorId('');

                  setQueueDoctors([]);

                  fetchAllQueues();

                }}>

                RESET

              </button>

            </div>

          </div>


 

          <div className="table-responsive">

            <table className="table table-rec align-middle mb-0">

              <thead>

                <tr>

                  <th>Token</th>

                  <th>Patient Identity</th>

                  <th>Age</th>

                  <th>Assigned Dr.</th>

                  <th>Arrival</th>

                  <th>Status</th>

                </tr>

              </thead>


 

              <tbody>

                {(() => {

                  const filteredQueue = allPatients.filter((t: any) => {

                    const matchesDept = !queueDept || t.doctor?.department === queueDept;

                    const matchesDoc = !queueDoctorId || String(t.doctor?.id) === String(queueDoctorId);

                    return matchesDept && matchesDoc;

                  });


 

                 

                  if (filteredQueue.length === 0) {

                   // const doctorName = queueDoctors.find(d => String(d.id) === queueDoctorId)?.name;

                    return (

                      <tr>

                        <td colSpan={6} className="text-center py-5">

                          <div className="text-muted">

                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📋</span>

                            <h6 className="fw-bold mb-1">No patients currently in queue</h6>

                            <p className="small mb-0">Try selecting a different doctor or reset filters.</p>

                          </div>

                        </td>

                      </tr>

                    );

                  }


 

                 

                  return filteredQueue.sort((a,b)=>new Date(a.checkInTime).getTime()-new Date(b.checkInTime).getTime())

                  .map((t: any) => (

                    <tr key={`global-token-${t.id}`}>

                      <td className="fw-bold" style={{ color: '#f2994a' }}>{t.tokenDisplay}</td>

                      <td>

                        <div className="fw-bold">{t.patient?.name}</div>

                        <small className="text-muted">{t.patient?.phone}</small>

                      </td>

                      <td className="fw-medium">{calculateAge(t.patient?.dateOfBirth)}</td>

                      <td>

                        <div className="fw-bold">{t.doctor?.name}</div>

                        <small className="text-muted" style={{ fontSize: '10px' }}>{t.doctor?.department}</small>

                      </td>

                      <td>{formatTime(t.checkInTime)}</td>

                      <td>

                        <span className={`badge rounded-pill px-3 py-1 ${t.status === 'WAITING' ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'} border`} style={{ fontSize: '9px' }}>

                          {t.status}

                        </span>

                      </td>

                    </tr>

                  ));

                })()}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>


 

  );

};


 

export default ReceptionistDashboard;





 