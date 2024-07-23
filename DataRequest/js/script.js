import {
    fetchJsonFile,
    fetchJsonFileV01,
    convertUTCtoCentralTime
} from '../../js/requestData.js';
import {
    blurBackground,
    getNames,
    popupMessage,
    addBasinNames,
    haveOneYearOfData,
    showLoading,
    formatDate
} from './functions.js';

let domain = "https://coe-mvsuwa04mvs.mvs.usace.army.mil:8243/mvs-data";
let generalInfoURL = domain + "/catalog/TIMESERIES?office=MVS&like=";
let gageJsonUrl = "../../../../php_data_api/public/json/gage_control.json";
//let  = domain + "/timeseries?" + name=Mt%20Vernon-Big%20Muddy.Stage.Inst.15Minutes.0.lrgsShef-rev&office=MVS&begin=2024-01-01T00%3A00%3A00.00Z&end=2024-12-31T23%3A59%3A59.59Z&timezone=CST6CDT

// Const Elements
const basinName = document.getElementById('basinCombobox'),
      gageName = document.getElementById('gageCombobox'),
      beginDate = document.getElementById('begin-input'),
      endDate = document.getElementById('end-input'),
      resultsDiv = document.querySelector('.results'),
      darkModeCheckbox = document.querySelector('.header label input'),
      popupWindowBtn = document.getElementById('popup-button'),
      getDataBtn = document.getElementById('button-data'),
      getCSVBtn = document.getElementById('button-csv'),
      getJSONBtn = document.getElementById('button-json'),
      emailBtn = document.getElementById('button-email'),
      dailyCheckbox = document.getElementById('daily'),
      hourlyCheckbox = document.getElementById('hourly');


let globalData = [];

/*======================= Beginning of Script ========================*/
// Fetch the gages names
fetchJsonFile(gageJsonUrl, initialize, function(error){
    popupMessage("error", "There was an error getting the data.<br>Error: '" + error + "'");
    popupWindowBtn.click();
});


