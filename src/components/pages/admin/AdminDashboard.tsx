import React, { useEffect, useState, useCallback } from 'react';

import Swal from 'sweetalert2';

import Sidebar from '../../layout/Sidebar';
import axiosInstance from '../../../services/axiosInstance';

import { FaChevronLeft,FaChevronRight } from 'react-icons/fa';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';


 

interface AdminDashboardProps {}

interface Doctor {

    id: number;

    name: string;

    specialization: string;

    days: string[];

    timeStart: string;

    timeEnd: string;

    slot: string;

}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {

    const [activeTab, setActiveTab] = useState<'scheduling' | 'rules' | 'analytics'>('scheduling');

    const [doctors, setDoctors] = useState<Doctor[]>([]);

    const [showForm, setShowForm] = useState(false);

    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const [maxPatients, setMaxPatients] = useState(1);

    const [maxDays, setMaxDays] = useState(30);

    const [cutoffHours, setCutoffHours] = useState(2);

    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    // Validation Patterns

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const phoneRegex = /^[0-9]{10}$/;

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;


 

    // analytics states

   const todayStr = new Date().toISOString().split('T')[0];

   const [analyticsStartDate, setAnalyticsStartDate] = useState(todayStr);

   const [analyticsEndDate, setAnalyticsEndDate] = useState(todayStr);

   const [analyticsDept, setAnalyticsDept] = useState("");

   const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

   const [selectedDocId, setSelectedDocId] = useState<string>("");


 

   // chart data states

   const [chartData, setChartData] = useState<any[]>([]);

   const [isChartLoading, setIsChartLoading] = useState<boolean>(false);


 

   // api fetch for charts

   const fetchAnalyticsAndChartData = useCallback(async () => {

       if (!selectedDocId) return;

       setIsChartLoading(true);

       try {

           // fetch

           const statsRes = await axiosInstance.get('/clinicq/admin/stats/summary', {

               params: { startDate: analyticsStartDate, endDate: analyticsEndDate, doctorId: selectedDocId }

           });

           setStats({

               totalAppointments: statsRes.data.totalAppointments,

               totalWalkIns: statsRes.data.totalWalkIns,

               totalCompleted: statsRes.data.totalCompleted,

               totalNoShows: statsRes.data.totalNoShows

           });


 

           // Fetch Timeline Chart Trend

           const chartRes = await axiosInstance.get('/clinicq/admin/stats/chart', {

               params: { startDate: analyticsStartDate, endDate: analyticsEndDate, doctorId: selectedDocId }

           });

           

           const formattedChartData = chartRes.data.map((item: any) => {

               const dateObj = new Date(item.date);

               return {

                   ...item,

                   displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

               };

           });

           setChartData(formattedChartData);

           setCurrentCardIndex(0);

           setIsFlipped({});

       } catch (err) {

           console.error("Error updating admin analytics visualizers:", err);

       } finally {

           setIsChartLoading(false);

       }

   }, [analyticsStartDate, analyticsEndDate, selectedDocId]);


 

   

   useEffect(() => {

       fetchAnalyticsAndChartData();

   }, [fetchAnalyticsAndChartData]);





   const [stats, setStats] = useState({

       totalAppointments: 0,

       totalWalkIns: 0,

       totalCompleted: 0,

       totalNoShows: 0

   });


 

   // Navigation States

   const [currentCardIndex, setCurrentCardIndex] = useState(0);

   const [isFlipped, setIsFlipped] = useState<{ [key: number]: boolean }>({});


 

   useEffect(() => {

       if (!analyticsDept) {

           setFilteredDoctors([]);

           setSelectedDocId("");

           return;

       }

       const matched = doctors.filter(doc => 

           doc.specialization.toUpperCase() === analyticsDept.toUpperCase()

       );

       setFilteredDoctors(matched);

       setSelectedDocId("");

   }, [analyticsDept, doctors]);


 

   const fetchAnalyticsData = useCallback(async () => {

       if (!selectedDocId) return;

       try {

           const response = await axiosInstance.get('/clinicq/admin/stats/summary', {

               params: {

                   startDate: analyticsStartDate,

                   endDate: analyticsEndDate,

                   doctorId: selectedDocId

               }

           });

           setStats({

               totalAppointments: response.data.totalAppointments,

               totalWalkIns: response.data.totalWalkIns,

               totalCompleted: response.data.totalCompleted,

               totalNoShows: response.data.totalNoShows

           });

           setCurrentCardIndex(0);

           setIsFlipped({});

       } catch (err) {

           console.error("Error fetching analytics statistics:", err);

       }

   }, [analyticsStartDate, analyticsEndDate, selectedDocId]);


 

   useEffect(() => {

       fetchAnalyticsData();

   }, [fetchAnalyticsData]);


 

   

   const statsCards = [

       { label: 'Total Booked', val: stats.totalAppointments, col: '#007bff', icon: '📅', desc: 'Total scheduled sessions' },

       { label: 'Walk-ins', val: stats.totalWalkIns, col: '#20c997', icon: '🚶‍♂️', desc: 'Direct on-site arrivals' },

       { label: 'Completed', val: stats.totalCompleted, col: '#ff7e5f', icon: '✅', desc: 'Successful checkouts' },

       { label: 'No-Shows', val: stats.totalNoShows, col: '#ff6b6b', icon: '❌', desc: 'Missed appointment slots' }

   ];


 

   const handleNextCard = () => {

       setCurrentCardIndex((prev) => (prev === statsCards.length - 1 ? 0 : prev + 1));

   };


 

   const handlePrevCard = () => {

       setCurrentCardIndex((prev) => (prev === 0 ? statsCards.length - 1 : prev - 1));

   };


 

   const toggleCardFlip = (idx: number, flipState: boolean) => {

       setIsFlipped(prev => ({ ...prev, [idx]: flipState }));

   };


 

    const [formInputs, setFormInputs] = useState({

        name: "",

        email: "",

        password: "",

        phone: "",

        location: "",

        description: ""

    });

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

        const{name,value}=e.target;

        setFormInputs(prev=>({ ...prev, [name]: value }));

    }

   

    const handleUpdateRules = async () => {

        try {

            const response = await axiosInstance.post('/clinicq/admin/booking-rules', null, {

                params: { maxPatients, maxDays, cutoffHours }

            });

            if (response.status === 200) {

                Swal.fire({

                    title: 'Rules Updated!', text: response.data, icon: 'success',

                    background: '#fff', color: '#111', confirmButtonColor: '#ff7e5f'

                });

            }

        } catch (error: any) {

            Swal.fire({ title: 'Connection Failed', text: 'Check server connection.', icon: 'error', background: '#fff', color: '#111' });

        }

    };

    const handleSaveDoctor = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const dayMap: { [key: string]: string } = { 'Mon': 'MONDAY', 'Tue': 'TUESDAY', 'Wed': 'WEDNESDAY', 'Thu': 'THURSDAY', 'Fri': 'FRIDAY', 'Sat': 'SATURDAY', 'Sun': 'SUNDAY' };

        const selectedDaysList = selectedDays.map(d => dayMap[d]).join(',');

        try {

            if (editingDoctor) {

                await axiosInstance.put(`/clinicq/admin/doctor/${editingDoctor.id}`, null, {

                    params: {

                        days: selectedDaysList,

                        startTime: formData.get('timeStart'),

                        endTime: formData.get('timeEnd'),

                        slotDuration: parseInt((formData.get('slot') as string).split(' ')[0])

                    }

                });

                Swal.fire({ title: 'Updated!', text: 'Schedule configured', icon: 'success', confirmButtonColor: '#ff7e5f' });

            } else {

                const rawName = formData.get('name') as string;

                //const rawSlot=formData.get('slot') as string;

                const finalName = rawName.startsWith("Dr. ") ? rawName : `Dr. ${rawName}`;

                //const finalSlot=rawSlot?parseInt(rawSlot.split(' ')[0]):15;

                await axiosInstance.post(`/clinicq/admin/doctor`, null, {

                    params: {

                        email: formData.get('email'),

                        password: formData.get('password'),

                        name: finalName,

                        department: formData.get('department'),

                        gender: formData.get('gender'),

                        phone: formData.get('phone'),

                        location: formData.get('location'),

                        description: formData.get('description'),

                        days: selectedDaysList,

                        startTime: formData.get('timeStart'),

                        endTime: formData.get('timeEnd'),

                        slotDuration: parseInt((formData.get('slot') as string).split(' ')[0])

                    }

                });

                Swal.fire({ title: 'Registered!', text: 'Doctor added successfully.', icon: 'success', confirmButtonColor: '#ff7e5f' });

            }

            setShowForm(false);

            // if (onToggleForm) onToggleForm(false);

            setEditingDoctor(null);

            setSelectedDays([]);

            fetchDoctors();

        } catch (err: any) {

            Swal.fire({

                icon: 'error',

                title: 'Action Failed',

                text: 'Verify if rules are set',

                background: '#fff',

                color: '#111' });

        }

    };

    const formatDays = (days: string[]) => {

        const order = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

        const sortedDays = days.sort((a, b) => order.indexOf(a) - order.indexOf(b));

        if (sortedDays.length === 5 && sortedDays[0] === "MON" && sortedDays[4] === "FRI") return ["Mon-Fri"];

        if (sortedDays.length === 7 && sortedDays[0] === "MON" && sortedDays[6] === "SUN") return ["Mon-Sun"];

        return sortedDays.map(d => d.charAt(0) + d.slice(1).toLowerCase());

    };

    const fetchDoctors = useCallback(async () => {

        try {

            const response = await axiosInstance.get("/clinicq/admin/doctors");

            const grouped = new Map<number, any>();

            response.data.forEach((item: any) => {

                const docId = item.doctor.id;

                const day = item.dayOfWeek.substring(0, 3);

                if (grouped.has(docId)) {

                    const existing = grouped.get(docId);

                    if (!existing.days.includes(day)) existing.days.push(day);

                } else {

                    grouped.set(docId, {

                        id: docId, name: item.doctor.name, specialization: item.doctor.department,

                        days: [day], timeStart: item.startTime.substring(0, 5), timeEnd: item.endTime.substring(0, 5), slot: `${item.slotDuration} mins`

                    });

                }

            });

            const formattedDoctors = Array.from(grouped.values()).map(doc => ({ ...doc, days: formatDays(doc.days) }));

            setDoctors(formattedDoctors);

        } catch (err) { console.error(err); }

    }, []);

    const handleDeleteDoctor = (id: number) => {

        Swal.fire({

            title: 'Are you sure?', text: "Doctor will be removed permanently!", icon: 'warning',

            showCancelButton: true, confirmButtonColor: '#ff6b6b', cancelButtonColor: '#adb5bd',

            confirmButtonText: 'Delete', background: '#fff', color: '#111'

        }).then(async (result) => {

            if (result.isConfirmed) {

                try {

                    await axiosInstance.delete(`/clinicq/admin/doctor/${id}`);

                    setDoctors(prevDoctors=>prevDoctors.filter(doc=>doc.id!==id));

                    await Swal.fire({

                        title:'Deleted!',

                        text:'Doctor removed successfully.',

                        icon:'success',

                        timer:1500,

                        showConfirmButton:false

                    });

                    fetchDoctors();

                } catch (err) { Swal.fire('Error', 'Delete failed. Please try again.', 'error'); }

            }

        });

    };

    const openForm = (doc: Doctor | null) => {

        setEditingDoctor(doc);

        setSelectedDays(doc ? doc.days : []);

        setShowForm(true);

        // if (onToggleForm) onToggleForm(true);

    };

    const closeForm = () => {

        setShowForm(false);

        setFormInputs({ name: "", email: "", password: "", phone: "", location: "", description: "" });

        setEditingDoctor(null);

        setSelectedDays([]);

        // if (onToggleForm) onToggleForm(false);

    };

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    // completion in real time

    useEffect(() => {

        const { name, email, password, phone, location, description } = formInputs;

        if (editingDoctor) {

            setIsFormValid(selectedDays.length > 0);

            return;

        }

        const isNameOk = /^[a-zA-Z\S]{2,50}$/.test(name);

        const isEmailOk = emailRegex.test(email);

        const isPassOk = passRegex.test(password);

        const isPhoneOk = phoneRegex.test(phone);

        const isOtherOk = formInputs.location.trim().length>=2 && formInputs.description.trim().length >= 10;

        const isDaysOk = selectedDays.length > 0;

        setIsFormValid(isNameOk && isEmailOk && isPassOk && isPhoneOk && isOtherOk && isDaysOk);

    }, [formInputs, selectedDays, editingDoctor]);

    return (

        <div className="d-flex min-vh-100" style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-grow-1 p-4 overflow-auto">

                <style>

                    {`

                    .glass-panel {

                        background: rgba(255, 255, 255, 0.7);

                        backdrop-filter: blur(25px);

                        -webkit-backdrop-filter: blur(25px);

                        border: 1px solid rgba(0, 0, 0, 0.05);

                        border-radius: 24px;

                        box-shadow: 0 10px 30px rgba(0,0,0,0.02);

                    }

                    .custom-table thead th {

                        background: transparent;

                        color: #adb5bd;

                        text-transform: uppercase;

                        font-size: 0.7rem;

                        letter-spacing: 1px;

                        border-bottom: 2px solid #f1f3f5;

                    }

                    .animate-in { animation: slideUp 0.5s ease-out forwards; }

                    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

                    .btn-vivid {

                        background: linear-gradient(90deg, #ff7e5f 0%, #ff6b6b 100%);

                        color: white; border: none; border-radius: 12px; font-weight: 700; transition: transform 0.2s;

                    }

                    .btn-vivid:hover { transform: translateY(-2px); color: white; box-shadow: 0 5px 15px rgba(255, 126, 95, 0.3); }

                    .form-control-custom { background: #fff !important; border: 1px solid #dee2e6 !important; border-radius: 10px; padding: 10px 15px; }

                    /* CAROUSEL SLIDER */

                   .analytics-carousel-wrapper {

                       position: relative;

                       width: 100%;

                       max-width: 450px;

                       margin: 0 auto;

                       perspective: 1200px; /* Establishes deep 3D space perspective */

                   }

                   .analytics-card-inner {

                       position: relative;

                       width: 100%;

                       height: 250px;

                       text-align: center;

                       transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

                       transform-style: preserve-3d !important; /* Preserves 3D layers during rotation */

                   }

                   .analytics-card-is-flipped {

                       transform: rotateY(180deg) !important;

                   }

                   .analytics-card-front, .analytics-card-back {

                       position: absolute;

                       width: 100%;

                       height: 100%;

                       -webkit-backface-visibility: hidden !important;

                       backface-visibility: hidden !important;

                       border-radius: 24px;

                       display: flex;

                       flex-direction: column;

                       justify-content: center;

                       align-items: center;

                       padding: 20px;

                   }

                   .analytics-card-front {

                       background: #ffffff !important;

                       border: 1px solid rgba(0, 0, 0, 0.05);

                       z-index: 2;

                       transform: rotateY(0deg) !important; /* Base orientation */

                   }

                   .analytics-card-back {

                       transform: rotateY(180deg) !important; 

                       z-index: 1;

                   }

                   .carousel-arrow {

                       background: #ffffff;

                       border: 1px solid #dee2e6;

                       width: 45px;

                       height: 45px;

                       border-radius: 50%;

                       display: flex;

                       align-items: center;

                       justify-content: center;

                       cursor: pointer;

                       transition: all 0.2s ease;

                       box-shadow: 0 4px 10px rgba(0,0,0,0.05);

                   }

                   .carousel-arrow:hover {

                       background: #f8f9fa;

                       transform: scale(1.05);

                   }

                   .dot-indicator {

                       width: 10px;

                       height: 10px;

                       border-radius: 50%;

                       background: #dee2e6;

                       transition: all 0.3s ease;

                       border: none;

                       padding: 0;

                   }

                   .dot-active {

                       background: #ec89dd !important;

                       width: 24px;

                       border-radius: 10px;

                   }

                   .gradient-filter-panel {

                       background: rgba(255, 255, 255, 0.85) !important;

                       backdrop-filter: blur(20px);

                       -webkit-backdrop-filter: blur(20px);

                       border: 2px solid transparent !important;

                       background-image: linear-gradient(white, white), linear-gradient(135deg, #6a11cb 0%, #ff7e5f 50%, #0beacb 100%) !important;

                       background-origin: border-box !important;

                       background-clip: padding-box, border-box !important;

                       border-radius: 30px !important;

                       box-shadow: 0 15px 35px rgba(0,0,0,0.05) !important;

                   }

                   .input-icon-wrapper {

                       width: 42px;

                       height: 42px;

                       border-radius: 12px;

                       display: flex;

                       align-items: center;

                       justify-content: center;

                       font-size: 1.1rem;

                       color: white;

                       box-shadow: 0 4px 10px rgba(0,0,0,0.05);

                   }

                   .filter-label-custom {

                       font-size: 0.75rem;

                       font-weight: 700;

                       letter-spacing: 0.5px;

                       color: #495057;

                       margin-left: 2px;

                   }

                   .analytics-filter-card {

                     

                       background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fef7ff 100%) !important;

                       border-image: linear-gradient(135deg,#ff7e5f 0%,#ff6b6b 50%,#fecfef 100%) 1 !important;

                       border-radius: 28px;

                       padding: 15px;

                       box-shadow: 0 15px 35px rgba(255, 154, 158, 0.15);

                       transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

                   }

                   .analytics-filter-card:hover {

                       transform: translateY(-2px);

                       box-shadow: 0 20px 45px rgba(255, 154, 158, 0.25);

                       border-color: linear-gradient(135deg,#ff6b6b 0%,#ff4757 100%) 1 !important;

                   }

                   .icon-wrapper-accent {

                       background: #ffffff !important;

                       width: 44px;

                       height: 44px;

                       border-radius: 14px;

                       display: flex;

                       align-items: center;

                       justify-content: center;

                       font-size: 1.25rem;

                       box-shadow: 0 6px 15px rgba(0,0,0,0.05);

                       transition: transform 0.3s ease;

                   }

                   .filter-group-container:hover .icon-wrapper-accent {

                       transform: scale(1.08) rotate(3deg);

                   }

                   .input-label-premium {

                       font-size: 1.2rem !important;

                       font-weight: 700 !important;

                       letter-spacing: 0.8 px;

                       color: #4a2831 !important; 

                       text-transform: uppercase;

                   }

                   .form-control-premium {

                       background: #ffffff !important;

                       border: 1px solid rgba(255, 255, 255, 0.5) !important;

                       border-radius: 14px;

                       padding: 12px 16px;

                       font-weight: 700;

                       color: #2d3748 !important; 

                       transition: all 0.3s ease;

                       font-size: 0.95rem;

                       box-shadow: 0 4px 10px rgba(0,0,0,0.02);

                   }

                   .form-control-premium:focus {

                       background: #ffffff !important;

                       border-color: #ff6b6b !important;

                       box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.2) !important;

                       color: #000000 !important;

                   }

                   .form-control-premium:disabled {

                       background: rgba(255, 255, 255, 0.4) !important;

                       color: rgba(0, 0, 0, 0.3) !important;

                       opacity: 0.7;

                       cursor: not-allowed;

                   }

                    @keyframes dynamicGradientFlow{

                        0% { background-position: 0% 50%;}

                        50% {background-position: 100% 50%;}

                        100% {background-position: 0% 50%;}

                    }

                    .animate-back-gradient{

                        background-size:400% 400% !important;

                        animation: dynamicGradientFlow 6s ease infinite !important;

                    }

                   .analytics-chart-panel {


 

                       background: linear-gradient(135deg,rgba(255,154,158,0.15) 0%,rgba(254,207,239,0.15) 100%) !important;

                       backdrop-filter: blur(20px) saturate(180%);

                       -webkit-backdrop-filter: blur(20px) saturate(180%);

                       border: 2px solid transparent !important;

                       background-clip: padding-box,border-box !important;

                       background-origin:padding-box,border-box !important;

                       background-image:linear-gradient(rgba(255,255,255,0.8),rgba(255,255,255,0.8)), linear-gradient(135deg,rgba(255,126,95,0.4) 0%,rgba(254,207,239,0.6) 100%) !important;

                       border-radius: 24px;

                       padding: 2rem;

                       box-shadow: 0 15px 35px rgba(255,154,158,0.12);

                       transition: all 0.5s cubic-bezier(0.16,1,0.3,1);

                   }

                   .analytics-chart-panel:hover {

                       transform:translateY(-3px);

                       background-image:linear-gradient(rgba(255,255,255,0.9),rgba(255,255,255,0.9)),linear-gradient(135deg,#ff7e5f 0%,#ff6b6b 100%) !important;

                       box-shadow: 0 20px 45px rgba(255, 154, 158, 0.22);

                   }

                    .volume-trend-badge{

                        background: #ffffff !important;

                        border:1px solid rgba(255,126,95,0.2) !important;

                        color: #ff7e5f !important;

                        padding:8px 16px;

                        border-radius:12px;

                        font-size:11px;

                        display:flex;

                        align-items:center;

                        gap:6px;

                        box-shadow: 0 4px 10px rgba(255,154,158,0.1);

                    }

                    `}

                </style>

                {/* SCHEDULING */}

                {activeTab === 'scheduling' && (

                    <div className="animate-in">

                        <div className="d-flex justify-content-between align-items-center mb-4 px-2">

                            <h2 className="fw-bold m-0" style={{ color: '#111' }}>Doctor Scheduling</h2>

                            <button className="btn btn-vivid px-4 shadow-sm" onClick={() => openForm(null)}>+ Add New Doctor</button>

                        </div>

                        <div className="glass-panel p-4">

                            <div className="table-responsive">

                                <table className="table custom-table align-middle mb-0">

                                    <thead>

                                        <tr>

                                            <th>Doctor Name</th>

                                            <th>Department</th>

                                            <th>Working Days</th>

                                            <th>Hours</th>

                                            <th>Slot</th>

                                            <th className="text-end">Actions</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {doctors.length > 0 ? doctors.map(doc => (                                            <tr key={doc.id}>

                                                <td className="fw-bold" style={{ color: '#2c3e50' }}>{doc.name}</td>

                                                <td><span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(255,126,95,0.1)', color: '#ff7e5f' }}>{doc.specialization}</span></td>

                                                <td className="small text-muted fw-bold">{doc.days.join(", ")}</td>

                                                <td className="small fw-bold">{doc.timeStart} — {doc.timeEnd}</td>

                                                <td><b style={{ color: '#ff7e5f' }}>{doc.slot}</b></td>

                                                <td className="text-end">

                                                    <div className="d-flex gap-2 justify-content-end">

                                                        <button className="btn btn-sm fw-bold px-3 border" style={{ borderRadius: '8px', color: '#ffc107' }} onClick={() => openForm(doc)}>Modify</button>

                                                        <button className="btn btn-sm fw-bold px-3 border" style={{ borderRadius: '8px', color: '#ff6b6b' }} onClick={() => handleDeleteDoctor(doc.id)}>Delete</button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )) : <tr><td colSpan={6} className="text-center py-5 text-muted italic">No doctors registered yet.</td></tr>}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                )}

                {/* RULES */}

                {activeTab === 'rules' && (

                    <div className="animate-in">

                        <h2 className="fw-bold mb-4 px-2">System Rules</h2>

                        <div className="glass-panel p-5 col-lg-7">

                            <div className="mb-4">

                                <label className="small fw-bold text-muted text-uppercase mb-2">Number of Persons Allowed Per Slot</label>

                                <input type="number" className="form-control form-control-custom" value={maxPatients} onChange={(e) => setMaxPatients(parseInt(e.target.value) || 0)} min={1} />

                            </div>

                            <div className="mb-4">

                                <label className="small fw-bold text-muted text-uppercase mb-2">Max Advance Booking (Days)</label>

                                <input type="number" className="form-control form-control-custom" value={maxDays} onChange={(e) => setMaxDays(parseInt(e.target.value))} />

                            </div>

                            <div className="mb-5">

                                <label className="small fw-bold text-muted text-uppercase mb-2">Reschedule & Cancellation Window (Hours)</label>

                                <input type="number" className="form-control form-control-custom" value={cutoffHours} onChange={(e) => setCutoffHours(parseInt(e.target.value))} />

                            </div>

                            <button className="btn btn-vivid w-100 py-3 fw-bold shadow" onClick={handleUpdateRules}>SAVE SYSTEM RULES</button>

                        </div>

                    </div>

                )}          

                {/* ANALYTICS */}

               {activeTab === 'analytics' && (

                   <div className="animate-in">

                       <div className="mb-4 px-2">

                           <h2 className="fw-bold m-0" style={{ color: '#111', letterSpacing: '-0.5px' }}>Clinic Analytics</h2>

                           <p className="text-muted small mb-0 mt-1">Monitor real-time performance metrics and physician scheduling distributions.</p>

                       </div>

                       <div className="analytics-filter-card mb-3 shadow-sm row py-4 mx-0">

                           {/* Start Date */}

                           <div className="col-12 col-sm-6 col-md-3 filter-group-container">

                               <div className="d-flex align-items-center gap-3 mb-2">

                                   <div className="icon-wrapper-accent" style={{ background: 'rgba(0, 123, 255, 0.1)', color: '#007bff' }}>

                                       📅

                                   </div>

                                   <span className="input-label-premium">Start Date</span>

                               </div>

                               <input 

                                   type="date" 

                                   className="form-control form-control-premium shadow-none" 

                                   value={analyticsStartDate} 

                                   onChange={(e) => setAnalyticsStartDate(e.target.value)} 

                               />

                           </div>

                           {/* End Date */}

                           <div className="col-12 col-sm-6 col-md-3 filter-group-container">

                               <div className="d-flex align-items-center gap-3 mb-2">

                                   <div className="icon-wrapper-accent" style={{ background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}>

                                       ⏳

                                   </div>

                                   <span className="input-label-premium">End Date</span>

                               </div>

                               <input 

                                   type="date" 

                                   className="form-control form-control-premium shadow-none" 

                                   value={analyticsEndDate} 

                                   onChange={(e) => setAnalyticsEndDate(e.target.value)} 

                               />

                           </div>

                           {/* Department Selector */}

                           <div className="col-12 col-sm-6 col-md-3 filter-group-container">

                               <div className="d-flex align-items-center gap-3 mb-2">

                                   <div className="icon-wrapper-accent" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107' }}>

                                       🏥

                                   </div>

                                   <span className="input-label-premium">Department</span>

                               </div>

                               <select 

                                   className="form-select form-control-premium shadow-none" 

                                   value={analyticsDept} 

                                   onChange={(e) => setAnalyticsDept(e.target.value)}

                                   style={{colorScheme:'dark'}}>

                                   <option value="">Select Wing</option>

                                   <option value="GENERAL">General Medicine</option>

                                   <option value="CARDIOLOGY">Cardiology</option>

                                   <option value="ORTHOPEDICS">Orthopedics</option>

                                   <option value="PEDIATRICS">Pediatrics</option>

                               </select>

                           </div>


 

                           {/* Physician Selector */}

                           <div className="col-12 col-sm-6 col-md-3 filter-group-container">

                               <div className="d-flex align-items-center gap-3 mb-2">

                                   <div className="icon-wrapper-accent" style={{ background: 'rgba(32, 201, 151, 0.1)', color: '#20c997' }}>

                                       👨‍⚕️

                                   </div>

                                   <span className="input-label-premium">Medical Expert</span>

                               </div>

                               <select 

                                   className="form-select form-control-premium shadow-none" 

                                   disabled={!analyticsDept} 

                                   value={selectedDocId} 

                                   onChange={(e) => setSelectedDocId(e.target.value)}>

                                   <option value="">Select Professional</option>

                                   {filteredDoctors.map(doc => (

                                       <option key={doc.id} value={doc.id}>{doc.name}</option>

                                   ))}

                               </select>

                           </div>

                       </div>


 

                       {/* CAROUSEL BLOCK */}

                       {selectedDocId ? (

                           <div className="d-flex flex-column align-items-center justify-content-center py-4 animate-in">

                               <div className="d-flex align-items-center gap-4 w-100 justify-content-center">

                                   <button className="carousel-arrow" onClick={handlePrevCard} aria-label="Previous metrics panel">

                                      <FaChevronLeft style={{ color:'#6c757d',fontSize:'1.1rem'}}/>

                                   </button>

                                   <div className="analytics-carousel-wrapper">

                                       <div 

                                           className={`analytics-card-inner ${isFlipped[currentCardIndex] ? 'analytics-card-is-flipped' : ''}`}

                                           onMouseEnter={() => toggleCardFlip(currentCardIndex, true)}

                                           onMouseLeave={() => toggleCardFlip(currentCardIndex, false)}>

                                         

                                           <div className="analytics-card-front shadow-sm">

                                               <div className="fs-1 mb-2">{statsCards[currentCardIndex].icon}</div>

                                               <h4 className="fw-bold mb-1" style={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>

                                                   {statsCards[currentCardIndex].label}

                                               </h4>

                                               <p className="small text-muted mb-0 mt-2 px-3">{statsCards[currentCardIndex].desc}</p>

                                               <small className="text-secondary mt-3 opacity-50" style={{ fontSize: '11px', fontWeight: '600' }}>Hover to flip card →</small>

                                           </div>


 

                                           <div 

                                               className="analytics-card-back shadow-lg animated-back-gradient" 

                                               style={{ 

                                                   background: currentCardIndex === 0 

                                                       ? 'linear-gradient(-45deg, #007bff, #00c6ff, #007bff, #0056b3)'

                                                       : currentCardIndex === 1

                                                       ? 'linear-gradient(-45deg, #20c997, #0beacb, #20c997, #137356)'

                                                       : currentCardIndex === 2

                                                       ? 'linear-gradient(-45deg, #ff7e5f, #ff6b6b, #feb47b, #ff7e5f)'

                                                       : 'linear-gradient(-45deg, #ff6b6b, #ff4757, #ff6b6b, #b3323e)'  

                                               }}>

                                               <h6 className="text-white text-opacity-75 small fw-bold text-uppercase mb-2" style={{ fontSize: '27px', color: '#ffffff', letterSpacing: '0.5px' }}>

                                                   {statsCards[currentCardIndex].label} Metrics

                                               </h6>

                                               <h1 className="display-2 fw-bold m-0 text-white animate-in" style={{ color: '#ffffff', fontWeight: '800' }}>

                                                   {statsCards[currentCardIndex].val}

                                               </h1>                                        

                                               <small className="text-dark text-opacity-50 mt-3" style={{ fontSize: '17px', color: 'rgba(211, 198, 198, 0.6)' }}>

                                                   ClinicQ Live Data Captured

                                               </small>

                                           </div>

                                       </div>

                                   </div>

                                   <button className="carousel-arrow" onClick={handleNextCard} aria-label="Next metrics panel">

                                      <FaChevronRight style={{ color:'#6c757d',fontSize:'1.1rem'}}/>

                                   </button>

                               </div>

                               {/* Pagination Bottom bar */}

                               <div className="d-flex gap-2 mt-4 justify-content-center">

                                   {statsCards.map((_, idx) => (

                                       <button 

                                           key={idx} 

                                           onClick={() => setCurrentCardIndex(idx)} 

                                           className={`dot-indicator ${currentCardIndex === idx ? 'dot-active' : ''}`}

                                           aria-label={`Jump directly to panel slide index number ${idx + 1}`}

                                       />

                                   ))}

                               </div>

                               {/* CHART VISUALIZER */}

                               <div className="analytics-chart-panel w-100 mt-5 animate-in" style={{ maxWidth: '850px' }}>

                                   <div className="d-flex justify-content-between align-items-center mb-4">

                                       <div>

                                           <h5 className="fw-bold m-0" style={{ color: '#4a2831',letterSpacing:'-0.3px'}}>Patient Inflow Analysis</h5>

                                           <small className="text-secondary fw-medium" style={{fontSize:'12px',color:'#6c757d'}}>Timeline distribution tracking cumulative visits</small>

                                       </div>

                                       <span className="volume-trend-badge fw-bold">

                                           <span style={{color:'#ff7e5f'}}>📈</span> Volume Trend

                                       </span>

                                   </div>

                                   {isChartLoading ? (

                                       <div className="text-center py-5">

                                           <div className="spinner-border text-coral" style={{ color: '#ff7e5f' }}></div>

                                       </div>

                                   ) : chartData.length > 0 ? (

                                       <div className='p-3 rounded-4 shadow-inner' style={{ width: '100%', height: 320,background: '#ffffff',border:'1 px solid rgba(255,154,158,0.15)',boxShadow:'inset 0 2px 8px rgba(0,0,0,0.01)'}}>

                                           <ResponsiveContainer>

                                               <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5}}>

                                                   <defs>

                                                       <linearGradient id="lightSunsetMeshGradient" x1="0" y1="0" x2="0" y2="1">

                                                           <stop offset="0%" stopColor="#ff7e5f" stopOpacity={0.6}/>

                                                           <stop offset="40%" stopColor="#ff6b6b" stopOpacity={0.35}/>

                                                           <stop offset="75%" stopColor="#fecfef" stopOpacity={0.15}/>

                                                           <stop offset="100%" stopColor="#fef7ff" stopOpacity={0.02}/>

                                                       </linearGradient>

                                                   </defs>

                                                   <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,154,158,0.12)" vertical={false} />                                                

                                                   <XAxis 

                                                       dataKey="displayDate" 

                                                       axisLine={false} 

                                                       tickLine={false} 

                                                       tick={{ fill: '#7a6e71', fontSize: 12, fontWeight: 700 }} 

                                                   />

                                                   <YAxis 

                                                       axisLine={false} 

                                                       tickLine={false} 

                                                       allowDecimals={false}

                                                       tick={{ fill: '#7a6e71', fontSize: 12, fontWeight: 700 }} 

                                                   />  

                                                   <Tooltip 

                                                       contentStyle={{ 

                                                           background: '#ffffff', 

                                                           border: '1px solid rgba(255,126,95,0.2)', 

                                                           borderRadius: '16px', 

                                                           backdropFilter:'blur(10px)',

                                                           boxShadow: '0 15px 30px rgba(255,154,158,0.15)' 

                                                       }}

                                                       labelStyle={{ fontWeight: '700', color: '#4a2831' }}

                                                       itemStyle={{ fontWeight: '600', color: '#ff7e5f' }}

                                                   />                                                  

                                                   <Area 

                                                       type="monotone" 

                                                       dataKey="patientCount" 

                                                       name="Patients Served"

                                                       stroke="#ff6b6b" 

                                                       strokeWidth={4.5} 

                                                       fillOpacity={1} 

                                                       fill="url(#lightSunsetMeshGradient)" 

                                                       activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 3, fill: '#ff6b6b',style:{filter:'drop-shadow(0 4px 12px rgba(255,107,107,0.5))'} }}

                                                   />

                                               </AreaChart>

                                           </ResponsiveContainer>

                                       </div>

                                   ) : (

                                       <div className="text-center py-5 text-dark text-opacity-40 italic small">

                                           Insufficient timeline metrics generated for this timeframe.

                                       </div>

                                   )}

                               </div>

                            </div>

                       ) : (

                           <div className="text-center py-5 glass-panel col-lg-8 mx-auto mt-4 text-muted border-dashed border-2 animate-in" style={{ borderStyle: 'dashed' }}>

                               <div className="fs-2 mb-2">📊</div>

                               <h5 className="fw-bold">No Metrics Selected</h5>

                               <p className="small text-muted mb-0">Please set filter options above to view specialized medical reports.</p>

                           </div>

                       )}

                   </div>

               )}

                {/* Form */}

                {showForm && (

                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 1050, backdropFilter: 'blur(10px)' }}>

                        <div className="glass-panel p-5 animate-in" style={{ width: '520px', maxHeight: '90vh', overflowY: 'auto', background: '#fff' }}>

                            <h3 className="fw-bold mb-4" style={{ color: '#111' }}>{editingDoctor ? `Configure Schedule` : 'Add New Professional'}</h3>

                            <form onSubmit={handleSaveDoctor}>

                                {!editingDoctor && (

                                    <div className="row g-3 mb-1">

                                        <div className="col-6">

                                            <div className='input-group'>

                                                <span className='input-group-text bg-light border-end-0 text-muted fw-bold'

                                                    style={{ borderRadius: '10px 0 0 10px', fontSize: '0.9rem' }}>

                                                    Dr.

                                                </span>

                                                <input name="name" placeholder="Full Name"

                                                    value={formInputs.name}

                                                    onChange={handleFieldChange}

                                                    className="form-control form-control-custom shadow-none"

                                                    style={{ borderRadius: '0 10px 10px 0', borderLeft: 'none' }} required />

                                                <div style={{ minHeight: '10px' }}>

                                                    {formInputs.name && !/^[a-zA-Z\s]{2,50}$/.test(formInputs.name) && (

                                                        <small className='text-danger' style={{ fontSize: '9px', display: 'block' }}>

                                                            * Name should be at least 2 letters.

                                                        </small>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                        <div className="col-6">

                                            <input name="email" type="email"

                                                value={formInputs.email}

                                                placeholder="Email" className="form-control form-control-custom shadow-none" onChange={handleFieldChange} required />

                                            <div style={{ minHeight: '10px' }}>

                                                {formInputs.email && !emailRegex.test(formInputs.email) && (

                                                    <small className='text-danger' style={{ fontSize: '9px' }}>

                                                        * Enter a valid email

                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                        <div className="col-6">

                                            <input name="password" type="password"

                                                placeholder="Password"

                                                value={formInputs.password}

                                                onChange={handleFieldChange} className={`form-control form-control-custom shadow-none ${formInputs.password && !passRegex.test(formInputs.password)?'border-danger':''}`} required />

                                            <div style={{ minHeight: '10px' }}>

                                                {formInputs.password && !passRegex.test(formInputs.password) && (

                                                    <small className='text-danger' style={{ fontSize: '9px', lineHeight: '1' }}>

                                                        * Use 8+ characters with letters,numbers and special characters.

                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                        <div className="col-6">

                                            <input name="phone" placeholder="Contact no"

                                                value={formInputs.phone}

                                                onChange={handleFieldChange} maxLength={10} className="form-control form-control-custom shadow-none" required />

                                            <div style={{ minHeight: '10px' }}>

                                                {formInputs.phone && !phoneRegex.test(formInputs.phone) && (

                                                    <small className='text-danger' style={{ fontSize: '9px' }}>

                                                        * Enter 10 digits

                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                        <div className="col-6">

                                            <select name="department" className="form-select form-control-custom" required>

                                                <option value="" disabled selected hidden>Select Department</option>

                                                <option value="GENERAL">GENERAL</option>

                                                <option value="CARDIOLOGY">CARDIOLOGY</option>

                                                <option value="ORTHOPEDICS">ORTHOPEDICS</option>

                                                <option value="PEDIATRICS">PEDIATRICS</option>

                                            </select>

                                        </div>

                                        <div className="col-6">

                                            <select name="gender" className="form-select form-control-custom" required>

                                                <option value="" disabled selected hidden>Gender</option>

                                                <option value="MALE">MALE</option>

                                                <option value="FEMALE">FEMALE</option>

                                            </select>

                                        </div>

                                        <div className="col-12">

                                            <input name="location" placeholder="Consultation Room No." className="form-control form-control-custom shadow-none"

                                            value={formInputs.location}

                                            onChange={handleFieldChange}

                                            required />

                                            <div style={{minHeight:'10px'}}>

                                                {formInputs.location && formInputs.location.trim().length<2 && (

                                                    <small className='text-danger' style={{fontSize:'9px'}}>

                                                        * Please enter a room no.

                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                        <div className="col-12">

                                            <textarea name="description" placeholder="Description" className="form-control form-control-custom shadow-none" rows={2}

                                            value={formInputs.description}

                                            onChange={handleFieldChange}

                                            required></textarea>

                                            <div style={{minHeight:'10px'}}>

                                                {formInputs.description && formInputs.description.trim().length<10 && (

                                                    <small className='text-danger' style={{ fontSize:'9px'}}>* Bio should be atleast 10 characters long.</small>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                )}

                                <div className="mb-4">

                                    <label className="fw-bold small text-muted mb-2">Operating Days</label>

                                    <div className="d-flex flex-wrap gap-2">

                                        {allDays.map(day => (

                                            <div key={day}>

                                                <input type="checkbox" className="btn-check" id={`btn-${day}`} checked={selectedDays.includes(day)} onChange={(e) => e.target.checked ? setSelectedDays([...selectedDays, day]) : setSelectedDays(selectedDays.filter(d => d !== day))} />

                                                <label className={`btn btn-sm px-3 rounded-pill fw-bold ${selectedDays.includes(day) ? 'btn-danger text-white border-0' : 'btn-outline-secondary'}`} htmlFor={`btn-${day}`}>{day}</label>

                                            </div>

                                        ))}

                                    </div>

                                    {selectedDays.length === 0 && (

                                        <small className='text-danger d-block mt-1' style={{ fontSize: '10px' }}>

                                            * Select atleast one working day.

                                        </small>

                                    )}

                                </div>

                                <div className="row g-3 mb-4">

                                    <div className="col-6"><label className="small fw-bold text-muted mb-1">Shift Start</label><input type="time" name="timeStart" className="form-control form-control-custom" defaultValue={editingDoctor?.timeStart || "09:00"} /></div>

                                    <div className="col-6"><label className="small fw-bold text-muted mb-1">Shift End</label><input type="time" name="timeEnd" className="form-control form-control-custom" defaultValue={editingDoctor?.timeEnd || "17:00"} /></div>

                                    <div className="col-12">

                                        <label className="small fw-bold text-muted mb-2">Slot duration</label>

                                        <select name="slot" className="form-select form-control-custom" defaultValue={editingDoctor?.slot || "15 mins"}>

                                            <option value="" disabled selected hidden>slot time</option>

                                            <option value="10 mins">10 mins</option>

                                            <option value="15 mins">15 mins</option>

                                            <option value="20 mins">20 mins</option>

                                        </select>

                                    </div>

                                </div>

                                <div className="d-flex gap-3">

                                    <button type="submit"

                                        disabled={!isFormValid}

                                        className="btn btn-vivid flex-grow-1 py-3 fw-bold"

                                        style={{

                                            background: !isFormValid ? '#adb5bd' : 'linear-gradient(90deg, #ff7e5f 0%, #ff6b6b 100%)',

                                            cursor: !isFormValid ? 'not-allowed' : 'pointer',

                                            opacity: !isFormValid ? 0.7 : 1

                                        }}

                                    >DEPLOY UPDATES</button>

                                    <button type="button" className="btn btn-outline-dark px-4 rounded-3 border-0 fw-bold" onClick={closeForm}>Cancel</button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

};


 

export default AdminDashboard;