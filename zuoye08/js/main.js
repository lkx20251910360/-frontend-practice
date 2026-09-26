document.addEventListener('DOMContentLoaded', function () {
    var rooms = [
        { name: '文学阅览室', area: 1, open: true },
        { name: '科技阅览室', area: 2, open: true },
        { name: '历史阅览室', area: 3, open: false },
        { name: '期刊阅览室', area: 4, open: true }
    ];

    var areaFilter = document.getElementById('areaFilter');
    var openFilter = document.getElementById('openFilter');
    var roomList = document.getElementById('roomList');

    function renderRooms() {
        var area = areaFilter.value;
        var openOnly = openFilter.checked;
        var result = [];

        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            var matchArea = (area === 'all') || (room.area === Number(area));
            var matchOpen = (!openOnly) || room.open;
            if (matchArea && matchOpen) {
                result.push(room);
            }
        }

        roomList.innerHTML = '';

        if (result.length === 0) {
            var emptyItem = document.createElement('li');
            emptyItem.className = 'list-group-item text-muted';
            emptyItem.textContent = '无匹配结果';
            roomList.appendChild(emptyItem);
            return;
        }

        for (var j = 0; j < result.length; j++) {
            var item = document.createElement('li');
            item.className = 'list-group-item';

            var status = '关闭';
            if (result[j].open) {
                status = '开放';
            }

            item.textContent = result[j].name + ' — ' + status;
            roomList.appendChild(item);
        }
    }

    areaFilter.addEventListener('change', renderRooms);
    openFilter.addEventListener('change', renderRooms);
    renderRooms();

    loadChart();
    loadThree();
});

function loadChart() {
    fetch('data/data.json')
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            var labels = [];
            var values = [];

            for (var i = 0; i < data.length; i++) {
                labels.push(data[i].room);
                values.push(data[i].usage);
            }

            var ctx = document.getElementById('usageChart');

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '借阅量（册）',
                        data: values,
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
}

function loadThree() {
    var container = document.getElementById('three-container');
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2233);

    var camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(4, 3, 6);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    var dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    var stage = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.4, 0.3, 48),
        new THREE.MeshStandardMaterial({ color: 0x37474f })
    );
    stage.position.y = -0.15;
    scene.add(stage);

    var items = new THREE.Group();

    var geos = [
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.TorusGeometry(0.4, 0.16, 16, 48)
    ];

    var colors = [0x4fc3f7, 0xffb74d, 0xef5350];

    for (var i = 0; i < geos.length; i++) {
        var angle = (i / geos.length) * Math.PI * 2;
        var mesh = new THREE.Mesh(
            geos[i],
            new THREE.MeshStandardMaterial({ color: colors[i] })
        );
        mesh.position.set(Math.cos(angle) * 1.4, 0.6, Math.sin(angle) * 1.4);
        items.add(mesh);
    }

    scene.add(items);

    function animate() {
        requestAnimationFrame(animate);
        items.rotation.y += 0.005;
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}