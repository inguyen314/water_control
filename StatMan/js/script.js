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
    clearTable,
    haveOneYearOfData
} from './functions.js'


// Const Elements
const basinName = document.getElementById('basinCombobox'),
      gageName = document.getElementById('gageCombobox'),
      beginDate = document.getElementById('begin-input'),
      endDate = document.getElementById('end-input'),
      computeHTMLBtn = document.getElementById('button-html'),
      computeCSV = document.getElementById('button-csv'),
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
        document.getElementById('page-container').classList.toggle('dark');
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

    // Get the gage 'tsid_stage_rev' for the 'Available POR' table
    let tsIdStagRev;
    data.forEach(element => {
        if (element.basin === basinName.value) {
            element.gages.forEach(item => {
                if (item.tsid_datman === gageName.value) {
                    tsIdStagRev = item.tsid_stage_rev;
                }
            });
        };
    });

    // If is not local it will add the 'tsid_stage_rev' to the URL
    let newGeneralInfoURL = isLocal ? generalInfoURL : generalInfoURL + tsIdStagRev;

    // Update 'Available POR' when the page load.
    fetchJsonFile(newGeneralInfoURL, updateAvailablePORTable, function(){}); // Change URL for the online version

    // Update 'Avaliable POR' table everytime the gage name is changed
    gageName.addEventListener('change', function(){
        // Get the gage 'tsid_stage_rev' for the 'Available POR' table
        let tsIdStagRev;
        data.forEach(element => {
            if (element.basin === basinName.value) {
                element.gages.forEach(item => {
                    if (item.tsid_datman === gageName.value) {
                        tsIdStagRev = item.tsid_stage_rev;
                    }
                });
            };
        });

        // If is not local it will add the 'tsid_stage_rev' to the URL
        let newGeneralInfoURL = isLocal ? generalInfoURL : generalInfoURL + tsIdStagRev;
        fetchJsonFile(newGeneralInfoURL, updateAvailablePORTable, function(){}) // Change URL for the online version

        // Is the gage a project?
        fetchJsonFile(jsonUrl, function(data){
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
                // Change the datum info to show
                document.querySelector('#content-body .container .data-type label').innerText = "Datum: NAV88";
            } else {
                document.querySelector('#content-body .container .data-type label').innerText = "Datum: NGVD29";
            }

        }, function(){});

    })

    // Is the gage a project?
    fetchJsonFile(jsonUrl, function(data){
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
            // Change the datum info to show
            document.querySelector('#content-body .container .data-type label').innerText = "Datum: NAV88";
        } else {
            document.querySelector('#content-body .container .data-type label').innerText = "Datum: NGVD29";
        }

    }, function(){});

    // Get all data to create the url
    const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
    const timeSeries = "/timeseries?";
    const timeZone = "CST6CDT";

    computeCSV.addEventListener('click' , alertMessageForCSVBtn);

    // HTML button clicked
    computeHTMLBtn.addEventListener('click', function() {

        // Verify if the selected period is more than one year.
        if (haveOneYearOfData(beginDate.value, endDate.value)) {

            computeHTMLBtn.textContent = "Processing - One Moment";

            // Initialize variables
            let datmanName = gageName.value,
            beginValue = formatString("start date", beginDate.value),
            endValue = formatString('end date', endDate.value);

            // Create the URL to get the data
            let stageUrl = createUrl(domain,timeSeries,datmanName,officeName,beginValue,endValue,timeZone)
            fetchJsonFile(stageUrl, main, function(){});
            resultsDiv.classList.remove('hidden');

        } else {

            alert("The period must be greater than one year.");

        }

        
    });    
}

