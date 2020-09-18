function parseQueryString(queryString) {
    var params = {};
    var queries = queryString.split('&');
    for (var i = 0, l = queries.length; i < queries.length; i++) {
        var temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
}

function tax(x, brakes) {
    var t = 0;
    var s = x;
    for (var i = 0; i < brakes.length; i++) {
        var br = brakes[i];
        if (s > br[0]) {
            t += (s - br[0]) * br[1];
            s = br[0];
        }
    }
    return t;
}

function formatCurrency(c) {
    return '$' + c.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var params = parseQueryString(window.location.search.substring(1));

window.onload = function () {
    var nz = [
        [70000, 0.330],
        [48000, 0.300],
        [14000, 0.170],
        [    0, 0.105]
    ];

    var nz_labour = [
        [180000, 0.390],
        [ 70000, 0.330],
        [ 48000, 0.300],
        [ 14000, 0.170],
        [     0, 0.105]
    ]

    var nz_act = [
        [ 70000, 0.330],
        [ 14000, 0.170],
        [     0, 0.105]
    ]

    var nz_national = [
        [90000, 0.330],
        [64000, 0.300],
        [20000, 0.170],
        [    0, 0.105]
    ]

    var nz_top = [
        [    0, 0.33]
    ]

    var nz_green = [
        [150000, 0.420],
        [100000, 0.370],
        [ 70000, 0.330],
        [ 48000, 0.300],
        [ 14000, 0.170],
        [     0, 0.105]
    ];

    var from = Math.max(parseInt(params['f']) || 0, 0);
    var to = parseInt(params['t']) || (from + 200000);
    var step = Math.max((to - from) / 50, 1);

    var labels = [];
    for (var l = from; l <= to; l += step) {
        labels.push(l);
    }

    var ctx = document.getElementById("myChart");
    var data = {
        labels: labels,
        datasets: [{
            label: "Current",
            function: function (x) {
                return tax(x, nz);
            },
            data: [],
            fill: false,
            borderColor: 'grey'
        },
        {
            label: "Labour",
            function: function (x) {
                return tax(x, nz_labour);
            },
            data: [],
            fill: false,
            borderColor: 'red'
        },
        {
            label: "National",
            function: function (x) {
                return tax(x, nz_national);
            },
            data: [],
            fill: false,
            borderColor: 'blue'
        },
        {
            label: "TOP",
            function: function (x) {
                return Math.max(tax(x, nz_top) - 13000, 0);
            },
            data: [],
            fill: false,
            borderColor: 'black'
        },
        {
            label: "Act",
            function: function (x) {
                return tax(x, nz_act);
            },
            data: [],
            fill: false,
            borderColor: 'yellow'
        },
        {
            label: "Green",
            function: function (x) {
                return tax(x, nz_green);
            },
            data: [],
            fill: false,
            borderColor: 'green'
        }
    ]
    };

    Chart.pluginService.register({
        beforeInit: function (chart) {
            var data = chart.config.data;
            for (var i = 0; i < data.datasets.length; i++) {
                for (var j = 0; j < data.labels.length; j++) {
                    var fct = data.datasets[i].function,
                        x = data.labels[j],
                        y = fct(x);
                    data.datasets[i].data.push(y);
                }
            }
        }
    });

    Chart.pluginService.register({
        beforeInit: function (chart) {
            var datasets = chart.config.data.datasets;
            var colors = palette('mpn65', datasets.length);
            for (var i = 0; i < datasets.length; i++) {
                if (!datasets[i].borderColor)
                    datasets[i].borderColor = '#' + colors[i];
            }
        }
    });

    var myBarChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            legend: {
                display: true,
                position: 'bottom'
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
                        var xLabel = data.labels[tooltipItem.index];
                        if (label) {
                            label += ': ';
                        }
                        label += formatCurrency(tooltipItem.yLabel) + ' (' + (100 * tooltipItem.yLabel / xLabel).toFixed(2) + '%)';
                        return label;
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (label, index, labels) {
                            return formatCurrency(label);
                        }
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (label, index, labels) {
                            return formatCurrency(label);
                        }
                    }
                }]
            }
        }
    });
};