/*======================= Functions For Script =======================*/
function initialize(data) {

    // CSV initial function (Alert)
    getCSVBtn.addEventListener('click', csvNoDataMessage);

    // Add dark mode functionality
    darkModeCheckbox.addEventListener('click', function() {
        document.getElementById('content-body').classList.toggle('dark');
        document.getElementById('page-container').classList.toggle('dark');
    });

    // Add function to popup window button
    popupWindowBtn.addEventListener('click', blurBackground);

    // Extract the names of the basins with the list of gages
    let namesObject = getNames(data);

    // Checkbox Functions
    dailyCheckbox.addEventListener('click', function() {
        if (hourlyCheckbox.checked) {
            hourlyCheckbox.checked = false;
        }
        addGageNames(namesObject);
    });

    hourlyCheckbox.addEventListener('click', function() {
        if (dailyCheckbox.checked) {
            dailyCheckbox.checked = false;
        }
        addGageNames(namesObject);
    });

    // Add the basins names to the basin combobox
    addBasinNames(basinName, namesObject);

    // Add data to the gage combobox at the beggining of the code
    addGageNames(namesObject);

    // Change the gage values each time the basin value is changed
    basinName.addEventListener('change', function() {
        addGageNames(namesObject);
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
                        if (gage.tsid_datman === gageName.value || gage.tsid_stage_rev === gageName.value) {
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
                    if (gage.tsid_datman === gageName.value || gage.tsid_stage_rev === gageName.value) {
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

// Buttons Functions
getDataBtn.addEventListener('click', function() {

    // CSV initial function (Alert)
    getCSVBtn.removeEventListener('click', csvNoDataMessage);

    // Hide result div before getting the data if the result div is showing
    resultsDiv.classList.add('hidden');

    // Show loading animation
    showLoading();

    // Get data for the period of record
    let periodDataUrl = domain + "/timeseries?" + "name=" + gageName.value + "&office=MVS&begin=" + beginDate.value + "T05%3A00%3A00.00Z&end=" + endDate.value + "T23%3A59%3A59.59Z" + "&page-size=5000";
    fetchJsonFile(periodDataUrl, function(data) {

        // Month to Number object (For converting string months to numbers)
        let monthConvert = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        }

        console.log(periodDataUrl);

        // If the daily checkbox is checked
        if (dailyCheckbox.checked) {
            let cstData = convertUTCtoCentralTime(data)['values']; // Convert number dates to actual date and change from UTC to CST

            globalData = [];

            console.log(cstData);

            cstData.forEach(element => {
                globalData.push({
                    date: formatDate(element[0], monthConvert),
                    stage: element[1]
                });
            });

            clearAllTables();

            createMultipleTables(globalData);

            resultsDiv.classList.remove('hidden');

            getCSVBtn.addEventListener('click', function() {

                let csvString = 'Date,Stage\n';
                
                globalData.forEach(element => {
                    csvString += `${element.date},${element.stage}\n`;
                });

                exportToCSV(csvString);
            })

        // If the hourly checkbox is checked
        } else if (hourlyCheckbox.checked) {

            let cstData = convertUTCtoCentralTime(data)['values']; // Convert number dates to actual date and change from UTC to CST

            globalData = [];

            console.log(cstData);

            cstData.forEach(element => {
                globalData.push({
                    date: formatDate(element[0], monthConvert),
                    stage: element[1]
                });
            });

            clearAllTables();

            createMultipleTables(globalData);

            resultsDiv.classList.remove('hidden');

        }

        showLoading();

    }, function(error) { showLoading(); popupMessage('error', `There was an error getting the data.<br>Error:<br>${error}`); popupWindowBtn.click();});


});

// Function to add gages names in combobox
function addGageNames(data) {
    gageName.options.length = 0;
    data.forEach(element => {
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
}

// Create Table
function createTable(data) {

    let tableBody = document.querySelector('#result-table tbody');

    data.forEach(element => {
        let newRow = document.createElement('tr');
        let parseNum = parseFloat(element.stage).toFixed(2);
        newRow.innerHTML = `<td>${element.date}</td>
                            <td>${parseNum}</td>`;
        tableBody.appendChild(newRow); 
    });

}

function createMultipleTables(data) {
    
    // Check how many pages of tables will be
    let pages = 1;
    let pageCapacity = 100;
    if (data.length > 100) {
        pages = Math.ceil(data.length/100);
    }

    /*=================== Create Buttons =========================*/
    // Create Previous Button
    let arrowLeft = document.createElement('button');
    arrowLeft.id = 'previous-btn';
    arrowLeft.classList.add('disabled');

    // Style Button
    arrowLeft.textContent = "Previous Page";
    arrowLeft.style.visibility = 'hidden';
    arrowLeft.style.background = 'rgb(224, 224, 224)';
    arrowLeft.style.color = 'black';
    arrowLeft.style.position = 'absolute';
    arrowLeft.style.left = '50px';
    arrowLeft.style.top = '50px';
    arrowLeft.style.padding = '5px 15px';
    arrowLeft.style.fontSize = '1em';
    arrowLeft.style.fontWeight = '500';
    arrowLeft.style.borderRadius = '5px';
    arrowLeft.style.border = '1px solid black';
    arrowLeft.style.cursor = 'pointer';

    // Create Next Button
    let arrowRight = document.createElement('button');
    arrowRight.id = 'next-btn';

    // Style Button
    arrowRight.textContent = "Next Page";
    arrowRight.style.background = 'rgb(224, 224, 224)';
    arrowRight.style.color = 'black';
    arrowRight.style.position = 'absolute';
    arrowRight.style.right = '50px';
    arrowRight.style.top = '50px';
    arrowRight.style.padding = '5px 15px';
    arrowRight.style.fontSize = '1em';
    arrowRight.style.fontWeight = '500';
    arrowRight.style.borderRadius = '5px';
    arrowRight.style.border = '1px solid black';
    arrowRight.style.cursor = 'pointer';

    // Store Buttons in Array for adding functions easily
    let buttonList = [arrowLeft, arrowRight];

    // Add Click function Left Button
    buttonList.forEach(button => {
        button.addEventListener('mouseenter', function() {
            button.style.fontWeight = '600';
            button.style.background = 'rgb(77, 107, 212)';
            button.style.color = 'white';
        });
        button.addEventListener('mouseleave', function() {
            button.style.fontWeight = '500';
            button.style.background = 'rgb(224, 224, 224)';
            button.style.color = 'black';
        })
    });

    // Add button to the page
    resultsDiv.appendChild(arrowLeft);
    resultsDiv.appendChild(arrowRight);


    /*=================== Create Page Number =========================*/
    // Create page label element
    let pageLabel = document.createElement('span');
    pageLabel.style.position = 'absolute';
    pageLabel.style.top = '15px';
    pageLabel.style.left = '50%';
    pageLabel.style.transform = 'translateX(-50%)';
    pageLabel.style.fontSize = '1em';

    // Create textbox
    let textboxStyle = `
    width: 2.1em; height: 1.5em; background: rgb(241, 244, 255); border: 1px solid grey; outline: none; padding: 2px; border-radius: 2px; text-align: center;
    `;
    pageLabel.innerHTML = `Page <input type="text" id="page-txtb" style="${textboxStyle}" value="1"> /100`;

    resultsDiv.appendChild(pageLabel);


    /*=================== Create Tables =========================*/

    // Create the tables
    for (let i = 0; i < pages; i++) { // Amount of tables

        // Create the table element
        let newPage = document.createElement('table');
        newPage.id = `page-${i+1}`;
        newPage.innerHTML = `
        <thead>
            <tr>
                <th>Time</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            
        </tbody>
        `;

        // Make the first tables visible
        if (i === 0) {
            newPage.classList.add('visible');
        }

        resultsDiv.appendChild(newPage);
        
        // Get the numbers of row for the last table
        if (i === (pages - 1)) {
            pageCapacity = (pages * pageCapacity) - data.length;
        }

        // Create the rows
        for (let j = 0; j < pageCapacity; j++) { // Amount of rows for the table
            let index = j + (i * pageCapacity)
            let parseNum = parseFloat(data[index].stage).toFixed(2);
            let newRow = document.createElement('tr');

            newRow.innerHTML = `
            <td>${data[index].date}</td>
            <td>${parseNum}</td>
            `;

            newRow.style.textAlign = 'center';
            newRow.style.border = 'none';

            if (j % 2 !== 0) {
                newRow.style.background = 'rgb(77, 107, 212)';
                newRow.style.color = 'white';
            }

            document.getElementById(`${newPage.id}`).appendChild(newRow);
        };

    };

    // Get all the tables in a list
    let newList = [];
    resultsDiv.childNodes.forEach(child => {
        if (child.id && child.id.split('-')[0] === 'page') {
            newList.push(child);
        }
    });

    // Variable for the active table
    let activeTable = null;

    // Get the active table
    newList.forEach((element, index) => {

        let isVisible = false;

        element.classList.forEach(item => {
            if (item === 'visible') {
                isVisible = true
            }
        });

        if (isVisible) {
            activeTable = {
                table: element,
                index: index
            };
        }
    });

    // Update page label
    pageLabel.innerHTML = `Page <input type="text" id="page-txtb" style="${textboxStyle}" value="1"> /${newList.length}`;

    // Change page when buttons are pressed
    arrowRight.addEventListener('click', function() {

        // Change table to the next
        activeTable.table.classList.remove('visible');
        newList[activeTable.index + 1].classList.add('visible');

        // Update page label
        pageLabel.innerHTML = `Page <input type="text" id="page-txtb" style="${textboxStyle}" value="${activeTable.index + 2}"> /${newList.length}`;
        pageTxtb = document.getElementById('page-txtb');
        pageTxtb.addEventListener('change', function() {

            if (pageTxtb.value > newList.length) {
                pageTxtb.value = newList.length;
            } else if (pageTxtb.value < 1) {
                pageTxtb.value = 1;
            }
    
            // Change table to the previous
            activeTable.table.classList.remove('visible');
            newList[pageTxtb.value - 1].classList.add('visible');
    
            // Make the new table the active table
            activeTable = {
                table: newList[pageTxtb.value - 1],
                index: pageTxtb.value - 1
            };
    
            // Diable button depending on the active table
            if (activeTable.index === 0) {
                arrowLeft.style.visibility = 'hidden';
                arrowRight.style.visibility = 'visible';
            } else if (activeTable.index === (newList.length - 1)) {
                arrowRight.style.visibility = 'hidden';
                arrowLeft.style.visibility = 'visible';
            } else {
                arrowLeft.style.visibility = 'visible';
                arrowRight.style.visibility = 'visible';
            }
    
        });

        // Make the new table the active table
        activeTable = {
            table: newList[activeTable.index + 1],
            index: activeTable.index + 1
        };

        // Diable button depending on the active table
        if (activeTable.index === 0) {
            arrowLeft.style.visibility = 'hidden';
        } else if (activeTable.index === (newList.length - 1)) {
            arrowRight.style.visibility = 'hidden';
        } else {
            arrowLeft.style.visibility = 'visible';
            arrowRight.style.visibility = 'visible';
        }
        
    });

    // Change page when buttons are pressed
    arrowLeft.addEventListener('click', function() {

        // Change table to the previous
        activeTable.table.classList.remove('visible');
        newList[activeTable.index - 1].classList.add('visible');

        // Update page label
        pageLabel.innerHTML = `Page <input type="text" id="page-txtb" style="${textboxStyle}" value="${activeTable.index}"> /${newList.length}`;
        pageTxtb = document.getElementById('page-txtb');
        pageTxtb.addEventListener('change', function() {

            if (pageTxtb.value > newList.length) {
                pageTxtb.value = newList.length;
            } else if (pageTxtb.value < 1) {
                pageTxtb.value = 1;
            }
    
            // Change table to the previous
            activeTable.table.classList.remove('visible');
            newList[pageTxtb.value - 1].classList.add('visible');
    
            // Make the new table the active table
            activeTable = {
                table: newList[pageTxtb.value - 1],
                index: pageTxtb.value - 1
            };
    
            // Diable button depending on the active table
            if (activeTable.index === 0) {
                arrowLeft.style.visibility = 'hidden';
                arrowRight.style.visibility = 'visible';
            } else if (activeTable.index === (newList.length - 1)) {
                arrowRight.style.visibility = 'hidden';
                arrowLeft.style.visibility = 'visible';
            } else {
                arrowLeft.style.visibility = 'visible';
                arrowRight.style.visibility = 'visible';
            }
    
        });

        // Make the new table the active table
        activeTable = {
            table: newList[activeTable.index - 1],
            index: activeTable.index - 1
        };

        // Diable button depending on the active table
        if (activeTable.index === 0) {
            arrowLeft.style.visibility = 'hidden';
        } else if (activeTable.index === (newList.length - 1)) {
            arrowRight.style.visibility = 'hidden';
        } else {
            arrowLeft.style.visibility = 'visible';
            arrowRight.style.visibility = 'visible';
        }
        
    });

    // Change the page to the page inputed into the textbox
    let pageTxtb = document.getElementById('page-txtb');
    pageTxtb.addEventListener('change', function() {

        if (pageTxtb.value > newList.length) {
            pageTxtb.value = newList.length;
        } else if (pageTxtb.value < 1) {
            pageTxtb.value = 1;
        }

        // Change table to the previous
        activeTable.table.classList.remove('visible');
        newList[pageTxtb.value - 1].classList.add('visible');

        // Make the new table the active table
        activeTable = {
            table: newList[pageTxtb.value - 1],
            index: pageTxtb.value - 1
        };

        // Diable button depending on the active table
        if (activeTable.index === 0) {
            arrowLeft.style.visibility = 'hidden';
            arrowRight.style.visibility = 'visible';
        } else if (activeTable.index === (newList.length - 1)) {
            arrowRight.style.visibility = 'hidden';
            arrowLeft.style.visibility = 'visible';
        } else {
            arrowLeft.style.visibility = 'visible';
            arrowRight.style.visibility = 'visible';
        }

    });

}

// Clear Table
function clearTable() {
    let tableBody = document.querySelector('#result-table tbody');
    tableBody.innerHTML = ' ';
}

function clearAllTables() {
    resultsDiv.innerHTML = ' ';
}

function csvNoDataMessage() {
    popupMessage('error', 'There is no data to create the csv file. Get the data first and try again.');
    popupWindowBtn.click();
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