// Main function
function main(data) {
    // Add function to the CSV button
    computeCSV.removeEventListener('click', alertMessageForCSVBtn)

    // Add the gage name to the title
    document.querySelector('.results #gage-info-table th').textContent = gageName.value.split('.')[0];

    // Fetch data for general information
    let formattedName = gageName.value.split('.')[0].split(' ').join('%20');

    // Update Location Info
    fetchJsonFile(`${locationInfoURL}/${formattedName}?office=${officeName}`, function(data) {
        locationInformation.textContent = `LAT. ${data.latitude}, LONG. ${data.longitude}, ${data.description}`;
        //zeroGageData.textContent = `${elevation} ft NAVD ${navNum}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
    }, function(){});

    // Is the gage a project?
    fetchJsonFile(jsonUrl, function(data){
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
            fetchJsonFile(`${locationInfoURL}/${formattedName}?office=${officeName}`, function(data) {
                zeroGageData.textContent = `${data.elevation.toFixed(2)} ft ${data["vertical-datum"]}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
            }, function(){});
        } else {

            fetchJsonFile(jsonUrl, function (data) {
                let basinData = data.filter(x => x.basin === basinName.value)[0].gages.filter(y => y.tsid_datman === gageName.value)[0];
                let idNgvd29 = basinData.level_id_ngvd29;
                let idEffectiveDate = basinData.level_id_effective_date_ngvd29;
                let idUnits29 = basinData.unit_id;

                let fetchURL = "https://cwms-data.usace.army.mil/cwms-data/levels";
                
                // example: https://cwms-data.usace.army.mil/cwms-data/levels/Sub-Casey%20Fork.Height.Inst.0.NGVD29?office=MVS&effective-date=2024-01-01T08:00:00&unit=ft

                console.log(fetchURL + "/" + idNgvd29 + "?office=" + officeName + "&effective-date=" + idEffectiveDate + "&unit=" + idUnits29);

                fetchJsonFile(fetchURL + "/" + idNgvd29 + "?office=" + officeName + "&effective-date=" + idEffectiveDate + "&unit=" + idUnits29, function (data) {
                    let constantValue = data["constant-value"];

                    console.log(`${locationInfoURL}/${formattedName}?office=${officeName}`);

                    fetchJsonFile(`${locationInfoURL}/${formattedName}?office=${officeName}`, function(data) {
                        let newElev = constantValue - data.elevation;
                        zeroGageData.textContent = `${newElev.toFixed(2)} ft ${data["vertical-datum"]}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.`;
                    }, function(){});

                }, function() {});

                zeroGageData.textContent = "${data.elevation} ft ${data['vertical-datum']}   NOTE: ADD DATUM TO STAGE TO OBTAIN ELEVATION.";
                
            }, function (){});
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

    let aveTableSring = 'Day,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec\n';
    for (let i = 3; i < averageTable.childNodes.length; i++) {
        aveTableSring += averageTable.childNodes[i].innerText.split('\t').join(',');
        aveTableSring += '\n';
    }

    computeCSV.addEventListener('click' , function() {

        let dataStringForCSV = '';
        dataStringForCSV += "Mean table\n";
        dataStringForCSV += formatDataToCSV(meanDataTable);
        dataStringForCSV += "\nMin Table\n";
        dataStringForCSV += formatDataToCSV(minDataTable);
        dataStringForCSV += "\nMax Table\n";
        dataStringForCSV += formatDataToCSV(maxDataTable);

        exportToCSV(dataStringForCSV);
    });

}

// Update Available POR Function
function updateAvailablePORTable(data) {
    let tempData = data
    if (isLocal) {
        data.forEach(element => {
            if (element.location_id === gageName.value.split('.')[0]) {
                tempData = element;
            }
        });
    }

    let startPORDate = document.querySelector('#info-table .por-start');
    let endPORDate = document.querySelector('#info-table .por-end');
    let startDate = tempData.earliest_time.split(' ')[0];
    let endDates = tempData.latest_time.split(' ')[0];
    startPORDate.innerText = startDate;
    endPORDate.innerHTML = endDates;
    let startDateList = startDate.split('-');
    let endDateList = endDates.split('-');

    if (startDateList[0].length > 2) {
        beginDate.value = `${startDateList[0]}-${startDateList[1]}-${startDateList[2]}`;
        endDate.value = `${endDateList[0]}-${endDateList[1]}-${endDateList[2]}`;
    } else {
        beginDate.value = `${startDateList[2]}-${startDateList[0]}-${startDateList[1]}`;
        endDate.value = `${endDateList[2]}-${endDateList[0]}-${endDateList[1]}`;
    }
}

// Export CSV file
function exportToCSV(data, filename = 'data.csv') {
    // Convert the array of arrays to a CSV string
    /* const csvContent = convertArrayToCSV(data); */
    const csvContent = data;

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
        // Create a URL for the Blob and set it as the href attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        
        // Append the link to the body
        document.body.appendChild(link);
        
        // Programmatically click the link to trigger the download
        link.click();
        
        // Remove the link from the document
        document.body.removeChild(link);
    }
}

function alertMessageForCSVBtn() {
    alert("Need to compute the HTML first.");
}

function formatDataToCSV(data) {

    let stringCSV = '';

    // Add Header
    stringCSV += "Day,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec\n"

    // Add data
    let days = 1;
    data.forEach(element => {

        if (typeof(element[0]) === "object") {
            for (let row = 0; row < 2; row++) {

                if (row === 0) {

                    stringCSV += `${days},`;
                    days += 1;
                    for (let i = 0; i < 12; i++) {
                        if (element[i][0]) {
                            stringCSV += element[i][0].toFixed(2);
                        } else if (element[i][0] === 0) {
                            stringCSV += "0.00";
                        } else {
                            stringCSV += "---";
                        }
                        
                        if (i !== 11) {
                            stringCSV += ",";
                        }
                    }
                    stringCSV += '\n';

                } else {

                    stringCSV += ' ,';
                    for (let i = 0; i < 12; i++) {
                        if (element[i][1]) {
                            stringCSV += element[i][1];
                        } else {
                            stringCSV += "---";
                        }
                        if (i !== 11) {
                            stringCSV += ",";
                        }
                    }
                    stringCSV += '\n';

                }

            }

        } else {

            stringCSV += `${days},`;
            days += 1;
            for (let i = 0; i < 12; i++) {
                stringCSV += element[i].toFixed(2);
                if (i !== 11) {
                    stringCSV += ",";
                }
            }
            stringCSV += '\n';

        };

    });
    stringCSV += "MEAN,=SUM(B3:B33),=SUM(C3:C33),=SUM(D3:D33),=SUM(E3:E33),=SUM(F3:F33),=SUM(G3:G33),=SUM(H3:H33),=SUM(I3:I33),=SUM(J3:J33),=SUM(K3:K33),=SUM(L3:L33),=SUM(M3:M33)\n";
    stringCSV += "MIN,=MIN(B3:B33),=MIN(C3:C33),=MIN(D3:D33),=MIN(E3:E33),=MIN(F3:F33),=MIN(G3:G33),=MIN(H3:H33),=MIN(I3:I33),=MIN(J3:J33),=MIN(K3:K33),=MIN(L3:L33),=MIN(M3:M33)\n";
    stringCSV += "MAX,=MAX(B3:B33),=MAX(C3:C33),=MAX(D3:D33),=MAX(E3:E33),=MAX(F3:F33),=MAX(G3:G33),=MAX(H3:H33),=MAX(I3:I33),=MAX(J3:J33),=MAX(K3:K33),=MAX(L3:L33),=MAX(M3:M33)\n";
    return stringCSV;
}

let jsonUrl;
let generalInfoURL;
let isLocal;
let locationInfoURL = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data/locations";

// Check if the program is running in the web server or a host server
const hostname = window.location.hostname; //Web: wm.mvs.ds.usace.army.mil;    Local: 127.0.0.1
if (hostname === "wm.mvs.ds.usace.army.mil") {

    jsonUrl = "../../../../php_data_api/public/json/gage_control.json";
    generalInfoURL = "../../../../php_data_api/public/get_tsid_extents.php?cwms_ts_id=";
    isLocal = false;

} else if (hostname === "127.0.0.1") {

    jsonUrl = "../json/data.json";
    generalInfoURL = "../json/test_available_por_data.json";
    isLocal = true;

} else {
    alert("There was a problem getting the server name.");
}

// Fetch the gages names
fetchJsonFile(jsonUrl, initialize, function(){});

