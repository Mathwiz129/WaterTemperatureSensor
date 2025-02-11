let startDate, endDate;
let startTemp = 0;
let endTemp = 0;

// This function will update the current temperature on the page
async function fetchCurrentTemp() {
    try {
        const response = await fetch("https://tempsensor.anygeneric.dev/get"); // Fetch from the correct endpoint
        const text = await response.text(); // Get the response as plain text

        // Assuming the temperature value is the whole response
        const currentTemp = parseFloat(text.trim()); // Convert to a number after trimming any extra spaces or newlines
        if (!isNaN(currentTemp)) {
            document.getElementById("current-temp").innerText = currentTemp.toFixed(2); // Display current temperature
        } else {
            document.getElementById("current-temp").innerText = "Invalid data"; // In case the data isn't a valid number
        }
    } catch (error) {
        console.error("Error fetching current temperature data:", error);
        document.getElementById("current-temp").innerText = "Error"; // In case of an error
    }
}

// Call this function when the page loads to display the current temperature
fetchCurrentTemp();


async function fetchAndPlot() {
    const startInput = document.getElementById("start").value;
    const endInput = document.getElementById("end").value;
    if (!startInput || !endInput) {
        alert("Please select both start and end dates.");
        return;
    }

    startDate = new Date(startInput);
    endDate = new Date(endInput);

    // Fetch data
    const response = await fetch("https://tempsensor.anygeneric.dev/logs");
    const text = await response.text();
    const lines = text.trim().split("\n");

    let timestamps = [];
    let temps = [];

    lines.forEach(line => {
        const [timestamp, temp] = line.split(",");
        const date = new Date(timestamp);

        if (date >= startDate && date <= endDate) {
            timestamps.push(date);
            temps.push(parseFloat(temp));
        }
    });

    if (timestamps.length === 0) {
        alert("No data found in the selected range.");
        return;
    }

    startTemp = temps[0];  // Get the temperature of the first entry
    endTemp = temps[temps.length - 1];  // Get the temperature of the last entry

    // Create chart
    const ctx = document.getElementById("tempChart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: timestamps.map(date => date.toLocaleString()),
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
            },
            plugins: {
                title: {
                    display: true,
                    text: `Water Temperatures from ${startDate.toLocaleString()} until ${endDate.toLocaleString()}`
                }
            }
        }
    });

    // Show the canvas once the graph is generated
    document.getElementById("tempChart").style.display = "block";
}

function downloadGraph() {
    if (!window.myChart) {
        alert("Generate a graph first!");
        return;
    }
    const link = document.createElement("a");
    const formattedStart = startDate.toLocaleString().replace(/[\W_]+/g, '-');
    const formattedEnd = endDate.toLocaleString().replace(/[\W_]+/g, '-');
    link.download = `Water_Temperature_${formattedStart}_to_${formattedEnd}.png`;
    link.href = document.getElementById("tempChart").toDataURL();
    link.click();
}
