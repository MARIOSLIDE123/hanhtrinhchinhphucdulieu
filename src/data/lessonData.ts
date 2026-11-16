import { VanDungQuestion } from '../types';

export const ASSET_PATHS = {
  robot: '/src/assets/images/robot_mascot_1794799934826.jpg',
  mapLeaderboard: '/src/assets/images/map_leaderboard_1794799935955.jpg',
  mapChallenge: '/src/assets/images/map_challenge_1794799936758.jpg',
  mapLearn: '/src/assets/images/map_learn_1794799936202.jpg',
  mapReview: '/src/assets/images/map_review_1794799935944.jpg',
  mapTeam: '/src/assets/images/map_team_1794799937839.jpg',
};

/**
 * ============================================================================
 * 5 THỬ THÁCH VẬN DỤNG – BÀI 13: BIỂU DIỄN DỮ LIỆU (SGK TIN HỌC)
 * ============================================================================
 */
export const DEFAULT_VAN_DUNG_QUESTIONS: VanDungQuestion[] = [
  {
    id: 'VD_Q1',
    index: 1,
    title: 'Thử thách 1: Nhà thông thái dữ liệu',
    subtitle: 'Nhận diện giá trị thuộc kiểu dữ liệu xâu kí tự',
    type: 'single_choice',
    typeLabel: 'Chọn một đáp án đúng',
    prompt: 'Trong các giá trị dưới đây, giá trị nào thuộc kiểu dữ liệu xâu kí tự trong Scratch?',
    instruction: 'Chọn một đáp án duy nhất bên dưới',
    points: 20,
    options: [
      { id: 'A', label: '15', badge: 'Số nguyên' },
      { id: 'B', label: '3.141592', badge: 'Số thập phân' },
      { id: 'C', label: 'Computer', badge: 'Văn bản / Kí tự' },
      { id: 'D', label: 'true', badge: 'Logic (Đúng/Sai)' },
    ],
    correctAnswer: 'C',
    explanationCorrect: 'Chính xác! Computer là dữ liệu thuộc kiểu xâu kí tự.',
    explanationIncorrect: 'Chưa chính xác! Hãy nhớ rằng kiểu xâu kí tự bao gồm kí tự hoặc chuỗi kí tự (văn bản).',
  },
  {
    id: 'VD_Q2',
    index: 2,
    title: 'Thử thách 2: Giải mã phép toán',
    subtitle: 'Nhận diện tất cả phép toán thuộc kiểu dữ liệu logic',
    type: 'multi_choice',
    typeLabel: 'Chọn nhiều đáp án đúng',
    instruction: 'Chọn tất cả đáp án đúng',
    prompt: 'Hãy chọn TẤT CẢ các phép toán thuộc kiểu dữ liệu logic trong Scratch.',
    points: 20,
    options: [
      { id: 'A', label: 'Và (AND)', badge: 'Phép toán logic' },
      { id: 'B', label: 'Hoặc (OR)', badge: 'Phép toán logic' },
      { id: 'C', label: 'Không phải (NOT)', badge: 'Phép toán logic' },
      { id: 'D', label: 'Kết hợp (JOIN)', badge: 'Phép toán xâu kí tự' },
      { id: 'E', label: 'Phép cộng (+)', badge: 'Phép toán số' },
    ],
    correctAnswer: ['A', 'B', 'C'],
    explanationCorrect: 'Hoàn thành! AND, OR, NOT là ba phép toán logic trong Scratch.',
    explanationIncorrect:
      'Chưa chính xác! AND, OR, NOT là các phép toán logic; JOIN thuộc kiểu xâu kí tự và (+) thuộc kiểu số.',
  },
  {
    id: 'VD_Q3',
    index: 3,
    title: 'Thử thách 3: Điền đúng vị trí',
    subtitle: 'Khắc sâu khái niệm cốt lõi của Biến và Hằng',
    type: 'drag_drop',
    typeLabel: 'Kéo thả chữ vào ô trống',
    prompt: 'Hãy kéo các cụm từ phù hợp vào vị trí còn thiếu để hoàn thiện kiến thức.',
    instruction: 'Kéo hoặc chạm thẻ từ để đặt vào ô trống tương ứng',
    points: 20,
    textBefore: 'Biến được dùng để lưu trữ giá trị có thể',
    textMiddle: 'trong quá trình thực hiện chương trình.\n\nHằng là giá trị',
    textAfter: 'trong quá trình thực hiện chương trình.',
    dragItems: ['THAY ĐỔI', 'KHÔNG ĐỔI'],
    correctAnswer: {
      blank1: 'THAY ĐỔI',
      blank2: 'KHÔNG ĐỔI',
    },
    explanationCorrect:
      'Rất tốt! Biến có thể thay đổi giá trị, còn hằng không thay đổi trong quá trình chương trình thực hiện.',
    explanationIncorrect:
      'Hãy chú ý: Biến là giá trị có thể "THAY ĐỔI", còn Hằng là giá trị "KHÔNG ĐỔI" trong suốt quá trình chạy chương trình.',
  },
  {
    id: 'VD_Q4',
    index: 4,
    title: 'Thử thách 4: Hoàn thiện biểu thức',
    subtitle: 'Xác định công thức góc quay khi vẽ đa giác đều n cạnh',
    type: 'fill_blank',
    typeLabel: 'Điền đáp án vào ô trống',
    prompt:
      'Trong chương trình Scratch điều khiển nhân vật vẽ hình có n cạnh, biểu thức dùng để tính góc quay là gì?',
    instruction: 'Nhập biểu thức toán học tương ứng vào ô bên dưới',
    formulaDisplay: 'GÓC QUAY = [ Ô NHẬP ĐÁP ÁN ]',
    hint: 'Để vẽ đa giác đều n cạnh, góc quay được tính bằng 360 độ chia cho số cạnh n.',
    points: 20,
    correctAnswer: '360/n',
    explanationCorrect:
      'Chính xác! Biểu thức 360/n giúp xác định góc quay khi nhân vật vẽ hình có n cạnh.',
    explanationIncorrect:
      'Hãy thử lại! Để vẽ hình có n cạnh đều, góc quay được tính bằng 360 chia cho n (biểu thức: 360/n).',
  },
  {
    id: 'VD_Q5',
    index: 5,
    title: 'Thử thách 5: Kết nối tri thức',
    subtitle: 'Nối nhóm phép toán với kiểu dữ liệu tương ứng',
    type: 'matching',
    typeLabel: 'Ghép đôi tương ứng',
    prompt: 'Hãy nối mỗi nhóm phép toán với kiểu dữ liệu tương ứng.',
    instruction: 'Chạm chọn một mục ở Cột A rồi chạm chọn mục tương ứng ở Cột B để kết nối',
    points: 20,
    columnA: [
      { id: '1', text: 'Cộng, trừ, nhân, chia, chia lấy dư và làm tròn.' },
      { id: '2', text: 'Phép toán kết hợp JOIN.' },
      { id: '3', text: 'Phép so sánh bằng, nhỏ hơn, lớn hơn và phép toán AND, OR, NOT.' },
    ],
    columnB: [
      { id: 'A', text: 'Kiểu xâu kí tự' },
      { id: 'B', text: 'Kiểu logic' },
      { id: 'C', text: 'Kiểu số' },
    ],
    correctAnswer: {
      '1': 'C',
      '2': 'A',
      '3': 'B',
    },
    explanationCorrect: 'Xuất sắc! Bạn đã kết nối chính xác các phép toán với kiểu dữ liệu tương ứng.',
    explanationIncorrect:
      'Cộng, trừ, nhân, chia -> Kiểu số (1-C); Phép toán JOIN -> Kiểu xâu kí tự (2-A); So sánh & AND, OR, NOT -> Kiểu logic (3-B).',
  },
];
