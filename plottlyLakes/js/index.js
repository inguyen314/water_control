
const params = new URLSearchParams(window.location.search);
const lookbackDayURLParam = params.get('days') ? parseInt(params.get('days')) : null;

// Get all data to create the url
const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
const timeZone = "CST6CDT";
const office = "MVS";

// Object with all the time series to fetch
const timeSeries = {
    lakeShelbyville: {
        plot_1: ["Lovington-W Okaw.Flow.Inst.15Minutes.0.RatingUSGS", "Allenville-Whitley Cr.Flow.Inst.15Minutes.0.RatingUSGS", 
            "Cooks Mill-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS"], // Removed (Chesterville-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS)
        plot_2: ["Lk Shelbyville-Kaskaskia.Stage.Inst.30Minutes.0.29"],
        plot_3: ["Shelbyville TW-Kaskaskia.Flow.Inst.30Minutes.0.RatingUSGS"],
        plot_4: ["Shelbyville TW-Kaskaskia.Flow.Inst.30Minutes.0.RatingUSGS", "Shelbyville-Robinson Cr.Flow.Inst.15Minutes.0.RatingUSGS",
            "Cowden-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS", "Vandalia-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS"
        ]
    },
    lakeCarlyle: {
        plot_1: ["Vandalia-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS", "Brownstown-Hickory Cr.Flow.Inst.15Minutes.0.RatingUSGS", 
            "Mulberry Grove-Hurricane Cr.Flow.Inst.15Minutes.0.RatingUSGS", "Fairman-E Fork.Flow.Inst.15Minutes.0.RatingUSGS"],
        plot_2: ["Carlyle Lk-Kaskaskia.Stage.Inst.30Minutes.0.29"],
        plot_3: ["Carlyle-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS"],
        plot_4: ["Carlyle-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS", "Hoffman-Crooked Cr.Flow.Inst.15Minutes.0.RatingCOE",
            "Breese-Shoal Cr.Flow.Inst.15Minutes.0.RatingUSGS", "Venedy Station-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS"
        ]
    },
    lakeRend: {
        plot_1: ["Waltonville-Rayse Cr.Flow.Inst.15Minutes.0.RatingUSGS", "Mt Vernon-Casey Fork.Flow.Inst.15Minutes.0.RatingUSGS", 
            "Mt Vernon-Big Muddy.Flow.Inst.15Minutes.0.RatingCOE"],
        plot_2: ["Rend Lk-Big Muddy.Stage.Inst.30Minutes.0.29"],
        plot_3: ["Rend Lk-Big Muddy.Stage.Inst.30Minutes.0.29", "Sub-Big Muddy.Stage.Inst.30Minutes.0.29", "Sub-Casey Fork.Stage.Inst.30Minutes.0.29"],
        plot_4: ["Rend Lk-Big Muddy.Flow.Inst.30Minutes.0.RatingCOE", "Plumfield-Big Muddy.Flow.Inst.15Minutes.0.RatingUSGS",
            "Murphysboro-Big Muddy.Flow.Inst.15Minutes.0.RatingUSGS"]
    },
    lakeMarkTwain: {
        plot_1: ["Perry-Lick Cr.Flow.Inst.15Minutes.0.RatingUSGS", "Santa Fe-S Fork Salt.Flow.Inst.15Minutes.0.RatingUSGS", 
            "Santa Fe-Long Branch.Flow.Inst.15Minutes.0.RatingUSGS", "Madison-Elk Fork Salt.Flow.Inst.15Minutes.0.RatingUSGS",
            "Paris-Crooked Cr.Flow.Inst.15Minutes.0.RatingUSGS", "Hagers Grove-N Fork Salt.Flow.Inst.15Minutes.0.RatingUSGS",
            "Holliday-Mid Fork Salt.Flow.Inst.15Minutes.0.RatingUSGS", "Shelbina-N Fork Salt.Flow.Inst.15Minutes.0.RatingUSGS"],
        plot_2: ["Mark Twain Lk-Salt.Stage.Inst.30Minutes.0.29"],
        plot_3: ["ReReg Pool-Salt.Stage.Inst.15Minutes.0.29"],
        plot_4: ["Frankford-Spencer Cr.Flow.Inst.15Minutes.0.RatingUSGS", "New London-Salt.Flow.Inst.15Minutes.0.RatingUSGS",
            "Norton Bridge-Salt.Flow.Inst.15Minutes.0.RatingUSGS"]
    },
    lakeWappapello: {
        plot_1: ["Roselle-St Francis.Flow.Inst.15Minutes.0.RatingCOE", "Millcreek-St Francis.Flow.Inst.15Minutes.0.RatingUSGS", 
            "Saco-St Francis.Flow.Inst.15Minutes.0.RatingUSGS", "Patterson-St Francis.Flow.Inst.15Minutes.0.RatingUSGS"],
        plot_2: ["Wappapello Lk-St Francis.Stage.Inst.30Minutes.0.29"],
        plot_3: ["Iron Bridge-St Francis.Flow.Inst.30Minutes.0.RatingUSGS"],
        plot_4: ["Iron Bridge-St Francis.Flow.Inst.30Minutes.0.RatingUSGS", "Fisk-St Francis.Flow.Inst.1Hour.0.RatingCOE",
            "St Francis-St Francis.Flow.Inst.1Hour.0.RatingCOE"]
    }
};

