import {fetchJsonFile,getNames,addBasinNames,createUrl,formatString,getList} from './functions.js'

const jsonUrl = "https://www.mvs-wc.usace.army.mil/php_data_api/public/json/gage_control.json"

// Const Variables
const basinName = document.getElementById('basinCombobox'),
      gageName = document.getElementById('gageCombobox'),
      beginDate = document.getElementById('begin-input'),
      endDate = document.getElementById('end-input'),
      computeHTMLBtn = document.getElementById('button-html');

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
            officeName = "MVS",
            beginValue = formatString("start date", beginDate.value),
            endValue = formatString('end date', endDate.value);

        // Create the URL to get the data
        let stageUrl = createUrl(domain,timeSeries,datmanName,officeName,beginValue,endValue,timeZone)
        fetchJsonFile(stageUrl, main, function(){});
    });

    computeHTMLBtn.click();
    
}

// Main function
function main(data) {
    let objData = data["time-series"]["time-series"][0]["irregular-interval-values"]["values"];
    /* let dateArray = getList(objData, "date");
    let stageArray = getList(objData, "stage"); */
    
    let wholePeriodList = getList(objData);

    console.log(wholePeriodList);

    let tableDateList = [];

    let month = 1;
    let day = 1;
    for (let i = 1; i <= 372; i++) {

        if (i % 31 === 0){
            tableDateList.push({
                date: `${month}-${day}`,
                stage: 0
            });
            month++;
            day = 1;
        } else {
            tableDateList.push({
                date: `${month}-${day}`,
                stage: 0
            });
            day++;
        }

    }

    tableDateList.forEach(item => {
        wholePeriodList.forEach(element => {
            element.data.forEach(x => {
                let year = x.date.split('-')[0];
                let splittedDate = x.date.split('-').slice(-2);
                let refDate = splittedDate.join('-');

                // Get Average
                var count = 0;
                if (refDate === item.date) {
                    console.log(`refDate: (${refDate}); item.date: (${item.date})`);
                    item.stage += x.stage; 
                    count ++;
                }

            });
        });
    });

    console.log(tableDateList);
}


// Fetch the gages names
fetchJsonFile("../json/data.json", initialize, function(){});

/* fetchJsonFile(jsonUrl, initialize, function(){}); */

