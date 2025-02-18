
// Declare some const elements
const nameTextBox = document.getElementById('name-input');
const officeTextBox = document.getElementById('office-input');
const beginTextBox = document.getElementById('begin-input');
const endTextBox = document.getElementById('end-input');
const regTextBox = document.getElementById('reg-input');
const titelTextBox = document.getElementById('title-input');
const createGraphBtn = document.getElementById('createChartBtn')
const reportBtn = document.getElementById('reportBtn');
const settingBtn = document.getElementById('settingBtn');
const settingDiv = document.getElementById('setting-div');
const nameDropDownList = document.getElementById('select-name');
const eventDurationDays = document.getElementById('duration-input');
const titleSize = document.getElementById('title-size');
const xAxisSize = document.getElementById('x-axis-size');
const yAxisSize = document.getElementById('y-axis-size');
const legendSize = document.getElementById('legend-size');
const gridColor = document.getElementById('colorPicker');
const graphYAxisLimits = document.getElementById('graph-limits');
const filePicker = document.getElementById('file-picker');
const clearBtn = document.getElementById('clear-file-picker-btn');
const yAxisLabel = document.getElementById('y-axis-label');
const seriesName = document.getElementById('series-name-txbox');

// Empty Variables
//createTableTextFile(tableRows, tableHeader, text, `${nameTextBox.value.split('.')[0]}.txt`)
let tableRowsData;
let tableHeaderData;
let textData;

// Declare some variables
var nameValue;
var officeValue;
var beginValue;
var endValue;
var url;
var fileName;

// Call this function when the page loads to prepopulate the form
window.onload = loadUserData;

// If a file was picked then block the other inputs
let isExcelFile = false;
let globalExcelData = {
  dates: [],
  stages: [],
};

// URL of the JSON file
const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
const timeSeries = "/timeseries?";
const timeZone = "CST6CDT";

let consoleLogTest = true;

// Function for Report btn before getting the graph
function reportBtnClicked() {
  alert("First create the graph in order to get the report.")
}

function toggleSettingvisibility() {
  console.log(settingDiv.classList)
  let haveHidden = false;
  settingDiv.classList.forEach((value) => {
    if (value == 'hidden') {
      haveHidden = true;
    }
  })
  
  if (haveHidden) {
    settingDiv.classList.remove('hidden');
    settingBtn.classList.add('pressed')
  } else {
    settingDiv.classList.add('hidden');
    settingBtn.classList.remove('pressed')
  }
}

// Adding functionality to the buttons
settingBtn.addEventListener('click', toggleSettingvisibility);
reportBtn.addEventListener('click', reportBtnClicked);
createGraphBtn.addEventListener('mousedown', function () {
  createGraphBtn.classList.toggle('pressed')
});

createGraphBtn.addEventListener('mouseup', function () {
  createGraphBtn.classList.toggle('pressed')
});

reportBtn.addEventListener('mousedown', function () {
  reportBtn.classList.toggle('pressed')
});

reportBtn.addEventListener('mouseup', function () {
  reportBtn.classList.toggle('pressed')
});

filePicker.addEventListener('change', function(event){
  const file = event.target.files[0];
  const reader = new FileReader();

  console.log("Selected File: ", file.name);

  globalExcelData.dates = [];
  globalExcelData.stages = [];

  reportBtn.removeEventListener('click', getReport);

  reader.onload = function(e){
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type:'array'});

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(sheet);

    processExcelData(json, file.name.split('.')[0]);
    
  };

  reader.readAsArrayBuffer(file);
});

clearBtn.addEventListener('click', function(){
  filePicker.value = "";
  let elemntList = [nameTextBox, officeTextBox, beginTextBox, endTextBox];

  elemntList.forEach(element => {
    element.disabled = false;
  });

  isExcelFile = false;
})

