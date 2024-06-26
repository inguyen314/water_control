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
const generalInfoURL = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/";

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
      zeroGageData = document.getElementById('zero-gage-data');

// Const Variables
const officeName = "MVS";

/**============= Main functions when data is retrieved ================**/
// Initilize page
function initialize(data) {

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


    // Get all data to create the url
    const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
    const timeSeries = "/timeseries?";
    const timeZone = "CST6CDT";

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

        if (!is_gage29) {
            fetchJsonFile(`https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/${formattedName}?office=${officeName}`, function(data) {
                zeroGageData.textContent = `${data.elevation} ft ${data["vertical-datum"]}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
            }, function(){});
        } else {
            zeroGageData.textContent = "${data.elevation} ft ${data['vertical-datum']}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.";
        }

    }, function(){});


    // Fetch data for general information
    let formattedName = gageName.value.split('.')[0].split(' ').join('%20');

    fetchJsonFile(`https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations/${formattedName}?office=${officeName}`, function(data) {
        console.log(data);
        locationInformation.textContent = `LAT. ${data.latitude}, LONG. ${data.longitude}, ${data.description}`;
        //zeroGageData.textContent = `${elevation} ft NAVD ${navNum}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
    }, function(){});
    
    let objData = data["time-series"]["time-series"][0]["irregular-interval-values"]["values"];
    /* let dateArray = getList(objData, "date");
    let stageArray = getList(objData, "stage"); */
    
    let wholePeriodList = getList(objData);

    let totalData = getMeanMinMaxList(wholePeriodList);

    let meanData = totalData[0],
        minData = totalData[1],
        maxData = totalData[2];

    let meanDataTable = extractDataForTable(meanData);
    let minDataTable = extractDataForTable(minData);
    let maxDataTable = extractDataForTable(maxData);
    
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
    // Change button text
    computeHTMLBtn.textContent = "Compute HTML";

}


// Fetch the gages names
fetchJsonFile("../json/data.json", initialize, function(){});

// Fetch gages with the json URL
/* fetchJsonFile(jsonUrl, initialize, function(){}); */

