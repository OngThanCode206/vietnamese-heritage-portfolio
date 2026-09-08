import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../config/aiPrompt';

export const Chatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Xin chào! Em là Trợ lý AI của anh Cao Kỳ. Anh/Chị cần tìm hiểu thêm thông tin gì về kinh nghiệm hay dự án ạ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Thiếu VITE_GEMINI_API_KEY trong cấu hình!');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash', // Sửa model tại đây
        contents: userMsg,
        config: { systemInstruction: SYSTEM_INSTRUCTION }
      });

      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: response.text || 'Anh/Chị vui lòng liên hệ email nky57412@gmail.com để trao đổi thêm nhé!' }
      ]);
    } catch (error) {
      console.error('Lỗi gọi Gemini API:', error);
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: 'Có lỗi kết nối xảy ra. Vui lòng thử lại sau!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all"
        >
          💬 <span>Hỏi AI về Cao Kỳ</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[480px] bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-emerald-800 p-4 text-white font-semibold flex justify-between items-center border-b border-emerald-500/30">
            <span>🤖 Trợ lý AI - Cao Kỳ</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white ml-auto'
                    : 'bg-slate-800 text-gray-200 border border-slate-700'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-emerald-400 italic">AI đang suy nghĩ...</div>}
          </div>
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
            />
            <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm">Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
};