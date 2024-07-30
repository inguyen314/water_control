import {
    fetchJsonFile
} from './requestData.js'

const basinCombobox = document.getElementById('basin-combo');
const gageCombobox = document.getElementById('gage-combo');
const dailyCheckbox = document.getElementById('daily-check');
const hourlyCheckbox = document.getElementById('hourly-check');
const porDates = document.querySelectorAll('.date');
const gageJsonUrl = "../../../../php_data_api/public/json/gage_control.json";
const domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
const generalInfoURL = domain + "/catalog/TIMESERIES?office=MVS&like=";

fetchJsonFile(gageJsonUrl, main);

/*=============== Main Function =================*/
function main(data) {
    // Console information to show
    console.log(`Gages info URL:\n '${gageJsonUrl}'`);

    // Filter the data to just what we need
    const basinData = filterGagesData(data);

    // Get the list of basins
    const basinNameList = Object.keys(basinData);

    // Add Gages
    populateBasinComboBox(basinNameList);
    populateGageComboBox(basinCombobox.value, basinData);
    updatePORTable();

    basinCombobox.addEventListener('change', function() {
        populateGageComboBox(basinCombobox.value, basinData);
    });

    gageCombobox.addEventListener('change', function() {
        console.log(`Gage Name: ${gageCombobox.value}`);
        updatePORTable();
    })

    dailyCheckbox.addEventListener('click', function() {

        // If the box is already checked it won't uncheck it
        if (!dailyCheckbox.checked) {
            dailyCheckbox.checked = true;
        };
    
        // If the daily is checked then it will uncheck the hourly
        if (hourlyCheckbox.checked) {
            hourlyCheckbox.checked = false;
        };

        // Save the previous value
        let previousValue = gageCombobox.value.split('.')[0];
        populateGageComboBox(basinCombobox.value, basinData);

        // Set the value to the previous value
        gageCombobox.childNodes.forEach((option, index) => {
            if (option.value.split('.')[0] === previousValue) {
                gageCombobox.selectedIndex = index;
            }
        });

        updatePORTable();
    });

    hourlyCheckbox.addEventListener('click', function() {

        // If the box is already checked it won't uncheck it
        if (!hourlyCheckbox.checked) {
            hourlyCheckbox.checked = true;
        };
    
        // If the hourly is checked then it will uncheck the daily
        if (dailyCheckbox.checked) {
            dailyCheckbox.checked = false;
        };

        // Save the previous value
        let previousValue = gageCombobox.value.split('.')[0];
        populateGageComboBox(basinCombobox.value, basinData);

        // Set the value to the previous value
        gageCombobox.childNodes.forEach((option, index) => {
            if (option.value.split('.')[0] === previousValue) {
                gageCombobox.selectedIndex = index;
            }
        });

        updatePORTable();
    });

}

function populateBasinComboBox(data) {

    // Clear the combobox
    basinCombobox.innerHTML = '';

    // Loop through the basins list and add then to the combobox
    data.forEach(item => {
        let newItem = document.createElement('option');
        newItem.value = item;
        newItem.textContent = item;
        basinCombobox.appendChild(newItem);
    });

}

function populateGageComboBox(basin, data) {

    let gagesNameList = Object.keys(data[basin]);

    let currentGageList = [];

    if (dailyCheckbox.checked) {
        gagesNameList.forEach(gage => {
            if (data[basin][gage].datman) {
                currentGageList.push(gage);
            }
        });       
    } else {
        gagesNameList.forEach(gage => {
            if (data[basin][gage].stageRev) {
                currentGageList.push(gage);
            }
        });
    };

    // Clear the combobox
    gageCombobox.innerHTML = '';

    // Loop through the basins list and add then to the combobox
    currentGageList.forEach(item => {
        let newItem = document.createElement('option');
        newItem.value = dailyCheckbox.checked ? data[basin][item].datman : data[basin][item].stageRev;
        newItem.textContent = item;
        gageCombobox.appendChild(newItem);
    });

}

function filterGagesData(data) {

    // Create empty object to hold all the basins
    let basinData = {};

    data.forEach(basin => {

        // Create an object for the basin and an empty object to hold the gages
        basinData[basin.basin] = {};

        basin.gages.forEach(gage => {

            // Add data if there is at least a datman or stageRev
            if (gage['tsid_datman'] || gage['tsid_stage_rev']) {

                // Add each gage with the necessary data for the project
                basinData[basin.basin][gage['location_id'].split('.')[0]] = {
                    isProject: gage['display_stage_29'],
                    datman: gage['tsid_datman'],
                    stageRev: gage['tsid_stage_rev'],
                } 

            }

        });

    });

    return basinData;

}

function updatePORTable() {
    fetchJsonFile(generalInfoURL + gageCombobox.value, function(data) {
        let datesData = data.entries[0].extents[0];
        porDates[0].textContent = datesData['earliest-time'].split('T')[0];
        porDates[1].textContent = datesData['last-update'].split('T')[0];
    });
}
