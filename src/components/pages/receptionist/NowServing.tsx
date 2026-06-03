import React, { useEffect, useRef, useState } from "react";

import { HiMiniHeart } from "react-icons/hi2";


 

const API_URL = "http://localhost:8080/clinicq/display/nowserving";

const DOCTORS_PER_PAGE = 2;


 

interface TokenDisplay {

token: string;

patientName: string;

}


 

interface Doctor {

doctorId: number;

doctorName: string;

currentToken: TokenDisplay | null;

paused: boolean;

currentPauseMinutes:number;

nextTokens: TokenDisplay[];

}


 

interface Department {

departmentName: string;

doctors: Doctor[];

}



export default function NowServing() {

    const [departments, setDepartments] = useState<Department[]>([]);

    const [deptIndex, setDeptIndex] = useState(0);

    const [doctorIndex, setDoctorIndex] = useState(0);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


 

    // Fetch data (polling)

    useEffect(() => {

        const fetchData = async () => {

        try {

        const res = await fetch(API_URL);

        if (!res.ok) throw new Error("Failed to fetch");


 

        const data = await res.json();

        setDepartments(data.departments || []);

        setLoading(false);

        } catch (err) {

        setError("Unable to load queue data");

        setLoading(false);

        }

        };

        fetchData();

        const interval = setInterval(fetchData, 5000);


 

        return () => clearInterval(interval);

    }, []);


 

    const timeoutRef=useRef<any>(null);

    //  Department rotation (10 sec)

    useEffect(() => {

        if (!departments.length) return;

        let timeout:any;

   


 

        const run= ()=>{

          timeout=setTimeout(()=>{

            setDeptIndex(prev=>(prev+1)% departments.length);

            setDoctorIndex(0);

            run();

          },5000)

        };

        run();


 

        return ()=>{

          if(timeoutRef.current)

          {

            clearTimeout(timeoutRef.current);

          }

        }

      },[departments.length]);


 

    //  Doctor rotation (5 sec)

    useEffect(() => {

        if (!departments.length) return;


 

        const interval = setInterval(() => {

        const currentDept = departments[deptIndex];

        if (!currentDept) return;


 

        const maxPages = Math.ceil(

        currentDept.doctors.length / DOCTORS_PER_PAGE

        );


 

        if (maxPages > 1) {

        setDoctorIndex(prev => (prev + 1) % maxPages);

        }

        }, 2000);


 

        return () => clearInterval(interval);

    }, [departments, deptIndex]);

    //  States

if (loading) return <Centered text="Loading queue..." />;

if (error) return <Centered text={error} />;

if (!departments.length)

return <Centered text="No departments available" />;


 

const currentDept = departments[deptIndex];


 

if (!currentDept.doctors.length) {

return (

<Screen bg="#333">

<h1>{currentDept.departmentName}</h1>

<Centered text="No patients in queue" />

</Screen>

);

}


 

const start = doctorIndex * DOCTORS_PER_PAGE;

const visibleDoctors = currentDept.doctors.slice(

start,

start + DOCTORS_PER_PAGE

);



 

return (

   <Screen bg={getDeptColor(currentDept.departmentName)}>

     <h1 style={styles.title}>{currentDept.departmentName}</h1>


 

     <div style={styles.grid}>

       {visibleDoctors.map(doc => (

         <div key={doc.doctorId} style={styles.card}>

           <h2>{doc.doctorName}</h2>

           <div style={styles.now}>

            <>


 

          {doc.paused && (

            <div

              style={{

                marginBottom: "20px",

                padding: "8px",

                borderRadius: "12px",

                background: "rgba(239,68,68,0.15)",

                border: "1px solid #ef4444"

              }}>

              <div

                style={{

                  fontSize: "16px",

                  fontWeight: "bold",

                  color: "#ef4444",

                  marginBottom: "10px"

                }}>

                ⏸ DOCTOR PAUSED

              </div>


 

              <div

                style={{

                  fontSize: "22px",

                  fontWeight: "bold",

                  color: "#ef4444"

                }}>

                {doc.currentPauseMinutes} mins

              </div>


 

              <div

                style={{

                  marginTop: "8px",

                  opacity: 0.8

                }}>

                Consultation temporarily paused

              </div>

            </div>

          )}

          {!doc.paused &&(

            <>

          NOW SERVING


 

          <div style={styles.token}>

            {doc.currentToken?.token || "--"}

          </div>


 

          <div style={styles.patient}>

            {doc.currentToken?.patientName || ""}

          </div>

          </>

          )}

          </>


 

          </div>

           <div style={styles.patientList}>

             {doc.nextTokens.length

               ? doc.nextTokens.slice(0,4).map((t,i)=>(

               <div key={i} style={{...styles.patientItem,...(i==0 ? styles.firstPatient:{})}}>

                <span style={{fontWeight:"bold"

                ,fontSize:"17px"

              }}>#{i+1}

              </span>  . {t.token} <div style={{ fontSize:"14px", opacity:0.8}}>{t.patientName}</div>  </div>))

                   

               : "No upcoming patients"}

           </div>

         </div>

       ))}

     </div>

   </Screen>

 );

}

 // Screen wrapper

