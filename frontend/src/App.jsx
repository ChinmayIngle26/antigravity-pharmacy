import React from 'react';
import ChatComponent from './components/ChatComponent';
import AdminDashboard from './components/AdminDashboard';
import { Pill } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <header className="mb-8 flex items-center gap-3 text-pharmacy-900">
        <div className="bg-pharmacy-500 p-2 rounded-lg text-white">
          <Pill size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AntiGravity Pharmacy</h1>
          <p className="text-gray-500">Autonomous AI Agent System</p>
        </div>
      </header>
      
      <main className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl items-start justify-center">
        <section className="flex-1 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Patient Interface (Voice Enabled)</h2>
          <ChatComponent />
        </section>
        
        <section className="flex-1 w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Pharmacist View (Live)</h2>
          <AdminDashboard />
        </section>
      </main>
      
      <footer className="mt-12 text-gray-400 text-sm">
        Built with Agentic AI • LangGraph • FastAPI • React
      </footer>
    </div>
  );
}

export default App;
