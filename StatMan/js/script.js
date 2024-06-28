import {
    fetchJsonFile,
    getNames,
    addBasinNames,
    createUrl,
    formatString,
    getList,
    getMeanMinMaxList,
    extractDataForTable,
    createTable,
    clearTable
} from './functions.js'

const jsonUrl = "https://www.mvs-wc.usace.army.mil/php_data_api/public/json/gage_control.json"

//"https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/St%20Charles-Missouri?office=MVS"
const generalInfoURL = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations";

// Const Elements
const basinName = document.getElementById('basinCombobox'),
      gageName = document.getElementById('gageCombobox'),
      beginDate = document.getElementById('begin-input'),
      endDate = document.getElementById('end-input'),
      computeHTMLBtn = document.getElementById('button-html'),
      resultsDiv = document.querySelector('.results'),
      averageTable = document.getElementById('mean-table'),
      maxTable = document.getElementById('max-table'),
      minTable = document.getElementById('min-table'),
      aveCheckbox = document.getElementById('average'),
      maxCheckbox = document.getElementById('maximum'),
      minCheckbox = document.getElementById('minimum'),
      locationInformation = document.getElementById('location-data'),
      zeroGageData = document.getElementById('zero-gage-data'),
      darkModeCheckbox = document.querySelector('.header label input');

// Const Variables
const officeName = "MVS";

/**============= Main functions when data is retrieved ================**/
// Initilize page
function initialize(data) {

    // Add dark mode functionality
    darkModeCheckbox.addEventListener('click', function() {
        document.getElementById('content-body').classList.toggle('dark');
    });

    // Extract the names of the basins with the list of gages
    let namesObject = getNames(data);

    // Add the basins names to the basin combobox
    addBasinNames(basinName, namesObject);

    // Add data to the gage combobox at the beggining of the code
    gageName.options.length = 0;
    namesObject.forEach(element => {
        if (element['basin'] === basinName.value) {
            element['datman'].forEach(item => {
                let option = document.createElement('option');
                option.value = item;
                option.textContent = item.split('.')[0];
                gageName.appendChild(option);
            });
        }
    });

    // Change the gage values each time the basin value is changed
    basinName.addEventListener('change', function() {
        gageName.options.length = 0;
        namesObject.forEach(element => {
            if (element['basin'] === basinName.value) {
                element['datman'].forEach(item => {
                    let option = document.createElement('option');
                    option.value = item;
                    option.textContent = item.split('.')[0];
                    gageName.appendChild(option);
                });
            }
        });
    })

    // Update 'Avaliable POR' table everytime the gage name is changed
    /* gageName.addEventListener('change', function(){
        
    }) */


    // Get all data to create the url
    const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
    const timeSeries = "/timeseries?";
    const timeZone = "CST6CDT";

    // Populate Available POR table
    fetchJsonFile("../json/test_available_por_data.json",
        updateAvailablePORTable, function() {});

    // HTML button clicked
    computeHTMLBtn.addEventListener('click', function() {

        // Initialize variables
        let datmanName = gageName.value,
            beginValue = formatString("start date", beginDate.value),
            endValue = formatString('end date', endDate.value);

        // Create the URL to get the data
        let stageUrl = createUrl(domain,timeSeries,datmanName,officeName,beginValue,endValue,timeZone)
        fetchJsonFile(stageUrl, main, function(){});
        resultsDiv.classList.remove('hidden');
    });    
}

