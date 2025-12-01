
import React, { useState, useEffect, useRef } from 'react';
import { Role, User, Message, ChatMode, RAGDocument } from './types';
import { MOCK_STUDENT, MOCK_TEACHER, MOCK_SCHOOL_ADMIN, MOCK_SUPER_ADMIN, MOCK_DOCS, MOCK_ANALYTICS, MOCK_LEADERBOARD } from './constants';
import Layout from './components/Layout';
import { RAGUploader } from './components/RAGUploader';
import Leaderboard from './components/Leaderboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentQuizDashboard } from './components/StudentQuizDashboard';
import { geminiService } from './services/geminiService';
import { Chat } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [documents, setDocuments] = useState<RAGDocument[]>(MOCK_DOCS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Chat logic for ALL roles
  useEffect(() => {
    if (user) {
      let roleParam: 'student' | 'teacher' | 'admin' = 'student';
      if (user.role === Role.TEACHER) roleParam = 'teacher';
      if (user.role === Role.SCHOOL_ADMIN || user.role === Role.SUPER_ADMIN) roleParam = 'admin';

      geminiService.createChat(roleParam).then(chat => {
        setChatSession(chat);
        
        let welcomeMsg = "";
        if (user.role === Role.STUDENT) welcomeMsg = "Hi! I'm Nexus. What are we learning today?";
        else if (user.role === Role.TEACHER) welcomeMsg = "Welcome back. Classroom systems online.";
        else welcomeMsg = "System Control Online. Ready for commands.";
        
        setMessages([{
          id: 'init',
          role: 'model',
          text: welcomeMsg,
          timestamp: Date.now()
        }]);
      });
    }
  }, [user]);

  const handleLogin = (role: Role) => {
    switch(role) {
      case Role.STUDENT: setUser(MOCK_STUDENT); setActiveTab('quizzes'); break;
      case Role.TEACHER: setUser(MOCK_TEACHER); setActiveTab('dashboard'); break;
      case Role.SCHOOL_ADMIN: setUser(MOCK_SCHOOL_ADMIN); setActiveTab('admin_overview'); break;
      case Role.SUPER_ADMIN: setUser(MOCK_SUPER_ADMIN); setActiveTab('overview'); break;
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSpeaking(true);

    // Thinking state
    setMessages(prev => [...prev, { id: 'thinking', role: 'model', text: 'Thinking...', timestamp: Date.now(), isThinking: true }]);

    try {
      const response = await geminiService.sendMessage(chatSession, userMsg.text);
      
      setMessages(prev => prev.filter(m => !m.isThinking).concat({
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        toolCalls: response.toolCalls,
        timestamp: Date.now()
      }));

      const utterance = new SpeechSynthesisUtterance(response.text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      setIsSpeaking(false);
      setMessages(prev => prev.filter(m => !m.isThinking).concat({
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, something went wrong.",
        timestamp: Date.now()
      }));
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsSpeaking(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        } else {
          setIsSpeaking(false);
        }
      };
      
      recognition.onerror = () => {
        setIsSpeaking(false);
        alert("Microphone access error. Please check permissions.");
      };

      recognition.start();
    } else {
      alert("Voice input is not supported in this browser. Try Chrome.");
    }
  };

  // Render Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-accent-600/20 rounded-full blur-[100px]"></div>

        <div className="z-10 text-center w-full max-w-4xl">
          <div className="mb-12 animate-float">
            <h1 className="text-6xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-white to-accent-300 mb-4 drop-shadow-lg">EDUNEXUS</h1>
            <p className="text-slate-400 text-xl tracking-wide">Advanced Cognitive Learning & Management Platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => handleLogin(Role.STUDENT)} className="group relative p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-brand-500 rounded-xl transition-all">
               <div className="text-4xl mb-3">🎓</div>
               <div className="font-bold text-white">Student</div>
               <p className="text-xs text-slate-500 mt-1">Access AI Tutor</p>
            </button>
            
            <button onClick={() => handleLogin(Role.TEACHER)} className="group relative p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-brand-500 rounded-xl transition-all">
               <div className="text-4xl mb-3">👨‍🏫</div>
               <div className="font-bold text-white">Teacher</div>
               <p className="text-xs text-slate-500 mt-1">Class Insights</p>
            </button>

            <button onClick={() => handleLogin(Role.SCHOOL_ADMIN)} className="group relative p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-accent-500 rounded-xl transition-all">
               <div className="text-4xl mb-3">🏫</div>
               <div className="font-bold text-white">School Admin</div>
               <p className="text-xs text-slate-500 mt-1">Manage Users</p>
            </button>

            <button onClick={() => handleLogin(Role.SUPER_ADMIN)} className="group relative p-6 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-red-500 rounded-xl transition-all">
               <div className="text-4xl mb-3">⚡</div>
               <div className="font-bold text-white">Super Admin</div>
               <p className="text-xs text-slate-500 mt-1">System Owner</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- THE NEW CHAT INTERFACE COMPONENT (Sidebar Version) ---
  const ChatInterface = (
    <div className="flex flex-col h-full bg-slate-950/20">
      {/* XP Badge Header for Students */}
      {user.role === Role.STUDENT && (
         <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/50 flex justify-between items-center">
             <span className="text-xs text-slate-400">Current Status</span>
             <div className="bg-brand-900/30 border border-brand-500/30 px-3 py-1 rounded-full flex items-center space-x-2 shadow-sm">
                <span className="text-yellow-400 text-xs">⚡</span>
                <span className="font-display font-bold text-brand-100 text-xs tracking-wide">{user.xp?.toLocaleString()} XP</span>
             </div>
         </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-md ${
              msg.role === 'user' 
                ? 'bg-brand-600/90 text-white rounded-tr-sm border border-brand-500/50' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm'
            }`}>
              {msg.isThinking ? <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span> Thinking...</span> : msg.text}
            </div>
            
            {/* Tool Call Badges */}
            {msg.toolCalls && msg.toolCalls.map(tool => (
               <div key={tool.id} className="mt-1 flex items-center space-x-1 bg-slate-900/50 border border-slate-800/50 rounded px-2 py-0.5 text-[10px] text-slate-400">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 <span>Executed: <span className="font-mono text-brand-400">{tool.name}</span></span>
               </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/50 pb-safe">
         <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg py-3 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-500"
              />
              <button 
                onClick={startVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isSpeaking ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>
            </div>
            <button 
              onClick={() => handleSendMessage()}
              className="p-3 bg-brand-600/90 text-white rounded-lg hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20 backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
         </div>
      </div>
    </div>
  );

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={() => setUser(null)}
      chatComponent={ChatInterface}
    >
      {/* --- STUDENT VIEWS --- */}
      {/* Note: 'chat' is no longer a main tab */}
      
      {activeTab === 'leaderboard' && (
         <div className="p-6 max-w-4xl mx-auto animate-fade-in">
           <div className="mb-6 text-center">
              <h2 className="text-3xl font-display font-bold text-white">Top Students</h2>
              <p className="text-slate-400">Earn XP by completing quizzes and helping others!</p>
           </div>
           <Leaderboard data={MOCK_LEADERBOARD} />
         </div>
      )}

      {/* --- TEACHER VIEWS --- */}
      {activeTab === 'dashboard' && (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white">Class Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-xl border border-slate-800">
                <h4 className="text-slate-400 text-sm mb-2">Avg. Engagement</h4>
                <p className="text-3xl font-bold text-white">78% <span className="text-green-500 text-sm">↑ 12%</span></p>
             </div>
             <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-xl border border-slate-800">
                <h4 className="text-slate-400 text-sm mb-2">Active Students</h4>
                <p className="text-3xl font-bold text-white">24<span className="text-slate-500 text-sm">/30</span></p>
             </div>
             <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-xl border border-slate-800">
                <h4 className="text-slate-400 text-sm mb-2">Quiz Completion</h4>
                <p className="text-3xl font-bold text-white">92%</p>
             </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-800 h-80">
               <h3 className="text-lg font-bold text-white mb-4">Engagement Trends</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={MOCK_ANALYTICS}>
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none'}} />
                    <Line type="monotone" dataKey="engagement" stroke="#0ea5e9" strokeWidth={2} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
             <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-xl border border-slate-800 h-80">
               <h3 className="text-lg font-bold text-white mb-4">Quiz Performance</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={MOCK_ANALYTICS}>
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none'}} />
                    <Bar dataKey="accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- TEACHER/ADMIN GENERAL RAG UPLOAD --- */}
      {activeTab === 'rag' && (
         <div className="p-6 max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
               <h2 className="text-2xl font-display font-bold text-white mb-2">Knowledge Base</h2>
               <p className="text-slate-400">Manage RAG documents for the AI context.</p>
            </div>
            <RAGUploader 
              documents={documents} 
              onUpload={(d) => setDocuments(prev => [d, ...prev])} 
              targetSchoolId={user.schoolId}
              currentUserRole={user.role}
            />
         </div>
      )}

      {/* --- ADMIN DASHBOARDS (SUPER & SCHOOL) --- */}
      {(activeTab === 'admin_overview' || activeTab === 'users' || activeTab === 'classes' || activeTab === 'content' || activeTab === 'overview' || activeTab === 'tenants' || activeTab === 'financials' || activeTab === 'infrastructure') && (
        <AdminDashboard role={user.role} currentTab={activeTab} />
      )}

       {/* --- QUIZZES --- */}
       {activeTab === 'quizzes' && (
          <StudentQuizDashboard 
             user={user}
             onStartQuiz={(topic) => {
                 // Switch to quiz logic, or simply ask the persistent AI to start it
                 // Since AI is now on the right, we can feed the prompt directly
                 handleSendMessage(`Start a quiz about ${topic}`);
             }}
          />
       )}
    </Layout>
  );
};

export default App;
