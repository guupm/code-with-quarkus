// 다크/라이트 모드 토글 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const themeBtn = document.getElementById('themeToggleBtn');
    
    // 1. 페이지 로드 시 저장된 테마를 불러와 적용
    if (localStorage.getItem('theme') === 'light') {
        applyLightTheme();
    }

    // 2. 버튼 클릭 이벤트 연결
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
});

function toggleTheme() {
    const body = document.body;
    
    // 현재 라이트 모드인지 확인
    if (body.classList.contains('light-mode')) {
        // 다크 모드로 전환
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark'); // 상태 저장
        updateUI(false);
    } else {
        // 라이트 모드로 전환
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light'); // 상태 저장
        updateUI(true);
    }
}

// 라이트 모드를 강제로 적용하는 함수
function applyLightTheme() {
    document.body.classList.add('light-mode');
    updateUI(true);
}

// 화면 요소(버튼, 네비바)를 변경하는 공통 함수
function updateUI(isLight) {
    const btn = document.getElementById('themeToggleBtn');
    const navbar = document.querySelector('.navbar');
    if (!btn || !navbar) return;

    if (isLight) {
        btn.textContent = 'LIGHT';
        navbar.classList.remove('navbar-dark', 'bg-dark');
        navbar.classList.add('navbar-light', 'bg-light');
    } else {
        btn.textContent = 'DARK';
        navbar.classList.remove('navbar-light', 'bg-light');
        navbar.classList.add('navbar-dark', 'bg-dark');
    }
}