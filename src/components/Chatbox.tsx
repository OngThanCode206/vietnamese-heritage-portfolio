import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { SYSTEM_INSTRUCTION } from '../config/aiPrompt';

// Danh sách câu hỏi gợi ý nhanh
const SUGGESTED_QUESTIONS = [
  "Cao Kỳ có kỹ năng gì?",
  "Dự án nổi bật của Kỳ?",
  "Thành tích & Học bổng?",
  "Thông tin liên hệ?"
];

export const Chatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Xin chào! Em là Trợ lý AI của anh **Cao Kỳ**. Anh/Chị muốn tìm hiểu thông tin gì ạ?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Chưa tìm thấy VITE_GEMINI_API_KEY');

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [{ role: 'user', parts: [{ text: textToSend }] }]
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Lỗi API');

      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: replyText || 'Anh/Chị vui lòng liên hệ email **nky57412@gmail.com** để trao đổi thêm nhé!' }
      ]);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Có lỗi kết nối xảy ra. Vui lòng thử lại sau!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#064E3B] hover:bg-[#04392B] text-[#F4F1EA] px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-[#D97706] transition-all transform hover:scale-105 font-medium"
        >
          <span className="text-xl">💬</span> <span>Hỏi AI về Cao Kỳ</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[540px] bg-[#F9F8F3] border-2 border-[#D97706] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#064E3B] p-4 text-[#F4F1EA] font-bold flex justify-between items-center border-b-2 border-[#D97706]">
            <span className="flex items-center gap-2">🤖 Trợ lý AI — Cao Kỳ</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-[#F4F1EA] hover:text-[#D97706] text-xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F1EA]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#064E3B] text-[#F4F1EA] ml-auto rounded-br-none border border-[#04392B]'
                    : 'bg-white text-[#1F2937] border border-[#E5E7EB] shadow-sm rounded-bl-none'
                }`}
              >
                {m.sender === 'ai' ? (
                  <div className="prose prose-sm max-w-none text-[#1F2937] [&>p]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : (
                  m.text
                )}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-[#064E3B] font-semibold italic flex items-center gap-1.5 bg-white/60 p-2 rounded-lg w-fit">
                <span>🤖</span> AI đang trả lời...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions (Gợi ý câu hỏi nhanh) */}
          <div className="px-3 py-2 bg-[#F4F1EA] border-t border-[#E5E7EB] flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap text-xs bg-white text-[#064E3B] border border-[#064E3B]/30 hover:bg-[#064E3B] hover:text-white px-2.5 py-1 rounded-full transition-all flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Chat */}
          <div className="p-3 bg-white border-t border-[#E5E7EB] flex gap-2">
            <input
              className="flex-1 bg-[#F4F1EA] text-[#1F2937] text-sm px-3.5 py-2.5 rounded-xl border border-[#D1D5DB] focus:outline-none focus:border-[#064E3B]"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
            />
            <button 
              onClick={() => handleSend()} 
              disabled={loading}
              className="bg-[#064E3B] hover:bg-[#04392B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};