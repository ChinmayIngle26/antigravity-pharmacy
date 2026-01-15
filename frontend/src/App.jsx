import React from 'react';
import ChatComponent from './components/ChatComponent';
import AdminDashboard from './components/AdminDashboard';
import { Pill, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1c2e] to-black flex flex-col items-center p-8 text-white font-sans selection:bg-blue-500/30">
      
      <header className="mb-10 flex flex-col items-center gap-2 animate-fade-in-down">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-teal-400 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Pill size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-blue-400 to-teal-400 tracking-tight">
            AntiGravity Pharmacy
            </h1>
        </div>
        <div className="flex items-center gap-2 text-blue-200/60 text-sm font-medium tracking-wide uppercase">
            <Sparkles size={14} /> Autonomous AI Agent System
        </div>
      </header>
      
      <main className="flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] items-start justify-center">
        {/* Patient Interface */}
        <section className="flex-1 w-full lg:max-w-lg xl:max-w-xl">
           <ChatComponent />
        </section>
        
        {/* Admin Interface */}
        <section className="flex-[1.5] w-full">
           <AdminDashboard />
        </section>
      </main>
      
      <footer className="mt-16 text-slate-500 text-sm font-medium">
        Powered by <span className="text-slate-400">LangGraph</span> • <span className="text-slate-400">FastAPI</span> • <span className="text-slate-400">Llama Vision</span>
      </footer>
    </div>
  );
}

export default App;
