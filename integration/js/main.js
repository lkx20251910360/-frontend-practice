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
        let list = rooms;
        if (floorFilter.value !== 'all') list = list.filter(r => r.floor === Number(floorFilter.value));
        if (openFilter.checked) list = list.filter(r => r.open);
        roomList.innerHTML = list.length
            ? list.map(r => `<li class="list-group-item">${r.name} — ${r.open ? '开放' : '关闭'}</li>`).join('')
            : '<li class="list-group-item text-muted">无匹配结果</li>';
    }

    floorFilter.addEventListener('change', renderRooms);
    openFilter.addEventListener('change', renderRooms);
    renderRooms();

    const res = await fetch('data/data.json');
    const data = await res.json();

    new Chart(document.getElementById('usageChart'), {
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

    const container = document.getElementById('three-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 6);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    const building = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x0d6efd })
    );
    scene.add(building);

    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    renderer.domElement.addEventListener('mousedown', e => {
        dragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
    });

    document.addEventListener('mouseup', () => dragging = false);

    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        scene.rotation.y += (e.clientX - prevX) * 0.005;
        scene.rotation.x += (e.clientY - prevY) * 0.005;
        prevX = e.clientX;
        prevY = e.clientY;
    });

    function animate() {
        requestAnimationFrame(animate);
        building.rotation.y += 0.003;
        renderer.render(scene, camera);
    }
    animate();
});