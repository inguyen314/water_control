
// Fetch Json Data
export function fetchJsonFile(urlToFetch, sucessFunction, errorFunction){
    fetch(urlToFetch)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        sucessFunction(data);
    })    
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        errorFunction();
        alert("There was a problem getting the Data.");
    })
}

// Get name list
export function getNames(data) {
    // Empty list to hold the new objects
    let objArray = []

    // Loop through all the basins
    data.forEach(element => {

        // Temporary hold list to get the datman names from each basin
        let tempList = [];

        // Loop through all the gages in the current basin and add the datman name to the temp list
        element['gages'].forEach(item => {
            tempList.push(item['tsid_datman']);
        });

        let gagesList = tempList.filter(n => n != null);

        // Add a new object with the basin name and gages list to the object array
        if (gagesList.length > 0) {
            objArray.push({
                basin: element['basin'],
                datman: gagesList,
            })
        };
    });

    return objArray;
}

// Add Values to combobox
export function addBasinNames(combobox, objectList) {
    objectList.forEach(element => {
        let option = document.createElement('option');
        option.value = element['basin'];
        option.textContent = element['basin']; 
        combobox.appendChild(option);
    });
}

// Create URL to fetch the stage data
export function createUrl(domain, timeSeries, nameValue, officeValue, beginValue, endValue, timeZone){
    return domain + timeSeries + "name=" + nameValue + "&office=" + officeValue + "&begin=" + beginValue + "&end=" + endValue + "&timezone=" + timeZone
}

// Function to format string
export function formatString(textField, stringText) {
    if (textField == "name") {
        let output = stringText.replace(/ /g, '%20');
        return output
    } else if (textField === "start date" || textField === "end date") {
        let timeHour = (textField == "start date") ? "00%3A00%3A00.00Z" : "23%3A59%3A59.99Z";
        let output = stringText + "T" + timeHour;
        return output;
    }
}

// Function to get the mean list for the period
export function getList(dataList) {
    let yearsList = [],
        objectList = [];
        
    // Loop through the data list to get years of the period
    dataList.forEach(element => {
        let currentYear = element[0].split('-')[0];
        let currentYearInt = parseInt(currentYear);
        if (!yearsList.includes(currentYearInt)) {
            yearsList.push(currentYearInt);
        }
    });

    // Loop to get the dates and event for each year separated
    yearsList.forEach(year => {
        let tempList = [];
        dataList.forEach(element => {
            if (parseInt(element[0].split("-")[0]) === year) {
                tempList.push({
                    date: element[0].split("T")[0],
                    stage: element[1],
                });
            }
        });
        objectList.push({
            year: year,
            data: tempList,
        })
    });

    return objectList;
}

// Function to get the mean values
export function getMeanList(dataObject) {
    
}
