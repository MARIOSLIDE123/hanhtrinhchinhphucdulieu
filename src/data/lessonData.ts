import { ChallengeQuestion, GroupAssignment, TeamGroup, TeamQuestion } from '../types';

export const ASSET_PATHS = {
  robot: '/src/assets/images/robot_mascot_1794799934826.jpg',
  mapLearn: '/src/assets/images/map_learn_1794799936202.jpg',
  mapReview: '/src/assets/images/map_review_1794799935944.jpg',
  mapChallenge: '/src/assets/images/map_challenge_1794799936758.jpg',
  mapLeaderboard: '/src/assets/images/map_leaderboard_1794799935955.jpg',
  mapTeam: '/src/assets/images/map_team_1794799937839.jpg',
};

export interface DataTypeCardInfo {
  id: 'number' | 'string' | 'boolean';
  title: string;
  color: string;
  bgTint: string;
  borderTint: string;
  summary: string;
  examples: string[];
  operations: string[];
  robotExplanation: string;
}

export const DATA_TYPES_CONTENT: DataTypeCardInfo[] = [
  {
    id: 'number',
    title: 'A. Kiểu số',
    color: '#2389D8',
    bgTint: 'bg-[#2389D8]/8',
    borderTint: 'border-[#2389D8]/25',
    summary: 'Bao gồm số nguyên và số thập phân dùng để tính toán định lượng.',
    examples: ['15 (số nguyên)', '3.141592 (số thập phân)'],
    operations: ['Cộng (+)', 'Trừ (-)', 'Nhân (×)', 'Chia (/)', 'Chia lấy dư (mod)', 'Làm tròn số (round)'],
    robotExplanation:
      'Kiểu số giúp máy tính thực hiện các phép tính toán học như cộng, trừ, nhân, chia, chia lấy dư (mod) và làm tròn số!',
  },
  {
    id: 'string',
    title: 'B. Kiểu xâu kí tự',
    color: '#FF9850',
    bgTint: 'bg-[#FF9850]/10',
    borderTint: 'border-[#FF9850]/30',
    summary: 'Bao gồm một kí tự hoặc một dãy các kí tự (chữ cái, chữ số, kí hiệu).',
    examples: ['@', 'Computer', 'Tin học'],
    operations: ['JOIN (kết hợp / nối các xâu kí tự)'],
    robotExplanation:
      'Kiểu xâu kí tự lưu văn bản, tên gọi hoặc kí hiệu như "@", "Computer", "Tin học". Ta dùng phép toán JOIN để ghép nối các xâu lại với nhau!',
  },
  {
    id: 'boolean',
    title: 'C. Kiểu logic',
    color: '#38C9B1',
    bgTint: 'bg-[#38C9B1]/10',
    borderTint: 'border-[#38C9B1]/30',
    summary: 'Chỉ gồm đúng hai giá trị là true (đúng) và false (sai).',
    examples: ['true (đúng)', 'false (sai)'],
    operations: [
      'So sánh: bằng (=), nhỏ hơn (<), lớn hơn (>)',
      'AND: đúng khi cả hai biểu thức thành phần đều đúng',
      'OR: đúng khi ít nhất một biểu thức thành phần đúng',
      'NOT: đảo ngược giá trị logic',
    ],
    robotExplanation:
      'Kiểu logic chỉ có 2 giá trị true hoặc false! Các phép so sánh (=, <, >) và phép toán AND, OR, NOT giúp chương trình kiểm tra điều kiện chính xác.',
  },
];

export const QUICK_IDENTIFY_ITEMS = [
  { id: 'qi1', label: 'n = 6 (số cạnh đa giác)', answer: 'Biến', detail: 'n có thể thay đổi thành 3, 4, 6... nên n là Biến.' },
  { id: 'qi2', label: '3.14', answer: 'Hằng', detail: '3.14 là giá trị không đổi trong chương trình -> Hằng số.' },
  { id: 'qi3', label: '"Xin chào!"', answer: 'Hằng', detail: '"Xin chào!" là giá trị văn bản cố định -> Hằng xâu kí tự.' },
  { id: 'qi4', label: 'true', answer: 'Hằng', detail: 'true là giá trị logic cố định -> Hằng logic.' },
  { id: 'qi5', label: '2 × 3.14 × r', answer: 'Biểu thức', detail: 'Kết hợp hằng (2, 3.14), biến (r) và phép nhân (×) -> Biểu thức.' },
  { id: 'qi6', label: '360 / n', answer: 'Biểu thức', detail: 'Kết hợp hằng 360, phép chia và biến n để trả về góc quay -> Biểu thức.' },
];

