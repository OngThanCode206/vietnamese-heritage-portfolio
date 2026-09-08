export type Lang = "vi" | "en" | "ko";

export const languages: { code: Lang; label: string; name: string }[] = [
  { code: "vi", label: "VI", name: "Tiếng Việt" },
  { code: "en", label: "EN", name: "English" },
  { code: "ko", label: "KO", name: "한국어" },
];

export const profile = {
  name: "Võ Lê Cao Kỳ",
  gpa: "3.42 / 4.0",
  /** Đổi thành "/avatar.jpg" để dùng ảnh của bạn trong thư mục public */
  avatar: "",
  cvUrl:
    "https://www.topcv.vn/xem-cv/A1ZSB1pQVAECV1cCDQNZVAELVFZWVgFfUA8NBQdf59",
  music: "/music.mp3",
};

export const socials = [
  { label: "Facebook", href: "https://www.facebook.com/share/1CpaDx3T1V/?mibextid=wwXIfr" },
  { label: "Instagram", href: "https://www.instagram.com/kyc.catafrican/" },
  { label: "Gmail", href: "mailto:nky57412@gmail.com" },
  { label: "X", href: "https://x.com/C14k11" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/cao-k%E1%BB%B3-v%C3%B5-l%C3%AA-b27515411/" },
  { label: "GitHub", href: "https://github.com/OngThanCode206" },
];

type Experience = { role: string; org: string; details: string[] };
type Project = { title: string; role: string; description: string; tags: string[] };
type SkillGroup = { group: string; items: string[] };
type Achievement = { year: string; title: string };

type Content = {
  nav: { about: string; experience: string; projects: string; skills: string; achievements: string; contact: string };
  ui: {
    eyebrow: string;
    role: string;
    tagline: string;
    intro: string;
    cv: string;
    contactBtn: string;
    musicOn: string;
    musicOff: string;
    light: string;
    dark: string;
    language: string;
    avatarCaption: string;
    hoangSa: string;
    truongSa: string;
    footer: string;
  };
  sections: {
    experience: { eyebrow: string; title: string };
    projects: { eyebrow: string; title: string };
    skills: { eyebrow: string; title: string };
    achievements: { eyebrow: string; title: string };
    contact: { eyebrow: string; title: string };
  };
  experiences: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  achievements: Achievement[];
};

export const content: Record<Lang, Content> = {
  vi: {
    nav: {
      about: "Giới thiệu",
      experience: "Kinh nghiệm",
      projects: "Dự án",
      skills: "Kỹ năng",
      achievements: "Thành tích",
      contact: "Liên hệ",
    },
    ui: {
      eyebrow: "Portfolio · Sinh viên CNTT",
      role: "Sinh viên Công nghệ Thông tin — HUTECH",
      tagline: "AI • IoT / Hệ thống nhúng • Java Web Developer",
      intro:
        "Mình theo đuổi con đường kết hợp giữa phần cứng và phần mềm: từ cảm biến ESP32 ngoài đời thực đến hệ thống web Java Spring Boot và các mô hình AI. Định hướng phát triển: AI, IoT/Hệ thống nhúng và Java Web Developer.",
      cv: "Xem CV",
      contactBtn: "Liên hệ",
      musicOn: "Đang phát",
      musicOff: "Nhạc nền",
      light: "Chế độ sáng",
      dark: "Chế độ tối",
      language: "Ngôn ngữ",
      avatarCaption: "HUTECH · Sinh viên CNTT",
      hoangSa: "Hoàng Sa",
      truongSa: "Trường Sa",
      footer: "Võ Lê Cao Kỳ · Sinh viên CNTT HUTECH",
    },
    sections: {
      experience: { eyebrow: "Work Experiences", title: "Kinh nghiệm làm việc" },
      projects: { eyebrow: "Projects", title: "Dự án tiêu biểu" },
      skills: { eyebrow: "Skills", title: "Kỹ năng chuyên môn" },
      achievements: { eyebrow: "Achievements", title: "Thành tích & Chứng chỉ" },
      contact: { eyebrow: "Contact", title: "Kết nối với mình" },
    },
    experiences: [
      {
        role: "Cựu thành viên Ban Kỹ thuật",
        org: "Công ty TNHH META SQUARE",
        details: [
          "Bảo trì Drone và thiết bị Robotics.",
          "Giảng dạy STEM tại VAS & Royal School.",
          "Trưởng nhóm dự án Web Quản lý sinh viên và Web bán khóa học.",
        ],
      },
      {
        role: "Thành viên Ban Kỹ thuật",
        org: "Viện Trí tuệ Nhân tạo — ĐH Hùng Vương",
        details: ["Tham gia nghiên cứu và triển khai các dự án ứng dụng Trí tuệ Nhân tạo."],
      },
    ],
    projects: [
      {
        title: "IECMS — Hệ thống giám sát tiêu thụ năng lượng thông minh",
        role: "Trưởng nhóm",
        description:
          "Hệ thống giám sát tiêu thụ năng lượng ứng dụng IoT (ESP32) kết hợp AI phân tích, cảnh báo. Đã công bố bài báo khoa học năm 2025.",
        tags: ["IoT", "ESP32", "AI", "Nghiên cứu khoa học"],
      },
      {
        title: "Web Quản lý Nhân viên",
        role: "Full-stack",
        description:
          "Ứng dụng Java Spring Boot MVC với Spring Security phân quyền RBAC, JPA/Hibernate và cơ sở dữ liệu MySQL.",
        tags: ["Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"],
      },
      {
        title: "Mô hình Dự đoán Thị trường Chứng khoán",
        role: "AI Developer",
        description:
          "Thuật toán AI dự đoán xu hướng thị trường dựa trên dữ liệu lịch sử giá và khối lượng giao dịch.",
        tags: ["Python", "Machine Learning", "Data"],
      },
      {
        title: "Xe dò line tự động & Camera AI nhận diện",
        role: "Embedded",
        description:
          "Xe tự hành dò line kết hợp camera nhận diện đối tượng bằng thị giác máy tính trên nền tảng nhúng.",
        tags: ["Arduino", "Raspberry Pi", "Computer Vision"],
      },
    ],
    skills: [
      { group: "Ngôn ngữ", items: ["Java", "C/C++", "Python", "SQL"] },
      { group: "Framework & Tech", items: ["Spring Boot", "Spring Security", "Thymeleaf", "JPA/Hibernate"] },
      { group: "Tools & Hardware", items: ["MySQL", "Git", "ESP32", "Arduino", "Raspberry Pi"] },
    ],
    achievements: [
      { year: "2026", title: "Học bổng DB Global Dream Leader" },
      { year: "2025", title: "Bài báo khoa học công bố (Dự án IECMS)" },
      { year: "2025", title: 'Giải Ba — Rung Chuông Vàng "Tìm hiểu ASEAN"' },
      { year: "2025", title: "Giải Khuyến khích — AIoT Innoworks" },
      { year: "—", title: "Chứng chỉ WISE-IoT WISE-PASS Core Level 1 & Level 2" },
    ],
  },

  en: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
      achievements: "Achievements",
      contact: "Contact",
    },
    ui: {
      eyebrow: "Portfolio · IT Student",
      role: "Information Technology Student — HUTECH",
      tagline: "AI • IoT / Embedded Systems • Java Web Developer",
      intro:
        "I build across hardware and software: from real-world ESP32 sensors to Java Spring Boot web systems and AI models. Career focus: AI, IoT/Embedded Systems and Java Web Development.",
      cv: "View CV",
      contactBtn: "Contact",
      musicOn: "Playing",
      musicOff: "Music",
      light: "Light mode",
      dark: "Dark mode",
      language: "Language",
      avatarCaption: "HUTECH · IT Student",
      hoangSa: "Hoang Sa",
      truongSa: "Truong Sa",
      footer: "Vo Le Cao Ky · IT Student at HUTECH",
    },
    sections: {
      experience: { eyebrow: "Work Experiences", title: "Work experience" },
      projects: { eyebrow: "Projects", title: "Featured projects" },
      skills: { eyebrow: "Skills", title: "Technical skills" },
      achievements: { eyebrow: "Achievements", title: "Awards & certificates" },
      contact: { eyebrow: "Contact", title: "Let's connect" },
    },
    experiences: [
      {
        role: "Former Technical Team Member",
        org: "META SQUARE Co., Ltd.",
        details: [
          "Maintained drones and robotics equipment.",
          "Taught STEM classes at VAS & Royal School.",
          "Team lead for a student management web app and an online course platform.",
        ],
      },
      {
        role: "Technical Team Member",
        org: "Artificial Intelligence Institute — Hung Vuong University",
        details: ["Researched and deployed applied artificial intelligence projects."],
      },
    ],
    projects: [
      {
        title: "IECMS — Intelligent Energy Consumption Monitoring System",
        role: "Team Leader",
        description:
          "IoT energy monitoring system (ESP32) with AI-based analysis and alerting. Scientific paper published in 2025.",
        tags: ["IoT", "ESP32", "AI", "Research"],
      },
      {
        title: "Employee Management Web App",
        role: "Full-stack",
        description:
          "Java Spring Boot MVC application with Spring Security RBAC, JPA/Hibernate and a MySQL database.",
        tags: ["Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"],
      },
      {
        title: "Stock Market Prediction Model",
        role: "AI Developer",
        description:
          "AI algorithm predicting market trends from historical price and trading volume data.",
        tags: ["Python", "Machine Learning", "Data"],
      },
      {
        title: "Line-following Car & AI Vision Camera",
        role: "Embedded",
        description:
          "Autonomous line-following vehicle with computer-vision object recognition on an embedded platform.",
        tags: ["Arduino", "Raspberry Pi", "Computer Vision"],
      },
    ],
    skills: [
      { group: "Languages", items: ["Java", "C/C++", "Python", "SQL"] },
      { group: "Frameworks & Tech", items: ["Spring Boot", "Spring Security", "Thymeleaf", "JPA/Hibernate"] },
      { group: "Tools & Hardware", items: ["MySQL", "Git", "ESP32", "Arduino", "Raspberry Pi"] },
    ],
    achievements: [
      { year: "2026", title: "DB Global Dream Leader Scholarship" },
      { year: "2025", title: "Published scientific paper (IECMS project)" },
      { year: "2025", title: 'Third Prize — "Understanding ASEAN" Golden Bell contest' },
      { year: "2025", title: "Consolation Prize — AIoT Innoworks" },
      { year: "—", title: "WISE-IoT WISE-PASS Core Level 1 & Level 2 certificates" },
    ],
  },

  ko: {
    nav: {
      about: "소개",
      experience: "경력",
      projects: "프로젝트",
      skills: "역량",
      achievements: "수상",
      contact: "연락처",
    },
    ui: {
      eyebrow: "포트폴리오 · IT 전공 학생",
      role: "정보기술 전공 학생 — HUTECH",
      tagline: "AI • IoT / 임베디드 시스템 • Java 웹 개발자",
      intro:
        "하드웨어와 소프트웨어를 함께 다룹니다. 실제 ESP32 센서부터 Java Spring Boot 웹 시스템과 AI 모델까지 구현합니다. 목표 분야: AI, IoT/임베디드 시스템, Java 웹 개발.",
      cv: "이력서 보기",
      contactBtn: "연락하기",
      musicOn: "재생 중",
      musicOff: "배경 음악",
      light: "라이트 모드",
      dark: "다크 모드",
      language: "언어",
      avatarCaption: "HUTECH · IT 학생",
      hoangSa: "호앙사",
      truongSa: "쯔엉사",
      footer: "Võ Lê Cao Kỳ · HUTECH IT 전공 학생",
    },
    sections: {
      experience: { eyebrow: "Work Experiences", title: "업무 경력" },
      projects: { eyebrow: "Projects", title: "주요 프로젝트" },
      skills: { eyebrow: "Skills", title: "전문 역량" },
      achievements: { eyebrow: "Achievements", title: "수상 및 자격증" },
      contact: { eyebrow: "Contact", title: "연락처" },
    },
    experiences: [
      {
        role: "전 기술팀 팀원",
        org: "META SQUARE 유한회사",
        details: [
          "드론 및 로보틱스 장비 유지보수.",
          "VAS 및 Royal School에서 STEM 강의.",
          "학생 관리 웹과 온라인 강의 판매 웹 프로젝트 팀장.",
        ],
      },
      {
        role: "기술팀 팀원",
        org: "인공지능 연구소 — 훙브엉 대학교",
        details: ["인공지능 응용 프로젝트 연구 및 구축 참여."],
      },
    ],
    projects: [
      {
        title: "IECMS — 지능형 에너지 소비 모니터링 시스템",
        role: "팀장",
        description:
          "ESP32 기반 IoT 에너지 모니터링에 AI 분석과 경보를 결합한 시스템. 2025년 학술 논문 발표.",
        tags: ["IoT", "ESP32", "AI", "연구"],
      },
      {
        title: "직원 관리 웹 애플리케이션",
        role: "풀스택",
        description:
          "Spring Security RBAC, JPA/Hibernate, MySQL을 사용한 Java Spring Boot MVC 애플리케이션.",
        tags: ["Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"],
      },
      {
        title: "주식 시장 예측 모델",
        role: "AI 개발자",
        description: "과거 가격과 거래량 데이터를 기반으로 시장 추세를 예측하는 AI 알고리즘.",
        tags: ["Python", "Machine Learning", "Data"],
      },
      {
        title: "라인 트레이싱 자동차 & AI 인식 카메라",
        role: "임베디드",
        description: "임베디드 플랫폼에서 컴퓨터 비전 객체 인식을 결합한 자율 라인 트레이싱 차량.",
        tags: ["Arduino", "Raspberry Pi", "Computer Vision"],
      },
    ],
    skills: [
      { group: "언어", items: ["Java", "C/C++", "Python", "SQL"] },
      { group: "프레임워크 & 기술", items: ["Spring Boot", "Spring Security", "Thymeleaf", "JPA/Hibernate"] },
      { group: "도구 & 하드웨어", items: ["MySQL", "Git", "ESP32", "Arduino", "Raspberry Pi"] },
    ],
    achievements: [
      { year: "2026", title: "DB Global Dream Leader 장학금" },
      { year: "2025", title: "학술 논문 발표 (IECMS 프로젝트)" },
      { year: "2025", title: '"아세안 알기" 골든벨 3등상' },
      { year: "2025", title: "AIoT Innoworks 장려상" },
      { year: "—", title: "WISE-IoT WISE-PASS Core Level 1 & 2 자격증" },
    ],
  },
};
