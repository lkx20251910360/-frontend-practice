document.addEventListener('DOMContentLoaded', async () => {
    const rooms = [
        { name: '一楼自习室', floor: 1, open: true },
        { name: '二楼自习室', floor: 2, open: true },
        { name: '三楼自习室', floor: 3, open: false },
        { name: '四楼研讨室', floor: 4, open: true }
    ];

    const floorFilter = document.getElementById('floorFilter');
    const openFilter = document.getElementById('openFilter');
    const roomList = document.getElementById('roomList');

    function renderRooms() {
        const floor = floorFilter.value;
        const openOnly = openFilter.checked;

        let filtered = rooms;
        if (floor !== 'all') filtered = filtered.filter(r => r.floor === Number(floor));
        if (openOnly) filtered = filtered.filter(r => r.open);

        roomList.innerHTML = filtered.length
            ? filtered.map(r => `<li class="list-group-item">${r.name} — ${r.open ? '开放' : '关闭'}</li>`).join('')
            : '<li class="list-group-item text-muted">无匹配结果</li>';
    }

    floorFilter.addEventListener('change', renderRooms);
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
                label: '使用量（人次）',
                data: data.map(d => d.usage),
                backgroundColor: '#0d6efd'
            }]
        },
        options: {
            plugins: {
                title: { display: true, text: '自习室使用统计' },
                subtitle: { display: true, text: '数据来源：校园信息中心' }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: '人次' } }
            }
        }
    });
});