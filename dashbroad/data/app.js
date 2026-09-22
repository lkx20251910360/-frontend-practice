const state = { data: null };

const loadData = async () => {
  $('#status').text('加载中...').show();

  try {
    const response = await fetch('data/books.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const data = await response.json();

    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }

    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：课程统一数据集');
    $('#status').hide();

    renderCards(data);
    renderCharts(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  const $cards = $('#cards');
  $cards.empty();

  data.series.forEach((item) => {
    const total = item.counts.reduce((sum, n) => sum + n, 0);
    $cards.append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${item.category}</h5>
            <p class="card-text">总借阅量：${total}</p>
          </div>
        </div>
      </div>
    `);
  });
};

const renderCharts = (data) => {
  const barChart = echarts.init(document.querySelector('#bar-chart'));
  barChart.setOption({
    title: { text: '各月借阅量' },
    tooltip: {},
    xAxis: { data: data.months },
    yAxis: {},
    series: [
      {
        name: '借阅量',
        type: 'bar',
        data: data.series[0].counts
      }
    ]
  });

  window.addEventListener('resize', () => {
    barChart.resize();
  });
};

loadData();