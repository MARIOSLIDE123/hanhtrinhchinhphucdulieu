/**
 * ============================================================================
 * DATA ADVENTURE – BÀI 13: BIỂU DIỄN DỮ LIỆU
 * GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * ============================================================================
 * Kiến trúc: FRONTEND APP -> GOOGLE APPS SCRIPT (Web App) -> GOOGLE SHEETS
 *
 * HƯỚNG DẪN NHANH:
 * 1. Tạo Google Spreadsheet mới.
 * 2. Vào Tiện ích mở rộng -> Apps Script -> Dán toàn bộ mã này vào Code.gs.
 * 3. Chạy hàm setupDatabase() một lần để tạo đủ 6 trang tính & cấu hình mặc định.
 *    (Hoặc khi gọi API lần đầu, hệ thống cũng tự động kiểm tra và khởi tạo).
 * 4. Triển khai -> Tùy chọn triển khai mới -> Ứng dụng web:
 *    - Thực thi dưới dạng: Tôi (Me)
 *    - Người có quyền truy cập: Bất kỳ ai (Anyone)
 * 5. Sao chép URL Web App và dán vào Cài đặt Giáo viên trong ứng dụng.
 */

var SHEET_NAMES = {
  STUDENTS: 'STUDENTS',
  ATTEMPTS: 'ATTEMPTS',
  GROUPS: 'GROUPS',
  GROUP_ASSIGNMENTS: 'GROUP_ASSIGNMENTS',
  APP_CONFIG: 'APP_CONFIG',
  QUESTION_BANK: 'QUESTION_BANK'
};

var HEADERS = {
  STUDENTS: [
    'student_id',
    'full_name',
    'display_name',
    'school',
    'class',
    'join_time',
    'last_active',
    'total_score',
    'total_correct',
    'total_attempts'
  ],
  ATTEMPTS: [
    'attempt_id',
    'student_id',
    'question_id',
    'question_type',
    'answer',
    'is_correct',
    'score',
    'duration',
    'submitted_at'
  ],
  GROUPS: ['group_id', 'group_name', 'student_id', 'updated_at'],
  GROUP_ASSIGNMENTS: [
    'assignment_id',
    'group_id',
    'title',
    'description',
    'questions',
    'max_score',
    'status',
    'created_at'
  ],
  APP_CONFIG: ['config_key', 'config_value', 'updated_at'],
  QUESTION_BANK: [
    'question_id',
    'assignment_id',
    'question_text',
    'question_type',
    'options_json',
    'correct_answer',
    'points',
    'explanation',
    'updated_at'
  ]
};

/**
 * Khởi tạo Spreadsheet & Script Properties mặc định
 * Giáo viên có thể chạy hàm này trực tiếp từ trình soạn thảo Apps Script.
 */
function setupDatabase() {
  var props = PropertiesService.getScriptProperties();
  var ss = getSpreadsheet_();
  props.setProperty('SPREADSHEET_ID', ss.getId());

  if (!props.getProperty('TEACHER_PASSWORD')) {
    props.setProperty('TEACHER_PASSWORD', '2026');
  }

  ensureAllSheets_(ss);
  return {
    ok: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    message: 'Khởi tạo thành công 6 trang tính DATA ADVENTURE!'
  };
}

function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SPREADSHEET_ID');
  if (sheetId) {
    try {
      return SpreadsheetApp.openById(sheetId);
    } catch (e) {
      // Fallback nếu ID cũ không hợp lệ
    }
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    props.setProperty('SPREADSHEET_ID', active.getId());
    return active;
  }
  throw new Error('Không tìm thấy Google Spreadsheet. Vui lòng chạy setupDatabase() trong file Google Sheets.');
}

function ensureAllSheets_(ss) {
  Object.keys(SHEET_NAMES).forEach(function (key) {
    var name = SHEET_NAMES[key];
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold').setBackground('#E6F3FF');
      sheet.setFrozenRows(1);
    }
  });

  seedDefaultsIfEmpty_(ss);
}

