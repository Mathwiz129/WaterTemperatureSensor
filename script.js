// Fetch and display the current temperature
async function fetchCurrentTemp() {
    try {
        const response = await fetch("https://tempsensor.anygeneric.dev/get");
        const text = await response.text();
        const currentTemp = parseFloat(text.trim());

        if (!isNaN(currentTemp)) {
            document.getElementById("current-temp").innerText = currentTemp.toFixed(2);
        } else {
            document.getElementById("current-temp").innerText = "Invalid data";
        }
    } catch (error) {
        console.error("Error fetching current temperature data:", error);
        document.getElementById("current-temp").innerText = "Error";
    }
}

// Fetch and display last 12 hours of temperature data
async function fetchLast12Hours() {
    try {
        const response = await fetch("https://tempsensor.anygeneric.dev/logs");
        const text = await response.text();
        const lines = text.trim().split("\n");

        let timestamps = [];
        let temps = [];
        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

        lines.forEach(line => {
            const [timestamp, temp] = line.split(",");
            const date = new Date(timestamp);

            if (date >= twelveHoursAgo && date <= now) {
                timestamps.push(date.toLocaleString());
                temps.push(parseFloat(temp));
            }
        });

        if (timestamps.length === 0) {
            console.warn("No data found for the last 12 hours.");
            return;
        }

        // Create chart
        const ctx = document.getElementById("last12Chart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: timestamps,
                datasets: [{
                    label: "Temperature (°F)",
                    data: temps,
                    borderColor: "blue",
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: "Time" } },
                    y: { title: { display: true, text: "Temperature (°F)" } }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching last 12 hours data:", error);
    }
}

// Fetch custom graphing data based on user input
async function fetchAndPlot() {
    const startInput = document.getElementById("start").value;
    const endInput = document.getElementById("end").value;

    if (!startInput || !endInput) {
        alert("Please select both start and end dates.");
        return;
    }

    const startDate = new Date(startInput);
    const endDate = new Date(endInput);

    const response = await fetch("https://tempsensor.anygeneric.dev/logs");
    const text = await response.text();
    const lines = text.trim().split("\n");

    let timestamps = [];
    let temps = [];

    lines.forEach(line => {
        const [timestamp, temp] = line.split(",");
        const date = new Date(timestamp);

        if (date >= startDate && date <= endDate) {
            timestamps.push(date.toLocaleString());
            temps.push(parseFloat(temp));
        }
    });

    if (timestamps.length === 0) {
        alert("No data found in the selected range.");
        return;
    }

    const ctx = document.getElementById("customChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: timestamps,
            datasets: [{
                label: "Temperature (°F)",
                data: temps,
                borderColor: "red",
                fill: false
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Temperature (°F)" } }
            }
        }
    });
}

// Download custom graph
function downloadGraph() {
    const link = document.createElement("a");
    link.download = "Custom_Temperature_Graph.png";
    link.href = document.getElementById("customChart").toDataURL();
    link.click();
}

// Run on page load
fetchCurrentTemp();
fetchLast12Hours();