// ==== Main funtion to work with the data after getting the data =====
function processData(data) {

  let dateList;
  let stageList;

  if (isExcelFile){

    dateList = data.dates;
    stageList = data.stages;

  }
  else {

    // Get the date from the raw date data
    let rawDateList = getList(data, 0);

    // Initialize list
    dateList = [];
    
    // Loop to split the raw date and take just the part we want
    rawDateList.forEach(value => {
      dateList.push(formatDate(value));
    });
    // Get the stage data
    stageList = getList(data, 1);

    if (consoleLogTest) {
      console.log("stageList: ", stageList);
      console.log("dateList: ", dateList);
      console.log("Data: ", data);
    }

  };

  // Set Upper and Lower Limits
  //Check if the reg text box have values
  let upperLimit;
  let lowerLimit;
  if (regTextBox.value) {
    upperLimit = Math.max(...getRegulationLimits());
    lowerLimit = Math.min(...getRegulationLimits());
  } else {
    upperLimit = 412;
    lowerLimit = 406;
  }

  
  // Create List to plot limits
  let upperList = [];
  let lowerList = [];
  dateList.forEach((value, index) => {
    upperList[index] = upperLimit
  });
  dateList.forEach((value, index) => {
    lowerList[index] = lowerLimit
  });

  // Set the elevation for each event
  let elev0_5 = 0.5;
  let elev1_0 = 1.0;
  let elev1_5 = 1.5;
  let elev2_0 = 2.0;

  // Create empty arrays to store each elevation for the plot
  let event0_5 = [];
  let event1_0 = [];
  let event1_5 = [];
  let event2_0 = [];

  // Fill the empty arrays for each event
  let event0_5List = getEvents(stageList=stageList, upperLimit=upperLimit, dateList=dateList, eventFt=elev0_5)
  let event1_0List = getEvents(stageList=stageList, upperLimit=upperLimit, dateList=dateList, eventFt=elev1_0)
  let event1_5List = getEvents(stageList=stageList, upperLimit=upperLimit, dateList=dateList, eventFt=elev1_5)
  let event2_0List = getEvents(stageList=stageList, upperLimit=upperLimit, dateList=dateList, eventFt=elev2_0)

  // Get X and Y values for each event
  let xValues0_5 = event0_5List[1];
  let yValues0_5 = event0_5List[0];
  event0_5[0] = event0_5List[2];
  event0_5[1] = event0_5List[3];

  let xValues1_0 = event1_0List[1];
  let yValues1_0 = event1_0List[0];
  event1_0[0] = event1_0List[2];
  event1_0[1] = event1_0List[3];

  let xValues1_5 = event1_5List[1];
  let yValues1_5 = event1_5List[0];
  event1_5[0] = event1_5List[2];
  event1_5[1] = event1_5List[3];

  let xValues2_0 = event2_0List[1];
  let yValues2_0 = event2_0List[0];
  event2_0[0] = event2_0List[2];
  event2_0[1] = event2_0List[3];

  let endDateForEvents = event0_5[1][0][event0_5[1][0].length - 1];

  let above0_5Event = getAfterEvent(endDateForEvents, stageList, dateList, upperLimit, 0.5);
  let above1_0Event = getAfterEvent(endDateForEvents, stageList, dateList, upperLimit, 1.0);

  let above0_5LinePlot = [];
  let above1_0LinePlot = [];

  console.log( { above0_5Event, above1_0Event } );

  above0_5Event.forEach((element) => {

    above0_5LinePlot.push({
      y: upperLimit + 0.5,
      x: element.date
    })

  });

  above1_0Event.forEach((element) => {
    
    above1_0LinePlot.push({
      y: upperLimit + 1.0,
      x: element.date
    })

  });

  let tableHeader = ["Event", "Duration", "Start Date", "End Date"];
  let tableRows = [];
  
  // Add rows to the report table
  let tempRow = addRowsToTable(event0_5, "0.5");
  tempRow.forEach((value) => {
    tableRows.push(value)
  })
  tempRow = addRowsToTable(event1_0, "1.0");
  tempRow.forEach((value) => {
    tableRows.push(value)
  })
  tempRow = addRowsToTable(event1_5, "1.5");
  tempRow.forEach((value) => {
    tableRows.push(value)
  })
  tempRow = addRowsToTable(event2_0, "2.0");
  tempRow.forEach((value) => {
    tableRows.push(value)
  })

  let now = new Date();

  let nowList = now.toString().split(' ');

  // Get the first three elements using slice
  let chosenElements = nowList.slice(0, 4);

  // Join the first three elements with a hyphen
  let joinedNow = chosenElements.join(' ');

  let text = "Events Report for " + beginValue.split('-')[0] + "\nDate: " + joinedNow + "\n";

  reportBtn.removeEventListener('click', reportBtnClicked);

  tableRowsData = tableRows;
  tableHeaderData = tableHeader;
  textData = text;

  reportBtn.addEventListener('click', getReport);

  // Create the custome series for the events
  let event0_5plot = xValues0_5.map((x, i) => ({ x: x, y: yValues0_5[i] }));
  let event1_0plot = xValues1_0.map((x, i) => ({ x: x, y: yValues1_0[i] }));
  let event1_5plot = xValues1_5.map((x, i) => ({ x: x, y: yValues1_5[i] }));
  let event2_0plot = xValues2_0.map((x, i) => ({ x: x, y: yValues2_0[i] }));

  // Change the container properties in the CSS file
  var myDiv = document.getElementById('chartContainer');
  myDiv.classList.add('active-cont');

  // Get Title from title textbox
  let newTitle;
  if (titelTextBox.value) {
    newTitle = titelTextBox.value;
  } else {
    newTitle = "Graph Title";
  }

  let chartYaxisLabel = yAxisLabel.value !== "" ? yAxisLabel.value : "Elevation[ft]";

  console.log( { event0_5plot: event0_5plot } );
  console.log( { above0_5LinePlot: above0_5LinePlot } );

  createChart(yAxisTitle=chartYaxisLabel, title=newTitle, xAxisArray=dateList, yAxisArray=stageList,
    upperLimitSerie=upperList, lowerLimitSerie=lowerList, plot0_5=event0_5plot, plot1_0=event1_0plot, 
    plot1_5=event1_5plot, plot2_0=event2_0plot, plotAbove0_5=above0_5LinePlot, plotAbove1_0=above1_0LinePlot
  );

  let userData = {
    jsonName: nameTextBox.value,
    jsonBeginDate: beginTextBox.value,
    jsonEndDate: endTextBox.value,
    jsonRegilationLimits: regTextBox.value,
    jsonTitle: titelTextBox.value,
    jsonEventDuration: eventDurationDays.value,
    jsonTitleSize: titleSize.value,
    jsonXAxisSize: xAxisSize.value,
    jsonYAxisSize: yAxisSize.value,
    jsonLegengSize: legendSize.value,
    jsonColor: gridColor.value,
    jsonGraphLimits: graphYAxisLimits.value,
    jsonYAxisLabel: yAxisLabel.value,
    jsonSeriesName: seriesName.value,
  };

  fileName = nameTextBox.value;

  saveUserData(userData);

}