function seedDefaultsIfEmpty_(ss) {
  var now = new Date().toISOString();

  // Seed APP_CONFIG
  var configSheet = ss.getSheetByName(SHEET_NAMES.APP_CONFIG);
  if (configSheet.getLastRow() <= 1) {
    configSheet.appendRow(['grade_level', 'Tin học 7', now]);
    configSheet.appendRow(['subject_name', 'Tin học', now]);
    configSheet.appendRow(['lesson_title', 'Bài 13: Biểu diễn dữ liệu', now]);
  }

  // Seed GROUPS (4 nhóm mẫu)
  var groupsSheet = ss.getSheetByName(SHEET_NAMES.GROUPS);
  if (groupsSheet.getLastRow() <= 1) {
    groupsSheet.appendRow(['G1', 'NHÓM 1 – NHÀ KHOA HỌC DỮ LIỆU', '', now]);
    groupsSheet.appendRow(['G2', 'NHÓM 2 – BIỆT ĐỘI BIỂU THỨC', '', now]);
    groupsSheet.appendRow(['G3', 'NHÓM 3 – THÁM TỬ LOGIC', '', now]);
    groupsSheet.appendRow(['G4', 'NHÓM 4 – LẬP TRÌNH VIÊN NHÍ', '', now]);
  }

  // Seed GROUP_ASSIGNMENTS (2 nhiệm vụ mẫu)
  var assignSheet = ss.getSheetByName(SHEET_NAMES.GROUP_ASSIGNMENTS);
  if (assignSheet.getLastRow() <= 1) {
    assignSheet.appendRow([
      'ASM_1',
      'G1',
      'GIẢI MÃ THẾ GIỚI DỮ LIỆU',
      'Phân loại các dữ liệu 15, 3.141592, @, Computer, true, false vào ba nhóm: Số, Xâu kí tự, Logic và giải thích vì sao mỗi giá trị thuộc nhóm đó.',
      JSON.stringify([
        'Phân loại 15, 3.141592 vào nhóm Số',
        'Phân loại @, Computer vào nhóm Xâu kí tự',
        'Phân loại true, false vào nhóm Logic',
        'Giải thích lý do cho từng nhóm'
      ]),
      30,
      'Đang mở',
      now
    ]);
    assignSheet.appendRow([
      'ASM_2',
      'G2',
      'GIẢI MÃ BA PHÉP TOÁN',
      'Cho A1 = 3, B1 = 5. Tính A1+B1, xác định kết quả của A1&B1, xác định kết quả của A1<B1 và ghi rõ kiểu dữ liệu tương ứng.',
      JSON.stringify([
        'Tính A1 + B1 và nêu kiểu dữ liệu',
        'Xác định kết quả A1 & B1 và nêu kiểu dữ liệu',
        'Xác định kết quả A1 < B1 và nêu kiểu dữ liệu'
      ]),
      30,
      'Đang mở',
      now
    ]);
  }

  // Seed QUESTION_BANK (Câu hỏi cho nhiệm vụ nhóm)
  var qbSheet = ss.getSheetByName(SHEET_NAMES.QUESTION_BANK);
  if (qbSheet.getLastRow() <= 1) {
    qbSheet.appendRow([
      'TEAM_Q1',
      'ASM_1',
      'Trong các giá trị: 15, 3.141592, @, Computer, true, false — nhóm nào chứa 15 và 3.141592?',
      'single_choice',
      JSON.stringify(['Số', 'Xâu kí tự', 'Logic']),
      'Số',
      15,
      '15 là số nguyên và 3.141592 là số thập phân nên đều thuộc kiểu Số.',
      now
    ]);
    qbSheet.appendRow([
      'TEAM_Q2',
      'ASM_1',
      'Giá trị "@" và "Computer" thuộc kiểu dữ liệu nào?',
      'single_choice',
      JSON.stringify(['Số', 'Xâu kí tự', 'Logic']),
      'Xâu kí tự',
      15,
      'Kí tự @ và dãy kí tự Computer đều thuộc kiểu xâu kí tự.',
      now
    ]);
    qbSheet.appendRow([
      'TEAM_Q3',
      'ASM_2',
      'Với A1 = 3, B1 = 5, biểu thức A1 & B1 cho kết quả là gì và kiểu dữ liệu nào?',
      'single_choice',
      JSON.stringify(['8 (Kiểu Số)', '35 (Kiểu Xâu kí tự)', 'TRUE (Kiểu Logic)']),
      '35 (Kiểu Xâu kí tự)',
      15,
      'Phép toán & nối hai giá trị thành xâu kí tự "35".',
      now
    ]);
    qbSheet.appendRow([
      'TEAM_Q4',
      'ASM_2',
      'Với A1 = 3, B1 = 5, biểu thức A1 < B1 cho kết quả nào?',
      'single_choice',
      JSON.stringify(['TRUE (Kiểu Logic)', 'FALSE (Kiểu Logic)', '2 (Kiểu Số)']),
      'TRUE (Kiểu Logic)',
      15,
      'Vì 3 < 5 đúng nên phép so sánh trả về giá trị logic TRUE.',
      now
    ]);
  }
}

/* ============================================================================
 * HTTP ENTRY POINTS: doGet(e) & doPost(e)
 * ============================================================================ */

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action || 'ping';
    var ss = getSpreadsheet_();
    ensureAllSheets_(ss);

    switch (action) {
      case 'ping':
        return jsonResponse_({
          ok: true,
          service: 'DATA ADVENTURE Apps Script API',
          timestamp: new Date().toISOString()
        });
      case 'getLeaderboard':
        return jsonResponse_(getLeaderboard_(ss, params.student_id || ''));
      case 'getStudentProfile':
        return jsonResponse_(getStudentProfile_(ss, params.student_id || ''));
      case 'getGroups':
        return jsonResponse_(getGroups_(ss));
      case 'getAssignments':
        return jsonResponse_(getAssignments_(ss));
      case 'getAppConfig':
        return jsonResponse_(getAppConfig_(ss));
      case 'getSharedData':
      case 'getInitialData':
        return jsonResponse_({
          ok: true,
          config: getAppConfig_(ss).config,
          vanDungQuestions: getVanDungQuestions_(ss),
          groups: getGroups_(ss).groups,
          assignments: getAssignments_(ss).assignments,
          questionBank: getQuestionBank_(ss).questions
        });
      default:
        return jsonResponse_({ ok: false, error: 'Action GET không hợp lệ: ' + action });
    }
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message || String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var body = parseRequestBody_(e);
    var action = body.action || '';
    var ss = getSpreadsheet_();
    ensureAllSheets_(ss);

    switch (action) {
      case 'registerStudent':
        return jsonResponse_(registerStudent_(ss, body));
      case 'submitAnswer':
        return jsonResponse_(submitAnswer_(ss, body));
      case 'teacherLogin':
        return jsonResponse_(teacherLogin_(body));
      case 'getTeacherOverview':
        requireTeacherAuth_(body.teacher_token, body.password);
        return jsonResponse_(getTeacherOverview_(ss));
      case 'saveVanDungQuestions':
        requireTeacherAuth_(body.teacher_token, body.password);
        return jsonResponse_(saveVanDungQuestions_(ss, body));
      case 'saveGroups':
        requireTeacherAuth_(body.teacher_token, body.password);
        return jsonResponse_(saveGroups_(ss, body));
      case 'saveAssignment':
        requireTeacherAuth_(body.teacher_token, body.password);
        return jsonResponse_(saveAssignment_(ss, body));
      case 'updateQuestionBank':
        requireTeacherAuth_(body.teacher_token, body.password);
        return jsonResponse_(updateQuestionBank_(ss, body));
      case 'saveAppConfig':
        requireTeacherAuth_(body.teacher_token, body.password);
        return jsonResponse_(saveAppConfig_(ss, body));
      case 'changeTeacherPassword':
        requireTeacherAuth_(body.teacher_token, body.old_password);
        return jsonResponse_(changeTeacherPassword_(body.new_password));
      default:
        return jsonResponse_({ ok: false, error: 'Action POST không hợp lệ: ' + action });
    }
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message || String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (e2) {}
  }
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  return JSON.parse(e.postData.contents);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* ============================================================================
 * STUDENT REGISTRATION & PROFILE
 * ============================================================================ */

