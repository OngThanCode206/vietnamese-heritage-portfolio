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

/**
 * Danh sách model Gemini dùng cho chatbot portfolio.
 * Ưu tiên model Flash-Lite có độ trễ thấp, sau đó mới chuyển sang model dự phòng.
 * Lưu ý: Gemini 3.8/3.7 không cần thiết cho chatbot FAQ và có thể chịu tải cao hơn.
 */
const GEMINI_FAST_MODEL = "gemini-3.6-flash" as const;
const GEMINI_ACCURATE_MODEL = "gemini-3.6-flash" as const;
const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
] as const;

/** Mã lỗi có thể chuyển model ngay để giảm thời gian chờ */
const FAILOVER_STATUS = new Set([408, 429, 500, 502, 503, 504]);
/** Retry 429 chỉ một lần và delay rất ngắn */
const RETRY_DELAY_MS = 250;
/** Timeout cho một model: đủ rộng cho mạng quốc tế nhưng vẫn nhanh với chatbot */
const REQUEST_TIMEOUT_MS = 6500;
/** Deadline tổng của một lượt hỏi; không để chuỗi fallback kéo dài */
const TOTAL_DEADLINE_MS = 10000;
/** Giới hạn câu trả lời ở mức đủ dùng cho portfolio FAQ */
const MAX_ANSWER_CHARS = 1800;
/** Giới hạn context để giảm input token và tránh mang lỗi cũ vào lượt mới */
const MAX_HISTORY_MESSAGES = 4;
const MAX_HISTORY_CHARS = 500;
/** Chỉ typewriter với câu ngắn để hiệu ứng không tạo thêm độ trễ đáng kể */
const TYPEWRITER_CHARS_PER_TICK = 5;
const TYPEWRITER_TICK_MS = 8;

/** Endpoint gốc của Google Gemini API */
const API_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// ==========================================
// 3. CÁC HÀM BỔ TRỢ (HELPER FUNCTIONS)
// ==========================================

/**
 * Tạo ID ngẫu nhiên duy nhất cho tin nhắn
 * @param prefix Tiền tố định danh (ví dụ: 'user' hoặc 'ai')
 */
function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Định dạng giờ tin nhắn theo dạng HH:mm theo đúng định dạng ngôn ngữ
 */
