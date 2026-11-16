# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG DATA ADVENTURE (GOOGLE SHEETS + APPS SCRIPT)

Ứng dụng **DATA ADVENTURE – Hành trình chinh phục dữ liệu (Bài 13: Biểu diễn dữ liệu)** hoạt động theo kiến trúc:

`FRONTEND APP (React/Vite) ➔ GOOGLE APPS SCRIPT (Web App) ➔ GOOGLE SHEETS`

Mọi học sinh từ các trường khác nhau kết nối về **cùng một URL Web App** để đồng bộ điểm, hồ sơ, nhóm và bảng xếp hạng toàn quốc theo thời gian thực.

---

## 1. Cấu trúc 6 trang tính trong Google Sheets

Hệ thống sử dụng 6 trang tính (khi chạy hàm `setupDatabase()` trong `Code.gs`, cả 6 trang tính và dữ liệu mẫu sẽ được tự động tạo):

1. **`STUDENTS`**: `student_id`, `full_name`, `display_name`, `school`, `class`, `join_time`, `last_active`, `total_score`, `total_correct`, `total_attempts`
2. **`ATTEMPTS`**: `attempt_id`, `student_id`, `question_id`, `question_type`, `answer`, `is_correct`, `score`, `duration`, `submitted_at`
3. **`GROUPS`**: `group_id`, `group_name`, `student_id`, `updated_at`
4. **`GROUP_ASSIGNMENTS`**: `assignment_id`, `group_id`, `title`, `description`, `questions`, `max_score`, `status`, `created_at`
5. **`APP_CONFIG`**: `config_key`, `config_value`, `updated_at` (lưu khối lớp, môn học, tên bài học có thể chỉnh sửa)
6. **`QUESTION_BANK`**: `question_id`, `assignment_id`, `question_text`, `question_type`, `options_json`, `correct_answer`, `points`, `explanation`, `updated_at`

---

## 2. Hướng dẫn tạo Google Spreadsheet & cài đặt `Code.gs`

1. Đăng nhập Google Drive và tạo một **Google Sheets (Trang tính)** mới, đặt tên ví dụ: `DATA_ADVENTURE_BAI13_DB`.
2. Trên thanh menu của Google Sheets, chọn **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
3. Xóa mã mẫu `function myFunction() {}` trong tệp `Code.gs`, sau đó dán toàn bộ nội dung của tệp `/google-apps-script/Code.gs` vào.
4. Nhấn **Lưu (Ctrl + S)**.
5. Trên thanh công cụ Apps Script, chọn hàm **`setupDatabase`** trong danh sách hàm rồi nhấn **Chạy (Run)**.
6. Lần đầu chạy, Google sẽ yêu cầu **Xem lại quyền (Review permissions)** ➔ Chọn tài khoản Google của giáo viên ➔ **Nâng cao (Advanced)** ➔ **Đi tới ... (không an toàn)** ➔ **Cho phép (Allow)**.
7. Kiểm tra lại Google Sheets: 6 trang tính (`STUDENTS`, `ATTEMPTS`, `GROUPS`, `GROUP_ASSIGNMENTS`, `APP_CONFIG`, `QUESTION_BANK`) cùng 4 nhóm mẫu và 2 nhiệm vụ mẫu đã xuất hiện.

---

## 3. Hướng dẫn triển khai Apps Script Web App

1. Trong trình soạn thảo Apps Script, nhấn nút **Triển khai (Deploy)** ở góc trên bên phải ➔ **Tùy chọn triển khai mới (New deployment)**.
2. Ở biểu tượng bánh răng chọn loại: **Ứng dụng web (Web app)**.
3. Điền thông tin:
   - **Mô tả**: `DATA ADVENTURE API v1`
   - **Thực thi dưới dạng (Execute as)**: **Tôi (Me)**
   - **Người có quyền truy cập (Who has access)**: **Bất kỳ ai (Anyone)** *(Bắt buộc chọn "Bất kỳ ai" để học sinh các trường không cần đăng nhập Google vẫn gửi bài và xem bảng xếp hạng được).*