function registerStudent_(ss, body) {
  var fullName = String(body.full_name || '').trim();
  var school = String(body.school || '').trim();
  var className = String(body.class_name || body.class || '').trim();
  var requestedId = String(body.student_id || '').trim();

  if (fullName.length < 2 || school.length < 2 || className.length < 1) {
    return { ok: false, error: 'Vui lòng nhập đầy đủ Họ và tên, Trường và Lớp hợp lệ.' };
  }

  var sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  var rows = sheet.getDataRange().getValues();
  var now = new Date().toISOString();
  var displayName = makeDisplayName_(fullName);

  // Kiểm tra trùng student_id hoặc trùng (fullName + school + className) để tránh tạo bản ghi trùng khi reload
  for (var i = 1; i < rows.length; i++) {
    var rowId = String(rows[i][0] || '');
    var rowName = String(rows[i][1] || '').toLowerCase();
    var rowSchool = String(rows[i][3] || '').toLowerCase();
    var rowClass = String(rows[i][4] || '').toLowerCase();

    if (
      (requestedId && rowId === requestedId) ||
      (rowName === fullName.toLowerCase() &&
        rowSchool === school.toLowerCase() &&
        rowClass === className.toLowerCase())
    ) {
      sheet.getRange(i + 1, 7).setValue(now); // last_active
      return {
        ok: true,
        isReturning: true,
        student: rowToStudent_(rows[i], now),
        attempts: getStudentAttempts_(ss, rowId)
      };
    }
  }

  var newId = requestedId || generateUniqueId_('HS');
  var newRow = [newId, fullName, displayName, school, className, now, now, 0, 0, 0];
  sheet.appendRow(newRow);

  return {
    ok: true,
    isReturning: false,
    student: rowToStudent_(newRow, now),
    attempts: []
  };
}

function getStudentProfile_(ss, studentId) {
  if (!studentId) {
    return { ok: false, error: 'Thiếu student_id.' };
  }
  var sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(studentId)) {
      return {
        ok: true,
        student: rowToStudent_(rows[i]),
        attempts: getStudentAttempts_(ss, studentId)
      };
    }
  }
  return { ok: false, error: 'Không tìm thấy hồ sơ học sinh.' };
}

function getStudentAttempts_(ss, studentId) {
  var sheet = ss.getSheetByName(SHEET_NAMES.ATTEMPTS);
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(studentId)) {
      list.push({
        attempt_id: rows[i][0],
        student_id: rows[i][1],
        question_id: rows[i][2],
        question_type: rows[i][3],
        answer: rows[i][4],
        is_correct: rows[i][5] === true || rows[i][5] === 'TRUE',
        score: Number(rows[i][6] || 0),
        duration: Number(rows[i][7] || 0),
        submitted_at: rows[i][8]
      });
    }
  }
  return list;
}

/* ============================================================================
 * SERVER-SIDE ANSWER VERIFICATION & SCORING
 * ============================================================================ */

function submitAnswer_(ss, body) {
  var studentId = String(body.student_id || '').trim();
  var questionId = String(body.question_id || '').trim();
  var questionType = String(body.question_type || '').trim();
  var submissionNonce = String(body.submission_nonce || '').trim();
  var duration = Math.max(0, Number(body.duration || 0));
  var answer = body.answer;

  if (!studentId || !questionId) {
    return { ok: false, error: 'Thiếu thông tin student_id hoặc question_id.' };
  }

  // Kiểm tra học sinh tồn tại, nếu chưa có (ví dụ do lỗi mạng trước đó) thì tự động tạo mới để không mất điểm
  var studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  var studentRows = studentSheet.getDataRange().getValues();
  var studentRowIndex = -1;
  for (var i = 1; i < studentRows.length; i++) {
    if (String(studentRows[i][0]) === studentId) {
      studentRowIndex = i + 1;
      break;
    }
  }
  if (studentRowIndex === -1) {
    var fullName = String(body.full_name || 'Học sinh').trim();
    var displayName = makeDisplayName_(fullName);
    var school = String(body.school || 'Trường THCS').trim();
    var className = String(body.class_name || '7A').trim();
    var nowStr = new Date().toISOString();
    studentSheet.appendRow([studentId, fullName, displayName, school, className, nowStr, nowStr, 0, 0, 0]);
    studentRowIndex = studentSheet.getLastRow();
    studentRows = studentSheet.getDataRange().getValues();
  }

  var attemptSheet = ss.getSheetByName(SHEET_NAMES.ATTEMPTS);
  var attemptRows = attemptSheet.getDataRange().getValues();

  // Chống gửi trùng một lần nộp (nonce) và kiểm tra xem câu hỏi đã đạt điểm tối đa trước đó chưa
  var previousMaxScore = 0;
  for (var j = 1; j < attemptRows.length; j++) {
    if (submissionNonce && String(attemptRows[j][0]) === submissionNonce) {
      return {
        ok: true,
        duplicate: true,
        message: 'Lần nộp này đã được ghi nhận trước đó.',
        student: rowToStudent_(studentRows[studentRowIndex - 1])
      };
    }
    if (String(attemptRows[j][1]) === studentId && String(attemptRows[j][2]) === questionId) {
      var prevScore = Number(attemptRows[j][6] || 0);
      if (prevScore > previousMaxScore) previousMaxScore = prevScore;
    }
  }

  // Chấm điểm phía máy chủ với Fallback thông minh (Universal scoring)
  var gradeResult = gradeQuestionOnServer_(ss, questionId, answer);
  if (!gradeResult.found) {
    if (body.score !== undefined) {
      gradeResult = {
        found: true,
        type: questionType || 'custom',
        isCorrect: body.is_correct === true || String(body.is_correct) === 'true',
        score: Number(body.score || 0),
        maxScore: Number(body.max_score || 20),
        explanation: String(body.explanation || '')
      };
    } else {
      return { ok: false, error: 'Mã câu hỏi không tồn tại trên máy chủ: ' + questionId };
    }
  }

  // Chỉ cộng phần chênh lệch nếu lần này cao hơn (không cộng điểm lặp lại khi gửi nhiều lần)
  var awardedDelta = Math.max(0, gradeResult.score - previousMaxScore);
  var now = new Date().toISOString();
  var attemptId = submissionNonce || generateUniqueId_('ATT');

  attemptSheet.appendRow([
    attemptId,
    studentId,
    questionId,
    questionType || gradeResult.type,
    typeof answer === 'string' ? answer : JSON.stringify(answer),
    gradeResult.isCorrect,
    gradeResult.score,
    duration,
    now
  ]);

  // Tính lại tổng điểm từ ATTEMPTS để đảm bảo tính toàn vẹn, không thể tự sửa điểm
  var totals = recalculateStudentTotals_(ss, studentId);
  studentSheet.getRange(studentRowIndex, 7).setValue(now);
  studentSheet.getRange(studentRowIndex, 8).setValue(totals.totalScore);
  studentSheet.getRange(studentRowIndex, 9).setValue(totals.totalCorrect);
  studentSheet.getRange(studentRowIndex, 10).setValue(totals.totalAttempts);

  var updatedStudentRows = studentSheet.getDataRange().getValues();

  return {
    ok: true,
    attempt_id: attemptId,
    is_correct: gradeResult.isCorrect,
    score: gradeResult.score,
    awarded_delta: awardedDelta,
    max_score: gradeResult.maxScore,
    explanation: gradeResult.explanation,
    student: rowToStudent_(updatedStudentRows[studentRowIndex - 1])
  };
}