function formatMessageTime(date: Date, lang: ResponseLanguage = "vi"): string {
  const localeMap = { vi: "vi-VN", en: "en-US", ko: "ko-KR" };
  return date.toLocaleTimeString(localeMap[lang] || "vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Định dạng giờ cho widget Đồng hồ thời gian thực (VD: 5:27 pm)
 */
function formatLiveTime(date: Date): string {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

/**
 * Định dạng ngày cho widget Đồng hồ thời gian thực (DD/MM/YYYY)
 */
function formatLiveDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Hàm tạm dừng thực thi trong một khoảng thời gian
 * @param ms Số mili-giây cần tạm dừng
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Kiểm tra xem lỗi phát sinh có phải do AbortController ngắt request không
 */
function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Tự động nhận diện ngôn ngữ của câu hỏi nhập vào (Việt / Anh / Hàn)
 * @param text Đoạn văn bản người dùng nhập
 * @param currentUiLang Ngôn ngữ hiện tại của UI để fallback
 */
function detectResponseLanguage(text: string, currentUiLang: ResponseLanguage): ResponseLanguage {
  const normalized = text.toLowerCase().trim();

  // 1. Chữ Hàn là tín hiệu mạnh và gần như không mơ hồ.
  const koreanChars = normalized.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g)?.length ?? 0;
  if (koreanChars >= 2) return "ko";

  // 2. Dấu tiếng Việt là tín hiệu mạnh nhất cho tiếng Việt.
  if (/[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i.test(normalized)) {
    return "vi";
  }

  const words = normalized.match(/[a-zA-ZÀ-ỹĐđ]+/g) ?? [];
  const vietnameseWords = new Set([
    "xin", "chao", "chào", "anh", "chi", "chị", "em", "toi", "tôi",
    "minh", "mình", "ky", "kỳ", "dang", "đang", "lam", "làm",
    "gi", "gì", "nao", "nào", "du", "dự", "an", "án", "hoc", "học",
    "van", "vấn", "de", "đề", "kinh", "nghiem", "nghiệm", "thanh",
    "tich", "tích", "truong", "trường", "cong", "nghe", "công", "nghệ",
    "duoc", "được", "khong", "không", "co", "có", "nhung", "những",
    "cua", "của", "voi", "với", "the", "thế", "gioi", "giới", "bao",
    "nhieu", "nhiều", "nhat", "nhất", "la", "là", "va", "và", "hay",
    "gioi", "giỏi", "duan", "dự án",
  ]);

  const englishWords = new Set([
    "hello", "hi", "hey", "thanks", "thank", "please", "what", "who",
    "where", "when", "why", "how", "which", "can", "could", "would",
    "tell", "show", "about", "project", "projects", "experience", "skill",
    "skills", "education", "achievement", "achievements", "student", "developer",
    "work", "working", "study", "studying", "portfolio", "contact", "email",
    "is", "are", "do", "does", "did", "has", "have", "and", "or", "the",
    "my", "your", "his", "her", "their", "this", "that", "with", "from",
  ]);

  const viScore = words.reduce<number>((score, word) => score + (vietnameseWords.has(word) ? 1 : 0), 0);
  const enScore = words.reduce<number>((score, word) => score + (englishWords.has(word) ? 1 : 0), 0);

  // Câu tiếng Việt không dấu vẫn được ưu tiên nếu có từ đặc trưng.
  if (viScore >= 1 && viScore >= enScore) return "vi";
  if (enScore >= 1) return "en";

  // Nếu toàn bộ ký tự Latin và không có dấu tiếng Việt, dùng UI language.
  // Điều này giữ hành vi ổn định với các câu cực ngắn/đặc biệt.
  if (words.length > 0 && words.length >= 2) {
    const latinOnly = words.join(" ").replace(/[^a-zA-Z\s]/g, "").trim();
    if (latinOnly && currentUiLang === "en") return "en";
  }

  return currentUiLang;
}

/**
 * Bổ sung chỉ thị ép buộc ngôn ngữ cho Prompt gửi sang Gemini API
 */
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

/**
 * Trích xuất chuỗi thông báo lỗi chi tiết từ Response của Gemini API
 */
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

/**
 * Đọc nội dung text từ Response Body một cách an toàn
 */
async function readErrorBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function isTechnicalAssistantMessage(text: string): boolean {
  const value = text.toLowerCase();
  return (
    value.includes("gemini api") ||
    value.includes("hệ thống ai chưa thể") ||
    value.includes("dịch vụ gemini") ||
    value.includes("the ai service could not") ||
    value.includes("gemini api key") ||
    value.includes("현재 ai 서비스") ||
    value.includes("gemini가 요청")
  );
}

// ==========================================
// 4. HÀM GỌI API GEMINI (CORE NETWORK LOGIC)
// ==========================================

/**
 * Thực hiện gọi API Google Gemini
 * Có tích hợp: Tự động Retry khi lỗi mạng, tự chuyển Model khi thất bại, Timeout handling
 */
async function fetchGeminiText(
  apiKey: string,
  apiContents: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>,
  responseLanguage: ResponseLanguage,
  signal: AbortSignal,
  useAccurateModel: boolean
): Promise<string> {
  const startedAt = performance.now();
  let lastStatus = 0;
  let lastBody = "";

  // FAQ ngắn -> Flash-Lite. Câu hỏi kỹ thuật/giải thích -> Flash.
  // Các model fallback vẫn là model Stable hiện tại của Gemini 3.
  const models = useAccurateModel
    ? [GEMINI_ACCURATE_MODEL, "gemini-3.6-flash", GEMINI_FAST_MODEL, "gemini-3.1-flash-lite"]
    : [GEMINI_FAST_MODEL, "gemini-3.1-flash-lite", "gemini-3.6-flash", GEMINI_ACCURATE_MODEL];

  for (const modelName of models) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    let retried429 = false;
    const elapsed = performance.now() - startedAt;
    const remaining = TOTAL_DEADLINE_MS - elapsed;
    if (remaining <= 0) break;

    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    signal.addEventListener("abort", forwardAbort, { once: true });
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      Math.min(REQUEST_TIMEOUT_MS, Math.max(400, remaining))
    );

    try {
      const thinkingLevel = useAccurateModel ? "low" : "minimal";
      const maxOutputTokens = useAccurateModel ? 520 : 340;

      const response = await fetch(
        `${API_BASE_URL}/${modelName}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `${SYSTEM_INSTRUCTION}\n\nQUY TẮC CHATBOX PORTFOLIO:\n- Chỉ trả lời dựa trên thông tin portfolio được cung cấp.\n- Trả lời trực tiếp, đủ ý, không lan man.\n- Câu hỏi thông thường: tối đa 3 ý chính.\n- Chỉ mở rộng khi người dùng yêu cầu chi tiết.\n- Không bịa, không suy đoán dữ kiện cá nhân, thời gian, chức danh hoặc thành tích.\n- Nếu portfolio không có thông tin, nói rõ thông tin đó chưa được cung cấp.\n- Giữ nguyên tên dự án, công nghệ và mốc thời gian.\n- Không lặp lại câu hỏi.\n\nFINAL OUTPUT LANGUAGE RULE (HIGHEST PRIORITY):\n${getLanguageInstruction(responseLanguage)}`,
                },
              ],
            },
            contents: apiContents,
            generationConfig: {
              thinkingConfig: {
                thinkingLevel,
              },
              maxOutputTokens,
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
          const elapsedMs = Math.round(performance.now() - startedAt);
          console.debug(`[CKy] ${modelName} responded in ${elapsedMs}ms`);
          return text.slice(0, MAX_ANSWER_CHARS);
        }

        if (finishReason === "MAX_TOKENS") {
          lastStatus = 200;
          lastBody = "Gemini output token limit reached.";
        } else {
          lastStatus = 200;
          lastBody = "Gemini returned response without text content.";
        }
      } else {
        lastStatus = response.status;
        lastBody = await readErrorBody(response);

        // 400/401/403 là lỗi request/key/quyền: không đổi model mù quáng.
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          throw new Error(getApiErrorMessage(response.status, lastBody));
        }

        // 429: retry một lần cực ngắn nếu deadline còn đủ.
        if (response.status === 429 && !retried429) {
          const remainingAfter429 = TOTAL_DEADLINE_MS - (performance.now() - startedAt);
          if (remainingAfter429 > RETRY_DELAY_MS + 500) {
            retried429 = true;
            await sleep(RETRY_DELAY_MS);
            continue;
          }
        }

        // 5xx/408: bỏ model hiện tại và chuyển model tiếp theo ngay.
        if (FAILOVER_STATUS.has(response.status)) {
          break;
        }
      }
    } catch (error) {
      if (isAbortError(error)) {
        if (signal.aborted) throw error;
        lastStatus = 504;
        lastBody = "Request timeout";
      } else if (error instanceof Error && error.message.startsWith("Gemini API Error")) {
        throw error;
      } else {
        lastStatus = 0;
        lastBody = error instanceof Error ? error.message : String(error);
      }
    } finally {
      window.clearTimeout(timeoutId);
      signal.removeEventListener("abort", forwardAbort);
    }
  }

  throw new Error(
    lastStatus
      ? getApiErrorMessage(lastStatus, lastBody)
      : lastBody || "GEMINI_NO_AVAILABLE_MODEL"
  );
}

/**
 * Chuyển các lỗi kỹ thuật thành câu thông báo lỗi thân thiện cho UI người dùng
 */
function getFriendlyErrorMessage(error: unknown, lang: ResponseLanguage = "vi"): string {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (lang === "en") {
    if (message.includes("401") || message.includes("403")) {
      return "🌷 Oops! CKy hit a little snag. Please try again in a moment 💛";
    }
    if (message.includes("400")) {
      return "🐣 Hmm... hình như em vừa hiểu sai cách gửi câu hỏi mất rồi. Anh/Chị thử hỏi lại ngắn gọn hơn giúp em nhé!";
    }
    if (message.includes("429") || message.includes("quota")) {
      return "⏳ Ui, lúc này có hơi đông một chút! Anh/Chị chờ em vài giây rồi hỏi lại nhé 💫";
    }
    if (
      message.includes("503") ||
      message.includes("502") ||
      message.includes("504") ||
      message.includes("timeout")
    ) {
      return "🌼 CKy is a little busy right now and could not finish the reply. Please try again in a few seconds 💙";
    }
    return "✨ Oops! Em vừa gặp một chút trục trặc nhỏ. Anh/Chị thử lại giúp em nhé — em sẽ cố gắng trả lời ngay 💛";
  }

  if (lang === "ko") {
    if (message.includes("401") || message.includes("403")) {
      return "🌷 앗! CKy가 잠시 작은 문제를 겪고 있어요. 잠시 후 다시 물어봐 주세요 💛";
    }
    if (message.includes("400")) {
      return "🐣 음... 질문을 이해하는 과정에서 조금 꼬였어요. 조금 더 간단하게 다시 물어봐 주세요!";
    }
    if (message.includes("429") || message.includes("quota")) {
      return "⏳ 앗, 지금은 조금 붐비고 있어요! 몇 초만 기다렸다가 다시 질문해 주세요 💫";
    }
    if (
      message.includes("503") ||
      message.includes("502") ||
      message.includes("504") ||
      message.includes("timeout")
    ) {
      return "🌼 CKy가 잠시 바빠서 바로 답변하지 못했어요. 몇 초 후 다시 물어봐 주세요. 여기서 기다리고 있을게요 💙";
    }
    return "✨ 앗! 잠시 작은 문제가 생겼어요. 다시 한 번 물어봐 주세요. 곧 도와드릴게요 💛";
  }

  if (message.includes("401") || message.includes("403")) {
    return "🌷 Ôi, CKy vừa gặp một trục trặc nhỏ mất rồi ạ. Anh/Chị thử lại sau một chút giúp em nhé 💛";
  }
  if (message.includes("400")) {
    return "🐣 Hic... hình như em vừa hiểu sai cách gửi câu hỏi mất rồi ạ. Anh/Chị thử hỏi lại ngắn gọn hơn giúp em nhé!";
  }
  if (message.includes("429") || message.includes("quota")) {
    return "⏳ Ui, lúc này hơi đông một chút rồi ạ! Anh/Chị chờ em vài giây rồi hỏi lại nhé 💫";
  }
  if (
    message.includes("503") ||
    message.includes("502") ||
    message.includes("504") ||
    message.includes("timeout")
  ) {
    return "🌼 CKy đang hơi bận một chút nên chưa kịp trả lời ạ. Anh/Chị thử lại sau vài giây nhé, em vẫn ở đây 💙";
  }

  return "✨ Ôi, em vừa gặp một chút trục trặc nhỏ thôi ạ. Anh/Chị thử lại giúp em nhé — CKy vẫn sẵn sàng hỗ trợ mình 💛";
}

// ==========================================
// 5. COMPONENT CHÍNH (CHATBOX UI)
// ==========================================

export function Chatbox({ lang = "vi" }: ChatboxProps) {
  // --- STATE QUẢN LÝ ---
  /** Ngôn ngữ hiện tại của Chatbox (cho phép chuyển đổi động) */
  const [currentLang, setCurrentLang] = useState<ResponseLanguage>(lang);
  /** Trạng thái Ẩn/Hiện cửa sổ Chatbox */
  const [isOpen, setIsOpen] = useState(false);
  /** Trạng thái Ẩn/Hiện bóng gợi ý nổi */
  const [showCloud, setShowCloud] = useState(true);
  /** Văn bản đang nhập ở ô input */
  const [input, setInput] = useState("");
  /** Trạng thái AI đang xử lý / gửi yêu cầu */
  const [isLoading, setIsLoading] = useState(false);
  /** Thời gian hiện tại cho đồng hồ thực */
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  /** Danh sách tin nhắn cuộc trò chuyện */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: CHATBOX_I18N[lang]?.welcome || CHATBOX_I18N.vi.welcome,
      timestamp: "",
    },
  ]);

  // --- REFS ---
  /** Ref hỗ trợ cuộn xuống cuối danh sách tin nhắn */
  const chatEndRef = useRef<HTMLDivElement>(null);
  /** Ref lưu AbortController để hủy request API khi cẩn thiết */
  const abortControllerRef = useRef<AbortController | null>(null);

  /** Lấy bộ từ từ điển tương ứng với ngôn ngữ đang chọn */
  const t = CHATBOX_I18N[currentLang] || CHATBOX_I18N.vi;

  // --- EFFECTS ---

  /** EFFECT 1: Cập nhật currentLang khi prop `lang` thay đổi */
  useEffect(() => {
    setCurrentLang(lang);
  }, [lang]);

  /** EFFECT 2: Cập nhật tin nhắn chào mặc định khi người dùng chuyển ngôn ngữ */
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "welcome"
          ? { ...msg, text: t.welcome }
          : msg
      )
    );
  }, [currentLang, t.welcome]);

  /** EFFECT 3: Khởi chạy đồng hồ đếm thời gian thực và cập nhật timestamp tin nhắn chào */
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

  /** EFFECT 4: Tự động cuộn xuống cuối danh sách khi có tin nhắn mới hoặc thay đổi trạng thái */
  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({
        // Không smooth khi typewriter cập nhật liên tục; tránh jank và trễ UI.
        behavior: "auto",
        block: "end",
      });
    });
  }, [messages, isLoading, isOpen]);

  // --- HANDLERS & CALLBACKS ---

  /**
   * Cập nhật nội dung tin nhắn dựa theo ID (dùng cho hiệu ứng gõ chữ Typewriter)
   */
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

  /**
   * CỐT LÕI: Hàm gửi tin nhắn, chuẩn bị Prompt, gọi API và chạy hiệu ứng chữ chạy
   * @param textToSend Nội dung tin nhắn (nếu truyền vào từ nút gợi ý)
   */
  const handleSend = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend ?? input).trim();

      if (!query || isLoading) return;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

      // Trường hợp chưa cấu hình API KEY
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
      // Nhận diện ngôn ngữ từ văn bản người dùng
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

      // Chỉ gửi vài lượt gần nhất và cắt mỗi lượt để giảm input token + nhiễu.
      const recentMessages = messages
        .filter(
          (message) =>
            message.id !== "welcome" &&
            message.text.trim() !== "" &&
            !isTechnicalAssistantMessage(message.text)
        )
        .slice(-MAX_HISTORY_MESSAGES);

      const historyContents = recentMessages.map((message) => ({
        role: message.sender === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: message.text.slice(0, MAX_HISTORY_CHARS) }],
      }));

      const languageLabel =
        responseLanguage === "en"
          ? "ENGLISH"
          : responseLanguage === "ko"
            ? "KOREAN"
            : "VIETNAMESE";

      const latestUserPrompt = `[RESPONSE LANGUAGE: ${languageLabel}]\nAnswer ONLY in ${languageLabel}. Never switch language.\nUse only facts from the portfolio. If a fact is not available, say so.\n\nUSER QUESTION:\n${query}`;

      // Chọn model theo độ phức tạp của câu hỏi: FAQ ngắn → Flash-Lite;
      // câu hỏi nhiều ý/giải thích kỹ → Flash để tăng độ chính xác.
      const lowerQuery = query.toLowerCase();
      const useAccurateModel =
        query.length > 120 ||
        (query.match(/[?？！]/g)?.length ?? 0) >= 2 ||
        /\b(why|how|explain|compare|difference|detail|detailed|architecture|technical|technology|vì sao|tại sao|như thế nào|giải thích|so sánh|chi tiết|kiến trúc|kỹ thuật|công nghệ|왜|어떻게|설명|비교|자세히|기술)\b/i.test(lowerQuery);

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
        // Gọi API Gemini
        const answerText = await fetchGeminiText(
          apiKey,
          apiContents,
          responseLanguage,
          controller.signal,
          useAccurateModel
        );

        // Câu ngắn vẫn có typewriter; câu dài hiển thị ngay để hiệu ứng
        // không cộng thêm hàng chục giây vào thời gian người dùng phải chờ.
        // Giữ hiệu ứng chữ chạy cho mọi câu trả lời nhưng chạy nhanh.
        let typedText = "";
        for (
          let index = 0;
          index < answerText.length;
          index += TYPEWRITER_CHARS_PER_TICK
        ) {
          if (controller.signal.aborted) return;

          typedText += answerText.slice(
            index,
            index + TYPEWRITER_CHARS_PER_TICK
          );
          updateMessage(aiMsgId, typedText);
          await sleep(TYPEWRITER_TICK_MS);
        }
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        console.error("[CKy Gemini] Request failed", error);
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