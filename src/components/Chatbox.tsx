import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SYSTEM_INSTRUCTION } from "../config/aiPrompt";
import chatAvatar from "@/assets/dai_dien_chatbox.png";

export type ResponseLanguage = "vi" | "en" | "ko";

interface ChatboxProps {
  lang?: ResponseLanguage;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// Bộ từ điển đa ngôn ngữ cho toàn bộ UI
const CHATBOX_I18N = {
  vi: {
    assistantName: "Trợ lý ảo CKy",
    statusActive: "Đang hoạt động",
    statusTyping: "Đang trả lời...",
    loadingText: "Trợ lý CKy đang trả lời",
    welcome:
      "Dạ em xin chào Anh/Chị! Em là **Trợ lý ảo CKy** — đại diện thông tin cho **Võ Lê Cao Kỳ**. Anh/Chị cần em hỗ trợ thông tin gì về học vấn, kinh nghiệm hay các dự án của Kỳ ạ? 👋\n\n💡 **Anh/Chị có thể chọn nhanh các gợi ý bên dưới:**",
    placeholder: "Hỏi trợ lý CKy bất kỳ thông tin nào...",
    suggestions: [
      "Kỳ đang làm vị trí gì?",
      "Dự án tiêu biểu của Kỳ?",
      "Thành tích & Học vấn của Kỳ?",
      "Kỳ có kinh nghiệm gì về AI & IoT?",
      "Kỳ có sở thích gì ngoài công việc?",
      "Kỳ có thể làm việc nhóm không?",
      "Kỳ hiện đang code ngôn ngữ gì?",
    ],
    contactInfo:
      "Nếu cần hỗ trợ trực tiếp, Anh/Chị có thể liên hệ anh Kỳ qua Email **nky57412@gmail.com** nhé ạ!",
  },
  en: {
    assistantName: "CKy Virtual Assistant",
    statusActive: "Online",
    statusTyping: "Typing...",
    loadingText: "CKy assistant is typing",
    welcome:
      "Hello! I am **CKy Virtual Assistant** — representing **Võ Lê Cao Kỳ**. How can I assist you regarding Ky's education, experience, or projects? 👋\n\n💡 **You can select quick suggestions below:**",
    placeholder: "Ask CKy assistant anything...",
    suggestions: [
      "What is Ky's current role?",
      "What are Ky's featured projects?",
      "Ky's education & achievements?",
      "Ky's experience in AI & IoT?",
      "What are Ky's hobbies outside of work?",
      "Can Ky work in a team?",
      "What programming languages does Ky use?",
    ],
    contactInfo:
      "For direct support, feel free to contact Ky via Email at **nky57412@gmail.com**!",
  },
  ko: {
    assistantName: "CKy AI 어시스턴트",
    statusActive: "온라인",
    statusTyping: "답변 작성 중...",
    loadingText: "CKy 비서가 답변 중입니다",
    welcome:
      "안녕하세요! 저는 **Võ Lê Cao Kỳ**의 정보를 안내해 드리는 **CKy AI 어시스턴트**입니다. Kỳ의 학력, 경력, 프로젝트에 대해 궁금하신 점이 있으신가요? 👋\n\n💡 **아래 추천 질문을 선택해 보세요:**",
    placeholder: "CKy 비서에게 무엇이든 물어보세요...",
    suggestions: [
      "Kỳ의 현재 직무는 무엇인가요?",
      "Kỳ의 대표 프로젝트는 무엇인가요?",
      "Kỳ의 학력 및 성과는 무엇인가요?",
      "Kỳ의 AI & IoT 경력은 무엇인가요?",
      "Kỳ의 취미는 무엇인가요?",
      "Kỳ는 팀워크가 가능한가요?",
      "Kỳ는 현재 어떤 언어로 코딩하나요?",
    ],
    contactInfo:
      "직접 문의가 필요하신 경우, 이메일 **nky57412@gmail.com**으로 contact 해주시기 바랍니다!",
  },
} as const;

const GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
] as const;

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_MODEL = 1;
const RETRY_DELAY_MS = 650;
const REQUEST_TIMEOUT_MS = 8000;
const MAX_ANSWER_CHARS = 5000;