export interface MindMapBranch {
  id: string;
  title: string;
  color: string;
  points: string[];
}

export const MIND_MAP_BRANCHES: MindMapBranch[] = [
  {
    id: 'mm1',
    title: '1. Ba kiểu dữ liệu',
    color: '#2389D8',
    points: [
      'Kiểu số: số nguyên (15), số thập phân (3.141592).',
      'Kiểu xâu kí tự: kí tự hoặc dãy kí tự (@, Computer, Tin học).',
      'Kiểu logic: chỉ có 2 giá trị true (đúng) và false (sai).',
    ],
  },
  {
    id: 'mm2',
    title: '2. Các phép toán tương ứng',
    color: '#38C9B1',
    points: [
      'Kiểu số: cộng, trừ, nhân, chia, chia lấy dư, làm tròn số.',
      'Kiểu xâu kí tự: phép toán kết hợp JOIN để nối xâu.',
      'Kiểu logic: so sánh (=, <, >) và AND, OR, NOT.',
    ],
  },
  {
    id: 'mm3',
    title: '3. Khái niệm Biến',
    color: '#FF9850',
    points: [
      'Lưu trữ giá trị có thể thay đổi trong quá trình thực hiện chương trình.',
      'Được nhận biết bằng tên và thuộc một kiểu dữ liệu nhất định.',
      'Ví dụ: biến n lưu số cạnh của hình (n = 6).',
    ],
  },
  {
    id: 'mm4',
    title: '4. Khái niệm Hằng',
    color: '#A88BFA',
    points: [
      'Là giá trị không đổi trong quá trình thực hiện chương trình.',
      'Ví dụ: 3.14 (hằng số), "Xin chào!" (hằng xâu kí tự), true (hằng logic).',
    ],
  },
  {
    id: 'mm5',
    title: '5. Khái niệm Biểu thức',
    color: '#FF8EAA',
    points: [
      'Là sự kết hợp của biến, hằng, dấu ngoặc, phép toán và các hàm.',
      'Trả về một giá trị thuộc một kiểu dữ liệu nhất định.',
    ],
  },
  {
    id: 'mm6',
    title: '6. Ứng dụng trong Scratch',
    color: '#EAB308',
    points: [
      'Tạo biến: n, độ bước, góc quay.',
      'Nhập số cạnh n từ bàn phím.',
      'Dùng biểu thức 900/n và 360/n để điều khiển nhân vật vẽ đa giác.',
    ],
  },
];

export interface FlashcardItem {
  id: string;
  term: string;
  category: string;
  definition: string;
  example: string;
}