function processExcelData(data, outputFileName){

  fileName = outputFileName;

  let elemntList = [nameTextBox, officeTextBox, beginTextBox, endTextBox];

  elemntList.forEach(element => {
    element.disabled = true;
  });

  isExcelFile = true;

  console.log("Excel Data: ", data);

  data.forEach(element => {
    const excelBaseDate = new Date(1900, 1, 0);  // January 1, 1900
    const daysSinceBase = element["Date"] - 2;
    const jsDate = new Date(excelBaseDate.getTime() + daysSinceBase * 24 * 60 * 60 * 1000);

    // Format the date as MM/DD/YYYY
    const month = jsDate.getMonth(); // Months are zero-based
    const day = jsDate.getDate();
    const year = jsDate.getFullYear();

    globalExcelData.dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    globalExcelData.stages.push(element["Stage"]);
  });

  console.log("globalExcelData: ", globalExcelData);
}

function getAfterEvent(endDateForEvents, stageList, dateList, upperLimit, eventFeet){

  let aboveValues = [];

  let startCounting = false;
  let startCountIndex = 0;
  let previousIndex = null;
  for (let i = 0; i < stageList.length; i++){
    let tempStage = stageList[i];
    let eventElevation = eventFeet + upperLimit;
    let tempDate = dateList[i];

    if (startCounting) {
      startCountIndex += 1;
    }

    if (tempDate === endDateForEvents){
      startCounting = true;
    };

    if (startCounting && tempStage > eventElevation){
      previousIndex = i;
    }

    if (startCounting && tempStage > eventElevation && previousIndex - i < 2){

      aboveValues.push({
        stage: tempStage,
        date: i
      });

    } else if (startCounting && startCountIndex > 0) {

      aboveValues.push({
        stage: null,
        date: null
      });

    };

  };

  return aboveValues

}

// Report Btn Clicked
function getReport() {
  createTableTextFile(tableRowsData, tableHeaderData, textData, `${fileName}.txt`);
};

