document.addEventListener('DOMContentLoaded', async () => {
    const rooms = [
        { name: '文学阅览室', area: 1, open: true },
        { name: '科技阅览室', area: 2, open: true },
        { name: '历史阅览室', area: 3, open: false },
        { name: '期刊阅览室', area: 4, open: true }
    ];

    const areaFilter = document.getElementById('areaFilter');
    const openFilter = document.getElementById('openFilter');
    const roomList = document.getElementById('roomList');

    const renderRooms = () => {
        const area = areaFilter.value;
        const openOnly = openFilter.checked;

        let filtered = rooms;
        if (area !== 'all') filtered = filtered.filter(r => r.area === Number(area));
        if (openOnly) filtered = filtered.filter(r => r.open);

        roomList.innerHTML = filtered.length
            ? filtered.map(r => `<li class="list-group-item">${r.name} — ${r.open ? '开放' : '关闭'}</li>`).join('')
            : '<li class="list-group-item text-muted">无匹配结果</li>';
    };

    areaFilter.addEventListener('change', renderRooms);
    openFilter.addEventListener('change', renderRooms);
    renderRooms();

    const res = await fetch('data/data.json');
    const data = await res.json();

    const ctx = document.getElementById('usageChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.room),
            datasets: [{
                label: '借阅量（册）',
                data: data.map(d => d.usage),
                backgroundColor: '#0d6efd'
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: '阅览室借阅量统计' },
                subtitle: { display: true, text: '数据来源：图书馆信息中心' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: '册' } }
            }
        }
    });
});