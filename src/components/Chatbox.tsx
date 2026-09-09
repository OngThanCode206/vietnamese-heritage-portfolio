import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SYSTEM_INSTRUCTION } from "../config/aiPrompt";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  "Kỳ đang làm vị trí gì?",
  "Dự án tiêu biểu của Kỳ?",
  "Thành tích & Học vấn của Kỳ?",
];

export function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCloud, setShowCloud] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Dạ em xin chào Anh/Chị! Em là **Trợ lý ảo CKy** — đại diện thông tin cho **Võ Lê Cao Kỳ**. Anh/Chị cần em hỗ trợ thông tin gì về học vấn, kinh nghiệm hay các dự án của Kỳ ạ? 👋\n\n💡 **Anh/Chị có thể chọn nhanh các gợi ý bên dưới:**",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Cập nhật đồng hồ Live
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const formatLiveTime = (date: Date) => {
    return date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const formatLiveDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseAndAppendChunk = (line: string): string => {
    const cleanLine = line.replace(/\r$/, "").trim();
    if (!cleanLine.startsWith("data: ")) return "";
    const jsonStr = cleanLine.replace(/^data:\s*/, "").trim();
    if (jsonStr === "[DONE]") return "";
    try {
      const data = JSON.parse(jsonStr);
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch {
      return "";
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Xây dựng lịch sử hội thoại cho Gemini API (bỏ qua welcome & tin nhắn rỗng)
    const historyContents = messages
      .filter((m) => m.id !== "welcome" && m.text.trim() !== "")
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

    const apiContents = [
      ...historyContents,
      {
        role: "user",
        parts: [{ text: query.trim() }],
      },
    ];

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            contents: apiContents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (buffer.trim()) {
              accumulatedText += parseAndAppendChunk(buffer.trim());
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
                )
              );
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const chunkText = parseAndAppendChunk(line);
            if (chunkText) {
              accumulatedText += chunkText;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
                )
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Chatbox Stream Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text:
                  "Dạ em rất tiếc, kết nối hiện đang gián đoạn một chút. Anh/Chị có thể liên hệ trực tiếp với anh Kỳ qua Email **nky57412@gmail.com** hoặc SĐT **0369 623 216** nhé ạ!\n\n💡 **Anh/Chị có muốn tìm hiểu về các dự án tiêu biểu của Kỳ không ạ?**",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* 1. Đám mây thông báo khi đóng chatbox */}
      {showCloud && !isOpen && (
        <div className="relative mb-2 flex items-center gap-1.5 rounded-2xl border-2 border-primary/40 bg-card px-3 py-1.5 shadow-[4px_4px_0_0_var(--gold)] text-xs font-bold text-primary animate-bounce">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>Trợ lý ảo CKy</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCloud(false);
            }}
            title="Đóng"
            className="ml-1 rounded-full p-0.5 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="absolute -bottom-2 right-5 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-card" />
        </div>
      )}

      {/* 2. Khung Chatbox */}
      {isOpen && (
        <div className="mb-2 flex h-[520px] w-[350px] sm:w-[390px] flex-col overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md shadow-[8px_8px_0_0_var(--gold)] transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-card text-primary">
                <Bot className="h-4 w-4" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card animate-pulse" />
              </div>
              <div>
                <h3 className="font-display text-sm font-extrabold leading-none tracking-wide text-primary-foreground">
                  Trợ lý ảo CKy
                </h3>
                <p className="mt-1 flex items-center gap-1 text-[10px] opacity-90">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Đang hoạt động
                </p>
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
            {messages.map((m) => {
              if (m.sender === "ai" && !m.text && isLoading) return null;

              return (
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
                    className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                        : "bg-secondary/90 border border-primary/20 text-foreground rounded-tl-none shadow-sm"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed text-xs dark:prose-invert">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                    <span
                      className={`mt-1 block text-[9px] opacity-60 ${
                        m.sender === "user"
                          ? "text-right text-primary-foreground/70"
                          : "text-left text-muted-foreground"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Trạng thái Đang chờ */}
            {isLoading && !messages[messages.length - 1]?.text && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold bg-accent">
                  <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-primary/20 bg-secondary/80 px-4 py-2.5">
                  <span className="text-[11px] font-medium text-muted-foreground mr-1">
                    CKy đang soạn tin nhắn
                  </span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Gợi ý nhanh ban đầu */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {INITIAL_SUGGESTIONS.map((s) => (
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

          {/* Ô Nhập tin nhắn */}
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
                placeholder="Hỏi trợ lý CKy bất kỳ thông tin nào..."
                className="flex-1 rounded-xl border border-primary/30 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Nút mở/đóng Chatbox */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--gold)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Toggle Chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6 transition-transform group-hover:rotate-12" />}
      </button>

      {/* 4. Đồng hồ thời gian thực */}
      <div className="mt-2 flex flex-col items-center rounded-lg border border-primary/20 bg-card/90 px-2.5 py-1 text-center font-mono shadow-sm backdrop-blur-sm">
        <span className="text-[11px] font-bold text-foreground leading-none">
          {formatLiveTime(currentTime)}
        </span>
        <span className="mt-0.5 text-[10px] text-muted-foreground leading-none">
          {formatLiveDate(currentTime)}
        </span>
      </div>
    </div>
  );
}