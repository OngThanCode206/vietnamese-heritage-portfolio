import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SYSTEM_INSTRUCTION } from "../config/aiPrompt";
import chatAvatar from "@/assets/dai_dien_chatbox.png";

// ==========================================
// 1. CÁC KIỂU DỮ LIỆU & INTERFACE (TYPES)
// ==========================================

/** Danh sách mã ngôn ngữ phản hồi được hỗ trợ */
export type ResponseLanguage = "vi" | "en" | "ko";

interface ChatboxProps {
  /** Ngôn ngữ mặc định truyền từ Props ngoài vào */
  lang?: ResponseLanguage;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// ==========================================
// 2. HẰNG SỐ & BỘ TỪ ĐIỂN ĐA NGÔN NGỮ (I18N)
// ==========================================

/** Bộ từ điển đa ngôn ngữ cho toàn bộ giao diện UI của Chatbox */
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


// ==========================================
// 2. CẤU HÌNH GEMINI + PERFORMANCE
// ==========================================

const GEMINI_MODELS = {
  fast: ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.1-flash-lite"],
  accurate: ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"],
} as const;

const API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const RETRY_DELAY_MS = 250;
const REQUEST_TIMEOUT_MS = 6000;
const TOTAL_DEADLINE_MS = 9500;

const MAX_HISTORY_MESSAGES = 4;
const MAX_HISTORY_CHARS = 450;
const MAX_ANSWER_CHARS = 1800;

const CACHE_TTL_MS = 60_000;
const responseCache = new Map<
  string,
  { text: string; expiresAt: number }
>();

const TYPEWRITER_LIMIT = 450;
const TYPEWRITER_CHUNK = 30;

// ==========================================
// 3. HELPER
// ==========================================

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatMessageTime(
  date: Date,
  lang: ResponseLanguage = "vi"
): string {
  const locale = { vi: "vi-VN", en: "en-US", ko: "ko-KR" }[lang];
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatLiveTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
}

function formatLiveDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function detectResponseLanguage(
  text: string,
  fallback: ResponseLanguage
): ResponseLanguage {
  const normalized = text.toLowerCase().trim();

  if ((normalized.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g)?.length ?? 0) >= 2) {
    return "ko";
  }

  if (
    /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i.test(
      normalized
    )
  ) {
    return "vi";
  }

  const words = normalized.match(/[a-zA-ZÀ-ỹĐđ]+/g) ?? [];

  const viWords = new Set([
    "xin", "chao", "chào", "anh", "chi", "chị", "em", "toi", "tôi",
    "minh", "mình", "ky", "kỳ", "dang", "đang", "lam", "làm", "gi", "gì",
    "nao", "nào", "du", "dự", "an", "án", "hoc", "học", "van", "vấn",
    "de", "đề", "kinh", "nghiem", "nghiệm", "thanh", "tich", "tích",
    "truong", "trường", "cong", "nghe", "công", "nghệ", "duoc", "được",
    "khong", "không", "co", "có", "nhung", "những", "cua", "của", "voi",
    "với", "the", "thế", "gioi", "giới", "bao", "nhieu", "nhiều", "nhat",
    "nhất", "la", "là", "va", "và", "hay", "gioi", "giỏi", "duan", "dự án",
  ]);

  const enWords = new Set([
    "hello", "hi", "hey", "thanks", "thank", "please", "what", "who",
    "where", "when", "why", "how", "which", "can", "could", "would",
    "tell", "show", "about", "project", "projects", "experience", "skill",
    "skills", "education", "achievement", "achievements", "student",
    "developer", "work", "working", "study", "studying", "portfolio",
    "contact", "email", "is", "are", "do", "does", "did", "has", "have",
    "and", "or", "the", "my", "your", "his", "her", "their", "this",
    "that", "with", "from",
  ]);

  const viScore = words.filter((word) => viWords.has(word)).length;
  const enScore = words.filter((word) => enWords.has(word)).length;

  if (viScore > enScore && viScore > 0) return "vi";
  if (enScore > 0) return "en";
  return fallback;
}

