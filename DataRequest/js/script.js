import {fetchJsonFile} from '../../js/requestData.js';
import {
    blurBackground,
    getNames,
    popupMessage,
    addBasinNames
} from './functions.js';

let domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
let generalInfoURL = domain + "/catalog/TIMESERIES?office=MVS&like=";
let gageJsonUrl = "../../../../php_data_api/public/json/gage_control.json";
//let periodDataUrl = domain + "/timeseries?" + name=Mt%20Vernon-Big%20Muddy.Stage.Inst.15Minutes.0.lrgsShef-rev&office=MVS&begin=2024-01-01T00%3A00%3A00.00Z&end=2024-12-31T23%3A59%3A59.59Z&timezone=CST6CDT

// Const Elements
const basinName = document.getElementById('basinCombobox'),
      gageName = document.getElementById('gageCombobox'),
      beginDate = document.getElementById('begin-input'),
      endDate = document.getElementById('end-input'),
      resultsDiv = document.querySelector('.results'),
      averageTable = document.getElementById('mean-table'),
      maxTable = document.getElementById('max-table'),
      minTable = document.getElementById('min-table'),
      locationInformation = document.getElementById('location-data'),
      zeroGageData = document.getElementById('zero-gage-data'),
      darkModeCheckbox = document.querySelector('.header label input'),
      popupWindowBtn = document.getElementById('popup-button'),
      getDataBtn = document.getElementById('button-data'),
      getCSVBtn = document.getElementById('button-csv'),
      getJSONBtn = document.getElementById('button-json'),
      emailBtn = document.getElementById('button-email'),
      dailyCheckbox = document.getElementById('daily'),
      hourlyCheckbox = document.getElementById('hourly');

// Global Variable
let globalData;


function initialize(data) {
    // Add dark mode functionality
    darkModeCheckbox.addEventListener('click', function() {
        document.getElementById('content-body').classList.toggle('dark');
        document.getElementById('page-container').classList.toggle('dark');
    });

    // Add function to popup window button
    popupWindowBtn.addEventListener('click', blurBackground);

    // Extract the names of the basins with the list of gages
    let namesObject = getNames(data);

    // Add the basins names to the basin combobox
    addBasinNames(basinName, namesObject);

    // Add data to the gage combobox at the beggining of the code
    gageName.options.length = 0;
    namesObject.forEach(element => {
        if (element['basin'] === basinName.value) {

            if (dailyCheckbox.checked) {
                element['datman'].forEach(item => {
                    let option = document.createElement('option');
                    option.value = item;
                    option.textContent = item.split('.')[0];
                    gageName.appendChild(option);
                });
            } else if (hourlyCheckbox.checked) {
                element['rev'].forEach(item => {
                    let option = document.createElement('option');
                    option.value = item;
                    option.textContent = item.split('.')[0];
                    gageName.appendChild(option);
                });
            }
            
        }
    });

    // Change the gage values each time the basin value is changed
    basinName.addEventListener('change', function() {
        gageName.options.length = 0;
        namesObject.forEach(element => {
            if (element['basin'] === basinName.value) {

                if (dailyCheckbox.checked) {
                    element['datman'].forEach(item => {
                        let option = document.createElement('option');
                        option.value = item;
                        option.textContent = item.split('.')[0];
                        gageName.appendChild(option);
                    });
                } else if (hourlyCheckbox.checked) {
                    element['rev'].forEach(item => {
                        let option = document.createElement('option');
                        option.value = item;
                        option.textContent = item.split('.')[0];
                        gageName.appendChild(option);
                    });
                }
                
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

    let newGeneralInfoURL = generalInfoURL + tsIdStagRev;

    // Update 'Available POR' when the page load.
    fetchJsonFile(newGeneralInfoURL, updateAvailablePORTable, function(error){
        popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
        popupWindowBtn.click();
    }); // Change URL for the online version

    // Update 'Avaliable POR' table everytime the gage name is changed
    gageName.addEventListener('change', function(){
        // Get the gage 'tsid_stage_rev' for the 'Available POR' table
        let tsIdStagRev;
        data.forEach(element => {
            if (element.basin === basinName.value) {
                if (dailyCheckbox.checked) {
                    element.gages.forEach(item => {
                        if (item.tsid_datman === gageName.value) {
                            tsIdStagRev = item.tsid_stage_rev;
                        }
                    });
                } else if (hourlyCheckbox.checked) {
                    element.gages.forEach(item => {
                        if (item.tsid_stage_rev === gageName.value) {
                            tsIdStagRev = item.tsid_stage_rev;
                        }
                    });
                }
                
            };
        });

        // If is not local it will add the 'tsid_stage_rev' to the URL
        let newGeneralInfoURL = generalInfoURL + tsIdStagRev;
        console.log(newGeneralInfoURL);
        fetchJsonFile(newGeneralInfoURL, updateAvailablePORTable, function(error){
            popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
            popupWindowBtn.click();
        }) // Change URL for the online version

        // Is the gage a project?
        fetchJsonFile(gageJsonUrl, function(data){
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
    fetchJsonFile(gageJsonUrl, function(data){
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

    }, function(error){
        popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
        popupWindowBtn.click();
    });



}

// Update Available POR Function
function updateAvailablePORTable(data) {
    console.log(data);
    let tempData = data.entries[0].extents[0];

    let startPORDate = document.querySelector('#info-table .por-start');
    let endPORDate = document.querySelector('#info-table .por-end');
    let startDate = tempData["earliest-time"].split('T')[0];
    let endDates = tempData["latest-time"].split('T')[0];
    let startDateList = startDate.split('-');
    let endDateList = endDates.split('-');

    if (startDateList[0].length > 2) {
        beginDate.value = `${startDateList[0]}-${startDateList[1]}-${startDateList[2]}`;
        endDate.value = `${endDateList[0]}-${endDateList[1]}-${endDateList[2]}`;
        startPORDate.innerText = `${startDateList[1]}-${startDateList[2]}-${startDateList[0]}`;
        endPORDate.innerHTML = `${endDateList[1]}-${endDateList[2]}-${endDateList[0]}`;
    } else {
        beginDate.value = `${startDateList[2]}-${startDateList[0]}-${startDateList[1]}`;
        endDate.value = `${endDateList[2]}-${endDateList[0]}-${endDateList[1]}`;
        startPORDate.innerText = `${startDateList[2]}-${startDateList[0]}-${startDateList[1]}`;
        endPORDate.innerHTML = `${endDateList[2]}-${endDateList[0]}-${endDateList[1]}`;
    }
    
}

// Checkbox Functions
dailyCheckbox.addEventListener('click', function() {
    if (hourlyCheckbox.checked) {
        hourlyCheckbox.checked = false;
    }
});

hourlyCheckbox.addEventListener('click', function() {
    if (dailyCheckbox.checked) {
        dailyCheckbox.checked = false;
    }
});

// Buttons Functions
getDataBtn.addEventListener('click', function() {
    console.log(gageName.value);
    console.log(beginDate.value);
    console.log(endDate.value);
    //fetchJsonFile();
});

// Fetch the gages names
fetchJsonFile(gageJsonUrl, initialize, function(error){
    popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
    popupWindowBtn.click();
});