function Screen({ children, bg }: any) {

 return (

   <div

     style={{

       height: "100vh",

       color: "white",

       background: bg,

       transition: "0.5s",

       minHeight:"100vh",

       width:"100%",

       padding:"30px",

       boxSizing:"border-box"

     }}

   >

     {children}

   </div>

 );

}


 

// Centered message

function Centered({ text }: { text: string }) {

 return (

   <div

     style={{

       height: "100vh",

       display: "flex",

       justifyContent: "center",

       alignItems: "center",

       fontSize: "28px"

     }}

   >

     {text}

   </div>

 );

}

 // Styles

const styles: any = {

 title: {

   textAlign: "center",

   fontSize: "60px",

   marginBottom: "40px",

   color:"ffffff",

   letterSpacing:"4px",

   textShadow:"0 0 15px rgba(255,255,255,0.7)"

 },

 grid: {

   display: "grid",

   gridTemplateColumns: "repeat(2, 1fr)",

   gap: "30px",

   width:"100%",

   padding:"20px",

   boxSizing:"border-box",

   alignItems:"stretch"

 },

 card: {

   background: "rgba(0,0,0,0.5)",

   padding: "25px",

   borderRadius: "20px",

   textAlign: "center",

   backdropFilter: "blur(12px)",

   WebkitBackdropFilter: "blur(12px)",

   boxShadow:"0 8px 30px rgba(0,0,0,0.4)",

   minHeight:"320px",

   width:"100%",

   boxSizing:"border-box"

 },

 now: {

   marginTop: "10px",

   fontSize: "18px",

   letterSpacing:"3px",

   opacity:0.9



 },

 token: {

   fontSize: "52px",

   fontWeight: "bold",

   animation: "blink 1s infinite",

   margin:"10px 0 20px 0",

   letterSpacing:"6px",

   color:"#ffffff",

   textShadow:"0 1px 3px rgba(0,0,0,0.3)"


 

 },

 patient: {

   fontSize: "18px",

   marginTop: "5px"

 },

 next: {

   marginTop: "20px",

   fontSize: "18px"

 },


 

 firstPatient:{

  background:"rgba(255,255,255,0.06)",

  border:"1px solid rgba(255,255,255,0.2)",

  borderRadius:"12px",

  color:"#ffffff",

  fontWeight:"bold",

  boxShadow:"0 8px 25px rgba(0,0,0,0.4)"

 },

 patientList:{

  display:"grid",

  gridTemplateColumns:"repeat(2,1fr)",

  gap:"10px",

  marginTop:"15px"


 

 },


 

 patientItem:{

  fontSize:"15px",

  background:"rgba(255,255,255,0.1)",

  padding :"8px",

  borderRadius:"8px"

 }


 




 

};


 

//  Department Colors

function getDeptColor(name: string) {

 switch (name.toLowerCase()) {

   case "orthopedics":

     return "linear-gradient(135deg,#6a5af9,#8f7cff)";

   case "general":

     return "linear-gradient(135deg,#00c9a7,#2ec4b6)";

   case "pediatrics":

     return "linear-gradient(135deg,#ff7a18,#ffb347)";

   case "cardiology":

     return "linear-gradient(135deg,#00b4db,#0083b0)";

   default:

     return "#333";

 }

}