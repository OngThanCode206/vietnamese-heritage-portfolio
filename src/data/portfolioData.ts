export const profile = {
  name: "Võ Lê Cao Kỳ",
  role: "Sinh viên Công nghệ Thông tin — HUTECH",
  gpa: "3.42 / 4.0",
  tagline: "AI • IoT / Hệ thống nhúng • Java Web Developer",
  intro:
    "Mình theo đuổi con đường kết hợp giữa phần cứng và phần mềm: từ cảm biến ESP32 ngoài đời thực đến hệ thống web Java Spring Boot và các mô hình AI. Định hướng phát triển: AI, IoT/Hệ thống nhúng và Java Web Developer.",
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

export const experiences = [
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
    details: [
      "Tham gia nghiên cứu và triển khai các dự án ứng dụng Trí tuệ Nhân tạo.",
    ],
  },
];

export const projects = [
  {
    title: "IECMS — Intelligent Energy Consumption Monitoring System",
    role: "Trưởng nhóm",
    description:
      "Hệ thống giám sát tiêu thụ năng lượng ứng dụng IoT (ESP32) kết hợp AI phân tích, cảnh báo. Đã công bố Bài báo khoa học năm 2025.",
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
];

export const skills = [
  { group: "Ngôn ngữ", items: ["Java", "C/C++", "Python", "SQL"] },
  {
    group: "Framework & Tech",
    items: ["Spring Boot", "Spring Security", "Thymeleaf", "JPA/Hibernate"],
  },
  {
    group: "Tools & Hardware",
    items: ["MySQL", "Git", "ESP32", "Arduino", "Raspberry Pi"],
  },
];

export const achievements = [
  { year: "2025", title: "Bài báo khoa học công bố (Dự án IECMS)" },
  { year: "2026", title: "Học bổng DB Global Dream Leader" },
  { year: "2025", title: 'Giải Ba — Rung Chuông Vàng "Tìm hiểu ASEAN"' },
  { year: "2025", title: "Giải Khuyến khích — AIoT Innoworks" },
  { year: "—", title: "Chứng chỉ Quốc tế WISE-IoT WISE-PASS Core Level 1 & Level 2" },
];
