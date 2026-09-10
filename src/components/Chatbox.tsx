import { useState, useRef, useEffect, useCallback } from "react";
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

/**
 * Gemini models được thử theo thứ tự.
 *
 * Lưu ý:
 * - Không còn dùng Gemini 1.5.
 * - Nếu model đầu tiên đang quá tải (429/5xx), hệ thống sẽ retry
 *   rồi tự chuyển sang model tiếp theo.
 */
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
] as const;

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_MODEL = 2;
const RETRY_DELAYS_MS = [700, 1400];
const REQUEST_TIMEOUT_MS = 15000;

const API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatLiveTime(date: Date): string {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

function formatLiveDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException && error.name === "AbortError"
  );
}

function getApiErrorMessage(status: number, body: string): string {
  let detail = "";

  try {
    const parsed = JSON.parse(body);
    detail = parsed?.error?.message || "";
  } catch {
    detail = body;
  }

  return `Gemini API Error ${status}${detail ? `: ${detail}` : ""}`;
}

function extractTextFromSseEvent(event: string): string {
  const dataLines = event
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("data:"))
    .map((line) => line.replace(/^data:\s*/, "").trim())
    .filter(Boolean);

  if (!dataLines.length) return "";

  const textChunks: string[] = [];

  for (const dataStr of dataLines) {
    if (dataStr === "[DONE]") continue;

    try {
      const data = JSON.parse(dataStr);
      const parts = data?.candidates?.[0]?.content?.parts;

      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (typeof part?.text === "string" && part.text) {
            textChunks.push(part.text);
          }
        }
      }
    } catch {
      // Event chưa hoàn chỉnh sẽ được giữ trong buffer ở caller.
    }
  }

  return textChunks.join("");
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function fetchGeminiText(
  apiKey: string,
  apiContents: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>,
  signal: AbortSignal
): Promise<string> {
  let lastStatus = 0;
  let lastBody = "";

  for (const modelName of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const handleAbort = () => controller.abort();
      signal.addEventListener("abort", handleAbort, { once: true });

      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;

      try {
        // Dùng generateContent thay vì streamGenerateContent.
        // Chatbox vẫn có hiệu ứng gõ chữ ở UI, nhưng tránh lỗi SSE/buffering
        // khiến bubble AI bị rỗng hoặc loading vô hạn trên browser/Vercel.
        response = await fetch(
          `${API_BASE_URL}/${modelName}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }],
              },
              contents: apiContents,
              generationConfig: {
                thinkingConfig: {
                  thinkingLevel: "low",
                },
                maxOutputTokens: 700,
              },
            }),
            signal: controller.signal,
          }
        );
      } finally {
        window.clearTimeout(timeoutId);
        signal.removeEventListener("abort", handleAbort);
      }

      if (response.ok) {
        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts)
          ? parts
              .map((part: { text?: unknown }) =>
                typeof part?.text === "string" ? part.text : ""
              )
              .join("")
              .trim()
          : "";

        if (text) return text;

        throw new Error("Gemini trả về response nhưng không có nội dung.");
      }

      lastStatus = response.status;
      lastBody = await readErrorBody(response);

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error(getApiErrorMessage(response.status, lastBody));
      }

      // 404/429/5xx: thử model tiếp theo. 503 không retry cùng model để
      // tránh người dùng phải chờ quá lâu khi backend đang quá tải.
      continue;
    } catch (error) {
      if (isAbortError(error)) {
        if (signal.aborted) throw error;

        lastStatus = 504;
        lastBody = "Request timeout";
        continue;
      }

      if (
        error instanceof Error &&
        error.message.startsWith("Gemini API Error")
      ) {
        throw error;
      }

      lastBody = error instanceof Error ? error.message : String(error);
      continue;
    }
  }

  throw new Error(
    lastStatus
      ? getApiErrorMessage(lastStatus, lastBody)
      : "GEMINI_NO_AVAILABLE_MODEL"
  );
}

function getFriendlyErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (message.includes("missing vite_gemini_api_key")) {
    return "⚠️ Hệ thống chưa được cấu hình **VITE_GEMINI_API_KEY**. Vui lòng kiểm tra biến môi trường trên Vercel.";
  }

  if (message.includes("401") || message.includes("403")) {
    return "⚠️ Gemini API Key không hợp lệ hoặc chưa được cấp quyền. Vui lòng kiểm tra lại API Key trên Vercel.";
  }

  if (message.includes("400")) {
    return "⚠️ Request gửi tới Gemini không hợp lệ. Vui lòng thử lại với câu hỏi khác.";
  }

  if (message.includes("404")) {
    return "⚠️ Model Gemini hiện tại không khả dụng. Hệ thống đã thử các model dự phòng nhưng chưa kết nối được.";
  }

  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit")
  ) {
    return "⏳ Gemini đang giới hạn lưu lượng hoặc quota tạm thời. Anh/Chị vui lòng thử lại sau vài giây nhé!";
  }

  if (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("504")
  ) {
    return "⏳ Gemini đang quá tải trong thời gian ngắn. Anh/Chị vui lòng thử lại sau vài giây nhé!";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed")
  ) {
    return "🌐 Kết nối tới dịch vụ AI bị gián đoạn. Anh/Chị vui lòng kiểm tra mạng và thử lại nhé!";
  }

  return "Dạ em rất tiếc, hiện tại hệ thống AI đang gặp sự cố. Anh/Chị vui lòng thử lại sau ít giây ạ!";
}

export function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCloud, setShowCloud] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Không khởi tạo new Date() trong render/SSR để tránh React hydration mismatch (#418).
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text:
        "Dạ em xin chào Anh/Chị! Em là **Trợ lý ảo CKy** — đại diện thông tin cho **Võ Lê Cao Kỳ**. Anh/Chị cần em hỗ trợ thông tin gì về học vấn, kinh nghiệm hay các dự án của Kỳ ạ? 👋\n\n💡 **Anh/Chị có thể chọn nhanh các gợi ý bên dưới:**",
      timestamp: "",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const now = new Date();

    setCurrentTime(now);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "welcome"
          ? { ...msg, timestamp: formatMessageTime(now) }
          : msg
      )
    );

    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, isLoading, isOpen]);

  const updateMessage = useCallback(
    (messageId: string, text: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, text } : msg
        )
      );
    },
    []
  );

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend ?? input).trim();

      if (!query || isLoading) return;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

      if (!apiKey) {
        const userMsg: Message = {
          id: createId("user"),
          sender: "user",
          text: query,
          timestamp: formatMessageTime(new Date()),
        };

        const aiMsgId = createId("ai");

        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: aiMsgId,
            sender: "ai",
            text: "⚠️ Hệ thống chưa được cấu hình **VITE_GEMINI_API_KEY**. Vui lòng kiểm tra Environment Variables trên Vercel.",
            timestamp: formatMessageTime(new Date()),
          },
        ]);

        if (!textToSend) setInput("");
        return;
      }

      const now = new Date();

      const userMsg: Message = {
        id: createId("user"),
        sender: "user",
        text: query,
        timestamp: formatMessageTime(now),
      };

      const aiMsgId = createId("ai");

      const initialAiMsg: Message = {
        id: aiMsgId,
        sender: "ai",
        text: "",
        timestamp: formatMessageTime(now),
      };

      // Chỉ giữ lịch sử gần nhất để giảm input token và latency.
      const recentMessages = messages
        .filter(
          (message) =>
            message.id !== "welcome" &&
            message.text.trim() !== ""
        )
        .slice(-8);

      const historyContents = recentMessages.map((message) => ({
          role:
            message.sender === "user"
              ? ("user" as const)
              : ("model" as const),
          parts: [{ text: message.text }],
        }));

      const apiContents = [
        ...historyContents,
        {
          role: "user" as const,
          parts: [{ text: query }],
        },
      ];

      setMessages((prev) => [
        ...prev,
        userMsg,
        initialAiMsg,
      ]);

      if (!textToSend) {
        setInput("");
      }

      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const answerText = await fetchGeminiText(
          apiKey,
          apiContents,
          controller.signal
        );

        // API trả về trọn câu trả lời một lần; phần này tạo hiệu ứng gõ
        // từng ký tự mà không phụ thuộc SSE/buffering của browser.
        let typedText = "";
        for (const char of answerText) {
          if (controller.signal.aborted) return;
          typedText += char;
          updateMessage(aiMsgId, typedText);
          await sleep(8);
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        const friendlyMessage = getFriendlyErrorMessage(error);

        updateMessage(
          aiMsgId,
          `${friendlyMessage}\n\nNếu cần hỗ trợ trực tiếp, Anh/Chị có thể liên hệ anh Kỳ qua Email **nky57412@gmail.com** nhé ạ!`
        );
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        setIsLoading(false);
      }
    },
    [input, isLoading, messages, updateMessage]
  );

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {showCloud && !isOpen && (
        <div className="relative mb-2 flex items-center gap-1.5 rounded-2xl border-2 border-primary/40 bg-card px-3 py-1.5 text-xs font-bold text-primary shadow-[4px_4px_0_0_var(--gold)] animate-bounce">
          <Sparkles className="h-3.5 w-3.5 text-gold" />

          <span>Trợ lý ảo CKy</span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowCloud(false);
            }}
            title="Đóng"
            aria-label="Đóng lời nhắc trợ lý ảo"
            className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="absolute -bottom-2 right-5 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-card" />
        </div>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Trợ lý ảo CKy"
          className="mb-2 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/95 shadow-[8px_8px_0_0_var(--gold)] backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b-2 border-primary/20 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-card text-primary">
                <Bot className="h-4 w-4" />

                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                    isLoading
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-green-500 animate-pulse"
                  }`}
                />
              </div>

              <div>
                <h3 className="font-display text-sm font-extrabold leading-none tracking-wide">
                  Trợ lý ảo CKy
                </h3>

                <p className="mt-1 flex items-center gap-1 text-[10px] opacity-90">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isLoading ? "bg-yellow-300" : "bg-green-400"
                    }`}
                  />
                  {isLoading ? "Đang trả lời..." : "Đang hoạt động"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
              className="rounded-lg p-1 text-primary-foreground/80 transition-colors hover:bg-card/20 hover:text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => {
              if (
                message.sender === "ai" &&
                !message.text &&
                isLoading
              ) {
                return null;
              }

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    message.sender === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                      message.sender === "user"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gold bg-accent text-accent-foreground"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div
                    className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      message.sender === "user"
                        ? "rounded-tr-none bg-primary text-primary-foreground shadow-sm"
                        : "rounded-tl-none border border-primary/20 bg-secondary/90 text-foreground shadow-sm"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-xs leading-relaxed dark:prose-invert prose-p:my-1">
                      <ReactMarkdown>
                        {message.text}
                      </ReactMarkdown>
                    </div>

                    <span
                      className={`mt-1 block text-[9px] opacity-60 ${
                        message.sender === "user"
                          ? "text-right text-primary-foreground/70"
                          : "text-left text-muted-foreground"
                      }`}
                    >
                      {message.timestamp}
                    </span>

                    {isLoading &&
                      message.id === messages[messages.length - 1]?.id &&
                      message.sender === "ai" &&
                      message.text && (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-current"
                        />
                      )}
                  </div>
                </div>
              );
            })}

            {isLoading &&
              !messages[messages.length - 1]?.text && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold bg-accent">
                    <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-primary/20 bg-secondary/80 px-4 py-2.5">
                    <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                      CKy đang trả lời
                    </span>

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

            <div ref={chatEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {INITIAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleSend(suggestion)}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-gold hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-2.5 w-2.5 text-gold" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="border-t-2 border-primary/20 bg-card p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isLoading}
                maxLength={500}
                autoComplete="off"
                placeholder="Hỏi trợ lý CKy bất kỳ thông tin nào..."
                className="flex-1 rounded-xl border border-primary/30 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Nội dung câu hỏi"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Gửi tin nhắn"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--gold)] transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={isOpen ? "Đóng trợ lý ảo" : "Mở trợ lý ảo"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6 transition-transform group-hover:rotate-12" />
        )}
      </button>

      <div className="mt-2 flex min-h-[34px] flex-col items-center rounded-lg border border-primary/20 bg-card/90 px-2.5 py-1 text-center font-mono shadow-sm backdrop-blur-sm">
        {currentTime ? (
          <>
            <span className="text-[11px] font-bold leading-none text-foreground">
              {formatLiveTime(currentTime)}
            </span>

            <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
              {formatLiveDate(currentTime)}
            </span>
          </>
        ) : (
          <span
            aria-hidden="true"
            className="text-[11px] leading-[22px] opacity-0"
          >
            00:00
          </span>
        )}
      </div>
    </div>
  );
}
