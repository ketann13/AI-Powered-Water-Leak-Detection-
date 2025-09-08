document.addEventListener("DOMContentLoaded", function () {
    const pressureGauge = new Gauge(document.getElementById("pressureGauge")).setOptions({ maxValue: 10, animationSpeed: 32 });
    const flowGauge = new Gauge(document.getElementById("flowGauge")).setOptions({ maxValue: 100, animationSpeed: 32 });
    const tempGauge = new Gauge(document.getElementById("tempGauge")).setOptions({ maxValue: 100, animationSpeed: 32 });

    const ctx = document.getElementById("dataChart").getContext("2d");
    const dataChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Pressure",
                data: [],
                borderColor: "red",
                fill: false
            }]
        }
    });

    window.predictLeak = function () {
        const pressure = parseFloat(document.getElementById("pressure").value);
        const flowRate = parseFloat(document.getElementById("flow_rate").value);
        const temperature = parseFloat(document.getElementById("temperature").value);

        if (isNaN(pressure) || isNaN(flowRate) || isNaN(temperature)) {
            alert("Please enter valid numeric values.");
            return;
        }

        fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pressure, flow_rate: flowRate, temperature })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("result").innerText = "Error: " + data.error;
            } else {
                document.getElementById("result").innerText = data.prediction;

                pressureGauge.set(pressure);
                flowGauge.set(flowRate);
                tempGauge.set(temperature);

                const time = new Date().toLocaleTimeString();
                dataChart.data.labels.push(time);
                dataChart.data.datasets[0].data.push(pressure);
                dataChart.update();
            }
        })
        .catch(err => {
            document.getElementById("result").innerText = "Request failed!";
            console.error(err);
        });
    };
});