export const FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc1',
    term: 'Kiểu số',
    category: 'Kiểu dữ liệu',
    definition: 'Bao gồm số nguyên và số thập phân cùng các phép toán cộng, trừ, nhân, chia, chia lấy dư, làm tròn số.',
    example: 'Ví dụ: 15; 3.141592',
  },
  {
    id: 'fc2',
    term: 'Kiểu xâu kí tự',
    category: 'Kiểu dữ liệu',
    definition: 'Bao gồm kí tự hoặc xâu kí tự. Dùng phép toán kết hợp JOIN để nối các xâu kí tự.',
    example: 'Ví dụ: @; Computer; Tin học',
  },
  {
    id: 'fc3',
    term: 'Kiểu logic',
    category: 'Kiểu dữ liệu',
    definition: 'Có hai giá trị true (đúng) và false (sai). Gắn với phép so sánh (=, <, >) và logic (AND, OR, NOT).',
    example: 'Ví dụ: r > 0 trả về true khi r = 5',
  },
  {
    id: 'fc4',
    term: 'Phép toán AND, OR, NOT',
    category: 'Phép toán logic',
    definition: 'AND đúng khi cả hai điều kiện đều đúng; OR đúng khi ít nhất một điều kiện đúng; NOT đảo ngược giá trị logic.',
    example: 'Ví dụ: NOT (true) -> false',
  },
  {
    id: 'fc5',
    term: 'Biến (Variable)',
    category: 'Thành phần chương trình',
    definition: 'Dùng để lưu trữ giá trị có thể thay đổi trong quá trình thực hiện chương trình, nhận biết bằng tên và có kiểu dữ liệu.',
    example: 'Ví dụ: biến n = 6 lưu số cạnh hình lục giác',
  },
  {
    id: 'fc6',
    term: 'Hằng (Constant)',
    category: 'Thành phần chương trình',
    definition: 'Là giá trị không đổi trong suốt quá trình thực hiện chương trình.',
    example: 'Ví dụ: 3.14 (hằng số); "Xin chào!" (hằng xâu); true (hằng logic)',
  },
  {
    id: 'fc7',
    term: 'Biểu thức (Expression)',
    category: 'Thành phần chương trình',
    definition: 'Là sự kết hợp của biến, hằng, dấu ngoặc, phép toán và các hàm; trả về một giá trị thuộc một kiểu dữ liệu nhất định.',
    example: 'Ví dụ: 2 × 3.14 × r; 900 / n; 360 / n',
  },
];

export const QUICK_REVIEW_QUESTIONS = [
  {
    q: 'Giá trị nào sau đây thuộc kiểu Logic?',
    options: ['15', '"Tin học"', 'true', '3.141592'],
    correct: 'true',
    explanation: 'Kiểu logic chỉ có hai giá trị là true (đúng) và false (sai).',
  },
  {
    q: 'Phép toán nào dùng để nối các xâu kí tự trong Scratch?',
    options: ['MOD', 'JOIN', 'AND', 'ROUND'],
    correct: 'JOIN',
    explanation: 'Phép toán kết hợp JOIN dùng để nối các xâu kí tự với nhau.',
  },
  {
    q: 'Phép toán logic nào trả về đúng khi ÍT NHẤT MỘT biểu thức thành phần đúng?',
    options: ['AND', 'OR', 'NOT', 'MOD'],
    correct: 'OR',
    explanation: 'OR đúng khi ít nhất một biểu thức thành phần đúng.',
  },
  {
    q: 'Trong hoạt động vẽ đa giác Scratch với n cạnh, góc quay của nhân vật được tính bằng biểu thức nào?',
    options: ['900 / n', '360 / n', '180 × n', '3.14 × n'],
    correct: '360 / n',
    explanation: 'Tổng góc quay một vòng là 360 độ, chia đều cho n cạnh ta có góc quay = 360 / n.',
  },
  {
    q: '"Xin chào!" là ví dụ của khái niệm nào?',
    options: ['Biến', 'Hằng xâu kí tự', 'Hằng số', 'Biểu thức logic'],
    correct: 'Hằng xâu kí tự',
    explanation: '"Xin chào!" là giá trị văn bản không đổi -> hằng xâu kí tự.',
  },
];

