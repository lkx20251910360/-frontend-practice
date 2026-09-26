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

    const container = document.getElementById('three-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2233);

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(4, 3, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    const stage = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.4, 0.3, 48),
        new THREE.MeshStandardMaterial({ color: 0x37474f })
    );
    stage.position.y = -0.15;
    scene.add(stage);

    const items = new THREE.Group();

    const geos = [
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.TorusGeometry(0.4, 0.16, 16, 48)
    ];

    const colors = [0x4fc3f7, 0xffb74d, 0xef5350];

    geos.forEach((geo, i) => {
        const angle = (i / geos.length) * Math.PI * 2;
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colors[i] }));
        mesh.position.set(Math.cos(angle) * 1.4, 0.6, Math.sin(angle) * 1.4);
        items.add(mesh);
    });

    scene.add(items);

    const animate = () => {
        requestAnimationFrame(animate);
        items.rotation.y += 0.005;
        controls.update();
        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});