// Function to get the events for that time period
function getEvents(stageList, upperLimit, dateList, eventFt) {
  let tempStage = [];
  let tempDate = [];
  let eventStage = [];
  let eventDate = [];
  let eventDatesStr = []
  let otherEvents = [];
  let otherEventsDates = [];
  let eventUpperLimit = upperLimit - eventFt;

  // Event Duration
  let daycount = parseInt(eventDurationDays.value); 

  stageList.forEach((value, index) => {

    if (value < eventUpperLimit && index != stageList.length-1) {
      tempStage.push(eventUpperLimit);
      tempDate.push(index);
      eventDatesStr.push(dateList[index]);
    } else if (value < eventUpperLimit && index == stageList.length-1) {

      if (eventStage.length < tempStage.length && tempStage.length >= daycount) {
        otherEvents.push(tempStage);
        otherEventsDates.push(eventDatesStr);
        eventStage = tempStage;
        eventDate = tempDate;
      } else if (tempStage.length >= daycount) {
        otherEvents.push(tempStage);
        otherEventsDates.push(eventDatesStr);
      }

    } else if (value > eventUpperLimit && tempStage.length < daycount) {
      tempStage = [];
      tempDate = [];
      eventDatesStr = [];
    } else if (value > eventUpperLimit && tempStage.length >= daycount) {
      otherEvents.push(tempStage);
      otherEventsDates.push(eventDatesStr);
      if (eventStage.length < tempStage.length) {
        eventStage = tempStage;
        eventDate = tempDate;
      }
      tempStage = [];
      tempDate = [];
      eventDatesStr = [];
    }

  });

  let outputData = {
  eventStage: eventStage,
  eventDate: eventDate,
  otherEvents: otherEvents,
  otherEventsDates: otherEventsDates
  };

  console.log("Output Data: ", outputData);
  return [eventStage, eventDate, otherEvents, otherEventsDates]
};

// Function to get the values from the list
function getList(list, elemIndex) {
  let newList = []
  list.forEach((value, index) => {
    newList[index] = value[elemIndex]
  });
  return newList
}

function createChart(yAxisTitle, title, xAxisArray, yAxisArray, lowerLimitSerie, upperLimitSerie, plot0_5, plot1_0, plot1_5, plot2_0, plotAbove0_5, plotAbove1_0) {

  // Font Size
  let titleFontSize = titleSize.value + "px";
  let xAxisFontSize = xAxisSize.value + "px";
  let yAxisFontSize = yAxisSize.value + "px";
  let legendFontSize =  legendSize.value + "px";
  let gridLinesColor = gridColor.value;

  // Get graph limits
  let limitsList = getGraphLimits();
  let maxLimit = Math.max(...limitsList.limits);
  let minLimit = Math.min(...limitsList.limits);
  let graphIntervals = parseFloat(limitsList.interval);

  // Count the events above 0.5ft and 1.0ft
  let plotAbove0_5Count = 0;
  let plotAbove1_0Count = 0;

  plotAbove0_5.forEach((element) => {
    if (element.x !== null){
      plotAbove0_5Count += 1;
    }
  });

  plotAbove1_0.forEach((element) => {
    if (element.x !== null){
      plotAbove1_0Count += 1;
    }
  });

  // Initial series data
  const series = [
    {
      name: seriesName.value,
      data: yAxisArray,
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: 'Upper Limit ' + '[' + lowerLimitSerie[0] + ' ft]',
      data: lowerLimitSerie,
      dashStyle: 'Dash',
      color: 'grey',
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: 'Lower Limit ' + '[' + upperLimitSerie[0] + ' ft]',
      data: upperLimitSerie,
      dashStyle: 'Dash',
      color: 'grey',
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: '-0.5 ft ' + '[' + plot0_5.length + "]",
      data: plot0_5,
      color: "#277DA1",
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: '-1.0 ft ' + '[' + plot1_0.length + "]",
      data: plot1_0,
      color: '#F94144',
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: '-1.5 ft ' + '[' + plot1_5.length + "]",
      data: plot1_5,
      color: '#43AA8B',
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: '-2.0 ft ' + '[' + plot2_0.length + "]",
      data: plot2_0,
      color: '#F9844A',
      marker: {
        enabled: false // Disable markers for this series
      }
    },
    {
      name: '0.5 ft ' + '[' + plotAbove0_5Count + "]",
      data: plotAbove0_5,
      color: '#DD00FA',
      marker: {
        enabled: false // Disable markers for this series
      },
      showInLegend: true,
      //connectNulls: false,
      //legendSymbol: 'none'
    },
    {
      name: '1.0 ft ' + '[' + plotAbove1_0Count + "]",
      data: plotAbove1_0,
      color: '#0091FF',
      marker: {
        enabled: false // Disable markers for this series
      },
      showInLegend: true,
      //connectNulls: false,
      //legendSymbol: 'none'
    }
  ];

  // Filter out series with empty data arrays
  const filteredSeries = series.filter(serie => serie.data.length > 0);

  // Data for the chart
  const data = {
    chart: {
      type: 'line',
      zoomType: 'x'
    },
    title: {
      text: title,
      style: {
        fontSize: titleFontSize // Set the font size for the chart title
      }
    },
    xAxis: {
      categories: xAxisArray,
      tickInterval: 30, // Set the interval to 30
      labels: {
        rotation: -45, // Optional: rotate labels for better readability
        align: 'right',
        style: {
          fontSize: xAxisFontSize // Set the font size for the x-axis labels
        }
      },
      lineColor: '#000', // Change the x-axis line color to red (example)
      lineWidth: 2, // Width of the main x-axis line
      gridLineWidth: 1, // Enable grid lines for the x-axis
      gridLineColor: gridLinesColor // Color for the grid lines on the x-axis
    },
    yAxis: {
      title: {
        text: yAxisTitle, //'Rainfall (mm)'
        style: {
          fontSize: yAxisFontSize // Set the font size for the y-axis title
        }
      },
      labels: { // Add this block to style the y-axis labels
        style: {
          fontSize: yAxisFontSize // Set the font size for the y-axis labels
        }
      },
      lineColor: '#000', // Change the y-axis line color to blue (example)
      lineWidth: 2, // Width of the main y-axis line
      gridLineWidth: 1, // Enable grid lines for the y-axis
      gridLineColor: gridLinesColor, // Color for the grid lines on the y-axis
      tickInterval: graphIntervals, 
      startOnTick: false, // Prevent alignment to nearest tick
      endOnTick: false,   // Prevent alignment to nearest tick
      min: parseFloat(minLimit), // Set the minimum value of the y-axis
      max: parseFloat(maxLimit) // Set the maximum value of the y-axis
    },
    legend: {
      itemStyle: {
        fontSize: legendFontSize // Set the font size for the legend items
      }
    },
    series: filteredSeries
  };

  // Create the chart
  Highcharts.chart('chartContainer', data);
};