// Turn on/off plots
const plotShelbyville = true;
const plotCarlyle = true;
const plotRend = true;
const plotMarkTwain = true;
const plotWappapello = true;

const shelbyvillePlot_1_Div = document.getElementById('shelbyville-plot-1');
const shelbyvillePlot_2_Div = document.getElementById('shelbyville-plot-2');
const shelbyvillePlot_3_Div = document.getElementById('shelbyville-plot-3');
const shelbyvillePlot_4_Div = document.getElementById('shelbyville-plot-4');

const carlylePlot_1_Div = document.getElementById('carlyle-plot-1');
const carlylePlot_2_Div = document.getElementById('carlyle-plot-2');
const carlylePlot_3_Div = document.getElementById('carlyle-plot-3');
const carlylePlot_4_Div = document.getElementById('carlyle-plot-4');

const rendPlot_1_Div = document.getElementById('rend-plot-1');
const rendPlot_2_Div = document.getElementById('rend-plot-2');
const rendPlot_3_Div = document.getElementById('rend-plot-3');
const rendPlot_4_Div = document.getElementById('rend-plot-4');

const markTwainPlot_1_Div = document.getElementById('mark-twain-plot-1');
const markTwainPlot_2_Div = document.getElementById('mark-twain-plot-2');
const markTwainPlot_3_Div = document.getElementById('mark-twain-plot-3');
const markTwainPlot_4_Div = document.getElementById('mark-twain-plot-4');

const wappapelloPlot_1_Div = document.getElementById('wappapello-plot-1');
const wappapelloPlot_2_Div = document.getElementById('wappapello-plot-2');
const wappapelloPlot_3_Div = document.getElementById('wappapello-plot-3');
const wappapelloPlot_4_Div = document.getElementById('wappapello-plot-4');

const lookbackDaysSpan = document.querySelectorAll('.days-num');
const lookbackTextBox = document.getElementById('lookback-days-txtbox')
const lookbackBtn = document.getElementById('lookback-btn');

// Get Today's date
const today = new Date();

// Check if there is a value un the url parameter for days, else the lookback days will be 4 as default
const backDaysParam = lookbackDayURLParam ? lookbackDayURLParam : 4;
const backDays = backDaysParam + 1;

lookbackTextBox.value = backDaysParam;

lookbackBtn.addEventListener('click', buttonClicked);

lookbackTextBox.addEventListener('keydown', (e) => {
    if (e.key === "Enter"){
        buttonClicked();
    }
});

lookbackDaysSpan.forEach(span => {
    span.textContent = backDays - 1;
});

// Got back n amount of days to fetch the data
const backDaysDate = new Date();
backDaysDate.setDate(today.getDate() - backDays);

getData();

// ============================== FUNCTIONS ================================\\

