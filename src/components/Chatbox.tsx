import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "Kỳ có những kỹ năng gì?",
  "Dự án tiêu biểu của Kỳ?",
  "Kinh nghiệm làm việc thế nào?",
];

export function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Mình là trợ lý AI của **Võ Lê Cao Kỳ**. Bạn có muốn tìm hiểu thông tin gì về Kỳ không?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "Cảm ơn bạn đã nhắn tin!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Cảm ơn bạn đã quan tâm! Bạn có thể liên hệ trực tiếp với Kỳ qua Email hoặc các liên kết mạng xã hội bên dưới nhé.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Nút Bật Chatbox */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--gold)] transition-all duration-300 hover:scale-110 hover:shadow-[6px_6px_0_0_var(--gold)] active:scale-95"
          aria-label="Open Chat"
        >
          <Bot className="h-6 w-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-gold"></span>
          </span>
        </button>
      )}

      {/* Cửa sổ Chatbox */}
      {isOpen && (
        <div className="flex h-[520px] w-[350px] sm:w-[390px] flex-col overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md shadow-[8px_8px_0_0_var(--gold)] transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-card text-primary">
                <Bot className="h-4 w-4" />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-card" />
              </div>
              <div>
                <h3 className="font-display text-sm font-extrabold leading-none tracking-wide text-primary-foreground">
                  Kỳ AI Assistant
                </h3>
                <p className="mt-1 text-[10px] opacity-80">Trợ lý Portfolio thông minh</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-primary-foreground/80 transition-colors hover:bg-card/20 hover:text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Danh sách Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${
                  m.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    m.sender === "user"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-gold bg-accent text-accent-foreground"
                  }`}
                >
                  {m.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={`group relative max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                      : "bg-secondary/90 border border-primary/20 text-foreground rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed text-xs">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                  <span
                    className={`mt-1 block text-[9px] opacity-60 ${
                      m.sender === "user" ? "text-right text-primary-foreground/70" : "text-left text-muted-foreground"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Đang gõ (Loading) */}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold bg-accent">
                  <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <div className="flex gap-1.5 rounded-2xl rounded-tl-none border border-primary/20 bg-secondary/80 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Câu hỏi gợi ý nhanh */}
          {messages.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-gold hover:text-primary hover:shadow-sm"
                >
                  <Sparkles className="h-2.5 w-2.5 text-gold" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Ô Nhập văn bản */}
          <div className="border-t-2 border-primary/20 bg-card p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 rounded-xl border border-primary/30 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}