
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { Message } from '../types';

interface AdminChatWidgetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminChatWidget: React.FC<AdminChatWidgetProps> = ({ isOpen, setIsOpen }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Initialize chat on mount
  useEffect(() => {
    geminiService.createChat('admin').then(chat => {
      setChatSession(chat);
      setMessages([{
        id: 'init',
        role: 'model',
        text: "System Control Online. Accessing platform metrics... Ready for commands.",
        timestamp: Date.now()
      }]);
    });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
        const response = await geminiService.sendMessage(chatSession, userMsg.text);
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: response.text,
            toolCalls: response.toolCalls,
            timestamp: Date.now()
        }]);
    } catch (e) {
        console.error(e);
    } finally {
        setIsThinking(false);
    }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full shadow-2xl shadow-red-600/40 flex items-center justify-center z-50 transition-all hover:scale-110"
          >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </button>
      );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-900/80 to-slate-900 border-b border-slate-700 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(false)}>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-display font-bold text-white text-sm">System AI (MCP)</h3>
            </div>
            <button className="text-slate-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
            {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] rounded-lg px-3 py-2 text-xs md:text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-red-600/20 text-red-100 border border-red-500/30' 
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                        {msg.text}
                    </div>
                    {msg.toolCalls && msg.toolCalls.map(tool => (
                        <div key={tool.id} className="mt-1 flex items-center space-x-1 text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20">
                            <span>Executed: {tool.name}</span>
                        </div>
                    ))}
                </div>
            ))}
            {isThinking && (
                 <div className="flex items-start">
                    <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="relative">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Run system command..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none pr-8"
                />
                <button 
                    onClick={handleSend}
                    className="absolute right-2 top-2 text-slate-500 hover:text-white"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </div>
    </div>
  );
};

export default AdminChatWidget;