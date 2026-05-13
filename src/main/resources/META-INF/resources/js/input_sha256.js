// SHA-256 해시함수(브라우저내장Web Crypto API)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 확인모달출력+ 해시생성
async function showConfirmModal() {
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('email').value.trim();
    const phone    = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;

    // 모달에입력정보표시
    document.getElementById('confirmUsername').textContent = username;
    document.getElementById('confirmEmail').textContent    = email;
    document.getElementById('confirmPhone').textContent    = phone;

    // SHA-256 해시생성→ hidden 필드(id="password")에저장
    const hashed = await hashPassword(password);
    document.getElementById('hashedPassword').value = hashed;

    // F12 콘솔에서해시값확인
    console.log('해시된패스워드:', hashed);

    // Bootstrap 확인모달출력
    const modal = new bootstrap.Modal(
    document.getElementById('confirmModal'));
    modal.show();
}

// 가입하기버튼클릭→ form submit
function submitRegister() {
    // 확인모달닫기
    bootstrap.Modal.getInstance(
        document.getElementById('confirmModal')).hide();
        
    // form submit → POST /register_check 전송
    document.getElementById('registerForm').submit();
}
