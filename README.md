# Kỳ's Digital Heritage

Tạo cho tôi một trang Portfolio cá nhân hiện đại (Modern Heritage) kết hợp văn hóa Việt Nam.

1. Bố cục & Phong cách (Modern & Refined Layout):
   - Thiết kế hiện đại, tối giản, sang trọng với tone màu kem cát hoài cổ pha xanh lá rặng tre và xanh biển sâu. Các thẻ Card nội dung có viền mảnh (thin border), khoảng trắng thoáng đãng, hiệu ứng hover nhẹ nhàng.
   - Font chữ: Dùng font tiêu đề hiện đại, cứng cáp ('Montserrat' hoặc 'Plus Jakarta Sans') kết hợp font nội dung nét mảnh, cực kỳ dễ đọc ('Inter' hoặc 'Be Vietnam Pro').

2. Bản đồ Việt Nam (Background Map Adjustment):
   - Đặt hình ảnh Bản đồ Việt Nam (đầy đủ hai quần đảo Hoàng Sa & Trường Sa) làm hình nền mờ phía sau phần Intro/Giới thiệu.
   - Tăng độ sáng và độ phản quang nhẹ, đẩy vị trí bản đồ dịch lên trên một xíu, cài opacity khoảng 0.2 - 0.25 để bản đồ hiện lên rõ nét phía sau các con chữ.

3. Thông tin cá nhân đầy đủ (Võ Lê Cao Kỳ):
   - Giới thiệu chung: Võ Lê Cao Kỳ | Sinh viên CNTT HUTECH (GPA: 3.42/4.0) | Định hướng: AI, IoT/Hệ thống nhúng, Java Web Developer.
   - Kinh nghiệm làm việc (Work Experiences):
     + Cựu thành viên Ban Kỹ thuật - Công ty TNHH META SQUARE (Bảo trì Drone, Robotics; Giảng dạy STEM tại VAS & Royal School; Trưởng nhóm dự án Web Quản lý sinh viên & Web bán khóa học).
     + Thành viên Ban Kỹ thuật - Viện Trí tuệ Nhân tạo ĐH Hùng Vương.
   - Dự án tiêu biểu (Projects):
     1. IECMS (Intelligent Energy Consumption Monitoring System): Trưởng nhóm phát triển hệ thống giám sát năng lượng ứng dụng IoT (ESP32) & AI. Đã công bố Bài báo khoa học năm 2025.
     2. Web Quản lý Nhân viên: Java Spring Boot MVC, Spring Security (phân quyền RBAC), JPA/Hibernate, MySQL.
     3. Mô hình Dự đoán Thị trường Chứng khoán: Thuật toán AI dự đoán xu hướng dựa trên dữ liệu lịch sử.
     4. Xe dò line tự động & Camera AI nhận diện.
   - Kỹ năng (Skills):
     + Ngôn ngữ: Java, C/C++, Python, SQL.
     + Framework & Tech: Spring Boot, Spring Security, Thymeleaf, JPA/Hibernate.
     + Tools & Hardware: MySQL, Git, ESP32, Arduino, Raspberry Pi.
   - Thành tích (Achievements):
     + Bài báo khoa học công bố năm 2025 (Dự án IECMS).
     + Học bổng DB Global Dream Leader 2026.
     + Giải Ba Cuộc thi Rung Chuông Vàng "Tìm hiểu ASEAN" 2025.
     + Giải Khuyến khích - Cuộc thi AIoT Innoworks 2025.
     + Chứng chỉ Quốc tế: WISE-IoT WISE-PASS Core Level 1 & Level 2.

4. Nút CV & Mạng xã hội chính thức:
   - Nút "Tải CV" / "Download CV": Gắn liên kết trực tiếp tới CV TopCV: https://www.topcv.vn/xem-cv/A1ZSB1pQVAECV1cCDQNZVAELVFZWVgFfUA8NBQdf59 (mở ở tab mới `target="_blank"`).
   - Facebook: https://www.facebook.com/share/1CpaDx3T1V/?mibextid=wwXIfr
   - Instagram: https://www.instagram.com/kyc.catafrican/
   - Gmail: mailto:nky57412@gmail.com
   - X (Twitter): https://x.com/C14k11
   - LinkedIn: https://www.linkedin.com/in/cao-k%E1%BB%B3-v%C3%B5-l%C3%AA-b27515411/
   - GitHub: https://github.com/OngThanCode206

5. Tính năng bổ sung:
   - Tích hợp Trình phát nhạc nền (Background Music Player) với nút Bật/Tắt trên Header (phát file `/music.mp3` trong thư mục public).
   - Tạo khung chứa Ảnh đại diện cá nhân (/avatar.jpg).
   - Tách toàn bộ dữ liệu trên vào file `src/data/portfolioData.ts` để tôi có thể tự ý thêm, xóa, sửa tất cả thông tin trên web sau này.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vietnamese-heritage-portfolio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d388d253-ff97-4e1e-9d7f-c08024bc2814).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
