const state = { data: null };

const loadData = async () => {
    $('#status').text('加载中...').show();

    try {
        const response = await fetch('data/campus.json');
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
        renderBarChart(data);
        renderLineChart(data);
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
                        <p class="card-text">累计：${total}</p>
                    </div>
                </div>
            </div>
        `);
    });
};

let barChart = null;

const renderBarChart = (data) => {
    if (barChart === null) {
        barChart = echarts.init(document.querySelector('#bar-chart'));
    }
    barChart.setOption({
        title: { text: '各月场馆使用量' },
        tooltip: {},
        xAxis: { data: data.months },
        yAxis: {},
        series: data.series.map(s => ({
            name: s.category,
            type: 'bar',
            data: s.counts
        }))
    });
};

let lineChart = null;

const renderLineChart = (data) => {
    if (lineChart !== null) {
        lineChart.destroy();
    }
    const ctx = document.querySelector('#line-chart');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.months,
            datasets: data.series.map(s => ({
                label: s.category,
                data: s.counts,
                borderWidth: 1
            }))
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
};

window.addEventListener('resize', () => {
    if (barChart) barChart.resize();
});

$('#cards').on('click', '.card', function () {
    $(this).toggleClass('border-primary shadow');
});

loadData();