4. Nhấn **Triển khai (Deploy)**.
5. Sao chép **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`).

> **Lưu ý khi sửa Code.gs về sau**: Mỗi lần chỉnh sửa `Code.gs`, giáo viên phải chọn **Triển khai ➔ Quản lý các bản triển khai ➔ Chỉnh sửa (biểu tượng bút chì) ➔ Phiên bản mới ➔ Triển khai** để bản cập nhật có hiệu lực.

---

## 4. Hướng dẫn cài đặt trực tiếp URL Web App vào mã nguồn

Để học sinh và giáo viên mở ứng dụng là tự động kết nối thẳng vào Google Sheets mà **không cần phải thiết lập URL trong giao diện ứng dụng nữa**, hãy cấu hình trực tiếp theo 1 trong 2 cách:

### Cách 1 (Khuyên dùng): Dán trực tiếp vào file mã nguồn
1. Mở tệp `src/services/apiService.ts`.
2. Tìm biến `HARDCODED_GAS_URL` (khoảng dòng 30):
```typescript
export const HARDCODED_GAS_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```
3. Dán **URL ứng dụng web** vừa sao chép ở Bước 3 vào giữa hai dấu nháy đơn `'...'`.
4. Nhấn **Lưu (Ctrl + S)**. Ứng dụng sẽ tự động nhận diện và kết nối vĩnh viễn tới Google Sheets của bạn.

### Cách 2: Cấu hình qua biến môi trường (.env)
Tạo tệp `.env` tại thư mục gốc của dự án và điền:
```env
VITE_GAS_WEBAPP_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

---

## 5. Hướng dẫn kiểm tra đăng nhập, chấm điểm và bảng xếp hạng

1. **Đăng nhập học sinh**: Nhập Họ và tên, Trường, Lớp ➔ nhấn `BẮT ĐẦU HÀNH TRÌNH`. Mở sheet `STUDENTS` để kiểm tra dòng dữ liệu vừa được ghi với `student_id` duy nhất. Thử tải lại trang (`F5`): học sinh được tự động đăng nhập lại và **không** tạo bản ghi trùng lặp.
2. **Chấm điểm phía máy chủ**: Vào **Khu vực 3 – Thử thách SGK**, trả lời một câu hỏi. Hệ thống gửi `question_id` và đáp án lên `Code.gs`; `Code.gs` tự đối chiếu đáp án đúng và cộng điểm vào `ATTEMPTS` và `STUDENTS`. Thử nộp lại câu hỏi đã làm đúng: tổng điểm không bị cộng trùng.
3. **Bảng xếp hạng**: Vào **Khu vực 4 – Đấu trường dữ liệu**, kiểm tra thứ hạng TOP 10 / TOP 50 / Vị trí của tôi. Trên bảng công khai chỉ hiển thị tên rút gọn (`display_name`); tên đầy đủ nằm trong `STUDENTS` và bảng điều khiển giáo viên. Bảng tự động làm mới mỗi 20 giây hoặc khi bấm **Làm mới**.

---

## 6. Hướng dẫn thay đổi mật khẩu giáo viên và cấu hình nhóm

1. **Đổi mật khẩu giáo viên**:
   - Mật khẩu mặc định lưu tại `PropertiesService` trên Apps Script là `2026` (hoàn toàn không lưu trong mã frontend).
   - Sau khi đăng nhập khu vực Giáo viên, vào tab **Quản lý dữ liệu & Cài đặt** ➔ mục **Đổi mật khẩu giáo viên** ➔ nhập mật khẩu mới và lưu.
   - Hoặc giáo viên có thể sửa trực tiếp trong Apps Script: **Cài đặt dự án (Project Settings) ➔ Thuộc tính tập lệnh (Script Properties) ➔ `TEACHER_PASSWORD`**.
2. **Cấu hình nhóm & nhiệm vụ**:
   - Vào tab **Quản lý Nhóm** để tạo/sửa/xóa nhóm, thêm hoặc chuyển học sinh giữa 4 nhóm.
   - Vào tab **Quản lý Nhiệm vụ** để chỉnh sửa 2 nhiệm vụ mẫu hoặc tạo nhiệm vụ mới.
   - Vào tab **Quản lý Câu hỏi Nhiệm vụ** để thêm/sửa/xóa câu hỏi hiển thị trực tiếp ở khu vực **Nhiệm vụ đồng đội** của học sinh.
