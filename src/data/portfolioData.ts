export type Lang = "vi" | "en" | "kr";

export const languages: { code: Lang; label: string; name: string }[] = [
  { code: "vi", label: "VI", name: "Tiếng Việt" },
  { code: "en", label: "EN", name: "English" },
  { code: "kr", label: "KR", name: "한국어" },
];

export const profile = {
  name: "Võ Lê Cao Kỳ",
  gpa: "3.42 / 4.0",
  avatar: "/avatar.jpg",
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
type Project = { title: string; role: string; period?: string; description: string; tags: string[] };
type SkillGroup = { group: string; items: string[] };
type Achievement = { year: string; title: string };
type Activity = { period: string; title: string; role: string; details: string[] };

export type Content = {
  nav: { about: string; experience: string; projects: string; skills: string; achievements: string; activities: string; contact: string };
  ui: {
    eyebrow: string;
    role: string;
    tagline: string;
    intro: string;
    cv: string;
    contactBtn: string;
    musicOn: string;
    musicOff: string;
    musicStop: string;
    light: string;
    dark: string;
    language: string;
    avatarCaption: string;
    interestsTitle: string;
    hoangSa: string;
    truongSa: string;
    footer: string;
  };
  sections: {
    experience: { eyebrow: string; title: string };
    projects: { eyebrow: string; title: string; featuredTitle: string; otherTitle: string };
    skills: { eyebrow: string; title: string };
    achievements: { eyebrow: string; title: string };
    activities: { eyebrow: string; title: string };
    contact: { eyebrow: string; title: string };
  };
  interests: string[];
  experiences: Experience[];
  featuredProjects: Project[];
  otherProjects: Project[];
  projects: Project[];
  skills: SkillGroup[];
  achievements: Achievement[];
  activities: Activity[];
};

export const content: Record<Lang, Content> = {
  vi: {
    nav: {
      about: "Giới thiệu",
      experience: "Kinh nghiệm",
      projects: "Dự án",
      skills: "Kỹ năng",
      achievements: "Thành tích",
      activities: "Hoạt động",
      contact: "Liên hệ",
    },
    ui: {
      eyebrow: "Portfolio · Sinh viên CNTT",
      role: "Sinh viên Công nghệ Thông tin — HUTECH",
      tagline: "AI • IoT / Hệ thống nhúng • Web Developer",
      intro:
        " Là một sinh viên Công nghệ Thông tin đầy nhiệt huyết, mình tập trung nghiên cứu sự kết hợp giữa Phần cứng, Phần mềm và Trí tuệ Nhân tạo (AI). Luôn chủ động trong R&D và tích cực thử thách bản thân qua các cuộc thi công nghệ, mình hướng tới việc tạo ra những hệ thống tự động hóa thông minh mang lại giá trị thiết thực cho cộng đồng cũng như sự phát triển lâu dài của bản thân.",
      cv: "Xem CV",
      contactBtn: "Liên hệ",
      musicOn: "Đang phát",
      musicOff: "Nhạc nền",
      musicStop: "Dừng",
      light: "Chế độ sáng",
      dark: "Chế độ tối",
      language: "Ngôn ngữ",
      avatarCaption: " Sinh viên CNTT · HUTECH ",
      interestsTitle: "Sở thích cá nhân",
      hoangSa: "Hoàng Sa",
      truongSa: "Trường Sa",
      footer: "· Sinh viên CNTT HUTECH",
    },
    sections: {
      experience: { eyebrow: "Work Experiences", title: "Kinh nghiệm làm việc" },
      projects: {
        eyebrow: "Projects",
        title: "Dự án & Sản phẩm",
        featuredTitle: "Dự án Tiêu biểu",
        otherTitle: "Dự án Đã thực hiện",
      },
      skills: { eyebrow: "Skills", title: "Kỹ năng chuyên môn" },
      achievements: { eyebrow: "Achievements", title: "Thành tích & Giải thưởng" },
      activities: { eyebrow: "Activities & Contests", title: "Hoạt động & Phong trào" },
      contact: { eyebrow: "Contact", title: "Kết nối với mình" },
    },
    interests: ["⚽ Bóng đá", "✈️ Đi du lịch", "🍲 Ăn uống"],
    experiences: [
      {
        role: "Liên chi Hội Trưởng",
        org: "Trường Đại học Công nghệ TP.HCM - HUTECH (2026 - Hiện tại)",
        details: [
          "Thành viên BTC Lễ hội Văn hóa Việt - Hàn năm 2025 do Viện Công nghệ Việt Hàn phối hợp cùng Học viện King Sejong Hồ Chí Minh 3 tổ chức.",
          "Thành viên BTC chiến dịch Xuân tình nguyện 2026 do Viện Công nghệ Việt Hàn tổ chức tại Đắc Nông.",
          "Thành viên BTC chuỗi hoạt động Hành trình khám phá di sản do Viện Công nghệ Việt Hàn tổ chức.",
        ],
      },
      {
        role: "Thành viên Ban Kỹ thuật",
        org: "Viện Trí tuệ Nhân tạo — ĐH Hùng Vương (2026 - Hiện tại)",
        details: [
          "Hỗ trợ nghiên cứu, phát triển các dự án học thuật và bảo trì sửa chữa các thiết bị công nghệ.",
          "Tổ chức các cuộc thi học thuật công nghệ tại các trường đại học và THPT.",
          "Rèn luyện tư duy logic, sáng tạo, kỹ năng thiết kế hệ thống, lập trình và vận hành công nghệ.",
        ],
      },
      {
        role: "Cựu thành viên Ban Kỹ thuật",
        org: "Công ty TNHH META SQUARE (2024 - 2026)",
        details: [
          "Bảo trì, sửa chữa và phục hồi các thiết bị công nghệ như Drone và Robotics.",
          "Hỗ trợ giảng dạy và hướng dẫn thực hành công nghệ STEM cho học sinh tại các trường quốc tế như VAS và Royal School.",
          "Đảm nhiệm vai trò trưởng nhóm trong dự án phát triển phần mềm: Web Quản lý sinh viên và Web bán khóa học.",
        ],
      },
    ],
    featuredProjects: [
      {
        title: "IECMS — Hệ thống Giám sát Tiêu thụ Năng lượng Thông minh",
        role: "Trưởng nhóm phát triển",
        period: "08/2025 – 03/2026",
        description:
          "Hệ thống giám sát tiêu thụ năng lượng ứng dụng IoT (ESP32) kết hợp AI phân tích, cảnh báo tự động. Đã công bố bài báo khoa học năm 2025.",
        tags: ["IoT", "ESP32", "AI", "Nghiên cứu khoa học"],
      },
      {
        title: "Website Quản lý Nhân viên",
        role: "Full-stack Developer",
        period: "04/2026 – 07/2026",
        description:
          "Hệ thống quản lý nhân sự Web bằng Java Spring Boot MVC & MySQL, tích hợp Spring Security phân quyền RBAC (3 vai trò Admin, Manager, Employee), JPA/Hibernate, Thymeleaf và Bootstrap.",
        tags: ["Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"],
      },
      {
        title: "Mô hình Thuật toán Dự đoán Thị trường Chứng khoán",
        role: "Trưởng nhóm phát triển AI",
        period: "05/2026 – Hiện tại",
        description:
          "Nghiên cứu và phát triển mô hình Machine Learning dự đoán xu hướng thị trường chứng khoán dựa trên dữ liệu lịch sử giá và khối lượng giao dịch.",
        tags: ["Python", "Machine Learning", "Data Analysis"],
      },
      {
        title: "Camera AI & Xe Dò Line Tự Động",
        role: "Trưởng nhóm / Embedded & AI",
        period: "06/2025 – 2026",
        description:
          "Phát triển hệ thống Camera AI nhận diện và giám sát hình ảnh kết hợp xe tự hành dò line thông qua thuật toán điều khiển và cảm biến nhúng.",
        tags: ["Computer Vision", "Arduino", "Raspberry Pi", "IoT/Embedded"],
      },
    ],
    otherProjects: [
      {
        title: "Robot Hỗ trợ Dịch vụ Hành chính Công",
        role: "Trưởng nhóm phát triển",
        period: "05/2024",
        description:
          "Quản lý thiết kế và lập trình robot hỗ trợ điều hướng, hướng dẫn và tương tác tự động trong môi trường dịch vụ hành chính công.",
        tags: ["Robotics", "Embedded", "Control Systems"],
      },
      {
        title: "Nghiên cứu Sóng Não & Ứng dụng Công nghệ",
        role: "Trưởng nhóm nghiên cứu",
        period: "08/2025 – 09/2025",
        description:
          "Nghiên cứu nguyên lý hoạt động của sóng não (EEG) và khả năng ứng dụng trong AI, điều khiển thiết bị và tương tác người - máy (HCI).",
        tags: ["AI Research", "Bio-Signal Processing", "HCI"],
      },
      {
        title: "Nghiên cứu & Phát triển Drone & Robotics",
        role: "Thành viên Ban Kỹ thuật",
        period: "01/2025 – 05/2025",
        description:
          "Bảo trì, sửa chữa, vận hành Drone và hệ thống Robotics; nghiên cứu giải pháp tự động hóa phục vụ học tập và thi đấu công nghệ tại HUTECH.",
        tags: ["Drone", "Robotics", "Automation"],
      },
      {
        title: "Hệ thống Quản lý Sinh viên",
        role: "Trưởng nhóm phát triển",
        period: "02/2024 – 04/2024",
        description:
          "Thiết kế và phát triển hệ thống quản lý sinh viên hỗ trợ quản lý thông tin, điểm số, quá trình học tập và tối ưu hóa cơ sở dữ liệu.",
        tags: ["Web Development", "Database", "Management System"],
      },
      {
        title: "Website Bán Khóa Học Trực Tuyến",
        role: "Trưởng nhóm phát triển",
        period: "02/2024 – 04/2024",
        description:
          "Xây dựng nền tảng E-learning hỗ trợ đăng ký, quản lý khóa học, tài khoản người dùng và tích hợp thanh toán cơ bản.",
        tags: ["Web Development", "UI/UX", "E-learning"],
      },
    ],
    get projects() {
      return [...this.featuredProjects, ...this.otherProjects];
    },
    skills: [
      {
        group: "Ngôn ngữ Lập trình",
        items: ["C", "C++", "C#", "Java", "Python", "SQL", "JavaScript", "HTML / CSS"],
      },
      {
        group: "Web Development & Kiến trúc",
        items: ["Spring Boot", "Spring MVC", "Spring Security", "Thymeleaf", "Bootstrap", "REST API", "MVC", "RBAC", "CRUD"],
      },
      {
        group: "Database & Chuyên môn",
        items: ["MySQL", "JPA / Hibernate", "AI / Machine Learning", "IoT & Embedded", "Robotics"],
      },
      {
        group: "Công cụ & Phần mềm",
        items: ["Git / GitHub", "IntelliJ IDEA", "VS Code", "Maven", "Apache NetBeans IDE", "Arduino", "ESP32"],
      },
      {
        group: "Kỹ năng Tin học & Quản lý",
        items: [
          "Thành thạo MS Word, Excel, PowerPoint",
          "MS Project (Quản lý & theo dõi tiến độ dự án)",
          "Soạn thảo tài liệu, làm báo cáo & slide thuyết trình chuyên nghiệp",
        ],
      },
    ],
    achievements: [
      { year: "2026", title: "Học bổng DB Global Dream Leader" },
      { year: "2025", title: "Bài báo khoa học công bố (Dự án IECMS)" },
      { year: "2025", title: "Giải Nhất Bóng đá Viện Công nghệ Việt – Hàn" },
      { year: "2025", title: 'Giải Ba — Rung Chuông Vàng "Tìm hiểu ASEAN"' },
      { year: "2025", title: "Giải Khuyến khích & Bán kết — AIoT Innoworks 2025" },
      { year: "2025", title: 'Tuyên dương "Sinh viên tiêu biểu trong học tập và rèn luyện năm học 2024 – 2025"' },
      { year: "2025", title: "Chứng chỉ WISE-IoT WISE-PaaS Core Level 1 & Level 2" },
    ],
    activities: [
      {
        period: "2024 – 2026",
        title: "Viện Công nghệ Việt – Hàn, Đại học HUTECH",
        role: "Sinh viên tham gia hoạt động học thuật và phong trào sinh viên",
        details: [
          "Đạt Giải Ba cuộc thi “Rung Chuông Vàng – Tìm hiểu ASEAN” năm 2025.",
          "Đạt Giải Nhất Bóng đá Viện Công nghệ Việt – Hàn năm 2025.",
          "Được tuyên dương danh hiệu “Sinh viên tiêu biểu trong học tập và rèn luyện năm học 2024 – 2025”.",
          "Tham gia Talkshow “Sinh viên 5 tốt – Thời cơ và Thách thức”.",
          "Tham gia hoạt động tư tưởng trong khuôn khổ Ngày hội “Sinh viên 5 tốt” năm 2025.",
          "Tham gia hoạt động hội nhập “Trình diễn trang phục truyền thống các quốc gia”.",
          "Tham dự Lễ khai mạc, Tuyên dương Thanh niên tiên tiến làm theo lời Bác 2025, Lễ kết nạp Đảng và Triển lãm Ngày hội Sinh viên 5 tốt.",
          "Thành viên BTC của Lễ hội Văn hóa Việt - Hàn năm 2025 do Viện Công nghệ Việt Hàn phối hợp cùng Học viện King Sejong Hồ Chí Minh 3 tổ chức.",
          "Thành viên BTC chiến dịch Xuân tình nguyện 2026 do Viện Công nghệ Việt Hàn tổ chức tại Đắc Nông.",
          "Thành viên BTC của chuỗi hoạt động Hành trình khám phá di sản do Viện Công nghệ Việt Hàn tổ chức.",
        ],
      },
      {
        period: "08/2025 – 11/2025",
        title: "AIoT Innoworks 2025",
        role: "Thí sinh tham gia vòng Bán kết",
        details: [
          "Tham gia nghiên cứu và phát triển ý tưởng sáng tạo phục vụ cuộc thi công nghệ InnoWorks 2025.",
        ],
      },
      {
        period: "06/2025",
        title: "Cuộc thi Ý tưởng Sáng tạo trẻ TP. Hồ Chí Minh lần thứ 17 – 2025 Chủ đề 'Ý thức thúc đẩy phong trào Bình Dân học vụ số'",
        role: "Trưởng nhóm tham gia cuộc thi",
        details: [
          "Tham gia đề xuất và phát triển ý tưởng sáng tạo ứng dụng công nghệ vào thực tiễn.",
        ],
      },
      {
        period: "06/2025",
        title: "Đoàn Trường Đại học Công nghệ TP. Hồ Chí Minh",
        role: "Thí sinh tham gia cuộc thi Chính Luận",
        details: [
          "Có bài viết tham gia Cuộc thi Chính luận về bảo vệ nền tảng tư tưởng của Đảng trong đoàn viên, thanh thiếu niên lần thứ Nhất năm 2025.",
        ],
      },
    ],
  },

  en: {
    nav: {
      about: "About",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
      achievements: "Achievements",
      activities: "Activities",
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
      musicStop: "Stop",
      light: "Light mode",
      dark: "Dark mode",
      language: "Language",
      avatarCaption: "HUTECH · IT Student",
      interestsTitle: "Personal Hobbies",
      hoangSa: "Hoang Sa",
      truongSa: "Truong Sa",
      footer: "Vo Le Cao Ky · IT Student at HUTECH",
    },
    sections: {
      experience: { eyebrow: "Work Experiences", title: "Work experience" },
      projects: {
        eyebrow: "Projects",
        title: "Projects & Products",
        featuredTitle: "Featured Projects",
        otherTitle: "Completed Projects",
      },
      skills: { eyebrow: "Skills", title: "Technical skills" },
      achievements: { eyebrow: "Achievements", title: "Awards & Honors" },
      activities: { eyebrow: "Activities & Contests", title: "Activities & Competitions" },
      contact: { eyebrow: "Contact", title: "Let's connect" },
    },
    interests: ["⚽ Football", "✈️ Traveling", "🍲 Eating out"],
    experiences: [
      {
        role: "Head of Student Association Branch",
        org: "Ho Chi Minh City University of Technology - HUTECH (2026 - Present)",
        details: [
          "Organizing Committee member for the 2025 Viet - Han Cultural Festival co-organized by VKIT and King Sejong Institute HCM 3.",
          "Organizing Committee member for the 2026 Spring Volunteer Campaign organized by VKIT in Dak Nong.",
          "Organizing Committee member for the Heritage Discovery Journey activity series organized by VKIT.",
        ],
      },
      {
        role: "Technical Team Member",
        org: "Artificial Intelligence Institute — Hung Vuong University (2026 - Present)",
        details: [
          "Supported academic project R&D and tech equipment maintenance & repair.",
          "Organized academic technology competitions for universities and high schools.",
          "Enhanced logical thinking, project management, system design, and technical operation skills.",
        ],
      },
      {
        role: "Former Technical Team Member",
        org: "META SQUARE Co., Ltd. (2024 - 2026)",
        details: [
          "Maintained, repaired, and restored technology equipment including Drones and Robotics.",
          "Assisted in teaching and guiding STEM tech practice for students at international schools (VAS, Royal School).",
          "Served as Team Lead for software development projects: Student Management Web App & Course Selling Web App.",
        ],
      },
    ],
    featuredProjects: [
      {
        title: "IECMS — Intelligent Energy Consumption Monitoring System",
        role: "Development Team Lead",
        period: "Aug 2025 – Mar 2026",
        description:
          "Smart IoT energy monitoring system (ESP32) combined with AI analysis and automatic alerting. Scientific paper published in 2025.",
        tags: ["IoT", "ESP32", "AI", "Scientific Research"],
      },
      {
        title: "Employee Management Web Application",
        role: "Full-stack Developer",
        period: "Apr 2026 – Jul 2026",
        description:
          "Web HR management system built with Java Spring Boot MVC & MySQL, Spring Security (3-role RBAC: Admin, Manager, Employee), JPA/Hibernate, Thymeleaf & Bootstrap.",
        tags: ["Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"],
      },
      {
        title: "Stock Market Prediction Algorithm Model",
        role: "AI Development Lead",
        period: "May 2026 – Present",
        description:
          "Researched and developed Machine Learning models to predict stock market trends based on historical price and volume data.",
        tags: ["Python", "Machine Learning", "Data Analysis"],
      },
      {
        title: "AI Camera & Autonomous Line-Following Vehicle",
        role: "Team Lead / Embedded & AI",
        period: "Jun 2025 – 2026",
        description:
          "Developed AI Camera system for object recognition and surveillance, combined with autonomous line-following vehicle using sensor control algorithms.",
        tags: ["Computer Vision", "Arduino", "Raspberry Pi", "Embedded"],
      },
    ],
    otherProjects: [
      {
        title: "Public Administrative Service Support Robot",
        role: "Development Team Lead",
        period: "May 2024",
        description:
          "Designed and programmed a service robot supporting navigation, guidance, and automated interaction in public administrative environments.",
        tags: ["Robotics", "Embedded", "Control Systems"],
      },
      {
        title: "Brainwave Research & Tech Application",
        role: "Research Team Lead",
        period: "Aug 2025 – Sep 2025",
        description:
          "Investigated EEG brainwave principles and their applications in AI, hardware control, and Human-Computer Interaction (HCI).",
        tags: ["AI Research", "Bio-Signal Processing", "HCI"],
      },
      {
        title: "Drone & Robotics R&D",
        role: "Technical Team Member",
        period: "Jan 2025 – May 2025",
        description:
          "Maintained, repaired, and operated Drones & Robotics systems; researched automation solutions for tech competitions at HUTECH.",
        tags: ["Drone", "Robotics", "Automation"],
      },
      {
        title: "Student Management System",
        role: "Development Team Lead",
        period: "Feb 2024 – Apr 2024",
        description:
          "Designed and built a student management web application for tracking student info, grades, academic records, and database optimization.",
        tags: ["Web Development", "Database", "Management System"],
      },
      {
        title: "Online Course Platform",
        role: "Development Team Lead",
        period: "Feb 2024 – Apr 2024",
        description:
          "Developed an E-learning web platform supporting course registration, content management, user accounts, and basic payments.",
        tags: ["Web Development", "UI/UX", "E-learning"],
      },
    ],
    get projects() {
      return [...this.featuredProjects, ...this.otherProjects];
    },
    skills: [
      {
        group: "Programming Languages",
        items: ["C", "C++", "C#", "Java", "Python", "SQL", "JavaScript", "HTML / CSS"],
      },
      {
        group: "Web Development & Architecture",
        items: ["Spring Boot", "Spring MVC", "Spring Security", "Thymeleaf", "Bootstrap", "REST API", "MVC", "RBAC", "CRUD"],
      },
      {
        group: "Database & Core Knowledge",
        items: ["MySQL", "JPA / Hibernate", "AI / Machine Learning", "IoT & Embedded", "Robotics"],
      },
      {
        group: "Software & Tools",
        items: ["Git / GitHub", "IntelliJ IDEA", "VS Code", "Maven", "Apache NetBeans IDE", "Arduino", "ESP32"],
      },
      {
        group: "Office & Project Management",
        items: [
          "Proficient in MS Word, Excel, PowerPoint",
          "MS Project (Project scheduling & management)",
          "Professional documentation, reporting & presentation slides",
        ],
      },
    ],
    achievements: [
      { year: "2026", title: "DB Global Dream Leader Scholarship" },
      { year: "2025", title: "Published scientific paper (IECMS project)" },
      { year: "2025", title: "1st Place — VKIT Football Tournament 2025" },
      { year: "2025", title: '3rd Place — "Understanding ASEAN" Golden Bell Contest' },
      { year: "2025", title: "Consolation Prize & Semi-finalist — AIoT Innoworks 2025" },
      { year: "2025", title: "Honored as 'Outstanding Student in Academic & Training Performance 2024–2025'" },
      { year: "2025", title: "WISE-IoT WISE-PaaS Core Level 1 & Level 2 certificates" },
    ],
    activities: [
      {
        period: "2024 – 2026",
        title: "Viet-Han Institute of Technology, HUTECH University",
        role: "Active participant in academic activities and student movement",
        details: [
          "Won 3rd Place in 'Understanding ASEAN' Golden Bell Contest 2025.",
          "Won 1st Place in Viet-Han Institute Football Championship 2025.",
          "Honored as 'Outstanding Student in Academic and Training Performance 2024 – 2025'.",
          "Participated in Talkshow 'Student of 5 Merits – Opportunities & Challenges'.",
          "Organizing Committee member: Viet-Han Cultural Festival 2025, Spring Volunteer Campaign 2026 (Dak Nong), Heritage Discovery Journey series.",
        ],
      },
      {
        period: "Aug 2025 – Nov 2025",
        title: "AIoT Innoworks 2025",
        role: "Semi-finalist Contestant",
        details: [
          "Researched and built innovative IoT & AI solutions for real-world application.",
        ],
      },
      {
        period: "Jun 2025",
        title: "17th HCMC Youth Creative Ideas Contest 2025",
        role: "Team Lead Participant",
        details: [
          "Developed creative tech project centered on Digital Literacy Awareness.",
        ],
      },
      {
        period: "Jun 2025",
        title: "Political Essay Contest on Protecting Ideological Foundation (HUTECH)",
        role: "Contestant Participant",
        details: [
          "Submitted political essay for the 1st HUTECH Youth Union Essay Competition 2025.",
        ],
      },
    ],
  },

  kr: {
    nav: {
      about: "소개",
      experience: "경력",
      projects: "프로젝트",
      skills: "역량",
      achievements: "수상",
      activities: "활동",
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
      musicStop: "정지",
      light: "라이트 모드",
      dark: "다크 모드",
      language: "언어",
      avatarCaption: "HUTECH · IT 학생",
      interestsTitle: "개인 취미",
      hoangSa: "호앙사",
      truongSa: "쯔엉사",
      footer: "Võ Lê Cao Kỳ · HUTECH IT 전공 학생",
    },
    sections: {
      experience: { eyebrow: "Work Experiences", title: "업무 경력" },
      projects: {
        eyebrow: "Projects",
        title: "프로젝트 및 제품",
        featuredTitle: "주요 프로젝트",
        otherTitle: "수행 프로젝트",
      },
      skills: { eyebrow: "Skills", title: "전문 역량" },
      achievements: { eyebrow: "Achievements", title: "수상 및 자격증" },
      activities: { eyebrow: "Activities & Contests", title: "대외 활동 및 경진대회" },
      contact: { eyebrow: "Contact", title: "연락처" },
    },
    interests: ["⚽ 축구", "✈️ 여행", "🍲 맛집 탐방"],
    experiences: [
      {
        role: "학생회 연합회장",
        org: "호치민 기술대학교 - HUTECH (2026 - 현재)",
        details: [
          "2025 한-베 문화 축제 조직위원회 위원.",
          "2026 닥농성 봄 자원봉사 캠페인 조직위원회 위원.",
          "문화유산 탐방 여정 활동 시리즈 조직위원회 위원.",
        ],
      },
      {
        role: "기술팀 팀원",
        org: "인공지능 연구소 — 훙브엉 대학교 (2026 - 현재)",
        details: [
          "학술 연구 프로젝트 개발 지원 및 기술 장비 유지보수·수리.",
          "대학교 및 고등학교 대상 기술 학술 경진대회 개최.",
        ],
      },
      {
        role: "전 기술팀 팀원",
        org: "META SQUARE 유한회사 (2024 - 2026)",
        details: [
          "드론 및 로보틱스 기술 장비 유지보수, 수리 및 복원.",
          "국제학교(VAS, Royal School) 학생 대상 STEM 기술 실습 지도 및 강의 지원.",
        ],
      },
    ],
    featuredProjects: [
      {
        title: "IECMS — 지능형 에너지 소비 모니터링 시스템",
        role: "개발 팀장",
        period: "2025.08 – 2026.03",
        description:
          "ESP32 기반 IoT 에너지 모니터링에 AI 분석과 자동 경보를 결합한 시스템. 2025년 학술 논문 발표.",
        tags: ["IoT", "ESP32", "AI", "학술 연구"],
      },
      {
        title: "직원 관리 웹 애플리케이션",
        role: "풀스택 개발자",
        period: "2026.04 – 2026.07",
        description:
          "Java Spring Boot MVC & MySQL 기반 인사 관리 웹 시스템.",
        tags: ["Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"],
      },
      {
        title: "주식 시장 예측 알고리즘 모델",
        role: "AI 개발 팀장",
        period: "2026.05 – 현재",
        description:
          "과거 주가 및 거래량 데이터를 기반으로 주식 시장 추세를 예측하는 머신러닝 모델 연구 및 개발.",
        tags: ["Python", "Machine Learning", "Data Analysis"],
      },
      {
        title: "AI 카메라 & 자율 라인 트레이싱 차량",
        role: "팀장 / 임베디드 & AI",
        period: "2025.06 – 2026",
        description:
          "객체 인식 및 감시용 AI 카메라 시스템 개발과 센서 제어 알고리즘 기반 자율 주행 라인 트레이서 결합.",
        tags: ["Computer Vision", "Arduino", "Raspberry Pi", "Embedded"],
      },
    ],
    otherProjects: [
      {
        title: "공공 행정 서비스 지원 로봇",
        role: "프로젝트 팀장",
        period: "2024.05",
        description:
          "공공 행정 환경에서 자동 안내, 위치 유도 및 상호작용을 지원하는 서비스 로봇 설계.",
        tags: ["Robotics", "Embedded", "Control Systems"],
      },
      {
        title: "뇌파 연구 및 기술 응용",
        role: "연구 팀장",
        period: "2025.08 – 2025.09",
        description:
          "뇌파(EEG) 작동 원리 분석 및 AI, 제어 시스템, 인간-컴퓨터 상호작용(HCI) 분야 응용 연구.",
        tags: ["AI Research", "Bio-Signal Processing", "HCI"],
      },
      {
        title: "드론 & 로보틱스 연구개발(R&D)",
        role: "기술팀 팀원",
        period: "2025.01 – 2025.05",
        description:
          "드론 및 로봇 시스템 유지보수·수리·운용, HUTECH 기술 경진대회 참가를 위한 자동화 솔루션 연구.",
        tags: ["Drone", "Robotics", "Automation"],
      },
      {
        title: "학생 관리 시스템",
        role: "프로젝트 팀장",
        period: "2024.02 – 2024.04",
        description:
          "학생 정보, 성적, 학업 과정 관리 및 데이터베이스 최적화를 지원하는 학생 관리 웹 시스템 구축.",
        tags: ["Web Development", "Database", "Management System"],
      },
      {
        title: "온라인 강좌 판매 웹사이트",
        role: "프로젝트 팀장",
        period: "2024.02 – 2024.04",
        description:
          "강좌 수강 신청, 콘텐츠 관리, 사용자 계정 및 기본 결제 기능을 지원하는 이러닝 플랫폼 개발.",
        tags: ["Web Development", "UI/UX", "E-learning"],
      },
    ],
    get projects() {
      return [...this.featuredProjects, ...this.otherProjects];
    },
    skills: [
      {
        group: "프로그래밍 언어",
        items: ["C", "C++", "C#", "Java", "Python", "SQL", "JavaScript", "HTML / CSS"],
      },
      {
        group: "웹 개발 & 아키텍처",
        items: ["Spring Boot", "Spring MVC", "Spring Security", "Thymeleaf", "Bootstrap", "REST API", "MVC", "RBAC", "CRUD"],
      },
      {
        group: "데이터베이스 & 전문 지식",
        items: ["MySQL", "JPA / Hibernate", "AI / 머신러닝", "IoT & 임베디드", "로보틱스"],
      },
      {
        group: "소프트웨어 & 도구",
        items: ["Git / GitHub", "IntelliJ IDEA", "VS Code", "Maven", "Apache NetBeans IDE", "Arduino", "ESP32"],
      },
      {
        group: "사무 및 프로젝트 관리",
        items: [
          "MS Word, Excel, PowerPoint 숙련",
          "MS Project (일정 및 프로젝트 관리)",
          "전문 문서 작성, 보고서 작성 및 발표 슬라이드 제작",
        ],
      },
    ],
    achievements: [
      { year: "2026", title: "DB Global Dream Leader 장학금" },
      { year: "2025", title: "학술 논문 발표 (IECMS 프로젝트)" },
      { year: "2025", title: "VKIT 축구 대회 우승" },
      { year: "2025", title: '"아세안 알기" 골든벨 3등상' },
      { year: "2025", title: "AIoT Innoworks 장려상 및 본선 진출" },
      { year: "2025", title: "2024-2025 학년도 우수 학생 표창" },
      { year: "2025", title: "WISE-IoT WISE-PaaS Core Level 1 & Level 2 자격증" },
    ],
    activities: [
      {
        period: "2024 – 2026",
        title: "HUTECH 대학교 베트남-한국 기술원",
        role: "학생 참가자 및 활동가",
        details: [
          "2025년 '아세안 알기' 골든벨 3등상 수상.",
          "2025년 한베기술원 축구 대회 우승.",
          "2024–2025 학년도 학업 및 훈련 우수 학생 표창.",
          "2025년 한-베 문화 축제, 닥농성 봉사활동, 문화유산 탐방 여정 조직위원회 참여.",
        ],
      },
      {
        period: "2025.08 – 2025.11",
        title: "AIoT Innoworks 2025",
        role: "본선 진출팀 참가자",
        details: [
          "실제 문제를 해결하기 위한 창의적인 IoT 및 AI 솔루션 연구 및 개발.",
        ],
      },
      {
        period: "2025.06",
        title: "제17회 호치민시 청년 창의 아이디어 경진대회",
        role: "참여팀 팀장",
        details: [
          "디지털 대중 교육 운동 추진을 위한 기술 응용 아이디어 기획 및 개발.",
        ],
      },
      {
        period: "2025.06",
        title: "HUTECH 청년단 정치 논설 작성 대회",
        role: "참여 참가자",
        details: [
          "2025년 제1회 HUTECH 청년단 주최 정치 논설 작성 대회 참가 완료.",
        ],
      },
    ],
  },
};