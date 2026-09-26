document.addEventListener('DOMContentLoaded', function () {
    var rooms = [
        { name: '一楼自习室', floor: 1, open: true },
        { name: '二楼自习室', floor: 2, open: true },
        { name: '三楼自习室', floor: 3, open: false },
        { name: '四楼研讨室', floor: 4, open: true }
    ];

    var floorFilter = document.getElementById('floorFilter');
    var openFilter = document.getElementById('openFilter');
    var roomList = document.getElementById('roomList');

    function renderRooms() {
        var floor = floorFilter.value;
        var openOnly = openFilter.checked;
        var result = [];

        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            var matchFloor = false;
            var matchOpen = false;

            if (floor === 'all' || room.floor === Number(floor)) {
                matchFloor = true;
            }

            if (!openOnly || room.open) {
                matchOpen = true;
            }

            if (matchFloor && matchOpen) {
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

    floorFilter.addEventListener('change', renderRooms);
    openFilter.addEventListener('change', renderRooms);
    renderRooms();

    loadChart();
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
                        label: '使用量（人次）',
                        data: values,
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
}