function recalculateStudentTotals_(ss, studentId) {
  var sheet = ss.getSheetByName(SHEET_NAMES.ATTEMPTS);
  var rows = sheet.getDataRange().getValues();
  var bestByQuestion = {};
  var totalAttempts = 0;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(studentId)) {
      totalAttempts++;
      var qId = String(rows[i][2]);
      var sc = Number(rows[i][6] || 0);
      var ok = rows[i][5] === true || rows[i][5] === 'TRUE';
      if (!bestByQuestion[qId] || sc > bestByQuestion[qId].score) {
        bestByQuestion[qId] = { score: sc, correct: ok };
      } else if (ok) {
        bestByQuestion[qId].correct = true;
      }
    }
  }

  var totalScore = 0;
  var totalCorrect = 0;
  Object.keys(bestByQuestion).forEach(function (qId) {
    totalScore += bestByQuestion[qId].score;
    if (bestByQuestion[qId].correct) totalCorrect++;
  });

  return {
    totalScore: totalScore,
    totalCorrect: totalCorrect,
    totalAttempts: totalAttempts
  };
}

function gradeQuestionOnServer_(ss, questionId, answer) {
  // 1. Thử thách Vận dụng 1 (Chọn 1 đáp án)
  if (questionId === 'VD_Q1') {
    var ok1 = normalize_(answer) === 'c' || normalize_(answer) === 'computer';
    return {
      found: true,
      type: 'single_choice',
      isCorrect: ok1,
      score: ok1 ? 20 : 0,
      maxScore: 20,
      explanation: ok1
        ? 'Chính xác! Computer là dữ liệu thuộc kiểu xâu kí tự.'
        : 'Chưa chính xác! Hãy nhớ rằng kiểu xâu kí tự bao gồm kí tự hoặc chuỗi kí tự.'
    };
  }

  // 2. Thử thách Vận dụng 2 (Chọn nhiều đáp án)
  if (questionId === 'VD_Q2') {
    var selected = Array.isArray(answer) ? answer.map(function(s) { return String(s).toUpperCase(); }) : [];
    var correctArr = ['A', 'B', 'C'];
    var cHits = 0;
    var wHits = 0;
    selected.forEach(function(item) {
      if (correctArr.indexOf(item) !== -1) cHits++;
      else wHits++;
    });
    var net = Math.max(0, cHits - wHits);
    var score2 = Math.round((net / correctArr.length) * 20);
    var isExact = cHits === correctArr.length && wHits === 0;
    return {
      found: true,
      type: 'multi_choice',
      isCorrect: isExact,
      score: score2,
      maxScore: 20,
      explanation: isExact
        ? 'Hoàn thành! AND, OR, NOT là ba phép toán logic trong Scratch.'
        : 'Chưa chính xác! AND, OR, NOT là ba phép toán logic trong Scratch.'
    };
  }

  // 3. Thử thách Vận dụng 3 (Kéo thả vào ô trống)
  if (questionId === 'VD_Q3') {
    var aObj = (typeof answer === 'object' && answer !== null) ? answer : {};
    var b1 = normalize_(aObj.blank1) === 'thay đổi';
    var b2 = normalize_(aObj.blank2) === 'không đổi';
    var sc3 = (b1 ? 10 : 0) + (b2 ? 10 : 0);
    return {
      found: true,
      type: 'drag_drop',
      isCorrect: b1 && b2,
      score: sc3,
      maxScore: 20,
      explanation: (b1 && b2)
        ? 'Rất tốt! Biến có thể thay đổi giá trị, còn hằng không thay đổi trong quá trình chương trình thực hiện.'
        : 'Hãy chú ý: Biến có thể thay đổi, còn Hằng là giá trị không đổi trong quá trình thực hiện.'
    };
  }

  // 4. Thử thách Vận dụng 4 (Điền biểu thức)
  if (questionId === 'VD_Q4') {
    var clean = normalize_(answer).replace(/\s+/g, '').replace(':', '/');
    var isRight = clean === '360/n' || clean === '(360/n)';
    return {
      found: true,
      type: 'fill_blank',
      isCorrect: isRight,
      score: isRight ? 20 : 0,
      maxScore: 20,
      explanation: isRight
        ? 'Chính xác! Biểu thức 360/n giúp xác định góc quay khi nhân vật vẽ hình có n cạnh.'
        : 'Hãy thử lại! Để vẽ hình có n cạnh đều, góc quay được tính bằng 360 chia cho n.'
    };
  }

  // 5. Thử thách Vận dụng 5 (Ghép đôi)
  if (questionId === 'VD_Q5') {
    var mObj = (typeof answer === 'object' && answer !== null) ? answer : {};
    var m1 = normalize_(mObj['1']) === 'c' || normalize_(mObj['1']) === 'kiểu số';
    var m2 = normalize_(mObj['2']) === 'a' || normalize_(mObj['2']) === 'kiểu xâu kí tự';
    var m3 = normalize_(mObj['3']) === 'b' || normalize_(mObj['3']) === 'kiểu logic';
    var hits = (m1 ? 1 : 0) + (m2 ? 1 : 0) + (m3 ? 1 : 0);
    var fScore = hits === 3 ? 20 : Math.round((hits / 3) * 20);
    return {
      found: true,
      type: 'matching',
      isCorrect: hits === 3,
      score: fScore,
      maxScore: 20,
      explanation: (hits === 3)
        ? 'Xuất sắc! Bạn đã kết nối chính xác các phép toán với kiểu dữ liệu tương ứng.'
        : 'Nhóm 1 (+, -, ×, /) -> Kiểu số (C); Nhóm 2 (JOIN) -> Kiểu xâu kí tự (A); Nhóm 3 (So sánh & Logic) -> Kiểu logic (B).'
    };
  }

  // 6. Thưởng hoàn thành chặng học tập & toàn bài (tương thích ngược)
  if (questionId === 'LESSON_COMPLETE_BONUS') {
    return {
      found: true,
      type: 'lesson_bonus',
      isCorrect: true,
      score: 30,
      maxScore: 30,
      explanation: 'Hoàn thành toàn bộ Bài 13 (+30 điểm).'
    };
  }

  // 2. Bộ câu hỏi SGK & 5 câu mở rộng (chuẩn xác tuyệt đối phía máy chủ)
  var keyMap = {
    SGK_A1: function (ans) {
      var ok1 = normalize_(ans && ans['Tin học']) === 'xâu kí tự';
      var ok2 = normalize_(ans && ans['3.141592']) === 'số';
      var count = (ok1 ? 1 : 0) + (ok2 ? 1 : 0);
      return {
        isCorrect: count === 2,
        score: Math.round((count / 2) * 10),
        maxScore: 10,
        explanation: '"Tin học" là xâu kí tự; 3.141592 là số thập phân thuộc kiểu số.'
      };
    },
    SGK_A2: function (ans) {
      var c1 = normalize_(ans && ans.c1) === '8';
      var c2v = normalize_(ans && ans.c2_val) === '35';
      var c2t = normalize_(ans && ans.c2_type) === 'xâu kí tự';
      var c3v = normalize_(ans && ans.c3_val) === 'true';
      var c3t = normalize_(ans && ans.c3_type) === 'logic';
      var hits = (c1 ? 1 : 0) + (c2v && c2t ? 1 : 0) + (c3v && c3t ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'A1+B1 = 8 (Số); A1&B1 = "35" (Xâu kí tự); A1<B1 = TRUE (Logic).'
      };
    },
    SGK_A3: function (ans) {
      var ok1 = normalize_(ans && ans['Cộng, trừ, nhân, chia']) === 'số';
      var ok2 = normalize_(ans && ans['JOIN']) === 'xâu kí tự';
      var ok3 = normalize_(ans && ans['So sánh, AND, OR, NOT']) === 'logic';
      var hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'Số dùng +, -, ×, /; Xâu kí tự dùng JOIN; Logic dùng so sánh và AND, OR, NOT.'
      };
    },
    SGK_A4: function (ans) {
      return gradeMultiChoice_(
        ans,
        ['and_both', 'or_one', 'not_invert'],
        15,
        'AND đúng khi cả hai điều kiện đúng; OR đúng khi ít nhất một điều kiện đúng; NOT đảo ngược giá trị logic.'
      );
    },
    SGK_B5: function (ans) {
      var ok = String(ans) === 'var_mutable';
      return {
        isCorrect: ok,
        score: ok ? 10 : 0,
        maxScore: 10,
        explanation: 'Biến dùng để lưu trữ giá trị có thể thay đổi trong khi thực hiện chương trình.'
      };
    },
    SGK_B6: function (ans) {
      var ok1 = normalize_(ans && ans['3.14']) === 'hằng số';
      var ok2 = normalize_(ans && ans['"Xin chào!"']) === 'hằng xâu kí tự';
      var ok3 = normalize_(ans && ans['true']) === 'hằng logic';
      var hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: '3.14 là hằng số; "Xin chào!" là hằng xâu kí tự; true là hằng logic.'
      };
    },
    SGK_B7: function (ans) {
      var ok = String(ans) === 'expr_combo';
      return {
        isCorrect: ok,
        score: ok ? 10 : 0,
        maxScore: 10,
        explanation: 'Biểu thức là sự kết hợp của biến, hằng, dấu ngoặc, phép toán và hàm để trả về một giá trị.'
      };
    },
    SGK_C_EXPR: function (ans) {
      var aOk = normalize_(ans && ans.a_val) === 'true' && normalize_(ans && ans.a_type) === 'logic';
      var bOk = Number(ans && ans.b_val) === 31.4 && normalize_(ans && ans.b_type) === 'số';
      var cValNorm = normalize_(ans && ans.c_val).replace(/^["“]|["”]$/g, '');
      var cOk = cValNorm === 'chu vi đường tròn là 31.4' && normalize_(ans && ans.c_type) === 'xâu kí tự';
      var hits = (aOk ? 1 : 0) + (bOk ? 1 : 0) + (cOk ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'Với r = 5: r > 0 là TRUE (Logic); 2×3.14×r là 31.4 (Số); JOIN tạo "Chu vi đường tròn là 31.4" (Xâu kí tự).'
      };
    },
    SGK_C8_PRACTICE: function (ans) {
      var r = Number(ans && ans.r);
      var c = Number(ans && ans.c);
      var s = Number(ans && ans.s);
      if (isNaN(r) || r < 0 || isNaN(c) || isNaN(s)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore: 20,
          explanation: 'Bán kính r phải là số không âm và kết quả C, S phải hợp lệ.'
        };
      }
      var expectedC = 2 * 3.14 * r;
      var expectedS = 3.14 * r * r;
      var cOk = Math.abs(c - expectedC) < 0.05;
      var sOk = Math.abs(s - expectedS) < 0.05;
      var hits = (cOk ? 1 : 0) + (sOk ? 1 : 0);
      return {
        isCorrect: hits === 2,
        score: hits * 10,
        maxScore: 20,
        explanation: 'Với r = ' + r + ': Chu vi C = 2×3.14×r = ' + expectedC.toFixed(2) + '; Diện tích S = 3.14×r×r = ' + expectedS.toFixed(2) + ' (Kiểu Số).'
      };
    },
    EXT_1: function (ans) {
      var ok = String(ans) === 'B';
      return {
        isCorrect: ok,
        score: ok ? 10 : 0,
        maxScore: 10,
        explanation: '"Computer" là một dãy các kí tự nên thuộc kiểu Xâu kí tự (B).'
      };
    },
    EXT_2: function (ans) {
      return gradeMultiChoice_(
        ans,
        ['A', 'B', 'C'],
        15,
        'Ba phép toán logic là AND (A), OR (B), NOT (C). JOIN thuộc xâu kí tự và Cộng thuộc kiểu số.'
      );
    },
    EXT_3: function (ans) {
      var expected = {
        '15': 'số',
        '3.141592': 'số',
        '@': 'xâu kí tự',
        'Computer': 'xâu kí tự',
        'true': 'logic',
        'false': 'logic'
      };
      var hits = 0;
      Object.keys(expected).forEach(function (k) {
        if (normalize_(ans && ans[k]) === expected[k]) hits++;
      });
      return {
        isCorrect: hits === 6,
        score: Math.round((hits / 6) * 15),
        maxScore: 15,
        explanation: 'Số: 15, 3.141592; Xâu kí tự: @, Computer; Logic: true, false.'
      };
    },
    EXT_4: function (ans) {
      var b1 = normalize_(ans && ans.blank1) === 'thay đổi';
      var b2 = normalize_(ans && ans.blank2) === 'không đổi';
      var hits = (b1 ? 1 : 0) + (b2 ? 1 : 0);
      return {
        isCorrect: hits === 2,
        score: hits * 5,
        maxScore: 10,
        explanation: 'Biến lưu trữ giá trị có thể thay đổi; Hằng là giá trị không đổi trong quá trình thực hiện chương trình.'
      };
    },
    EXT_5: function (ans) {
      var ok1 = normalize_(ans && ans['Biến']) === 'change';
      var ok2 = normalize_(ans && ans['Hằng']) === 'constant';
      var ok3 = normalize_(ans && ans['Biểu thức']) === 'expression';
      var hits = (ok1 ? 1 : 0) + (ok2 ? 1 : 0) + (ok3 ? 1 : 0);
      return {
        isCorrect: hits === 3,
        score: Math.round((hits / 3) * 15),
        maxScore: 15,
        explanation: 'Biến -> thay đổi; Hằng -> không đổi; Biểu thức -> kết hợp các thành phần để trả lại một giá trị.'
      };
    }
  };

  if (keyMap[questionId]) {
    var res = keyMap[questionId](answer);
    res.found = true;
    res.type = questionId;
    return res;
  }

  // 3. Kiểm tra câu hỏi động trong QUESTION_BANK (nhiệm vụ nhóm do giáo viên quản lý)
  var qbSheet = ss.getSheetByName(SHEET_NAMES.QUESTION_BANK);
  var qbRows = qbSheet.getDataRange().getValues();
  for (var i = 1; i < qbRows.length; i++) {
    if (String(qbRows[i][0]) === questionId) {
      var expectedAns = String(qbRows[i][5] || '');
      var maxPts = Number(qbRows[i][6] || 10);
      var expl = String(qbRows[i][7] || '');
      var isCorrect = normalize_(answer) === normalize_(expectedAns);
      return {
        found: true,
        type: String(qbRows[i][3] || 'team_question'),
        isCorrect: isCorrect,
        score: isCorrect ? maxPts : 0,
        maxScore: maxPts,
        explanation: expl
      };
    }
  }

  return { found: false };
}