export const CHALLENGE_QUESTIONS: ChallengeQuestion[] = [
  // NHÓM A – KIỂU DỮ LIỆU
  {
    id: 'SGK_A1',
    group: 'A',
    groupLabel: 'Nhóm A – Kiểu dữ liệu',
    numberLabel: 'Câu 1 (SGK)',
    type: 'matching',
    typeLabel: 'Ghép cột',
    prompt: 'Ghép mỗi dữ liệu sau với kiểu dữ liệu thích hợp.',
    maxScore: 10,
    matchLeft: ['Tin học', '3.141592'],
    matchRight: [
      { id: 'Xâu kí tự', label: 'Xâu kí tự' },
      { id: 'Số', label: 'Số' },
      { id: 'Logic', label: 'Logic' },
    ],
  },
  {
    id: 'SGK_A2',
    group: 'A',
    groupLabel: 'Nhóm A – Kiểu dữ liệu',
    numberLabel: 'Câu 2 (SGK)',
    type: 'expression_table',
    typeLabel: 'Tính kết quả biểu thức',
    prompt: 'Cho bảng tính có ô A1 = 3, B1 = 5. Xác định kết quả và kiểu dữ liệu của các công thức tại C1, C2, C3.',
    maxScore: 15,
  },
  {
    id: 'SGK_A3',
    group: 'A',
    groupLabel: 'Nhóm A – Kiểu dữ liệu',
    numberLabel: 'Câu 3 (SGK)',
    type: 'matching',
    typeLabel: 'Ghép cột',
    prompt: 'Ghép các phép toán với kiểu dữ liệu tương ứng.',
    maxScore: 15,
    matchLeft: ['Cộng, trừ, nhân, chia', 'JOIN', 'So sánh, AND, OR, NOT'],
    matchRight: [
      { id: 'Số', label: 'Số' },
      { id: 'Xâu kí tự', label: 'Xâu kí tự' },
      { id: 'Logic', label: 'Logic' },
    ],
  },
  {
    id: 'SGK_A4',
    group: 'A',
    groupLabel: 'Nhóm A – Kiểu dữ liệu',
    numberLabel: 'Câu 4 (SGK)',
    type: 'multi_choice',
    typeLabel: 'Chọn nhiều đáp án đúng',
    prompt: 'Chọn tất cả các phát biểu ĐÚNG về phép toán logic:',
    maxScore: 15,
    options: [
      { id: 'and_both', label: 'AND đúng khi cả hai điều kiện đều đúng.' },
      { id: 'or_one', label: 'OR đúng khi ít nhất một điều kiện đúng.' },
      { id: 'not_invert', label: 'NOT đảo ngược giá trị logic.' },
      { id: 'and_one', label: 'AND đúng khi chỉ cần một điều kiện đúng.' },
    ],
  },
  // NHÓM B – HẰNG, BIẾN, BIỂU THỨC
  {
    id: 'SGK_B5',
    group: 'B',
    groupLabel: 'Nhóm B – Hằng, Biến, Biểu thức',
    numberLabel: 'Câu 5 (SGK)',
    type: 'single_choice',
    typeLabel: 'Chọn một đáp án đúng',
    prompt: 'Chọn phát biểu mô tả đúng về biến trong lập trình:',
    maxScore: 10,
    options: [
      { id: 'var_const', label: 'Biến là giá trị không bao giờ thay đổi khi chạy chương trình.' },
      { id: 'var_mutable', label: 'Biến dùng để lưu trữ giá trị có thể thay đổi trong khi thực hiện chương trình.' },
      { id: 'var_op', label: 'Biến chỉ là phép toán cộng, trừ, nhân, chia.' },
    ],
  },
  {
    id: 'SGK_B6',
    group: 'B',
    groupLabel: 'Nhóm B – Hằng, Biến, Biểu thức',
    numberLabel: 'Câu 6 (SGK)',
    type: 'drag_drop',
    typeLabel: 'Kéo thả phân loại',
    prompt: 'Phân loại các giá trị sau vào đúng nhóm hằng:',
    maxScore: 15,
    dragItems: ['3.14', '"Xin chào!"', 'true'],
    dropZones: ['Hằng số', 'Hằng xâu kí tự', 'Hằng logic'],
  },
  {
    id: 'SGK_B7',
    group: 'B',
    groupLabel: 'Nhóm B – Hằng, Biến, Biểu thức',
    numberLabel: 'Câu 7 (SGK)',
    type: 'single_choice',
    typeLabel: 'Chọn một đáp án đúng',
    prompt: 'Chọn định nghĩa đúng của biểu thức:',
    maxScore: 10,
    options: [
      { id: 'expr_text', label: 'Một dãy chữ cái bất kỳ không chứa phép toán.' },
      { id: 'expr_combo', label: 'Sự kết hợp của biến, hằng, dấu ngoặc, phép toán và hàm để trả về một giá trị.' },
      { id: 'expr_name', label: 'Tên của một nhân vật trong Scratch.' },
    ],
  },
  // NHÓM C – LUYỆN TẬP THEO SGK
  {
    id: 'SGK_C_EXPR',
    group: 'C',
    groupLabel: 'Nhóm C – Luyện tập theo SGK',
    numberLabel: 'Luyện tập (SGK)',
    type: 'expression_table',
    typeLabel: 'Tính kết quả biểu thức',
    prompt: 'Với r = 5, hãy xác định kết quả và kiểu dữ liệu của ba biểu thức sau:',
    maxScore: 15,
  },
  {
    id: 'SGK_C8_PRACTICE',
    group: 'C',
    groupLabel: 'Nhóm C – Luyện tập theo SGK',
    numberLabel: 'Câu 8 – Thực hành',
    type: 'circle_practice',
    typeLabel: 'Bài thực hành tính toán',
    prompt: 'Nhập bán kính r (không âm), tính chu vi C = 2 × 3.14 × r và diện tích S = 3.14 × r × r, đồng thời xác định kiểu dữ liệu của kết quả.',
    maxScore: 20,
  },
  // 5 CÂU HỎI MỞ RỘNG
  {
    id: 'EXT_1',
    group: 'EXT',
    groupLabel: '5 Câu hỏi mở rộng',
    numberLabel: 'Mở rộng 1',
    type: 'single_choice',
    typeLabel: 'Chọn một đáp án đúng',
    prompt: 'Giá trị “Computer” thuộc kiểu dữ liệu nào?',
    maxScore: 10,
    options: [
      { id: 'A', label: 'A. Số.' },
      { id: 'B', label: 'B. Xâu kí tự.' },
      { id: 'C', label: 'C. Logic.' },
    ],
  },
  {
    id: 'EXT_2',
    group: 'EXT',
    groupLabel: '5 Câu hỏi mở rộng',
    numberLabel: 'Mở rộng 2',
    type: 'multi_choice',
    typeLabel: 'Chọn nhiều đáp án đúng',
    prompt: 'Chọn ba phép toán logic trong danh sách sau:',
    maxScore: 15,
    options: [
      { id: 'A', label: 'A. AND' },
      { id: 'B', label: 'B. OR' },
      { id: 'C', label: 'C. NOT' },
      { id: 'D', label: 'D. JOIN' },
      { id: 'E', label: 'E. Cộng' },
    ],
  },
  {
    id: 'EXT_3',
    group: 'EXT',
    groupLabel: '5 Câu hỏi mở rộng',
    numberLabel: 'Mở rộng 3',
    type: 'drag_drop',
    typeLabel: 'Kéo thả phân loại',
    prompt: 'Kéo thả (hoặc chạm chọn) để phân loại các giá trị vào đúng ba nhóm dữ liệu:',
    maxScore: 15,
    dragItems: ['15', '3.141592', '@', 'Computer', 'true', 'false'],
    dropZones: ['Số', 'Xâu kí tự', 'Logic'],
  },
  {
    id: 'EXT_4',
    group: 'EXT',
    groupLabel: '5 Câu hỏi mở rộng',
    numberLabel: 'Mở rộng 4',
    type: 'fill_blank',
    typeLabel: 'Điền từ còn thiếu',
    prompt: 'Điền hai cụm từ thích hợp vào chỗ trống:',
    maxScore: 10,
    blankTemplate:
      'Biến lưu trữ giá trị có thể [1] trong quá trình thực hiện chương trình. Hằng là giá trị [2] trong quá trình thực hiện chương trình.',
  },
  {
    id: 'EXT_5',
    group: 'EXT',
    groupLabel: '5 Câu hỏi mở rộng',
    numberLabel: 'Mở rộng 5',
    type: 'matching',
    typeLabel: 'Ghép cột',
    prompt: 'Ghép khái niệm ở Cột A với mô tả đúng ở Cột B:',
    maxScore: 15,
    matchLeft: ['Biến', 'Hằng', 'Biểu thức'],
    matchRight: [
      { id: 'constant', label: 'Giá trị không thay đổi khi chương trình thực hiện.' },
      { id: 'change', label: 'Giá trị có thể thay đổi trong khi thực hiện chương trình.' },
      { id: 'expression', label: 'Sự kết hợp của biến, hằng, phép toán và các thành phần khác để trả lại một giá trị.' },
    ],
  },
];