// Main function
function main(data) {
    // Change button text
    computeHTMLBtn.textContent = "Processing - One Moment";

    document.querySelector('.results #gage-info-table th').textContent = gageName.value.split('.')[0];

    // Fetch data for general information
    let formattedName = gageName.value.split('.')[0].split(' ').join('%20');

    // Update Location Info
    fetchJsonFile(`${generalInfoURL}/${formattedName}?office=${officeName}`, function(data) {
        locationInformation.textContent = `LAT. ${data.latitude}, LONG. ${data.longitude}, ${data.description}`;
        //zeroGageData.textContent = `${elevation} ft NAVD ${navNum}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
    }, function(){});

    // Is the gage a project?
    fetchJsonFile("../json/data.json", function(data){
        let is_gage29 = false;
        data.forEach(element => {
            if (element.basin === basinName.value) {
                element.gages.forEach(gage => {
                    if (gage.tsid_datman === gageName.value) {
                        is_gage29 = gage.display_stage_29;
                    }
                });
            } 
        });

        // Update Zero Gage Datum
        if (!is_gage29) {
            fetchJsonFile(`${generalInfoURL}/${formattedName}?office=${officeName}`, function(data) {
                zeroGageData.textContent = `${data.elevation} ft ${data["vertical-datum"]}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
            }, function(){});
        } else {
            zeroGageData.textContent = "${data.elevation} ft ${data['vertical-datum']}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.";
        }

    }, function(){});

    /* Update some other data */
    // Selected POR Statistic
    let porStartDate = beginDate.value; // 'yyyy/mm/dd'
    let porEndDate = endDate.value; // 'yyyy/mm/dd'

    let monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let porNewStartDate = `${monthsNames[parseInt(porStartDate.split('-')[1]) - 1]} ${porStartDate.split('-')[0]}`;
    let porNewEndDate = `${monthsNames[parseInt(porEndDate.split('-')[1]) - 1]} ${porEndDate.split('-')[0]}`;

    document.querySelector('.selected-por-statistic h2').textContent = `Selected POR Statistics [${porNewStartDate} to ${porNewEndDate}]`
    
    let objData = data["time-series"]["time-series"][0]["irregular-interval-values"]["values"];
    
    // Get list with all the years
    let wholePeriodList = getList(objData);
    let totalData = getMeanMinMaxList(wholePeriodList);

    // Separete data between mean, max and min
    let meanData = totalData[0],
        minData = totalData[1],
        maxData = totalData[2];

    // Extract the data which is goind to be shown in the table
    let meanDataTable = extractDataForTable(meanData);
    let minDataTable = extractDataForTable(minData);
    let maxDataTable = extractDataForTable(maxData);
    
    // Check if the checkbox are checked
    if (aveCheckbox.checked) {
        clearTable(averageTable);
        createTable(meanDataTable, averageTable, "mean");
        document.querySelector(".daily-title.mean").classList.remove('hidden');
        document.querySelector(".mean-data").classList.remove('hidden');
    } else {
        document.querySelector(".daily-title.mean").classList.add('hidden');
        document.querySelector(".mean-data").classList.add('hidden');
    }

    if (maxCheckbox.checked) {
        clearTable(maxTable);
        createTable(maxDataTable, maxTable, "max");
        document.querySelector(".daily-title.max").classList.remove('hidden');
        document.querySelector(".max-data").classList.remove('hidden');
    } else {
        document.querySelector(".daily-title.max").classList.add('hidden');
        document.querySelector(".max-data").classList.add('hidden');
    }

    if (minCheckbox.checked) {
        clearTable(minTable);
        createTable(minDataTable, minTable, "min");
        document.querySelector(".daily-title.min").classList.remove('hidden');
        document.querySelector(".min-data").classList.remove('hidden');
    } else {
        document.querySelector(".daily-title.min").classList.add('hidden');
        document.querySelector(".min-data").classList.add('hidden');
    }

    // Get all the data for the total stats
    let totalPORData = [];
    wholePeriodList.forEach(element => {
        element.data.forEach(item => {
            totalPORData.push(item.stage);
        });
    });

    // Get mean, max and min
    let removeUndefinedTotal = totalPORData.filter(x => x);
    let totalMean = removeUndefinedTotal.reduce((x, y) => x + y)/removeUndefinedTotal.length;
    let totalMax = Math.max(...removeUndefinedTotal);
    let totalFilteredMinData = removeUndefinedTotal.filter(x => x !== 0);
    let totalMin = Math.min(...totalFilteredMinData);

    // Get date for min and max
    let maxTotalDate = null;
    wholePeriodList.forEach(element => {
        element.data.forEach(item => {
            if (item.stage === totalMax) {
                maxTotalDate = item.date;
            }
        });
    });

    let minTotalDate = null;
    wholePeriodList.forEach(element => {
        element.data.forEach(item => {
            if (item.stage === totalMin) {
                minTotalDate = item.date;
            }
        });
    });

    // Update numeric data for the mean data
    document.querySelectorAll('.first-stats h4')[0].innerText = `The Mean Stage for the POR was: ${totalMean.toFixed(2)}`;
    document.querySelectorAll('.first-stats h4')[1].innerText = `The Highest Stage for the POR was: ${totalMax.toFixed(2)} which occured on: ${maxTotalDate}`;
    document.querySelectorAll('.first-stats h4')[2].innerText = `The Lowest Stage for the POR was: ${totalMin.toFixed(2)} which occured on: ${minTotalDate}`;

    // Get all the data for the mean stats
    let allMeanData = [];
    meanDataTable.forEach(element => {
        for (let i = 0; i < element.length; i++){
            allMeanData.push(element[i]);
        };
    });

    // Get mean, max and min
    let aveMean = allMeanData.reduce((x, y) => x + y)/allMeanData.length;
    let aveMax = Math.max(...allMeanData);
    let filteredMinData = allMeanData.filter(x => x !== 0);
    let aveMin = Math.min(...filteredMinData);

    // Get date for min and max
    let maxMeanDate = null;
    meanData.forEach(element => {
        if (element.stage === aveMax) {
            maxMeanDate = element.date;
        }
    });

    let minMeanDate = null;
    meanData.forEach(element => {
        if (element.stage === aveMin) {
            minMeanDate = element.date;
        }
    });

    // Update mean POR string
    document.querySelector('.daily-title.mean h4').textContent = `Daily Mean Values for Select POR [${porNewStartDate} to ${porNewEndDate}]`;

    // Update numeric data for the mean data
    document.querySelectorAll('.mean-stats h4')[0].innerHTML = `The AVG Mean Stage on this table: <strong>${aveMean.toFixed(2)}</strong>`;
    document.querySelectorAll('.mean-stats h4')[1].innerHTML = `The Highest Stage for the POR was: <strong>${aveMax.toFixed(2)}</strong> which occured on: <strong>${maxMeanDate}</strong>`;
    document.querySelectorAll('.mean-stats h4')[2].innerHTML = `The Lowest Stage for the POR was: <strong>${aveMin.toFixed(2)}</strong> which occured on: <strong>${minMeanDate}</strong>`;

    // Get all the data for the min stats
    let allMinData = [];
    minDataTable.forEach(element => {
        for (let i = 0; i < element.length; i++){
            allMinData.push(element[i][0]);
        };
    });

    // Get mean, max and min
    let removeUndefined = allMinData.filter(x => x);
    let minMean = removeUndefined.reduce((x, y) => x + y)/removeUndefined.length;
    let minMax = Math.max(...removeUndefined);
    let minFilteredMinData = removeUndefined.filter(x => x !== 0);
    let minMin = Math.min(...minFilteredMinData);

    // Get date for min and max
    let maxMinDate = null;
    minData.forEach(element => {
        if (element.stage[0] === minMax) {
            maxMinDate = `${element.stage[1]}-${element.date}`;
        }
    });

    let minMinDate = null;
    minData.forEach(element => {
        if (element.stage[0] === minMin) {
            minMinDate = `${element.stage[1]}-${element.date}`;
        }
    });

    // Update min POR string
    document.querySelector('.daily-title.min h4').textContent = `Daily Min Values for Select POR [${porNewStartDate} to ${porNewEndDate}]`;

    // Update numeric data for the min data
    document.querySelectorAll('.min-stats h4')[0].innerHTML = `The MIN Mean Stage on this table: <strong>${minMean.toFixed(2)}</strong>`;
    document.querySelectorAll('.min-stats h4')[1].innerHTML = `The Highest MIN Stage on this table: <strong>${minMax.toFixed(2)}</strong> which fell on the day: <strong>${maxMinDate.split('-').slice(-2).join('-')}</strong>`;
    document.querySelectorAll('.min-stats h4')[2].innerHTML = `The Lowest MIN Stage on this table: <strong>${minMin.toFixed(2)}</strong> which fell on the day: <strong>${minMinDate.split('-').slice(-2).join('-')}</strong>`;

    // Get all the data for the max stats
    let allMaxData = [];
    maxDataTable.forEach(element => {
        for (let i = 0; i < element.length; i++){
            allMaxData.push(element[i][0]);
        };
    });

    // Get mean, max and min
    let removeUndefinedMax = allMaxData.filter(x => x);
    let maxMean = removeUndefinedMax.reduce((x, y) => x + y)/removeUndefinedMax.length;
    let maxMax = Math.max(...removeUndefinedMax);
    let maxFilteredMinData = removeUndefinedMax.filter(x => x !== 0);
    let maxMin = Math.min(...maxFilteredMinData);

    // Get date for min and max
    let maxMaxDate = null;
    maxData.forEach(element => {
        if (element.stage[0] === maxMax) {
            maxMaxDate = `${element.stage[1]}-${element.date}`;
        }
    });

    let minMaxDate = null;
    maxData.forEach(element => {
        if (element.stage[0] === maxMin) {
            minMaxDate = `${element.stage[1]}-${element.date}`;
        }
    });

    // Update max POR string
    document.querySelector('.daily-title.max h4').textContent = `Daily Max Values for Select POR [${porNewStartDate} to ${porNewEndDate}]`;

    // Update numeric data for the min data
    document.querySelectorAll('.max-stats h4')[0].innerHTML = `The MAX Mean Stage on this table: <strong>${maxMean.toFixed(2)}</strong>`;
    document.querySelectorAll('.max-stats h4')[1].innerHTML = `The Highest MAX Stage on this table: <strong>${maxMax.toFixed(2)}</strong> which fell on the day: <strong>${maxMaxDate.split('-').slice(-2).join('-')}</strong>`;
    document.querySelectorAll('.max-stats h4')[2].innerHTML = `The Lowest MAX Stage on this table: <strong>${maxMin.toFixed(2)}</strong> which fell on the day: <strong>${minMaxDate.split('-').slice(-2).join('-')}</strong>`;
    

    // Change button text
    computeHTMLBtn.textContent = "Compute HTML";

}

// Update Available POR Function
function updateAvailablePORTable(data) {
    let startPORDate = document.querySelector('#info-table .por-start');
    let endPORDate = document.querySelector('#info-table .por-end');
    let startDate = data.earliest_time.split(' ')[0];
    let endDate = data.latest_time.split(' ')[0];
    startPORDate.innerText = startDate;
    endPORDate.innerHTML = endDate;
}

// Fetch the gages names
fetchJsonFile("../json/data.json", initialize, function(){});

// Fetch gages with the json URL on the Water Control page
/* fetchJsonFile("../../../../php_data_api/public/json/gage_control.json", initialize, function(){}) */