function gradeMultiChoice_(ans, correctArr, maxScore, explanation) {
  var selected = Array.isArray(ans) ? ans.map(String) : [];
  var correctCount = 0;
  var wrongCount = 0;

  selected.forEach(function (item) {
    if (correctArr.indexOf(item) !== -1) correctCount++;
    else wrongCount++;
  });

  var net = Math.max(0, correctCount - wrongCount);
  var score = Math.round((net / correctArr.length) * maxScore);
  var isExact = correctCount === correctArr.length && wrongCount === 0;

  return {
    isCorrect: isExact,
    score: score,
    maxScore: maxScore,
    explanation: explanation
  };
}

function normalize_(val) {
  return String(val === undefined || val === null ? '' : val)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/* ============================================================================
 * LEADERBOARD (TOP 10, TOP 50, MY RANK)
 * ============================================================================ */

function getLeaderboard_(ss, currentStudentId) {
  var sheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  var rows = sheet.getDataRange().getValues();
  var entries = [];

  for (var i = 1; i < rows.length; i++) {
    var totalScore = Number(rows[i][7] || 0);
    var totalCorrect = Number(rows[i][8] || 0);
    var totalAttempts = Number(rows[i][9] || 0);
    var accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    entries.push({
      student_id: String(rows[i][0]),
      display_name: String(rows[i][2] || makeDisplayName_(rows[i][1])),
      school: String(rows[i][3]),
      class_name: String(rows[i][4]),
      total_score: totalScore,
      total_correct: totalCorrect,
      total_attempts: totalAttempts,
      accuracy: Math.round(accuracy * 100),
      last_active: String(rows[i][6] || rows[i][5] || '')
    });
  }

  // Xếp hạng: Tổng điểm giảm dần -> Độ chính xác giảm dần -> Thời gian hoàn thành sớm hơn
  entries.sort(function (a, b) {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return String(a.last_active).localeCompare(String(b.last_active));
  });

  var ranked = entries.map(function (item, idx) {
    item.rank = idx + 1;
    return item;
  });

  var myRank = null;
  if (currentStudentId) {
    for (var k = 0; k < ranked.length; k++) {
      if (ranked[k].student_id === currentStudentId) {
        myRank = ranked[k];
        break;
      }
    }
  }

  return {
    ok: true,
    total_students: ranked.length,
    top10: ranked.slice(0, 10),
    top50: ranked.slice(0, 50),
    my_rank: myRank,
    updated_at: new Date().toISOString()
  };
}

/* ============================================================================
 * GROUPS, ASSIGNMENTS, QUESTION BANK & APP CONFIG
 * ============================================================================ */

function getGroups_(ss) {
  var groupSheet = ss.getSheetByName(SHEET_NAMES.GROUPS);
  var studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  var groupRows = groupSheet.getDataRange().getValues();
  var studentRows = studentSheet.getDataRange().getValues();

  var studentMap = {};
  for (var s = 1; s < studentRows.length; s++) {
    studentMap[String(studentRows[s][0])] = {
      student_id: String(studentRows[s][0]),
      display_name: String(studentRows[s][2]),
      school: String(studentRows[s][3]),
      class_name: String(studentRows[s][4]),
      total_score: Number(studentRows[s][7] || 0)
    };
  }

  var groupsById = {};
  for (var i = 1; i < groupRows.length; i++) {
    var gId = String(groupRows[i][0] || '').trim();
    var gName = String(groupRows[i][1] || '').trim();
    var stId = String(groupRows[i][2] || '').trim();
    if (!gId) continue;

    if (!groupsById[gId]) {
      groupsById[gId] = {
        group_id: gId,
        group_name: gName,
        members: [],
        group_score: 0,
        updated_at: String(groupRows[i][3] || '')
      };
    }

    if (stId && studentMap[stId]) {
      var st = studentMap[stId];
      var exists = groupsById[gId].members.some(function (m) {
        return m.student_id === stId;
      });
      if (!exists) {
        groupsById[gId].members.push(st);
        groupsById[gId].group_score += st.total_score;
      }
    }
  }

  return {
    ok: true,
    groups: Object.keys(groupsById).map(function (id) {
      return groupsById[id];
    })
  };
}

function getAssignments_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.GROUP_ASSIGNMENTS);
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var questions = [];
    try {
      questions = JSON.parse(rows[i][4] || '[]');
    } catch (e) {
      questions = String(rows[i][4] || '').split('\n').filter(Boolean);
    }
    list.push({
      assignment_id: String(rows[i][0]),
      group_id: String(rows[i][1]),
      title: String(rows[i][2]),
      description: String(rows[i][3]),
      questions: questions,
      max_score: Number(rows[i][5] || 30),
      status: String(rows[i][6] || 'Đang mở'),
      created_at: String(rows[i][7] || '')
    });
  }
  return { ok: true, assignments: list };
}