// Function to create the url
function createUrl() {
  return domain + timeSeries + "name=" + nameValue + ".Elev.Inst.~1Day.0.datman-rev" + "&office=" + officeValue + "&begin=" + beginValue + "&end=" + endValue + "&timezone=" + timeZone
}

// Function to format string
function formatString(textField, stringText) {
  if (textField == "name") {
    let output = stringText.replace(/ /g, ' ');
    return output
  } else if (textField == "date") {
    //// OLD VERSION
    // let output = stringText.replace(/:/g, '%3A');
    // output = output.replace(/ /g, "T")
    // return output + "Z"

    return `${stringText}T00%3A00%3A00.000Z`;
  }
}

// Fix columns lenght
function padString(str, length) {
  return str + ' '.repeat(length - str.length);
}

// Function to download TextFile
function createTableTextFile(data, headers, introText, filename) {
  // Determine the maximum length of each column
  const columnWidths = headers.map((header, index) => {
      return Math.max(header.length, ...data.map(row => row[index].toString().length));
  });

  // Format the headers with padding
  const headerRow = headers.map((header, index) => padString(header, columnWidths[index])).join('  ');

  // Format the data rows with padding
  const dataRows = data.map(row => row.map((cell, index) => padString(cell.toString(), columnWidths[index])).join('  '));

  // Combine the introduction, headers, and data rows
  const tableText = [introText, headerRow, ...dataRows].join('\n');

  // Create a Blob object from the table data
  const blob = new Blob([tableText], { type: 'text/plain' });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a new anchor element
  const a = document.createElement('a');

  // Set the href and download attributes of the anchor element
  a.href = url;
  a.download = filename;

  // Programmatically trigger a click on the anchor element
  a.click();

  // Revoke the Blob URL
  URL.revokeObjectURL(url);
}

// Add each row to the column
function addRowsToTable(eventList, eventFt) {

  let tempTable = [];
  let tempRow = [];

  // Check if there is at least one event
  if (eventList[0].length > 0) {

    if (eventList[0].length > 1) {
      eventList[0].forEach((value, index) => {
        tempRow.push(eventFt + " ft");
        tempRow.push(value.length);
        tempRow.push(eventList[1][index][0]);
        tempRow.push(eventList[1][index][eventList[1][index].length - 1]);
        tempTable.push(tempRow);
        tempRow = [];
      })
    } else {
      tempRow.push(eventFt + " ft");
      tempRow.push(eventList[0][0].length);
      tempRow.push(eventList[1][0][0]);
      tempRow.push(eventList[1][0][eventList[1][0].length - 1]);
      tempTable.push(tempRow);
      tempRow = [];
    }
    
  };
  return tempTable
}

