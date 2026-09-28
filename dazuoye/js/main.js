let books = [];

function render(list) {
  $('#book-list').empty();
  if (list.length === 0) {
    $('#book-list').append('<li>暂无数据</li>');
    return;
  }
  list.forEach(b => {
    $('#book-list').append(
      `<li>${b.title} ${b.category} ${b.floor}楼 可借 ${b.available} / 共 ${b.total}</li>`
    );
  });
}

function bindSearch() {
  $('#keyword, #category').on('input change', () => {
    const kw = $('#keyword').val().trim();
    const cat = $('#category').val();

    if (kw.length > 20) {
      $('#msg').text('搜索词不能超过20个字符');
      return;
    } else {
      $('#msg').text('');
    }

    const list = books.filter(b =>
      b.title.includes(kw) && (cat === '' || b.category === cat)
    );
    render(list);
  });
}

function loadBooks() {
  $.getJSON('data/books.json')
    .done(data => {
      books = data;
      render(books);
    })
    .fail(() => {
      $('#book-list').append('<li>数据加载失败</li>');
    });
}

function drawCharts(data) {
  const categories = [...new Set(data.map(b => b.category))];
  const totalByCategory = categories.map(c =>
    data.filter(b => b.category === c).reduce((s, b) => s + b.total, 0)
  );

  echarts.init(document.getElementById('chart1')).setOption({
    title: { text: '各分类藏书量' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: totalByCategory,
      itemStyle: {
        color: function(params) {
          const colors = ['#0d47a1', '#1976d2', '#42a5f5', '#90caf9', '#000000', '#546e7a'];
          return colors[params.dataIndex % colors.length];
        }
      }
    }]
  });

  const totalAvailable = data.reduce((s, b) => s + b.available, 0);
  const totalBorrowed = data.reduce((s, b) => s + b.borrowed, 0);

  echarts.init(document.getElementById('chart2')).setOption({
    title: { text: '可借与已借占比' },
    series: [{
      type: 'pie',
      data: [
        { name: '可借', value: totalAvailable, itemStyle: { color: '#0d47a1' } },
        { name: '已借出', value: totalBorrowed, itemStyle: { color: '#42a5f5' } }
      ]
    }]
  });
}

function init3d() {
  const box = document.getElementById('3d-box');
  const w = box.clientWidth || 800;
  const h = box.clientHeight || 360;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x16213e);
  scene.fog = new THREE.Fog(0x16213e, 8, 20);

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(4, 3, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  box.appendChild(renderer.domElement);

  new THREE.OrbitControls(camera, renderer.domElement);

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
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = box.clientWidth / box.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(box.clientWidth, box.clientHeight);
  });
}

$(function() {
  bindSearch();
  loadBooks();

  $('.nav-btn').on('click', function(e) {
    e.preventDefault();
    const target = $(this).data('target');
    $('section').hide();
    $('#' + target).show();

    if (target === 'stats' && !window.chartsDrawn) {
      drawCharts(books);
      window.chartsDrawn = true;
    }

    if (target === 'view3d' && !window.scene3dReady) {
      setTimeout(() => {
        init3d();
        window.scene3dReady = true;
      }, 0);
    }
  });
});