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

## 5. Hướng dẫn kiểm tra đăng nhập, 5 thử thách Vận dụng và bảng xếp hạng

1. **Đăng nhập học sinh**: Nhập Họ và tên, Trường, Lớp ➔ nhấn `BẮT ĐẦU HÀNH TRÌNH`. Mở sheet `STUDENTS` để kiểm tra dòng dữ liệu vừa được ghi với `student_id` duy nhất. Thử tải lại trang (`F5`): học sinh được tự động đăng nhập lại và **không** tạo bản ghi trùng lặp.
2. **Khu vực trung tâm: VẬN DỤNG – CHINH PHỤC 5 THỬ THÁCH (Thang điểm 100)**:
   - **Thử thách 1 (Chọn 1 - 20đ)**: Nhận diện xâu kí tự `Computer`.
   - **Thử thách 2 (Chọn nhiều - 20đ)**: Chọn cả 3 phép toán logic AND, OR, NOT.
   - **Thử thách 3 (Kéo thả - 20đ)**: Kéo thẻ `THAY ĐỔI` vào ô Biến và `KHÔNG ĐỔI` vào ô Hằng.
   - **Thử thách 4 (Điền ô - 20đ)**: Điền biểu thức góc quay `360/n`.
   - **Thử thách 5 (Ghép đôi - 20đ)**: Nối 3 nhóm phép toán với kiểu dữ liệu tương ứng (1-C, 2-A, 3-B).
   - Hệ thống tự động chấm điểm phía máy chủ và lưu vào `ATTEMPTS` và `STUDENTS`. Nếu học sinh luyện tập lại, hệ thống sẽ lưu điểm cao nhất của từng câu mà không cộng dồn trùng lặp.
3. **Bảng xếp hạng**: Vào **Bảng xếp hạng toàn quốc**, kiểm tra thứ hạng TOP 10 / TOP 50 / Vị trí của tôi. Bảng tự động làm mới mỗi 20 giây hoặc khi bấm **Làm mới dữ liệu**.

---

## 6. Hướng dẫn quản trị giáo viên & 5 câu hỏi Vận dụng

1. **Đăng nhập giáo viên**:
   - Nhấn biểu tượng bánh răng ⚙️ ở góc trên bên phải.
   - Mật khẩu mặc định lưu tại `PropertiesService` trên Apps Script là `2026` (hoàn toàn bảo mật tại backend).
2. **Quản lý 5 câu hỏi Vận dụng**:
   - Vào tab **Quản lý 5 Câu hỏi Vận dụng** để xem, chỉnh sửa nội dung câu hỏi, đáp án đúng, lời giải thích và điểm số.
   - Hình thức tương tác được cố định đúng chuẩn sư phạm (Câu 1: chọn 1; Câu 2: chọn nhiều; Câu 3: kéo thả; Câu 4: điền ô trống; Câu 5: ghép đôi).
   - Nhấn **Lưu & Cập nhật 5 câu hỏi** để đồng bộ lên Google Sheets, hoặc nhấn **Khôi phục mặc định SGK** để trở về nội dung chuẩn ban đầu.
3. **Báo cáo dữ liệu & Danh sách học sinh**:
   - Xem toàn bộ học sinh tham gia, điểm số 5 câu, thời gian làm bài và bấm **Xuất file Excel/CSV** để tải báo cáo về máy tính.
4. **Đổi mật khẩu giáo viên**:
   - Vào tab **Cài đặt lớp & Đổi mật khẩu** ➔ nhập mật khẩu cũ và mật khẩu mới ➔ lưu. Hoặc sửa trực tiếp trong Apps Script: **Cài đặt dự án ➔ Thuộc tính tập lệnh ➔ `TEACHER_PASSWORD`**.