const API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatMessageTime(date: Date, lang: ResponseLanguage = "vi"): string {
  const localeMap = { vi: "vi-VN", en: "en-US", ko: "ko-KR" };
  return date.toLocaleTimeString(localeMap[lang] || "vi-VN", {
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
  return error instanceof DOMException && error.name === "AbortError";
}

function detectResponseLanguage(text: string, currentUiLang: ResponseLanguage): ResponseLanguage {
  const normalized = text.toLowerCase().trim();

  const koreanChars = normalized.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g)?.length ?? 0;
  if (koreanChars >= 2) return "ko";

  if (/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i.test(normalized)) {
    return "vi";
  }

  const vietnameseWords = [
    "xin", "chao", "chào", "anh", "chi", "chị", "em", "toi", "tôi",
    "minh", "mình", "ky", "kỳ", "dang", "đang", "lam", "làm",
    "gi", "gì", "nao", "nào", "du", "dự", "an", "án", "hoc", "học",
    "van", "vấn", "de", "đề", "kinh", "nghiem", "nghiệm", "thanh",
    "tich", "tích", "truong", "trường", "cong", "nghe", "công", "nghệ",
    "duoc", "được", "khong", "không", "co", "có", "nhung", "những",
    "cua", "của", "voi", "với", "the", "thế", "gioi", "giới", "bao",
    "nhieu", "nhiều", "nhat", "nhất", "la", "là", "va", "và", "hay",
    "gioi", "giỏi", "du an", "dự án",
  ];

  const words: string[] = normalized.match(/[a-zA-ZÀ-ỹĐđ]+/g) ?? [];
  const viScore = vietnameseWords.reduce(
    (score, word) => score + (words.includes(word) ? 1 : 0),
    0
  );

  if (viScore >= 1) return "vi";

  const englishWords = [
    "hello", "hi", "hey", "thanks", "thank", "please", "what", "who",
    "where", "when", "why", "how", "which", "can", "could", "would",
    "tell", "show", "about", "project", "projects", "experience", "skill",
    "skills", "education", "achievement", "achievements", "student", "developer",
    "work", "working", "study", "studying", "portfolio", "contact", "email",
    "is", "are", "do", "does", "did", "has", "have", "and", "or", "the",
  ];

  const enScore = englishWords.reduce((score, word) => score + (words.includes(word) ? 1 : 0), 0);

  if (enScore >= 1) return "en";

  return currentUiLang;
}

function getLanguageInstruction(language: ResponseLanguage): string {
  if (language === "en") {
    return `
LANGUAGE OVERRIDE FOR THIS REQUEST:
- The user's message is in ENGLISH.
- You MUST answer in ENGLISH only.
- Do NOT answer in Vietnamese or Korean.
`;
  }

  if (language === "ko") {
    return `
LANGUAGE OVERRIDE FOR THIS REQUEST:
- The user's message is in KOREAN.
- You MUST answer in KOREAN only (한국어).
- Do NOT answer in Vietnamese or English.
`;
  }

  return `
LANGUAGE OVERRIDE FOR THIS REQUEST:
- The user's message is in VIETNAMESE.
- You MUST answer in VIETNAMESE only.
`;
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
  responseLanguage: ResponseLanguage,
  signal: AbortSignal
): Promise<string> {
  let lastStatus = 0;
  let lastBody = "";

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL + 1; attempt += 1) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");

      const controller = new AbortController();
      const forwardAbort = () => controller.abort();
      signal.addEventListener("abort", forwardAbort, { once: true });
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );

      try {
        const response = await fetch(
          `${API_BASE_URL}/${modelName}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: `${SYSTEM_INSTRUCTION}\n\nQUY TẮC CHATBOX PORTFOLIO:\n- Chỉ trả lời dựa trên thông tin portfolio được cung cấp.\n- Ưu tiên 2-5 câu ngắn hoặc các gạch đầu dòng cần thiết.\n- Không suy đoán thông tin cá nhân chưa có.\n- Không lặp lại câu hỏi của người dùng.\n\n${getLanguageInstruction(responseLanguage)}`,
                  },
                ],
              },
              contents: apiContents,
              generationConfig: {
                thinkingConfig: {
                  thinkingLevel: "minimal",
                },
                maxOutputTokens: 800,
              },
            }),
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts;
          const finishReason = data?.candidates?.[0]?.finishReason;

          const text = Array.isArray(parts)
            ? parts
                .map((part: { text?: unknown }) =>
                  typeof part?.text === "string" ? part.text : ""
                )
                .join("")
                .trim()
            : "";

          if (text) {
            return text.slice(0, MAX_ANSWER_CHARS);
          }

          if (finishReason === "MAX_TOKENS") {
            throw new Error("Gemini output token limit reached.");
          }

          throw new Error("Gemini returned response without text content.");
        }

        lastStatus = response.status;
        lastBody = await readErrorBody(response);

        if (response.status === 400 || response.status === 401 || response.status === 403) {
          throw new Error(getApiErrorMessage(response.status, lastBody));
        }

        if (!RETRYABLE_STATUS.has(response.status) || attempt >= MAX_RETRIES_PER_MODEL) {
          break;
        }
      } catch (error) {
        if (isAbortError(error)) {
          if (signal.aborted) throw error;
          lastStatus = 504;
          lastBody = "Request timeout";
          break;
        }

        if (
          error instanceof Error &&
          error.message.startsWith("Gemini API Error")
        ) {
          throw error;
        }

        lastBody = error instanceof Error ? error.message : String(error);
        break;
      } finally {
        window.clearTimeout(timeoutId);
        signal.removeEventListener("abort", forwardAbort);
      }

      if (attempt < MAX_RETRIES_PER_MODEL) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  throw new Error(
    lastStatus
      ? getApiErrorMessage(lastStatus, lastBody)
      : lastBody || "GEMINI_NO_AVAILABLE_MODEL"
  );
}

function getFriendlyErrorMessage(error: unknown, lang: ResponseLanguage = "vi"): string {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (lang === "en") {
    if (message.includes("429") || message.includes("quota")) return "⏳ Gemini API is temporarily busy. Please try again in a few seconds!";
    return "Dạ em rất tiếc, current AI service is unavailable. Please try again shortly!";
  }

  if (lang === "ko") {
    if (message.includes("429") || message.includes("quota")) return "⏳ AI 서비스 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해 주세요!";
    return "죄송합니다. 현재 AI 시스템에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요!";
  }

  if (message.includes("429") || message.includes("quota")) {
    return "⏳ Gemini đang giới hạn lưu lượng hoặc quota tạm thời. Anh/Chị vui lòng thử lại sau vài giây nhé!";
  }

  return "Dạ em rất tiếc, hiện tại hệ thống AI đang gặp sự cố. Anh/Chị vui lòng thử lại sau ít giây ạ!";
}

export function Chatbox({ lang = "vi" }: ChatboxProps) {
  // Quản lý ngôn ngữ hiện tại ngay trên giao diện
  const [currentLang, setCurrentLang] = useState<ResponseLanguage>(lang);

  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  const t = CHATBOX_I18N[currentLang] || CHATBOX_I18N.vi;

  const [isOpen, setIsOpen] = useState(false);
  const [showCloud, setShowCloud] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: t.welcome,
      timestamp: "",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cập nhật câu chào mặc định mỗi khi chuyển đổi ngôn ngữ
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "welcome"
          ? { ...msg, text: t.welcome }
          : msg
      )
    );
  }, [currentLang, t.welcome]);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "welcome"
          ? { ...msg, timestamp: formatMessageTime(now, currentLang) }
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
  }, [currentLang]);

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
          timestamp: formatMessageTime(new Date(), currentLang),
        };

        const aiMsgId = createId("ai");

        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: aiMsgId,
            sender: "ai",
            text: "⚠️ VITE_GEMINI_API_KEY is missing.",
            timestamp: formatMessageTime(new Date(), currentLang),
          },
        ]);

        if (!textToSend) setInput("");
        return;
      }

      const now = new Date();
      const responseLanguage = detectResponseLanguage(query, currentLang);

      const userMsg: Message = {
        id: createId("user"),
        sender: "user",
        text: query,
        timestamp: formatMessageTime(now, currentLang),
      };

      const aiMsgId = createId("ai");

      const initialAiMsg: Message = {
        id: aiMsgId,
        sender: "ai",
        text: "",
        timestamp: formatMessageTime(now, currentLang),
      };

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

      const languageLabel =
        responseLanguage === "en"
          ? "ENGLISH"
          : responseLanguage === "ko"
            ? "KOREAN"
            : "VIETNAMESE";

      const latestUserPrompt = `[RESPONSE LANGUAGE: ${languageLabel}]\nRespond ONLY in ${languageLabel}. Do not switch to another language.\n\nUSER QUESTION:\n${query}`;

      const apiContents = [
        ...historyContents,
        {
          role: "user" as const,
          parts: [{ text: latestUserPrompt }],
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
          responseLanguage,
          controller.signal
        );

        let typedText = "";
        const CHARS_PER_TICK = 4;
        const TICK_MS = 16;

        for (let index = 0; index < answerText.length; index += CHARS_PER_TICK) {
          if (controller.signal.aborted) return;

          typedText += answerText.slice(index, index + CHARS_PER_TICK);
          updateMessage(aiMsgId, typedText);
          await sleep(TICK_MS);
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        const friendlyMessage = getFriendlyErrorMessage(error, currentLang);

        updateMessage(
          aiMsgId,
          `${friendlyMessage}\n\n${t.contactInfo}`
        );
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        setIsLoading(false);
      }
    },
    [input, isLoading, messages, updateMessage, currentLang, t.contactInfo]
  );

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Lời nhắc bong bóng */}
      {showCloud && !isOpen && (
        <div className="relative mb-2 flex items-center gap-1.5 rounded-xl border-2 border-gold bg-[#FAF6ED] dark:bg-card px-3.5 py-2 text-xs font-bold text-primary shadow-[4px_4px_0_0_var(--gold)] animate-bounce">
          <Sparkles className="h-3.5 w-3.5 text-gold" />

          <span>{t.assistantName}</span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowCloud(false);
            }}
            title="Close"
            aria-label="Close assistant hint"
            className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-gold/20 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="absolute -bottom-2 right-5 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-gold" />
        </div>
      )}

      {/* Cửa sổ Chatbox */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t.assistantName}
          className="mb-2 flex h-[530px] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border-2 border-gold bg-[#FAF6ED] dark:bg-card/95 shadow-[8px_8px_0_0_var(--gold)] backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b-2 border-gold bg-primary px-4 py-3 text-primary-foreground">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold/40" />
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-card text-primary shadow-sm">
                <img
                  src={chatAvatar}
                  alt={t.assistantName}
                  className="h-full w-full object-cover"
                />

                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                    isLoading
                      ? "bg-amber-400 animate-pulse"
                      : "bg-emerald-500 animate-pulse"
                  }`}
                />
              </div>

              <div>
                <h3 className="font-display text-sm font-extrabold leading-none tracking-wide flex items-center gap-1.5">
                  <span>{t.assistantName}</span>
                </h3>

                <p className="mt-1 flex items-center gap-1 text-[10px] opacity-90 font-medium">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isLoading ? "bg-amber-300" : "bg-emerald-400"
                    }`}
                  />
                  {isLoading ? t.statusTyping : t.statusActive}
                </p>
              </div>
            </div>

            {/* Bộ chọn ngôn ngữ (VI | EN | KO) và Nút đóng */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-gold/40 bg-black/20 p-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setCurrentLang("vi")}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    currentLang === "vi"
                      ? "bg-gold text-primary font-black shadow-xs"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                  title="Tiếng Việt"
                >
                  VI
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentLang("en")}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    currentLang === "en"
                      ? "bg-gold text-primary font-black shadow-xs"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                  title="English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentLang("ko")}
                  className={`rounded px-1.5 py-0.5 transition-colors ${
                    currentLang === "ko"
                      ? "bg-gold text-primary font-black shadow-xs"
                      : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                  title="한국어"
                >
                  KO
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Thân Chatbox */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-[radial-gradient(#d4af37_0.5px,transparent_0.5px)] [background-size:16px_16px] [background-color:rgba(250,246,237,0.7)] dark:[background-color:var(--card)]">
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
                    className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold shadow-sm ${
                      message.sender === "user"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gold bg-[#FFFDF9] text-accent-foreground"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <img
                        src={chatAvatar}
                        alt={t.assistantName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div
                    className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      message.sender === "user"
                        ? "rounded-tr-none bg-primary text-primary-foreground border border-primary"
                        : "rounded-tl-none border border-gold/40 bg-[#FFFDF9] dark:bg-secondary text-foreground"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-xs leading-relaxed dark:prose-invert prose-p:my-1">
                      <ReactMarkdown>
                        {message.text}
                      </ReactMarkdown>
                    </div>

                    <span
                      className={`mt-1 block text-[9px] opacity-60 font-mono ${
                        message.sender === "user"
                          ? "text-right text-primary-foreground/80"
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
                          className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] animate-pulse bg-gold"
                        />
                      )}
                  </div>
                </div>
              );
            })}

            {isLoading &&
              !messages[messages.length - 1]?.text && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-gold bg-[#FFFDF9]">
                    <img
                      src={chatAvatar}
                      alt={t.assistantName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-gold/40 bg-[#FFFDF9] dark:bg-secondary/80 px-4 py-2.5 shadow-sm">
                    <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                      {t.loadingText}
                    </span>

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

            <div ref={chatEndRef} />
          </div>

          {/* Khung gợi ý */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-[#F3EFEA] dark:bg-muted/30 border-t border-gold/20">
              {t.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleSend(suggestion)}
                  className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-[#FFFDF9] dark:bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-all hover:border-gold hover:bg-gold/10 hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-2.5 w-2.5 text-gold" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Ô nhập liệu */}
          <div className="border-t-2 border-gold/40 bg-[#FAF6ED] dark:bg-card p-3">
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
                placeholder={t.placeholder}
                className="flex-1 rounded-xl border border-gold/50 bg-[#FFFDF9] dark:bg-background px-3.5 py-2 text-base sm:text-xs text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-60 shadow-inner"
                aria-label="Question input"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold bg-primary text-primary-foreground shadow-sm transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nút bật/tắt Chatbox */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-gold bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--gold)] transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={isOpen ? "Close virtual assistant" : "Open virtual assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <img
            src={chatAvatar}
            alt="Open virtual assistant"
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
        )}
      </button>

      {/* Đồng hồ hiển thị thời gian */}
      <div className="mt-2 flex min-h-[34px] flex-col items-center rounded-lg border border-gold/40 bg-[#FAF6ED] dark:bg-card/90 px-2.5 py-1 text-center font-mono shadow-xs backdrop-blur-sm">
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