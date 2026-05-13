function validateAndShowModal() {
    let valid = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const email    = document.getElementById('email').value.trim();
    const phone    = document.getElementById('phone').value.trim();

    // ①아이디: 4~20자영문/숫자
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!usernameRegex.test(username)) {
        showError('username', '아이디는4~20자영문/숫자만가능합니다.');
        valid = false;
    } else {
        clearError('username');
    }

    // ②패스워드: 8자이상, 영문+숫자+특수문자
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
        showError('password', '8자이상, 영문+숫자+특수문자를포함필요.');
        valid = false;
    } else {
        clearError('password');
    }

    // ③패스워드확인
    if (password !== passwordConfirm) {
        showError('passwordConfirm', '패스워드가일치하지않습니다.');
        valid = false;
    } else {
        clearError('passwordConfirm');
    }

    // ④이메일형식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email', '올바른이메일형식이아닙니다.');
        valid = false;
    } else {
        clearError('email');
    }

    // ⑤연락처형식: 010-0000-0000
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        showError('phone', '010-0000-0000 형식으로입력해주세요.');
        valid = false;
    } else {
        clearError('phone');
    }

    // 전체통과시확인모달출력
        if (valid) showConfirmModal();
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('is-invalid');
        const msg = document.getElementById(fieldId + 'Msg');
        if (msg) msg.textContent = message;
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    }

    window.onload= function() {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');

    if (error === 'duplicate_username') {
        showError('username', '이미사용중인아이디입니다.');
    } else if (error === 'duplicate_email') {
        showError('email', '이미사용중인이메일입니다.');
    }
}