async function getData() {
    const startDateday = (backDaysDate.getDate() + 1) > 9 ? backDaysDate.getDate() + 1 : `0${backDaysDate.getDate() + 1}`;
    const startDateMonth = (backDaysDate.getMonth() + 1) > 9 ? backDaysDate.getMonth() + 1 : `0${backDaysDate.getMonth() + 1}`;
    const endDateday = (today.getDate() + 1) > 9 ? today.getDate() + 1 : `0${today.getDate() + 1}`;
    const endDateMonth = (today.getMonth() + 1) > 9 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
    const startDate = `${backDaysDate.getFullYear()}-${startDateMonth}-${startDateday}T${backDaysDate.getHours()>9?backDaysDate.getHours():`0${backDaysDate.getHours()}`}:00:00.00Z`;
    const endDate = `${today.getFullYear()}-${endDateMonth}-${endDateday}T${today.getHours()>9?today.getHours():`0${today.getHours()}`}:00:00.00Z`;

    // https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=Vandalia-Kaskaskia.Flow.Inst.15Minutes.0.RatingUSGS&office=MVS&begin=2025-4-23T21:00:00.00Z&end=2025-4-15T21:00:00.00Z&page-size=1000000

    const plotPromises = async(lake, plot) => {
        const responsesList = []
        const getTsData = timeSeries[lake][plot].map(async(tsid) => {
            const url = `${domain}/timeseries?name=${tsid}&office=${office}&begin=${startDate}&end=${endDate}&page-size=1000000`;
            console.log("URL: ", url);

            try {
                const fetchPromise = await fetch(url);
                responsesList.push(await fetchPromise.json());
            } catch (error) {
                console.error(`Error while fetching URL:\n${url}`)
            }

        });

        await Promise.all(getTsData);

        return responsesList
    };

    // Plot Shelbyville
    if (plotShelbyville) {
        await plotPromises("lakeShelbyville", "plot_1")
        .then(data => {
            processData(data, shelbyvillePlot_1_Div, "FLOW");
        });

        await plotPromises("lakeShelbyville", "plot_2")
        .then(data => {
            processData(data, shelbyvillePlot_2_Div, "STAGE");
        });

        await plotPromises("lakeShelbyville", "plot_3")
        .then(data => {
            processData(data, shelbyvillePlot_3_Div, "FLOW");
        });

        await plotPromises("lakeShelbyville", "plot_4")
        .then(data => {
            processData(data, shelbyvillePlot_4_Div, "FLOW");
        });
    };

    if (plotCarlyle) {
        await plotPromises("lakeCarlyle", "plot_1")
        .then(data => {
            processData(data, carlylePlot_1_Div, "FLOW");
        });

        await plotPromises("lakeCarlyle", "plot_2")
        .then(data => {
            processData(data, carlylePlot_2_Div, "STAGE");
        });

        await plotPromises("lakeCarlyle", "plot_3")
        .then(data => {
            processData(data, carlylePlot_3_Div, "FLOW");
        });

        await plotPromises("lakeCarlyle", "plot_4")
        .then(data => {
            processData(data, carlylePlot_4_Div, "FLOW");
        });
    };

    if (plotRend) {
        await plotPromises("lakeRend", "plot_1")
        .then(data => {
            processData(data, rendPlot_1_Div, "FLOW");
        });

        await plotPromises("lakeRend", "plot_2")
        .then(data => {
            processData(data, rendPlot_2_Div, "STAGE");
        });

        await plotPromises("lakeRend", "plot_3")
        .then(data => {
            processData(data, rendPlot_3_Div, "STAGE");
        });

        await plotPromises("lakeRend", "plot_4")
        .then(data => {
            processData(data, rendPlot_4_Div, "FLOW");
        });
    };

    if (plotMarkTwain) {
        await plotPromises("lakeMarkTwain", "plot_1")
        .then(data => {
            processData(data, markTwainPlot_1_Div, "FLOW");
        });

        await plotPromises("lakeMarkTwain", "plot_2")
        .then(data => {
            processData(data, markTwainPlot_2_Div, "STAGE");
        });

        await plotPromises("lakeMarkTwain", "plot_3")
        .then(data => {
            processData(data, markTwainPlot_3_Div, "STAGE");
        });

        await plotPromises("lakeMarkTwain", "plot_4")
        .then(data => {
            processData(data, markTwainPlot_4_Div, "FLOW");
        });
    };

    if (plotWappapello) {
        await plotPromises("lakeWappapello", "plot_1")
        .then(data => {
            processData(data, wappapelloPlot_1_Div, "FLOW");
        });

        await plotPromises("lakeWappapello", "plot_2")
        .then(data => {
            processData(data, wappapelloPlot_2_Div, "STAGE");
        });

        await plotPromises("lakeWappapello", "plot_3")
        .then(data => {
            processData(data, wappapelloPlot_3_Div, "FLOW");
        });

        await plotPromises("lakeWappapello", "plot_4")
        .then(data => {
            processData(data, wappapelloPlot_4_Div, "FLOW");
        });
    };
    
}     

function processData(data, plotDiv, type) {
    // Define color list and an empty array to store the series
    const colorList = ["red", "green", "blue", "magenta", "orange", "red", "green", "blue", "magenta", "orange"]
    const seriesList = [];
    let tsTemplateForVerticalLines = null;

    data.forEach((ts, index) => {

        const fullData = [];
        ts.values.forEach(element => {
            fullData.push({
                date: new Date(element[0]),
                value: element[1]
            })
        });

        tsTemplateForVerticalLines = fullData;

        const units = type.toLowerCase() === "stage" ? "ft" : "cfs";

        seriesList.push(createSerie(fullData, `${ts.name} (${units})`, "lines", colorList[index], type, index>4));

    });

    const hoursInterval = backDays > 12 ? (backDays > 20 ? 24 : 12) : 6;

    const { tickvals, ticktext } = generateCustomTicks(backDaysDate, hoursInterval, backDays * 24);
    const verticalLines = tsTemplateForVerticalLines
    .filter(d => d.date.getUTCHours() === 0 && d.date.getUTCMinutes() === 0)
    .map(d => ({
        type: 'line',
        x0: d.date.toISOString(),
        x1: d.date.toISOString(),
        y0: 0,
        y1: 1,
        xref: 'x',
        yref: 'paper', // so it spans full height of the plot
        line: {
        color: 'rgba(0,0,0,0.3)', // light gray
        width: 2, // <-- thicker line
        dash: 'solid'
        }
    }));

    createPlot(seriesList, tickvals, ticktext, verticalLines, "", Math.min(tsTemplateForVerticalLines.value), Math.max(tsTemplateForVerticalLines.value), plotDiv, type)

}