function getQuestionBank_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.QUESTION_BANK);
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var opts = [];
    try {
      opts = JSON.parse(rows[i][4] || '[]');
    } catch (e) {}
    list.push({
      question_id: String(rows[i][0]),
      assignment_id: String(rows[i][1]),
      question_text: String(rows[i][2]),
      question_type: String(rows[i][3]),
      options: opts,
      correct_answer: String(rows[i][5]),
      points: Number(rows[i][6] || 10),
      explanation: String(rows[i][7] || ''),
      updated_at: String(rows[i][8] || '')
    });
  }
  return { ok: true, questions: list };
}

function getAppConfig_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.APP_CONFIG);
  var rows = sheet.getDataRange().getValues();
  var cfg = {
    grade_level: 'Tin học 7',
    subject_name: 'Tin học',
    lesson_title: 'Bài 13: Biểu diễn dữ liệu'
  };
  for (var i = 1; i < rows.length; i++) {
    var k = String(rows[i][0]);
    if (k) cfg[k] = String(rows[i][1] || '');
  }
  return { ok: true, config: cfg };
}

/* ============================================================================
 * TEACHER AUTHENTICATION & ADMIN ACTIONS
 * ============================================================================ */

function teacherLogin_(body) {
  var props = PropertiesService.getScriptProperties();
  var savedPassword = props.getProperty('TEACHER_PASSWORD') || '2026';
  var inputPassword = String(body.password || '');

  if (inputPassword !== savedPassword) {
    return { ok: false, error: 'Mật khẩu giáo viên không chính xác.' };
  }

  var token = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature('teacher_auth', savedPassword)
  );
  return {
    ok: true,
    teacher_token: token,
    message: 'Đăng nhập khu vực giáo viên thành công.'
  };
}

