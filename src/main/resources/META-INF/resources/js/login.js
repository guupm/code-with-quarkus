function validateAndLogin() {
    let valid = true;

    // 입력값 가져오기
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value;

    // ① 아이디 유효성 검사 (4~20자 영문/숫자만 허용)
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!usernameRegex.test(username)) {
        showError('usernameInput', 'usernameMsg', '아이디는 4~20자 영문/숫자만 입력 가능합니다.');
        valid = false;
    } else {
        clearError('usernameInput');
    }

    // ② 패스워드 유효성 검사 (8자 이상, 영문 + 숫자 + 특수문자 포함)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
        showError('passwordInput', 'passwordMsg', '비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
        valid = false;
    } else {
        clearError('passwordInput');
    }

    // ③ 두 항목 모두 통과 시 로그인 실행
    if (valid) {
        submitLogin();
    }
}

// ── [추가됨] 로그인 전용 에러 메시지 출력 함수 ──
function showError(fieldId, msgId, message) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.add('is-invalid');
    const msg = document.getElementById(msgId);
    if (msg) msg.textContent = message;
}

// ── [추가됨] 로그인 전용 에러 메시지 제거 함수 ──
function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    }
}

// ── [추가됨] 폼 제출 및 비밀번호 암호화(해싱) 함수 ──
async function submitLogin() {
    const passwordRaw = document.getElementById('passwordInput').value;
    
    // input_sha256.js에 있는 해시 함수를 사용하여 비밀번호 암호화
    const hashed = await hashPassword(passwordRaw);
    document.getElementById('password').value = hashed;
    
    console.log('로그인 전송 해시:', hashed);
    
    // 검증이 완료되었으므로 백엔드(/login_check)로 폼 전송
    document.getElementById('loginForm').submit();
}

// 페이지 로딩이 완료된 후 실행
document.addEventListener('DOMContentLoaded', function() {

    const savedTheme = localStorage.getItem('theme');
    
    // toggle.js에 정의된 함수가 존재하는지 확인 후 호출
    if (savedTheme === 'light' && typeof applyLightTheme === 'function') {
        applyLightTheme(); 
    }
    
    // HTML에 있는 아이디와 패스워드 입력창 요소를 가져옵니다.
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');

    // 엔터키 감지 함수
    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 동작(새로고침 등) 방지
            validateAndLogin(); // 클릭과 동일하게 로그인 검증 함수 실행
        }
    }

    // 아이디, 비밀번호 입력창에서 키보드가 눌릴 때마다 감지 함수를 실행
    if (usernameInput) usernameInput.addEventListener('keydown', handleEnterKey);
    if (passwordInput) passwordInput.addEventListener('keydown', handleEnterKey);
});