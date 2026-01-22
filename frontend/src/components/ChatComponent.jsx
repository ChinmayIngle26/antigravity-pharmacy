import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Bot, User, Camera, Paperclip, Loader2, Volume2 } from 'lucide-react';
import { chatWithAgent, uploadPrescription } from '../api';

const ChatComponent = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Pharmacist. Upload a prescription or ask me about any medicine.' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const aiResponse = await chatWithAgent(input);
    const aiMsg = { role: 'ai', content: aiResponse };
    
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Browser does not support speech recognition.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    // Show image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        setMessages(prev => [...prev, { role: 'user', content: <img src={e.target.result} alt="Prescription" className="max-w-[200px] rounded-lg border border-white/20" /> }]);
    };
    reader.readAsDataURL(file);

    try {
        const result = await uploadPrescription(file);
        let responseText = "";
        
        if (result.medicine_name) {
            responseText = `Analyzed Prescription:\n- Medicine: ${result.medicine_name}\n- Dosage: ${result.dosage}\n- Quantity: ${result.quantity || 'N/A'}\n\n${result.instructions || ''}\n\nShall I place this order for you?`;
        } else if (result.raw_text) {
             responseText = `I couldn't perfectly parse the prescription, but here is what I read:\n\n${result.raw_text}`;
        } else {
            responseText = result.error || "Sorry, I couldn't read the prescription.";
        }
        
        setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', content: "Error uploading image." }]);
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className="flex flex-col h-[700px] w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative group">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white/5 p-4 backdrop-blur-md border-b border-white/10 flex items-center gap-3 z-10">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
            <Bot size={20} className="text-white" />
        </div>
        <div>
            <h2 className="text-white font-bold text-lg leading-tight">AI Pharmacist</h2>
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-blue-200/60 text-xs font-medium">Always Online</span>
            </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
             <div className="flex flex-col gap-1 items-start">
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-md backdrop-blur-sm ${
                msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none border border-blue-500/30' 
                    : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                }`}>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</div>
                </div>
                 {/* Speak Button for individual messages */}
                {msg.role === 'ai' && (
                    <button 
                        onClick={() => {
                            if ('speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                                const utterance = new SpeechSynthesisUtterance(msg.content);
                                window.speechSynthesis.speak(utterance);
                            }
                        }}
                        className="text-xs text-blue-300/50 hover:text-blue-300 ml-2 flex items-center gap-1"
                    >
                        <Volume2 size={12} /> Play
                    </button>
                )}
             </div>
          </div>
        ))}
        {loading && (
             <div className="flex justify-start animate-pulse">
                <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex items-center gap-2 text-blue-200/50 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Thinking...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="flex gap-2 relative">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
            />
            
           <button 
            onClick={() => fileInputRef.current.click()}
            className="p-3 rounded-xl bg-white/5 text-blue-300 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5"
            title="Upload Prescription"
            >
                <Camera size={20} />
            </button>
            
            <button 
            onClick={toggleVoice}
             className={`p-3 rounded-xl transition-all duration-200 border border-white/5 ${
                 isListening 
                 ? 'bg-red-500/20 text-red-400 animate-pulse border-red-500/30' 
                 : 'bg-white/5 text-blue-300 hover:bg-white/10 hover:text-white'
             }`}
            title="Voice Input"
            >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your medicine request..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-light"
            />
            
            <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
