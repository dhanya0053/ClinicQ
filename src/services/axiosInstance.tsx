// import axios from "axios";


 

// const axiosInstance=axios.create({

//     baseURL:"http://localhost:8080",

// });


 

// axiosInstance.interceptors.request.use((config) =>{

//     const token=localStorage.getItem("token");

//     if(token)

//     {

//         config.headers.Authorization=`Bearer ${token}`;

//     }

//     return config;

// })


 

// export default axiosInstance;



 

import axios from "axios";

import Swal from 'sweetalert2';

const axiosInstance=axios.create({

    baseURL:"http://localhost:8080",

});


 

axiosInstance.interceptors.request.use((config) =>{

    const token=localStorage.getItem("token");

    if(token)

    {

        config.headers.Authorization=`Bearer ${token}`;

    }

    return config;

})


 

axiosInstance.interceptors.response.use(

    (response)=>{

        return response;

    },

    (error)=>{

        if(error.response && error.response.status===401){

            localStorage.removeItem("token");

            localStorage.removeItem("role");


 

            Swal.fire({

                title:'<span style="color:#dc3545; font-weight:700;">Session Expired</span>',

                html:`<div style="font-family:'Segoe UI',sans-serif;color:#555;font-size:14px;line-height:1.5;">

                Your session has expired.Please log back in to renew your session.</div>`,

                icon:'warning',

                confirmButtonText:'Restore Session',

                confirmButtonColor:'#20c997',

                allowOutsideClick: false,

                allowEscapeKey: false

            }).then(() =>{

                window.location.href='/';

            });

        }

        return Promise.reject(error);

    }

);

export default axiosInstance;