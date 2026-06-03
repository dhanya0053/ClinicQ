

import React, { useState, useEffect, useCallback } from 'react';

import axiosInstance from '../../../services/axiosInstance';

import { useNavigate } from 'react-router-dom';

import { FaClinicMedical } from 'react-icons/fa';

interface HistoryProps {

  onNavigate: (tab: 'book' | 'my' | 'history' | 'token') => void;

}


 

const PastHistory: React.FC<HistoryProps> = ({ onNavigate }) => {

  const navigate=useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const [filterMode, setFilterMode] = useState<'dr' | 'date'>('dr');

  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  const [historyData, setHistoryData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [visitDetail, setVisitDetail] = useState<any>(null);

  const [fetchingDetail, setFetchingDetail] = useState(false);


 

  const handleViewDossier = async (visit: any) => {

    setSelectedVisit(visit);

    setFetchingDetail(true);

    try {

      const res = await axiosInstance.get(`/clinicq/patient/appointment/history/${visit.id}`);

      setVisitDetail(res.data);

    } catch (err) {

      console.error("Error fetching dossier:", err);

      setVisitDetail(null);

    } finally {

      setFetchingDetail(false);

    }

  };

  const fetchHistory = useCallback(async () => {

    if (filterMode === 'date' && !startDate && !endDate) return;

    setLoading(true);

    try {

      const response = await axiosInstance.get(`/clinicq/patient/appointments/history`, {

        params: {

          startDate: filterMode === 'date' ? startDate : null,

          endDate: filterMode === 'date' ? endDate : null,

        }

      });

      setHistoryData(response.data);

    } catch (err) {

      console.error("Error fetching history: ", err);

    } finally {

      setLoading(false);

    }

  }, [filterMode, startDate, endDate]);


 

  useEffect(() => {

    fetchHistory();

  }, [fetchHistory]);


 

  const filteredHistory = historyData.filter(item => {

    if (!searchTerm && filterMode === 'dr') return true;

    if (filterMode === 'dr') {

      const drName = item.doctor?.name || "";

      return drName.toLowerCase().includes(searchTerm.toLowerCase());

    } else {

      const dateValue = item.slotDate || item.timeSlot?.slotDate || item.slot?.slotDate || item.date;

      if (!startDate || !endDate || !dateValue) return false;

      const recordDate = new Date(dateValue);

      const start = new Date(startDate);

      const end = new Date(endDate);

      if (isNaN(recordDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      recordDate.setHours(0, 0, 0, 0);

      start.setHours(0, 0, 0, 0);

      end.setHours(0, 0, 0, 0);

      return recordDate >= start && recordDate <= end;

    }

  });


 

  return (

    <div className="d-flex min-vh-100 overflow-hidden"

      style={{ background: 'radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%)', color: '#212529', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

      <style>

        {`

          .glass-panel-light { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(0, 0, 0, 0.05); border-radius: 20px; }

          .history-card { background: #ffffff; border: 1px solid #eee; border-radius: 16px; transition: all 0.3s ease; }

          .history-card:hover { transform: translateX(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #20c997; }

          .active-record { border-left: 5px solid #20c997 !important; background: rgba(32, 201, 151, 0.05); }

          .timeline-dot { width: 12px; height: 12px; background: #20c997; border: 3px solid #fff; box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1); }

          .custom-input { background: #fff !important; border: 1px solid #dee2e6 !important; font-weight: 600; }

          .animate-slide-in { animation: slideIn 0.4s ease-out; }

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

          .dossier-content{

            flex-grow:1;

            overflow-y:auto;

            padding-right:8px;

          }

          .dossier-panel{

            display:flex;

            flex-direction:column;

            height:100%;

            border-radius:20px;

            background:#fff;

          }

          .dossier-panel-fixed{

            display:flex;

            flex-direction:column;

            height:100%;

            background:#fff;

            border-radius:20px;

            overflow:hidden

          }

          .dossier-internal-scroll{

            flex:1;

            overflow-y:auto;

            padding-right:5px;

          }

          .dossier-scroll-area{

            flex:1;

            overflow-y:auto;

            padding-right:8px;

           

          }

          .dossier-scroll-area::-webkit-scrollbar{

            width:6px;

          }

          .dossier-scroll-area::-webkit-scrollbar-thumb{

            background:#20c997;

            border-radius:10px;

          }

          .dossier-content::-webkit-scrollbar{

            width:6px;

          }

          .dossier-content::-webkit-scrollbar-thumb{

            background:#dee2e6;

            border-radius:10px;

          }

          .history-main-layout{

            display:flex;

            height:calc(100vh-180px);

            overflow:hidden;

          }

          .left-scroll-column{

            height:100%;

            overflow-y:auto;

            padding-right:15px;

            scrollbar-width:thin;

          }

          .right-sticky-column{

            height:100%;

            display:flex;

            flex-direction:column;

          }

          .left-timeline-scroll{

            flex:1;

            height: 100%;

            overflow-y:auto;

            padding-right:15px;

            padding-bottom:50px;

          }

          .sticky-dossier-panel{

            width:40%;

            height:100%;

            display:flex;

            flex-direction:column;

          }

          .logo-m { width:36px;height:36px;background:linear-gradient(135deg,#ff7e5f,#ff6b6b);border-radius:10px;display:flex;align-items:center;justify-content:center; }

         

          @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

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

          <button onClick={() => onNavigate('my')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">📋 My Appointments</button>

          <button onClick={() => onNavigate('history')} className="btn text-start py-2 px-3 border-0 fw-bold" style={{ background: 'rgba(255, 126, 95, 0.1)', color: '#ff7e5f', borderRadius: '12px' }}>🕒 History</button>

          <button onClick={() => onNavigate('token')} className="btn text-start py-2 px-3 border-0 text-muted fw-medium">🎟️ Token No</button>

          <div className="mt-auto pt-4 border-top">

            <button onClick={() => {localStorage.removeItem("token"); navigate('/');}} className="btn w-100 d-flex align-items-center gap-2 fw-bold logout-btn text-danger border-0 py-2 style={{ fontSize: '13px' }}"

              ><span>📤</span> Log Out</button>

          </div>

        </div>

      </div>


 

      {/* content */}

      <div className="flex-grow-1 p-4 d-flex flex-column overflow-hidden">

        <div className="glass-panel-light p-3 mb-4 d-flex justify-content-between align-items-center shadow-sm">

          <h3 className="fw-bold m-0 ps-2" style={{ color: '#111' }}>Medical Vault</h3>

          <div className="d-flex align-items-center gap-3">

            <div className="btn-group p-1 rounded-pill" style={{ background: '#f1f3f5' }}>

              <button className={`btn btn-sm rounded-pill px-3 fw-bold border-0 ${filterMode === 'dr' ? 'bg-white shadow-sm text-dark' : 'text-muted'}`} onClick={() => setFilterMode('dr')}>👨‍⚕️ Professional</button>

              <button className={`btn btn-sm rounded-pill px-3 fw-bold border-0 ${filterMode === 'date' ? 'bg-white shadow-sm text-dark' : 'text-muted'}`} onClick={() => setFilterMode('date')}>📅 Date Range</button>

            </div>

            {filterMode === 'dr' ? (

              <input type="text" className="form-control form-control-sm custom-input rounded-pill px-3" placeholder="Search Doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '220px' }} />

            ) : (

              <div className="d-flex gap-2 align-items-center">

                <input type="date" className="form-control form-control-sm custom-input rounded-pill" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                <span className="text-muted small fw-bold">To</span>

                <input type="date" className="form-control form-control-sm custom-input rounded-pill" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

              </div>

            )}

          </div>

        </div>

        <div className="row g-4 history-main-layout">

          {/* TIMELINE */}

          <div className={`${selectedVisit ? 'col-md-7' : 'col-md-12'} left-scroll-column transition-all`}>

            {!loading && (

              <div className="ms-4 border-start ps-4 py-2" style={{ borderColor: '#dee2e6' }}>

                {filteredHistory.map((visit) => (

                  <div key={visit.id} className="position-relative mb-4">

                    <div className="position-absolute timeline-dot rounded-circle" style={{ left: '-31px', top: '20px' }}></div>

                    <div className={`history-card p-4 shadow-sm ${selectedVisit?.id === visit.id ? 'active-record' : ''}`} onClick={() => handleViewDossier(visit)} style={{ cursor: 'pointer' }}>

                      <div className="d-flex justify-content-between align-items-center">

                        <div>

                          <small className="fw-bold text-uppercase d-block mb-1" style={{ color: '#20c997', fontSize: '10px', letterSpacing: '1px' }}>{visit.timeSlot?.slotDate}</small>

                          <h5 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>{visit.doctor?.name}</h5>

                          <p className="text-muted small mb-0">{visit.reason}</p>

                        </div>

                        <button className="btn btn-sm rounded-pill px-3 fw-bold" style={{ background: '#f8f9fa', color: '#20c997', fontSize: '10px', border: '1px solid #eee' }}>VIEW DOSSIER</button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>


 

          {/* visit details panel */}

          {selectedVisit && (

            <div className="col-md-5 right-sticky-column animate-slide-in" style={{ maxHeight:'85vh'}}>

              <div className="glass-panel-light p-4 dossier-panel-fixed shadow-lg border-start" style={{ background: '#fff' }}>

                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">

                  <h4 className="fw-bold m-0" style={{ color: '#111' }}>Clinical Record</h4>

                  <button className="btn btn-sm btn-light rounded-circle" onClick={() => { setSelectedVisit(null); setVisitDetail(null); }}>✕</button>

                </div>

             

                {fetchingDetail ? (

                  <div className='text-center py-5 mt-5'>

                    <div className='spinner-border text-success' role="status"></div>

                    <p className='mt-2 text-muted small'>Retrieving dossier...</p>

                  </div>

                ) : (

                  <div className='dossier-internal-scroll custom-scrollbar'>

                    {/* Diagnosis Section */}

                    <div className="mb-4">

                      <label className="text-muted fw-bold small text-uppercase d-block mb-2">Diagnosis</label>

                      <div className="p-3 rounded-4" style={{ background: '#f8f9fa', borderLeft: '4px solid #20c997' }}>

                        <p className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{selectedVisit.reason}</p>

                        <span className="badge rounded-pill bg-success-subtle text-success px-3 mb-2">{selectedVisit.status || 'Completed'}</span>

                        <p className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{visitDetail?.diagnosis || "Consultation"}</p>

                      </div>

                    </div>


 

                    {/* vitals */}

                    <div className="mb-4">

                      <label className="text-muted fw-bold small text-uppercase d-block mb-2">Vitals Captured</label>

                      <div className="row g-2">

                        <div className="col-6"><div className="p-2 rounded-3 text-center border" style={{ background: '#fff' }}><small className="d-block text-muted">Blood Pressure</small><b style={{ color: '#20c997' }}>{visitDetail?.bloodPressure || "N/A"}</b></div></div>

                        <div className="col-6"><div className="p-2 rounded-3 text-center border" style={{ background: '#fff' }}><small className="d-block text-muted">Heart Rate</small><b style={{ color: '#20c997' }}>{visitDetail?.heartRate || "N/A"} BPM</b></div></div>

                      </div>

                    </div>


 

                    {/* Notes Section*/}

                    <div className='mb-4'>

                      <label className='text-muted fw-bold small text-uppercase d-block mb-2'>Doctor's Notes</label>

                      <div className='p-3 rounded-4 bg-light border border-dashed'>

                        <p className='small mb-0 text-dark' style={{ fontStyle: 'italic' }}>

                          {visitDetail?.notes || "No additional notes provided."}

                        </p>

                      </div>

                    </div>


 

                    {/* Dynamic Medicine List */}

                    <div className="mb-3">

                      <label className="text-muted fw-bold small text-uppercase d-block mb-2">Prescribed Medications</label>

                      {visitDetail?.medicines && visitDetail.medicines.length>0 ?(

                        <div className='d-flex flex-column gap-2'>

                          {visitDetail?.medicines?.map((med:any,idx:number)=>(

                            <div key={idx} className='p-3 rounded-4 border d-flex align-items-center bg-white shadow-sm hover-medicine'>

                              <span className="fs-4 me-3">💊</span>

                              <div className='flex-grow-1'>

                                <h6 className='fw-bold mb-0' style={{ color:'#2c3e50'}}>{med.medicineName}</h6>

                                <div className='d-flex gap-2 mt-1'>

                                  <span className='badge bg-light text-dark border' style={{ fontSize:'9px' }}>{med.dosage}</span>

                                  <span className='badge bg-light text-dark border' style={{ fontSize:'9px'}}>{med.frequency}</span>

                                  <span className='badge bg-info-subtle text-info border-info-subtle' style={{fontSize:'9px'}}>{med.duration}</span>

                                </div>

                              </div>

                            </div>

                          ))}

                        </div>

                      ):(

                        <div className="p-4 rounded-4 border-dashed border-2 text-center text-muted" style={{borderStyle:'dashed'}}>

                          <small>No medications prescribed for this visit.</small>

                        </div>

                      )}

                    </div>

                  </div>

                )}

                <button className="btn btn-dark w-100 py-3 rounded-pill fw-bold shadow-sm mt-3"

                onClick={() => {setSelectedVisit(null); setVisitDetail(null);}}>CLOSE ARCHIVE</button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};


 

export default PastHistory;