
// Sample data - Update this array manually to add/update trades
let tradeData = [
    {
        id: 1,
        type: 'ETH/USDT',
        status: 'completed',
        margin: 0.13,
        leverage: 200,
        profit: 0.23,
        // image : 'images/Trade1.jpg',
        entryPrice: 2675.5,
        exitPrice: 2649.48,
        direction: 'short',
        timestamp: new Date().getTime() // Add timestamp
    },
    // Add more trades here...
];

// Initialize comparison chart
const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
let comparisonChart = new Chart(comparisonCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'P&L',
            data: [],
            backgroundColor: '#2dd4bf',
            borderColor: '#2dd4bf',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Profit: $${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8',
                    callback: function (value) {
                        return '$' + value;
                    }
                },
                grid: {
                    color: '#334155'
                }
            },
            x: {
                ticks: {
                    color: '#94a3b8'
                },
                grid: {
                    color: '#334155'
                }
            }
        },
        // Add these for better responsive behavior
        layout: {
            padding: {
                top: 10,
                right: 15,
                bottom: 10,
                left: 15
            }
        },
        aspectRatio: 2 // Adjust this value as needed (lower = shorter chart)
    }
});

// Update 24h metrics and chart
function update24hMetrics() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);

    // Filter trades from last 24 hours
    const recentTrades = tradeData.filter(trade =>
        trade.timestamp >= last24h && trade.status === 'completed'
    );

    // Calculate metrics
    const totalProfit = recentTrades.reduce((acc, trade) => acc + trade.profit, 0);
    const totalVolume = recentTrades.reduce((acc, trade) => acc + trade.margin, 0);

    // Update UI
    document.getElementById('24hProfit').textContent = `$${totalProfit.toFixed(2)}`;
    document.getElementById('24hVolume').textContent = `$${totalVolume.toFixed(2)}`;

    // Update chart data
    const chartLabels = recentTrades.map(trade =>
        new Date(trade.timestamp).toLocaleTimeString()
    );
    const chartData = recentTrades.map(trade => trade.profit);

    comparisonChart.data.labels = chartLabels;
    comparisonChart.data.datasets[0].data = chartData;
    comparisonChart.update();
}

// Time filter handler
function updateChartData(range) {
    const buttons = document.querySelectorAll('.time-filter button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const now = Date.now();
    let timeRange;

    switch (range) {
        case '24h':
            timeRange = 24 * 60 * 60 * 1000;
            break;
        case '7d':
            timeRange = 7 * 24 * 60 * 60 * 1000;
            break;
        case '1m':
            timeRange = 30 * 24 * 60 * 60 * 1000;
            break;
    }

    const filteredTrades = tradeData.filter(trade =>
        trade.timestamp >= (now - timeRange) && trade.status === 'completed'
    );

    const chartLabels = filteredTrades.map(trade =>
        new Date(trade.timestamp).toLocaleDateString()
    );
    const chartData = filteredTrades.map(trade => trade.profit);

    comparisonChart.data.labels = chartLabels;
    comparisonChart.data.datasets[0].data = chartData;
    comparisonChart.update();
}




// Initialize chart
// const ctx = document.getElementById('performanceChart').getContext('2d');
// const performanceChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: ['17 Jan', '18Jan'],
//         datasets: [{
//             label: 'Portfolio Value',
//             data: [5, 5.2,],
//             borderColor: '#2dd4bf',
//             tension: 0.4
//         }]
//     },
//     options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             legend: {
//                 position: 'top',
//             }
//         }
//     }
// });

function updateDashboard() {
    // Calculate total balance
    const totalBalance = tradeData.reduce((acc, trade) => acc + trade.margin + trade.profit, 0);
    document.getElementById('totalBalance').textContent = totalBalance.toFixed(2);

    // Render trades
    renderTrades('active');
    renderTrades('completed');
}

function renderTrades(status) {
    const containerId = status === 'active' ? 'activeTrades' : 'completedTrades';
    const trades = tradeData.filter(trade => trade.status === status);

    const html = trades.map(trade => `
                <div class="trade-card">
                    <div class="trade-info">
                        <h4>${trade.type} (${trade.direction})</h4>
                        <p>Margin: $${trade.margin} | Leverage: ${trade.leverage}x</p>
                        <p class="${trade.profit >= 0 ? 'profit' : 'loss'}">
                            P&L: $${trade.profit.toFixed(2)}
                        </p>
                    </div>
                </div>
            `).join('');

    document.getElementById(containerId).innerHTML = html;
}

function exportCSV() {
    const csv = Papa.unparse(tradeData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades-export.csv';
    a.click();
}

function importCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = e => {
        const file = e.target.files[0];
        Papa.parse(file, {
            complete: (result) => {
                tradeData = result.data;
                updateDashboard();
            }
        });
    };

    input.click();
}

// Initial load
updateDashboard();