function requireTeacherAuth_(token, rawPassword) {
  var props = PropertiesService.getScriptProperties();
  var savedPassword = props.getProperty('TEACHER_PASSWORD') || '2026';
  var expectedToken = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature('teacher_auth', savedPassword)
  );

  if (token && token === expectedToken) return true;
  if (rawPassword && String(rawPassword) === savedPassword) return true;
  throw new Error('Không có quyền giáo viên hoặc phiên đăng nhập đã hết hạn.');
}

function changeTeacherPassword_(newPassword) {
  var clean = String(newPassword || '').trim();
  if (clean.length < 4) {
    return { ok: false, error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' };
  }
  var props = PropertiesService.getScriptProperties();
  props.setProperty('TEACHER_PASSWORD', clean);
  var newToken = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature('teacher_auth', clean)
  );
  return { ok: true, teacher_token: newToken, message: 'Đã cập nhật mật khẩu giáo viên.' };
}

function getTeacherOverview_(ss) {
  var studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  var sRows = studentSheet.getDataRange().getValues();
  var students = [];
  var totalSystemScore = 0;
  var completedStudents = 0;

  for (var i = 1; i < sRows.length; i++) {
    var st = rowToStudent_(sRows[i]);
    students.push(st);
    totalSystemScore += st.total_score;
    if (st.total_correct >= 10) completedStudents++;
  }

  return {
    ok: true,
    stats: {
      total_students: students.length,
      completed_students: completedStudents,
      total_score: totalSystemScore
    },
    students: students,
    vanDungQuestions: getVanDungQuestions_(ss),
    groups: getGroups_(ss).groups,
    assignments: getAssignments_(ss).assignments,
    questionBank: getQuestionBank_(ss).questions,
    config: getAppConfig_(ss).config
  };
}

