window.onload = function() {
    fetch('/profile/info') // 서버에서 사용자 정보 요청, 비동기 i/o
        .then(res => res.json()) // json 파싱
        .then(data => {
            // profileLink가 중복 선언(const)되어 에러가 발생하는 부분을 하나로 정리했습니다.
            const profileLink = document.getElementById('profileNavLink');
            if (profileLink) {
                profileLink.setAttribute('data-bs-title', ' ' + data.username);
                new bootstrap.Tooltip(profileLink);
            }
            
            document.getElementById('infoUsername').textContent = data.username; // DOM 조작방지
            document.getElementById('infoEmail').textContent = data.email;
            document.getElementById('infoPhone').textContent = data.phone;
            
            if (data.profileImage) { // null 체크
                document.getElementById('profileImg').src = '/uploads/profile/' + data.profileImage;
            }

            // 수정 폼에 기존 값 자동 채우기
            document.getElementById('updateEmail').value = data.email;
            document.getElementById('updatePhone').value = data.phone;
        });

    // URL 파라미터 오류 감지
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const success = params.get('success');

    const msgEl = document.getElementById('updateMsg');

    if (success === 'updated') {
        msgEl.className = 'alert alert-success';
        msgEl.textContent = '개인정보가 수정되었습니다.';

    } else if (success === 'password_changed') {
        // Toast 출력
        showToast('비밀번호 변경이 완료되어 로그인 페이지로 이동합니다.', 'success');
        
        // 3.5초 후 로그인 페이지로 이동
        setTimeout(function() {
            window.location.href = '/logout?next=login';
        }, 3500);

    } else if (error === 'duplicate_email') {
        msgEl.className = 'alert alert-danger';
        msgEl.textContent = '이미 사용 중인 이메일입니다.';
    }
    
    if (error === 'wrong_password') {
        // ① Toast 먼저 (즉각 알림)
        showToast('현재 비밀번호가 일치하지 않습니다.', 'danger');
        const pwMsgEl = document.getElementById('pwMsg');
        if (pwMsgEl) {
            pwMsgEl.className = 'alert alert-danger';
            pwMsgEl.textContent = '현재 비밀번호가 일치하지 않습니다.';
        }
    }

    if (error) {
        const messages = {
            'invalid_type': 'jpg, png, gif, webp 파일만 가능합니다.',
            'too_large': '파일 크기는 5MB 이하여야 합니다.',
            'upload_fail': '업로드 실패. 다시 시도해주세요.'
        };
        const msg = messages[error];
        const div = document.getElementById('uploadErrorMsg');
        if (msg && div) {
            div.textContent = msg;
            div.classList.remove('d-none');
        }
    }
};

// ----------------------------------------------------
// 유효성 검사 및 폼 제출 함수 모음
// ----------------------------------------------------

function validateAndUpdate() {
    let valid = true;
    const email = document.getElementById('updateEmail').value.trim();
    const phone = document.getElementById('updatePhone').value.trim();
    
    // ① 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError('updateEmail', 'updateEmailMsg', '올바른 이메일 형식이 아닙니다.');
        valid = false;
    } else {
        clearFieldError('updateEmail');
    }
    
    // ② 연락처 형식 검사
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        showFieldError('updatePhone', 'updatePhoneMsg', '010-0000-0000 형식으로 입력해주세요.');
        valid = false;
    } else {
        clearFieldError('updatePhone');
    }
    
    // 검증 통과 시 폼 제출
    if (valid) document.getElementById('updateForm').submit();
}

// 비밀번호 변경 유효성 검사 함수
async function validateAndChangePassword() {
    let valid = true;
    const currentPw = document.getElementById('currentPwInput').value;
    const newPw = document.getElementById('newPwInput').value;
    const newPwConfirm = document.getElementById('newPwConfirm').value;
    
    // ① 현재 비밀번호 빈값 체크
    if (!currentPw) {
        showFieldError('currentPwInput', 'currentPwMsg', '현재 비밀번호를 입력해주세요.');
        valid = false;
    } else {
        clearFieldError('currentPwInput');
    }
    
    // ② 새 비밀번호 정규식 검사
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!pwRegex.test(newPw)) {
        showFieldError('newPwInput', 'newPwMsg', '8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
        valid = false;
    } else {
        clearFieldError('newPwInput');
    }
    
    // ③ 새 비밀번호 확인 일치
    if (newPw !== newPwConfirm) {
        showFieldError('newPwConfirm', 'newPwConfirmMsg', '새 비밀번호가 일치하지 않습니다.');
        valid = false;
    } else {
        clearFieldError('newPwConfirm');
    }
    
    if (!valid) return;
    
    // ④ 현재/새 비밀번호 SHA-256 해시 생성
    const hashedCurrent = await hashPassword(currentPw);
    const hashedNew = await hashPassword(newPw);
    document.getElementById('currentPassword').value = hashedCurrent;
    document.getElementById('newPassword').value = hashedNew;
    
    // F12 콘솔 확인
    console.log('현재 PW 해시 :', hashedCurrent);
    console.log('새 PW 해시 :', hashedNew);
    
    document.getElementById('pwForm').submit();
}

// ----------------------------------------------------
// 유틸리티 함수 모음
// ----------------------------------------------------

// profile.js 전용 showError / clearError
function showFieldError(fieldId, msgId, message) {
    const field = document.getElementById(fieldId);
    if (field) field.classList.add('is-invalid');
    const msg = document.getElementById(msgId);
    if (msg) msg.textContent = message;
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    }
}

// ----------------------------------------------------
// 비밀번호 SHA-256 암호화 (해시) 함수
// ----------------------------------------------------
async function hashPassword(message) {
    // 1. 문자열을 UTF-8 바이트 배열로 변환
    const msgUint8 = new TextEncoder().encode(message);
    
    // 2. 브라우저 내장 암호화 API를 사용해 SHA-256 해시 생성
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    
    // 3. 버퍼 데이터를 16진수(Hex) 문자열로 변환
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}