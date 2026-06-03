import React, { useState,useRef,useEffect} from 'react';
import axiosInstance from '../../../services/axiosInstance';

interface PatientChatbotProps {

    currentTab?: string;

}


 

const PatientChatbot: React.FC<PatientChatbotProps> = ({ currentTab }) => {

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

    const [chatInput, setChatInput] = useState<string>("");

    const messagesEndRef=useRef<HTMLDivElement | null>(null);



 

    const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; suggestions?: string[]; }>>([

        {

            sender: 'bot' as const,

            text: "Hey there, Welcome to ClinicQ Support.\nI'm ClinicQ's virtual assistant.\nHow may I help you?"

        }

    ]);


 

    useEffect(()=>{

        if(isChatOpen){

            messagesEndRef.current?.scrollIntoView({behavior:'smooth'});

        }

    },[chatMessages,isChatOpen]);


 

   

    const handleSendMessage = async () => {

        if (!chatInput.trim()) return;

        const userMsg = chatInput.trim();

        const updatedMessages = [

            ...chatMessages,

            { sender: 'user' as const, text: userMsg }

        ];

        setChatMessages(updatedMessages);

        setChatInput("");

        setChatMessages(prev => [

            ...prev,

            { sender: 'bot' as const, text: "Thinking..." }

        ]);

        try {

            const res = await axiosInstance.post("http://localhost:8080/patient/chatbot", {

                message: userMsg

            });

            const botReply = res.data?.response || "Response received.";

            const incomingSuggestions: string[]=Array.isArray(res.data?.suggestions)? res.data.suggestions : [];

            setChatMessages(prev => {

                const structuralArray = [...prev];

                structuralArray[structuralArray.length - 1] = {

                    sender: 'bot' as const,

                    text: botReply,

                    suggestions:incomingSuggestions

                 };

                return structuralArray;

            });

        } catch (err: any) {

            console.error("Chatbot API Connection Failure:", err);

            setChatMessages(prev => {

                const structuralArray = [...prev];

                structuralArray[structuralArray.length - 1] = {

                    sender: 'bot' as const,

                    text: "System offline. I am having trouble reaching the ClinicQ AI core node. Please check your network connection."

                };

                return structuralArray;

            });

        }

    };


 

    return (

        <div style={{ fontFamily: "'Segoe UI', Roboto, sans-serif" }}>

            <style>

                {`

         .chat-trigger-btn {

           position: fixed;

           bottom: 24px;

           right: 24px;

           width: 60px;

           height: 60px;

           border-radius: 50%;

           background: linear-gradient(135deg, #ff7e5f 0%, #ff6b6b 100%); 

           color: #ffffff;

           border: none;

           display: flex;

           align-items: center;

           justify-content: center;

           font-size: 1.5rem;

           cursor: pointer;

           box-shadow: 0 8px 24px rgba(255, 110, 95, 0.35);

           transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

           z-index: 99999;

         }

         .chat-trigger-btn:hover {

           transform: scale(1.08) translateY(-2px);

           filter: brightness(1.08);

           box-shadow: 0 12px 28px rgba(255, 110, 95, 0.45);

         }


 

         .chat-window-box {

           position: fixed;

           bottom: 96px;

           right: 24px;

           width: 380px;

           height: 520px !important;

           background: linear-gradient(145deg, #ff7e5f 0%, #ff6b6b 50%, #f2994a 100%) !important;

           border-radius: 24px;

           box-shadow: 0 20px 50px rgba(255, 107, 107, 0.3);

           display: flex;

           flex-direction: column;

           overflow: hidden;

           z-index: 99999;

           border: 1px solid rgba(255, 255, 255, 0.15);

           transform-origin: bottom right;

           animation: chatApperance 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;

         }


 

         @keyframes chatApperance {

           from { opacity: 0; transform: scale(0.8) translateY(20px); }

           to { opacity: 1; transform: scale(1) translateY(0); }

         }


 

         .chat-avatar-circle {

           width: 32px;

           height: 32px;

           border-radius: 50%;

           display: flex;

           align-items: center;

           justify-content: center;

           font-weight: bold;

           font-size: 0.75rem;

         }


 

         .chat-msg-bubble-bot {

           background: rgba(255, 255, 255, 0.12) !important;

           color: #ffffff !important;

           backdrop-filter: blur(5px);

           border: 1px solid rgba(255, 255, 255, 0.08);

           padding: 12px 16px;

           border-radius: 4px 16px 16px 16px;

           max-width: 85%;

           font-size: 0.9rem;

           line-height: 1.45;

           font-weight: 500;

         }


 

         .chat-msg-bubble-user {

           background: #ffffff !important;

           color: #ff6b6b !important;

           padding: 12px 16px;

           border-radius: 16px 16px 4px 16px;

           max-width: 85%;

           font-size: 0.9rem;

           line-height: 1.45;

           font-weight: 600;

           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

         }


 

         .chat-input-bar {

           border: 1px solid rgba(255, 255, 255, 0.1);

           border-radius: 16px;

           padding: 12px 16px;

           display: flex;

           align-items: center;

           gap: 10px;

           background: rgba(0, 0, 0, 0.12);

         }

       

         .chat-slate-header {

           background:  linear-gradient(145deg, #83e916 0%, #397bde 50%, #f2994a 100%) !important;

           padding: 24px 20px 16px !important;

           color: #ffffff !important;

           position: relative;

           border-top-left-radius: 24px;

           border-top-right-radius: 24px;

           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

         }


 

         .chat-pill-toggle {

           display: flex;

           justify-content: center;

           gap: 2px;

           background: rgba(255, 255, 255, 0.08);

           border-radius: 20px;

           width: fit-content;

           margin: 0 auto 12px;

           padding: 7px;

           border: 1px solid rgba(255, 255, 255, 0.05);

         }


 

         .chat-avatar-stack-row {

           display: flex;

           justify-content: center;

           align-items: center;

           margin-bottom: 14px;

           padding-left: 10px;

         }


 

         .chat-avatar-profile-node {

           width: 38px;

           height: 38px;

           border-radius: 50%;

           background: #ffffff;

           color: #2b4560;

           display: flex;

           align-items: center;

           justify-content: center;

           font-size: 1.1rem;

           border: 2px solid #2b4560;

           margin-left: -10px;

           box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

           transition: transform 0.2s;

         }

         .chat-avatar-profile-node:hover {

           transform: translateY(-2px);

           z-index: 10 !important;

         }

           

         

         .chat-date-separator {

           text-align: center !important;

           font-size: 0.82rem !important;

           font-weight: 700 !important;

           color: rgba(255, 255, 255, 0.9) !important; 

           margin: 16px 0 24px !important;

           font-family: 'Segoe UI', Roboto, sans-serif !important;

           letter-spacing: 0.2px;

           user-select: none;

         }


 

         .suggestion-chip-btn{

            background: rgba(255,255,255,0.15) !important;

            color:#ffffff !important;

            border: 1px solid rgba(255,255,255,0.3) !important;

            border-radius:50px !important;

            padding:8px 16px !important;

            font-size:0.84rem !important;

            font-weight: 600 !important;

            cursor: pointer !important;

            backdrop-filter: blur(8px) !important;

            -webkit-backdrop-filter: blur(8px) !important;

            box-shadow:0 4px 12px rgba(0,0,0,0.05) !important;

            transition: all 0.25s cubic-bezier(0.175,0.885,0.32,1.275) !important;

            outline: none !important;

            animation: chipGlideIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;

            opacity:0;

            transform:translateY(6px);

         }

        .suggestion-chip-btn:hover{

          background:#ffffff !important;

          color: #ff6b6b !important;

          border-color:#ffffff !important;

          transform: translateY(-3px) scale(1.04) !important;

          box-shadow: 0 8px 20px rgba(255,255,255,0.25) !important;

        }

        .suggestion-chip-btn:active{

            transform:translateY(-1px) scale(0.98) !important;

        }

        @keyframes chipGlideIn{

          to{

             opacity:1;

             transform: translateY(0);

          }

        }

       `}

            </style>


 

            <button type="button" className="chat-trigger-btn" onClick={() => setIsChatOpen(!isChatOpen)}>

                {isChatOpen ? (

                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>

                ) : (

                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>

                )}

            </button>


 

            {/* chat window */}

            {isChatOpen && (

                <div className="chat-window-box">

                    <div className="chat-slate-header">

                        <div className="chat-pill-toggle">

                            <span style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 1, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>

                                💬 Messages

                            </span>  

                        </div>


 

                        <div className="chat-avatar-stack-row">

                            <div className="chat-avatar-profile-node" style={{ zIndex: 4 }}>👤</div>

                            <div className="chat-avatar-profile-node" style={{ zIndex: 3 }}>👤</div>

                            <div className="chat-avatar-profile-node" style={{ zIndex: 2 }}>👤</div>

                            <div className="chat-avatar-profile-node" style={{ zIndex: 1, background: '#ffffff', fontSize: '8px', fontWeight: 800, color: '#2b4560', fontFamily: 'sans-serif' }}>FAQ</div>

                        </div>


 

                        <div style={{ textAlign: 'center' }}>

                            <h6 style={{ fontWeight: 700, margin: 0, fontSize: '1.0rem', letterSpacing: '-0.2px', color: '#ffffff' }}>

                                Questions? Chat with us.

                            </h6>

                            <div style={{ fontSize: '0.70rem', opacity: 0.75, marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ffffff' }}>

                                <span style={{ width: '6px', height: '6px', background: '#20c997', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #20c997' }}></span>

                                Live Now

                            </div>

                        </div>


 

                        <button type="button"

                            style={{

                                position: 'absolute', top: '28px',

                                right: '24px',

                                background: 'none',

                                border: 'none',

                                color: 'rgba(255, 255, 255, 0.75)',

                                cursor: 'pointer', outline: 'none',

                                padding: '4px', transition: 'color 0.2s'

                            }}

                            onClick={() => setIsChatOpen(false)}

                            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}

                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}

                            title="Minimize Chat" >

                            <svg width="18" height="2" viewBox="0 0 18 2" fill="none" xmlns="http://www.w3.org/2000/svg">

                                <path d="M1 1H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /> </svg>

                        </button>

                    </div>


 

       

                    <div className="custom-scrollbar" style={{ flex: 1, padding: '10px 20px 20px', overflowY: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div className="chat-date-separator">

                            {new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}

                        </div>

                        {chatMessages.map((msg, idx) => (

                            <div key={idx} style={{ display:'flex',flexDirection:'column',gap:'6px' }}>

                                <div style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: '8px' }}>

                                    {msg.sender === 'bot' && (

                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', fontSize: '0.85rem', justifyContent: 'center' }}>🤖</div>

                                    )}

                                    <div className={msg.sender === 'user' ? "chat-msg-bubble-user" : "chat-msg-bubble-bot"} style={{ whiteSpace: 'pre-line' }}>

                                        {msg.text}

                                    </div>

                                </div>


 

                                {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length>0 && (

                                    <div style={{

                                        display:'flex',

                                        flexWrap:'wrap',

                                        gap:'8px',

                                        paddingLeft:'36px',

                                        marginTop:'6px',

                                        marginBottom:'4px'

                                    }}>

                                        {msg.suggestions.map((suggestionText,sIdx)=>(

                                            <button

                                                key={sIdx}

                                                type='button'

                                                className='suggestion-chip-btn'

                                                style={{

                                                    animationDelay:`${sIdx * 0.08}s`

                                                }}

                                                onClick={()=>{

                                                    setChatInput(suggestionText);

                                                    setTimeout(() => {

                                                        const targetBtn=document.querySelector('.chat-input-bar button') as HTMLButtonElement;

                                                        if(targetBtn) targetBtn.click();  

                                                    }, 50);

                                                }}

                                                onMouseEnter={(e)=>{

                                                    e.currentTarget.style.background='#ffffff';

                                                    e.currentTarget.style.color='#ff6b6b';

                                                    e.currentTarget.style.transform='translate(-1px)';

                                                }}

                                                onMouseLeave={(e)=>{

                                                    e.currentTarget.style.background='rgba(255,255,255,0.22)';

                                                    e.currentTarget.style.color='#fffff';

                                                    e.currentTarget.style.transform='none';

                                                }}>{suggestionText}

                                            </button>

                                        ))}

                                    </div>

                                )}

                            </div>

                        ))}

                        <div ref={messagesEndRef} style={{ float:'left',clear:'both',height:'1px'}}/>

                    </div>


 

                    {/* input box */}

                    <div style={{ padding: '20px', background: 'transparent' }}>

                        <div className="chat-input-bar">

                            <input

                                type="text"

                                className="form-control border-0 p-0 shadow-none bg-transparent"

                                style={{ fontSize: '0.92rem', color: '#ffffff', outline: 'none', width: '100%' }}

                                placeholder="Type your message..."

                                value={chatInput}

                                onChange={(e) => setChatInput(e.target.value)}

                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}

                            />

                            <button

                                type="button"

                                className="btn p-0 border-0 d-flex align-items-center"

                                style={{ color: chatInput.trim() ? '#ffffff' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }}

                                disabled={!chatInput.trim()}

                                onClick={handleSendMessage}>

                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"></path></svg>

                            </button>

                        </div>

                    </div>

                </div>

            )}

    </div>

    );

};


 

export default PatientChatbot;