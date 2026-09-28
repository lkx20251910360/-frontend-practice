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

function updateSummary(list) {
  const total = list.length;
  const availableCount = list.filter(b => b.available > 0).length;
  const totalBooks = list.reduce((s, b) => s + b.total, 0);
  const totalAvailable = list.reduce((s, b) => s + b.available, 0);
  $('#book-summary').text(
    `共 ${total} 种图书，总藏书 ${totalBooks} 本，当前可借 ${totalAvailable} 本，可借种类 ${availableCount} 种。`
  );
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
    updateSummary(list);
  });
}

function loadBooks() {
  $.getJSON('data/books.json')
    .done(data => {
      books = data;
      render(books);
      updateSummary(books);
    })
    .fail(() => {
      $('#book-list').append('<li>数据加载失败</li>');
      $('#book-summary').text('数据加载失败');
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
  scene.background = new THREE.Color(0xdfefff);

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(4, 3, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  box.appendChild(renderer.domElement);

  new THREE.OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 8, 6);
  scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0xa5d6a7 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const box1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3.5, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x90caf9 })
  );
  box1.position.y = 1.75;
  scene.add(box1);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3, 16),
    new THREE.MeshStandardMaterial({ color: 0x9e9e9e })
  );
  pole.position.set(2.5, 1.5, 0);
  scene.add(pole);

  const animate = () => {
    requestAnimationFrame(animate);
    box1.rotation.y += 0.005;
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