function getVanDungQuestions_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.QUESTION_BANK);
  var rows = sheet.getDataRange().getValues();
  var vdRows = [];
  for (var i = 1; i < rows.length; i++) {
    var qId = String(rows[i][0]);
    if (qId.indexOf('VD_Q') === 0) {
      try {
        var parsed = JSON.parse(rows[i][4]);
        vdRows.push(parsed);
      } catch (e) {}
    }
  }
  return vdRows;
}

function saveVanDungQuestions_(ss, body) {
  var questions = Array.isArray(body.questions) ? body.questions : [];
  var sheet = ss.getSheetByName(SHEET_NAMES.QUESTION_BANK);
  var now = new Date().toISOString();

  // Xóa các dòng VD_Q cũ
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]).indexOf('VD_Q') === 0) {
      sheet.deleteRow(i + 1);
    }
  }

  // Thêm 5 câu mới
  questions.forEach(function (q) {
    sheet.appendRow([
      String(q.id),
      'VAN_DUNG',
      String(q.prompt || ''),
      String(q.type || 'single_choice'),
      JSON.stringify(q),
      typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer),
      Number(q.points || 20),
      String(q.explanationCorrect || ''),
      now
    ]);
  });

  return { ok: true, questions: questions };
}

function saveGroups_(ss, body) {
  var groups = Array.isArray(body.groups) ? body.groups : [];
  var sheet = ss.getSheetByName(SHEET_NAMES.GROUPS);
  var now = new Date().toISOString();

  // Xóa dữ liệu cũ giữ lại header
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).clearContent();
  }

  var rowsToWrite = [];
  groups.forEach(function (g) {
    var gId = String(g.group_id || generateUniqueId_('G'));
    var gName = String(g.group_name || 'Nhóm mới');
    var members = Array.isArray(g.member_ids)
      ? g.member_ids
      : Array.isArray(g.members)
        ? g.members.map(function (m) { return m.student_id || m; })
        : [];

    if (members.length === 0) {
      rowsToWrite.push([gId, gName, '', now]);
    } else {
      members.forEach(function (stId) {
        rowsToWrite.push([gId, gName, String(stId), now]);
      });
    }
  });

  if (rowsToWrite.length > 0) {
    sheet.getRange(2, 1, rowsToWrite.length, 4).setValues(rowsToWrite);
  }

  return { ok: true, groups: getGroups_(ss).groups };
}

function saveAssignment_(ss, body) {
  var item = body.assignment || body;
  var sheet = ss.getSheetByName(SHEET_NAMES.GROUP_ASSIGNMENTS);
  var rows = sheet.getDataRange().getValues();
  var now = new Date().toISOString();

  var assignmentId = String(item.assignment_id || generateUniqueId_('ASM'));
  var rowData = [
    assignmentId,
    String(item.group_id || 'G1'),
    String(item.title || 'Nhiệm vụ mới'),
    String(item.description || ''),
    JSON.stringify(Array.isArray(item.questions) ? item.questions : []),
    Number(item.max_score || 30),
    String(item.status || 'Đang mở'),
    String(item.created_at || now)
  ];

  var updated = false;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === assignmentId) {
      sheet.getRange(i + 1, 1, 1, 8).setValues([rowData]);
      updated = true;
      break;
    }
  }
  if (!updated) {
    sheet.appendRow(rowData);
  }

  return { ok: true, assignments: getAssignments_(ss).assignments };
}

function updateQuestionBank_(ss, body) {
  var sheet = ss.getSheetByName(SHEET_NAMES.QUESTION_BANK);
  var now = new Date().toISOString();

  if (Array.isArray(body.questions)) {
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).clearContent();
    }
    var rowsToWrite = body.questions.map(function (q) {
      return [
        String(q.question_id || generateUniqueId_('TQ')),
        String(q.assignment_id || 'ASM_1'),
        String(q.question_text || ''),
        String(q.question_type || 'single_choice'),
        JSON.stringify(Array.isArray(q.options) ? q.options : []),
        String(q.correct_answer || ''),
        Number(q.points || 10),
        String(q.explanation || ''),
        now
      ];
    });
    if (rowsToWrite.length > 0) {
      sheet.getRange(2, 1, rowsToWrite.length, 9).setValues(rowsToWrite);
    }
  }

  return { ok: true, questions: getQuestionBank_(ss).questions };
}

function saveAppConfig_(ss, body) {
  var cfg = body.config || {};
  var sheet = ss.getSheetByName(SHEET_NAMES.APP_CONFIG);
  var now = new Date().toISOString();

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).clearContent();
  }

  var rowsToWrite = Object.keys(cfg).map(function (k) {
    return [k, String(cfg[k] || ''), now];
  });
  if (rowsToWrite.length > 0) {
    sheet.getRange(2, 1, rowsToWrite.length, 3).setValues(rowsToWrite);
  }

  return { ok: true, config: getAppConfig_(ss).config };
}

/* ============================================================================
 * HELPERS
 * ============================================================================ */

function rowToStudent_(row, overrideActive) {
  return {
    student_id: String(row[0] || ''),
    full_name: String(row[1] || ''),
    display_name: String(row[2] || makeDisplayName_(row[1])),
    school: String(row[3] || ''),
    class_name: String(row[4] || ''),
    join_time: String(row[5] || ''),
    last_active: overrideActive || String(row[6] || ''),
    total_score: Number(row[7] || 0),
    total_correct: Number(row[8] || 0),
    total_attempts: Number(row[9] || 0)
  };
}

function makeDisplayName_(fullName) {
  var parts = String(fullName || '').trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || 'Học sinh';
  if (parts.length === 2) return parts[0].charAt(0) + '. ' + parts[1];
  return parts[0].charAt(0) + '. ' + parts.slice(-2).join(' ');
}

function generateUniqueId_(prefix) {
  var rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  var ts = new Date().getTime().toString(36).toUpperCase();
  return prefix + '_' + ts + '_' + rand;
}
