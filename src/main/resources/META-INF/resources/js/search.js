document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault(); // 폼기본동작차단(새로고침)
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    window.open('https://www.google.com/search?q=' + encodeURIComponent(query), '_blank');
});
