import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Bot, User } from 'lucide-react';
import { chatWithAgent } from '../api';

const ChatComponent = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Pharmacist. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    // Logic to stop if needed, but simple recognition stops auto
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-pharmacy-600 p-4 text-white font-bold flex items-center gap-2">
        <Bot size={24} />
        From AntiGravity Pharmacy
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-pharmacy-500 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm ml-2">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <button 
          onClick={toggleVoice}
          className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your medicine request..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-pharmacy-500"
        />
        
        <button 
          onClick={handleSend}
          className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white p-2 rounded-full transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