function buttonClicked() {
    if (isFinite(lookbackTextBox.value)) {
        const link = document.createElement('a');
        link.href = `${window.location.pathname}?days=${lookbackTextBox.value}`;

        link.click();
    } else {
        lookbackTextBox.style.borderColor = "red";
    }
}

// Create plot Function
function createPlot(data, labelVals, labelText, shapeVar, title, minValue, maxValue, plotDivID, yAxisTitle) {

    let layout = {
        // title: { 
        //     text: title, 
        //     font: {size: 20} 
        // },
        // width: 720,
        // height: 480,
        autosize: true,
        margin: { l: 65, r: 50, b: 175, t: 50 },
        shapes: shapeVar,
        xaxis: {
            mirror: 'ticks',
            showlines: true,
            linewidth: 1,
            linecolor: 'black',
            title: { text: 'Date', font: {size: 12}, standoff: 15 },
            type: 'date',
            tickfont: { size: 12 },
            tickvals: labelVals,
            ticktext: labelText,
            tickangle: -90,
            showgrid: true,
            tickmode: 'array'
        },
        yaxis: {
            mirror: 'ticks',
            showlines: true,
            linewidth: 1,
            linecolor: 'black',
            title: { text: yAxisTitle, font: {size: 12}, standoff: 0 },
            tickfont: { size: 12 },
            range: [minValue, maxValue]
        },
        legend: {
            orientation: 'h',
            x: 0,
            y:-0.35,
            xanchor: 'left',
            yanchor: 'top',
            font: { size: 11 },
            ncols: 2
        }
    };

    let config = {
        responsive: true,
        displayModeBar: false,
        toImageButtonOptions: {
            filename: `${title}-Plot`,
            scale: 2
        }
    }

    Plotly.newPlot(plotDivID, data, layout, config);
}

function createSerie(data, serieName, serieMode, color, type, dot=false) {

    let serie = {
        x: data.map(x => x.date),
        y: data.map(x => x.value),
        mode: serieMode,
        line: { color: color, width: 2, dash: `${dot&&'dot'}` },
        name: serieName,
        showlegend: true,
        hoverlabel: {
            font: {
                color: "white"
            },
            bgcolor: color
        },
        hovertemplate: `<span style="color:white;">${type.toLowerCase()==="stage"?"%{y:,.2f} ft":"%{y:,.0f} cfs"}  |  ${serieName.split('.')[0]}</span><br><extra></extra>`,
        hovermode: 'closest'
    };

    return serie

}

function generateCustomTicks(startDate, hoursInterval, totalHours) {
    const tickvals = [];
    const ticktext = [];

    for (let i = 0; i <= totalHours; i += hoursInterval) {
        // Create a new date object each time based on startDate
        const currentDate = new Date(startDate.getTime());
        currentDate.setHours(currentDate.getHours() + i);  // Increment hours
        const time24format = (currentDate.getHours() * 100) + currentDate.getMinutes();

        let roundTime24Format = roundTime(time24format);
        if (totalHours/24 > 12){
            roundTime24Format = roundTime12H(time24format);
        }

        const newCurrentDate = new Date(currentDate.getTime());
        newCurrentDate.setUTCHours(roundTime24Format/100, 0, 0);

        // Push ISO string for tick values (to ensure they are in UTC)
        tickvals.push(newCurrentDate.toISOString());

        const hour = newCurrentDate.getUTCHours();
        const dateStr = newCurrentDate.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: 'numeric', 
            year: '2-digit',
            timeZone: 'UTC'  // Ensure date is in UTC
        });
        const weekday = newCurrentDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            timeZone: 'UTC' 
        });

        // If it's 00:00 UTC (midnight), format the date label
        if (hour === 0) {
            const utcDateStr = `${weekday} ${dateStr}`;
            ticktext.push(utcDateStr);
        } else {
            // Format the time string for hours and minutes in UTC
            const utcTimeStr = newCurrentDate.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC'  // Ensure time is in UTC
            });
            ticktext.push(utcTimeStr);
        }
    }

    return { tickvals, ticktext };
}

function roundTime(time) {
    if (time >= 0 && time < 600) {
        return 600
    } else if (time >= 600 && time < 1200) {
        return 1200
    } else if (time >= 1200 && time < 1800) {
        return 1800
    } else {
        return 0
    }
}

function roundTime12H(time) {
    if (time >= 0 && time < 1200) {
        return 1200
    } else {
        return 0
    }
}
