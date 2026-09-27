const ROUTES = ['home', 'study', 'stats', 'campus3d'];

const currentRoute = () => {
    const hash = (location.hash || '#home').replace('#', '');
    return ROUTES.includes(hash) ? hash : 'home';
};

const navigate = (route) => {
    ROUTES.forEach(r => {
        const $view = $('#view-' + r);
        if (r === route) $view.removeClass('d-none');
        else $view.addClass('d-none');
    });

    $('.navbar .nav-link').removeClass('active');
    $(`.navbar .nav-link[data-route="${route}"]`).addClass('active');

    const collapseEl = document.getElementById('mainNav');
    if (collapseEl && collapseEl.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
    }

    if (route === 'stats') {
        setTimeout(renderRoomChart, 0);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

$(window).on('hashchange', () => navigate(currentRoute()));

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
        renderBarChart(data);
        renderLineChart(data);

        if (currentRoute() === 'stats') {
            setTimeout(renderRoomChart, 0);
        }
    } catch (error) {
        $('#status').text('加载失败：' + error.message).show();
    }
};

const renderCards = (data) => {
    const months = data.months;
    data.series.forEach(s => {
        const total = s.counts.reduce((sum, n) => sum + n, 0);
        $('#cards').append(`
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title h6">${s.category}</h3>
                        <p class="card-text fs-4">${total}</p>
                        <p class="card-text small text-muted">共 ${months.length} 个月累计借阅</p>
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
        title: { text: '各月各品类借阅量', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        xAxis: { data: data.months },
        yAxis: { name: '册' },
        series: data.series.map(s => ({
            name: s.category,
            type: 'bar',
            data: s.counts
        }))
    });
};

let lineChart = null;

const renderLineChart = (data) => {
    if (lineChart !== null) lineChart.destroy();
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
            maintainAspectRatio: false,
            plugins: { title: { display: true, text: '借阅趋势（单位：册）' } }
        }
    });
};

const form = document.querySelector('#add-form');
const input = document.querySelector('#task-input');
const tip = document.querySelector('#tip');
const list = document.querySelector('#task-list');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter = 'all';

const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

const render = () => {
    list.innerHTML = '';

    const shown = tasks.filter(t =>
        currentFilter === 'all' ? true :
        currentFilter === 'active' ? !t.done : t.done
    );

    if (shown.length === 0) {
        const li = document.createElement('li');
        li.textContent = '没有符合条件的任务';
        li.className = 'list-group-item text-muted';
        list.appendChild(li);
        return;
    }

    shown.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = task.text;
        if (task.done) li.classList.add('done');

        li.addEventListener('click', () => {
            task.done = !task.done;
            save();
            render();
        });

        const del = document.createElement('span');
        del.className = 'del';
        del.textContent = '×';
        del.addEventListener('click', (e) => {
            e.stopPropagation();
            tasks = tasks.filter(t => t !== task);
            save();
            render();
        });
        li.appendChild(del);

        list.appendChild(li);
    });
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text === '') {
        tip.textContent = '任务名不能为空';
        return;
    }
    tasks.push({ text: text, done: false });
    save();
    tip.textContent = '';
    input.value = '';
    render();
});

document.querySelector('.filters').addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    currentFilter = e.target.dataset.filter;
    render();
});

const rooms = [
    { name: '一楼 A 区', usage: 320 },
    { name: '一楼 B 区', usage: 180 },
    { name: '二楼 A 区', usage: 410 },
    { name: '二楼 B 区', usage: 290 },
    { name: '三楼 A 区', usage: 150 },
    { name: '三楼 B 区', usage: 260 }
];

let roomChart = null;

const renderRoomChart = () => {
    const el = document.querySelector('#room-chart');
    if (!el) return;
    if (roomChart === null) roomChart = echarts.init(el);
    roomChart.setOption({
        title: { text: '各自习室使用量', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: rooms.map(r => r.name) },
        yAxis: { name: '人次' },
        series: [{ type: 'bar', data: rooms.map(r => r.usage) }]
    });
    roomChart.resize();
};

const rooms2 = [
    { name: '一楼 A 区', floor: 1, status: 'open', usage: 320 },
    { name: '一楼 B 区', floor: 1, status: 'closed', usage: 180 },
    { name: '二楼 A 区', floor: 2, status: 'open', usage: 410 },
    { name: '二楼 B 区', floor: 2, status: 'open', usage: 290 },
    { name: '三楼 A 区', floor: 3, status: 'closed', usage: 150 },
    { name: '三楼 B 区', floor: 3, status: 'open', usage: 260 }
];

let currentFloor = 'all';
let currentStatus = 'all';

const renderRooms = () => {
    const $list = $('#room-list').empty();

    const shown = rooms2.filter(r => {
        const okFloor = currentFloor === 'all' || r.floor === Number(currentFloor);
        const okStatus = currentStatus === 'all' || r.status === currentStatus;
        return okFloor && okStatus;
    });

    if (shown.length === 0) {
        $list.append('<li class="list-group-item text-muted">没有符合条件的自习室</li>');
        return;
    }

    shown.forEach(r => {
        const badge = r.status === 'open'
            ? '<span class="badge bg-success">开放中</span>'
            : '<span class="badge bg-secondary">已关闭</span>';
        $list.append(`
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${r.name}</span>
                <span>${badge} <span class="ms-2 text-muted small">使用 ${r.usage} 人次</span></span>
            </li>
        `);
    });
};

document.querySelectorAll('.filters').forEach(group => {
    group.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        const floor = e.target.dataset.floor;
        const status = e.target.dataset.status;
        if (floor !== undefined) {
            currentFloor = String(floor);
            group.querySelectorAll('button[data-floor]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        }
        if (status !== undefined) {
            currentStatus = String(status);
            group.querySelectorAll('button[data-status]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        }
        renderRooms();
    });
});

window.addEventListener('resize', () => {
    if (barChart) barChart.resize();
    if (roomChart) roomChart.resize();
});

$('#cards').on('click', '.card', function () {
    $(this).toggleClass('border-primary shadow');
});

$(function () {
    if (!location.hash) location.hash = '#home';
    render();
    renderRooms();
    navigate(currentRoute());
    loadData();
});