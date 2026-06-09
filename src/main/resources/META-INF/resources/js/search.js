// ── 챔피언 데이터 ──────────────────────────────────────────────
const CHAMPIONS = [
    { name: '아트록스', engName: 'Aatrox', role: '전사', lane: '탑', img: 'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Aatrox.png', difficulty: '상' },
    { name: '사일러스', engName: 'Sylas', role: '마법사', lane: '정글/미드', img: 'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Sylas.png', difficulty: '중' },
    { name: '애니비아', engName: 'Anivia', role: '마법사', lane: '미드', img: 'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Anivia.png', difficulty: '상' },
    { name: '브라이어', engName: 'Briar', role: '전사', lane: '정글', img: 'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Briar.png', difficulty: '중' },
    { name: '잭스', engName: 'Jax', role: '전사', lane: '탑', img: 'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jax.png', difficulty: '하' },
    { name: '징크스', engName: 'Jinx', role: '원거리딜러', lane: '원딜', img: 'https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jinx.png', difficulty: '중' },
    { name: '유나라', engName: 'Yunara', role: '전사', lane: '탑/정글', img: '/image/유나라.jpg', difficulty: '중' },
    { name: '자헨', engName: 'Jahen', role: '암살자', lane: '정글/미드', img: '/image/자헨.jpg', difficulty: '상' },
    { name: '멜', engName: 'Mel', role: '마법사', lane: '서포터/미드', img: '/image/멜.jpeg', difficulty: '중' }
];

// ── 뉴스 데이터 ──────────────────────────────────────────────
const NEWS = [
    { title: '새로운 챔피언 출시', desc: '2026 루나 레벨 이벤트! 신규 챔피언과 함께하는 특별한 시즌.', category: '게임업데이트' },
    { title: '패치노트 16.4', desc: '챔피언 밸런스 및 아이템 업데이트 내용을 확인하세요.', category: '패치노트' },
];

// ── 메인 화면으로 돌아가기 ────────────────────────────────────
function showMainScreen() {
    const searchSection = document.getElementById('searchResults');
    if (searchSection) {
        searchSection.style.display = 'none';
        searchSection.classList.add('d-none');
    }
    const heroSection = document.querySelector('.hero');
    if (heroSection) heroSection.classList.remove('d-none');
    
    document.querySelectorAll('section:not(#searchResults)').forEach(s => s.classList.remove('d-none'));
}

// ── 검색 실행 ────────────────────────────────────────────────
function performSearch(query) {
    const q = query.trim().toLowerCase(); 
    if (!q) {
        showMainScreen();
        return;
    }

    // 검색어가 챔피언 이름(또는 영문명)과 정확히 일치하는지 확인
    const exactMatch = CHAMPIONS.find(c => c.name === query.trim() || c.engName.toLowerCase() === q);

    if (exactMatch) {
        // 정확히 일치하는 챔피언이 있으면 모달창 띄우기
        fetch(`./modal/${exactMatch.engName}.html`)
            .then(res => {
                if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
                return res.text();
            })
            .then(data => {
                document.getElementById("modalContent").innerHTML = data;
                
                // 모달창 강제 실행
                const modalElement = document.getElementById('championModal');
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.show();

                // 검색창 글씨 지워주기 (편의성)
                document.getElementById('searchInput').value = '';
            })
            .catch(err => console.error(err));

        showMainScreen(); 
        return; 
    }

    // 정확히 일치하지 않을 때 (예: "전사", "미드") 기존처럼 리스트 보여주기
    document.getElementById('searchKeywordDisplay').textContent = `"${query}"`;

    const champResults = CHAMPIONS.filter(c =>
        c.name.includes(q) || c.engName.toLowerCase().includes(q) ||
        c.role.includes(q) || c.lane.includes(q)
    );

    const newsResults = NEWS.filter(n =>
        n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
    );

    document.getElementById('champCount').textContent = `(${champResults.length})`; 
    document.getElementById('newsCount').textContent = `(${newsResults.length})`;

    const champList = document.getElementById('championResultList'); 
    if (champResults.length === 0) {
        champList.innerHTML = `<div class="no-result"><h4>검색결과 없음</h4><p>"${query}"에 해당하는 챔피언이 없습니다.</p></div>`;
    } else {
        champList.innerHTML = champResults.map(c => `
            <div class="search-result-card d-flex align-items-center p-0 overflow-hidden" 
                 style="background-color: #1e1e1e; color: #fff; margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: transform 0.2s;"
                 onmouseover="this.style.transform='scale(1.02)'"
                 onmouseout="this.style.transform='scale(1)'"
                 data-bs-toggle="modal" 
                 data-bs-target="#championModal" 
                 data-url="./modal/${c.engName}.html">
                <img src="${c.img}" alt="${c.name}" style="width: 80px; height: 80px; object-fit: cover;" onerror="this.src='/image/LOL.png'">
                <div class="p-3">
                    <div style="font-weight:700; font-size:1rem; color:#fff;">${c.name} <span style="color:#aaa; font-size:0.85rem;">(${c.engName})</span></div>
                    <div style="color:#bbb; font-size:0.9rem; margin-top:4px;">역할: ${c.role} &nbsp;|&nbsp; 라인: ${c.lane} &nbsp;|&nbsp; 난이도: ${c.difficulty}</div>
                </div>
            </div>
        `).join('');
    }

    const newsList = document.getElementById('newsResultList'); 
    if (newsResults.length === 0) {
        newsList.innerHTML = `<div class="no-result"><h4>검색결과 없음</h4><p>"${query}"에 해당하는 뉴스가 없습니다.</p></div>`;
    } else {
        newsList.innerHTML = newsResults.map(n => `
            <div class="search-result-card p-3" style="background-color: #1e1e1e; margin-bottom: 10px; border-radius: 8px;">
                <span style="font-size:0.75rem; background:#c8253a; color:#fff; padding:2px 8px; border-radius:3px;">${n.category}</span>
                <div style="font-weight:700; font-size:1rem; color:#fff; margin-top:8px;">${n.title}</div>
                <div style="color:#bbb; font-size:0.9rem; margin-top:4px;">${n.desc}</div>
            </div>
        `).join('');
    }

    const firstCategoryItem = document.querySelector('.search-category-item');
    if (firstCategoryItem) {
        switchCategory('champion', firstCategoryItem); 
    }

    const heroEl = document.querySelector('.hero');
    if (heroEl) heroEl.classList.add('d-none'); 
    
    document.querySelectorAll('section:not(#searchResults)').forEach(s => s.classList.add('d-none')); 
    
    const searchResultsEl = document.getElementById('searchResults');
    if (searchResultsEl) {
        searchResultsEl.classList.remove('d-none'); 
        searchResultsEl.style.display = 'block'; 
    }
}

// ── 카테고리 전환 ────────────────────────────────────────────
function switchCategory(type, el) {
    document.querySelectorAll('.search-category-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    
    const resultChampEl = document.getElementById('resultChampion');
    const resultNewsEl = document.getElementById('resultNews');
    
    if (resultChampEl) resultChampEl.style.display = type === 'champion' ? 'block' : 'none';
    if (resultNewsEl) resultNewsEl.style.display = type === 'news' ? 'block' : 'none';
}

// ── 폼 이벤트 ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                performSearch(searchInput.value);
            }
        });
    }
});