export const DEFAULT_GROUPS: TeamGroup[] = [
  { group_id: 'G1', group_name: 'NHÓM 1 – NHÀ KHOA HỌC DỮ LIỆU', members: [], group_score: 0 },
  { group_id: 'G2', group_name: 'NHÓM 2 – BIỆT ĐỘI BIỂU THỨC', members: [], group_score: 0 },
  { group_id: 'G3', group_name: 'NHÓM 3 – THÁM TỬ LOGIC', members: [], group_score: 0 },
  { group_id: 'G4', group_name: 'NHÓM 4 – LẬP TRÌNH VIÊN NHÍ', members: [], group_score: 0 },
];

export const DEFAULT_ASSIGNMENTS: GroupAssignment[] = [
  {
    assignment_id: 'ASM_1',
    group_id: 'G1',
    title: 'GIẢI MÃ THẾ GIỚI DỮ LIỆU',
    description:
      'Phân loại các dữ liệu 15, 3.141592, @, Computer, true, false vào ba nhóm: Số, Xâu kí tự, Logic và giải thích vì sao mỗi giá trị thuộc nhóm đó.',
    questions: [
      'Phân loại 15, 3.141592 vào nhóm Số',
      'Phân loại @, Computer vào nhóm Xâu kí tự',
      'Phân loại true, false vào nhóm Logic',
      'Giải thích vì sao mỗi giá trị thuộc nhóm đó',
    ],
    max_score: 30,
    status: 'Đang mở',
  },
  {
    assignment_id: 'ASM_2',
    group_id: 'G2',
    title: 'GIẢI MÃ BA PHÉP TOÁN',
    description:
      'Cho A1 = 3, B1 = 5. Tính A1+B1, xác định kết quả của A1&B1, xác định kết quả của A1<B1 và ghi rõ kiểu dữ liệu tương ứng.',
    questions: [
      'Tính A1 + B1 và ghi rõ kiểu dữ liệu',
      'Xác định kết quả của A1 & B1 và ghi rõ kiểu dữ liệu',
      'Xác định kết quả của A1 < B1 và ghi rõ kiểu dữ liệu',
    ],
    max_score: 30,
    status: 'Đang mở',
  },
];