function languageInstruction(language: ResponseLanguage): string {
  if (language === "en") {
    return "Respond ONLY in English. Do not switch to Vietnamese or Korean.";
  }
  if (language === "ko") {
    return "한국어로만 답변하세요. 베트남어 또는 영어로 전환하지 마세요.";
  }
  return "Chỉ trả lời bằng tiếng Việt. Không chuyển sang tiếng Anh hoặc tiếng Hàn.";
}

function isComplexQuestion(query: string): boolean {
  return (
    query.length > 120 ||
    (query.match(/[?？!！]/g)?.length ?? 0) >= 2 ||
    /\b(why|how|explain|compare|difference|detail|detailed|architecture|technical|technology|vì sao|tại sao|như thế nào|giải thích|so sánh|chi tiết|kiến trúc|kỹ thuật|công nghệ|왜|어떻게|설명|비교|자세히|기술)\b/i.test(
      query
    )
  );
}

function getCacheKey(
  language: ResponseLanguage,
  query: string
): string {
  return `${language}:${query.toLowerCase().trim()}`;
}

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }

  return cached.text;
}

function setCachedResponse(key: string, text: string): void {
  responseCache.set(key, {
    text,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  if (responseCache.size > 30) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
}

function getApiErrorMessage(status: number, body: string): string {
  let detail = "";

  try {
    detail = JSON.parse(body)?.error?.message ?? "";
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

function getFriendlyErrorMessage(
  error: unknown,
  lang: ResponseLanguage
): string {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (lang === "en") {
    if (message.includes("401") || message.includes("403")) {
      return "⚠️ The Gemini API key is invalid or does not have access to this model.";
    }
    if (message.includes("429") || message.includes("quota")) {
      return "⏳ Gemini is temporarily rate-limited. Please try again in a few seconds.";
    }
    return "⚠️ The AI service is temporarily unavailable. Please try again shortly.";
  }

  if (lang === "ko") {
    if (message.includes("401") || message.includes("403")) {
      return "⚠️ Gemini API 키가 올바르지 않거나 이 모델에 대한 접근 권한이 없습니다.";
    }
    if (message.includes("429") || message.includes("quota")) {
      return "⏳ 현재 Gemini 요청이 많습니다. 잠시 후 다시 시도해 주세요.";
    }
    return "⚠️ 현재 AI 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (message.includes("401") || message.includes("403")) {
    return "⚠️ Gemini API key không hợp lệ hoặc chưa có quyền dùng model này.";
  }
  if (message.includes("429") || message.includes("quota")) {
    return "⏳ Gemini đang giới hạn lưu lượng. Anh/Chị vui lòng thử lại sau vài giây nhé!";
  }
  return "⚠️ Hệ thống AI đang tạm thời không khả dụng. Anh/Chị vui lòng thử lại sau ít giây nhé!";
}

// ==========================================
// 4. GEMINI API
// ==========================================

async function fetchGeminiText(
  apiKey: string,
  contents: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>,
  responseLanguage: ResponseLanguage,
  signal: AbortSignal,
  complex: boolean
): Promise<string> {
  const models = complex ? GEMINI_MODELS.accurate : GEMINI_MODELS.fast;
  const startedAt = performance.now();

  let lastStatus = 0;
  let lastBody = "";

  for (const model of models) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    const remaining = TOTAL_DEADLINE_MS - (performance.now() - startedAt);
    if (remaining <= 300) break;

    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal.addEventListener("abort", onAbort, { once: true });

    const timeout = window.setTimeout(
      () => controller.abort(),
      Math.min(REQUEST_TIMEOUT_MS, Math.max(1000, remaining))
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/${model}:generateContent`,
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
                  text: [
                    SYSTEM_INSTRUCTION,
                    "",
                    "CHATBOX RULES:",
                    "- Use only facts from the portfolio.",
                    "- Answer directly and accurately.",
                    "- Do not invent personal facts, dates, titles, achievements, or projects.",
                    "- If the portfolio does not contain a fact, say that it is not provided.",
                    "- Keep normal answers concise; expand only when asked.",
                    `- ${languageInstruction(responseLanguage)}`,
                  ].join("\n"),
                },
              ],
            },
            contents,
            generationConfig: {
              thinkingConfig: {
                thinkingLevel: complex ? "low" : "minimal",
              },
              maxOutputTokens: complex ? 520 : 320,
            },
          }),
          signal: controller.signal,
        }
      );

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

        if (text) {
          return text.slice(0, MAX_ANSWER_CHARS);
        }

        lastStatus = 200;
        lastBody = "Gemini returned no text content.";
        continue;
      }

      lastStatus = response.status;
      lastBody = await readErrorBody(response);

      if ([400, 401, 403].includes(response.status)) {
        throw new Error(getApiErrorMessage(response.status, lastBody));
      }

      if (!RETRYABLE_STATUS.has(response.status)) {
        continue;
      }

      // Chỉ retry 429 một lần; 5xx/timeout chuyển model ngay.
      if (response.status === 429) {
        const retryRemaining =
          TOTAL_DEADLINE_MS - (performance.now() - startedAt);

        if (retryRemaining > RETRY_DELAY_MS + 1200) {
          await sleep(RETRY_DELAY_MS);

          const retryResponse = await fetch(
            `${API_BASE_URL}/${model}:generateContent`,
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
                      text: [
                        SYSTEM_INSTRUCTION,
                        "",
                        "CHATBOX RULES:",
                        "- Use only facts from the portfolio.",
                        "- Answer directly and accurately.",
                        "- Do not invent personal facts, dates, titles, achievements, or projects.",
                        "- If the portfolio does not contain a fact, say that it is not provided.",
                        `- ${languageInstruction(responseLanguage)}`,
                      ].join("\n"),
                    },
                  ],
                },
                contents,
                generationConfig: {
                  thinkingConfig: {
                    thinkingLevel: complex ? "low" : "minimal",
                  },
                  maxOutputTokens: complex ? 520 : 320,
                },
              }),
              signal: controller.signal,
            }
          );

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const retryParts = retryData?.candidates?.[0]?.content?.parts;
            const retryText = Array.isArray(retryParts)
              ? retryParts
                  .map((part: { text?: unknown }) =>
                    typeof part?.text === "string" ? part.text : ""
                  )
                  .join("")
                  .trim()
              : "";

            if (retryText) return retryText.slice(0, MAX_ANSWER_CHARS);
          }

          lastStatus = retryResponse.status;
          lastBody = await readErrorBody(retryResponse);
        }
      }
    } catch (error) {
      if (isAbortError(error)) {
        if (signal.aborted) throw error;
        lastStatus = 504;
        lastBody = "Request timeout";
      } else if (
        error instanceof Error &&
        error.message.startsWith("Gemini API Error")
      ) {
        throw error;
      } else {
        lastBody = error instanceof Error ? error.message : String(error);
      }
    } finally {
      window.clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
    }
  }

  throw new Error(
    lastStatus
      ? getApiErrorMessage(lastStatus, lastBody)
      : lastBody || "GEMINI_NO_AVAILABLE_MODEL"
  );
}

// ==========================================
// 5. COMPONENT CHÍNH
// ==========================================

export function Chatbox({ lang = "vi" }: ChatboxProps) {
  const [currentLang, setCurrentLang] = useState<ResponseLanguage>(lang);
  const [isOpen, setIsOpen] = useState(false);
  const [showCloud, setShowCloud] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: CHATBOX_I18N[lang]?.welcome || CHATBOX_I18N.vi.welcome,
      timestamp: "",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = CHATBOX_I18N[currentLang] || CHATBOX_I18N.vi;

  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === "welcome"
          ? { ...message, text: t.welcome }
          : message
      )
    );
  }, [currentLang, t.welcome]);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);

    setMessages((prev) =>
      prev.map((message) =>
        message.id === "welcome"
          ? {
              ...message,
              timestamp: formatMessageTime(now, currentLang),
            }
          : message
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
        behavior: "auto",
        block: "end",
      });
    });
  }, [messages, isLoading, isOpen]);

  const updateMessage = useCallback(
    (messageId: string, text: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, text } : message
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
      const now = new Date();
      const responseLanguage = detectResponseLanguage(query, currentLang);
      const cacheKey = getCacheKey(responseLanguage, query);

      const userMessage: Message = {
        id: createId("user"),
        sender: "user",
        text: query,
        timestamp: formatMessageTime(now, currentLang),
      };

      const aiMessageId = createId("ai");

      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: aiMessageId,
          sender: "ai",
          text: "",
          timestamp: formatMessageTime(now, currentLang),
        },
      ]);

      if (!textToSend) setInput("");

      if (!apiKey) {
        updateMessage(
          aiMessageId,
          "⚠️ VITE_GEMINI_API_KEY chưa được cấu hình."
        );
        return;
      }

      const cached = getCachedResponse(cacheKey);
      if (cached) {
        updateMessage(aiMessageId, cached);
        return;
      }

      setIsLoading(true);

      const complex = isComplexQuestion(query);
      const history = messages
        .filter(
          (message) =>
            message.id !== "welcome" &&
            message.text.trim()
        )
        .slice(-MAX_HISTORY_MESSAGES)
        .map((message) => ({
          role: message.sender === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: message.text.slice(0, MAX_HISTORY_CHARS) }],
        }));

      const contents = [
        ...history,
        {
          role: "user" as const,
          parts: [{ text: query }],
        },
      ];

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const answer = await fetchGeminiText(
          apiKey,
          contents,
          responseLanguage,
          controller.signal,
          complex
        );

        setCachedResponse(cacheKey, answer);

        if (answer.length > TYPEWRITER_LIMIT) {
          updateMessage(aiMessageId, answer);
        } else {
          for (let index = 0; index < answer.length; index += TYPEWRITER_CHUNK) {
            if (controller.signal.aborted) return;
            updateMessage(
              aiMessageId,
              answer.slice(0, index + TYPEWRITER_CHUNK)
            );
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => resolve())
            );
          }
        }
      } catch (error) {
        if (isAbortError(error)) return;

        console.error("[CKy Gemini]", error);

        updateMessage(
          aiMessageId,
          `${getFriendlyErrorMessage(error, currentLang)}\n\n${t.contactInfo}`
        );
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, currentLang, t.contactInfo, updateMessage]
  );


  // --- RENDER GIAO DIỆN (JSX) ---
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* 1. LỜI NHẮC BONG BÓNG (FLOATING CLOUD HINT) */}
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

      {/* 2. CỬA SỔ CHATBOX DẠNG DIALOG */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t.assistantName}
          className="mb-2 flex h-[530px] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border-2 border-gold bg-[#FAF6ED] dark:bg-card/95 shadow-[8px_8px_0_0_var(--gold)] backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200"
        >
          {/* HEADER CHATBOX */}
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

            {/* BỘ CHỌN NGÔN NGỮ ĐỘNG (VI | EN | KO) VÀ NÚT ĐÓNG */}
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

          {/* KHU VỰC THÂN CHATBOX (HIỂN THỊ DANH SÁCH TIN NHẮN) */}
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

                    {/* Con trỏ nhấp nháy cho tin nhắn AI đang chạy chữ */}
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

            {/* BẢNG HIỂN THỊ LOADING (DẠNG 3 DẤU CHẤM) KHI AI ĐANG NGHĨ */}
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

          {/* KHUNG CÁC CÂU GỢI Ý NHANH (QUICK SUGGESTIONS) */}
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

          {/* Ô NHẬP LIỆU VÀ NÚT GỬI (INPUT FORM) */}
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

      {/* 3. NÚT BẬT / TẮT CHATBOX (FLOATING ACTION BUTTON) */}
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

      {/* 4. WIDGET ĐỒNG HỒ THỜI GIAN THỰC (LIVE CLOCK) */}
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