// Function to get settings
function getRegulationLimits() {
  let regLimitvalues = [];
  if (regTextBox.value) {
    let splitText = regTextBox.value.split('-');
    regLimitvalues.push(parseFloat(splitText[0].trim()));
    regLimitvalues.push(parseFloat(splitText[1].trim()));
  };
  return regLimitvalues;
}

// Get graph limits and interval
function getGraphLimits() {
  let graphLimitvalues = {
    limits: [],
    interval: 1
  };
  if (graphYAxisLimits.value) {
    let splitText = graphYAxisLimits.value.split(';');
    let limitsString = splitText[0].trim().split('-');
    graphLimitvalues.limits.push(parseFloat(limitsString[0].trim()));
    graphLimitvalues.limits.push(parseFloat(limitsString[1].trim()));
    
    if (splitText.length > 1) {
      graphLimitvalues.interval = splitText[1].trim().split('=')[1].trim();
    }

  };
  return graphLimitvalues;
}

function formatDate(timestamp) {
  // Convert the timestamp to a Date object
  const date = new Date(Number(timestamp));
  
  // Get the day, month, and year
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();

  // Return the formatted date
  return `${year}-${month}-${day}`;
}

function fetchData(url, successFunction) {
  fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Data retrieved successfully from url: ', url);
    successFunction(data);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation: ', error);
    alert('There has been a problem with your fetch operation: ', error);
  });
}

// Fetch the JSON file from the URL
createGraphBtn.addEventListener('click', function(){
    
  // Get all the values from the textbox
  nameValue = formatString('name', nameTextBox.value);
  officeValue = officeTextBox.value;
  beginValue = formatString('date', beginTextBox.value);
  endValue = formatString('date', endTextBox.value);

  url = createUrl()

  const dataLenght = 200000;

  url += `&page-size=${dataLenght}`;

  if (isExcelFile){
    
    console.log("Excel file.");
    processData(globalExcelData);

  }
  else {

    console.log("URL: ", url);
  
    // https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/timeseries?name=Sub-Casey%20Fork.Elev.Inst.~1Day.0.datman-rev&office=MVS&begin=2020-06-08T01%3A46%3A23.964Z&end=2021-06-16T17%3A46%3A23.964Z&timezone=CST6CDT"

    if (nameValue && officeValue && beginValue && endValue){

      fetchData(url, function(data) {
        //let dataObj = data["time-series"]["time-series"][0]["irregular-interval-values"]["values"];  <-- OLD VERSION
        let dataObj = data["values"];
        //alert(dataObj);
        // Do something with the data
        processData(dataObj);
      });

    } else {
      alert("Enter values for each text box.")
    }

  }

  
  
  
})

// Example of storing user input as JSON
function saveUserData(userData) {
  const jsonData = JSON.stringify(userData);  // Convert to JSON string
  localStorage.setItem('userData', jsonData); // Store in localStorage
  console.log('Data saved: ', userData);
}

// Example of retrieving user data from localStorage
function loadUserData() {
  const savedData = localStorage.getItem('userData');
  
  if (savedData) {
    const userData = JSON.parse(savedData);  // Convert from JSON string to object
    console.log("User Data: ", userData);

    nameTextBox.value = userData.jsonName;
    beginTextBox.value = userData.jsonBeginDate;
    endTextBox.value = userData.jsonEndDate;
    regTextBox.value = userData.jsonRegilationLimits;
    titelTextBox.value = userData.jsonTitle;
    eventDurationDays.value = userData.jsonEventDuration;
    titleSize.value = userData.jsonTitleSize;
    xAxisSize.value = userData.jsonXAxisSize;
    yAxisSize.value = userData.jsonYAxisSize;
    legendSize.value = userData.jsonLegengSize;
    gridColor.value = userData.jsonColor;
    graphYAxisLimits.value = userData.jsonGraphLimits;
    yAxisLabel.value = userData.jsonYAxisLabel;
    seriesName.value = userData.jsonSeriesName;

  } else {
    console.log("No saved user data found.");
  }
}