export const DEFAULT_TEAM_QUESTIONS: TeamQuestion[] = [
  {
    question_id: 'TEAM_Q1',
    assignment_id: 'ASM_1',
    question_text: 'Trong các giá trị: 15, 3.141592, @, Computer, true, false — nhóm nào chứa 15 và 3.141592?',
    question_type: 'single_choice',
    options: ['Số', 'Xâu kí tự', 'Logic'],
    correct_answer: 'Số',
    points: 15,
    explanation: '15 là số nguyên và 3.141592 là số thập phân nên đều thuộc kiểu Số.',
  },
  {
    question_id: 'TEAM_Q2',
    assignment_id: 'ASM_1',
    question_text: 'Giá trị "@" và "Computer" thuộc kiểu dữ liệu nào?',
    question_type: 'single_choice',
    options: ['Số', 'Xâu kí tự', 'Logic'],
    correct_answer: 'Xâu kí tự',
    points: 15,
    explanation: 'Kí tự @ và chuỗi chữ "Computer" thuộc kiểu xâu kí tự.',
  },
  {
    question_id: 'TEAM_Q3',
    assignment_id: 'ASM_2',
    question_text: 'Với A1 = 3, B1 = 5, biểu thức A1 & B1 cho kết quả nào?',
    question_type: 'single_choice',
    options: ['8 (Kiểu Số)', '35 (Kiểu Xâu kí tự)', 'TRUE (Kiểu Logic)'],
    correct_answer: '35 (Kiểu Xâu kí tự)',
    points: 15,
    explanation: 'Phép toán & nối hai giá trị thành xâu kí tự "35".',
  },
  {
    question_id: 'TEAM_Q4',
    assignment_id: 'ASM_2',
    question_text: 'Với A1 = 3, B1 = 5, biểu thức A1 < B1 cho kết quả nào?',
    question_type: 'single_choice',
    options: ['TRUE (Kiểu Logic)', 'FALSE (Kiểu Logic)', '2 (Kiểu Số)'],
    correct_answer: 'TRUE (Kiểu Logic)',
    points: 15,
    explanation: 'Vì 3 nhỏ hơn 5 là đúng nên A1 < B1 trả về TRUE (kiểu Logic).',
  },
];
