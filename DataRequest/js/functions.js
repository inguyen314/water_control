export function blurBackground () {
    let blur = document.querySelector('#page-container .page-wrap');
    blur.classList.toggle('active');
    let popupWindow = document.getElementById('popup-window');
    popupWindow.classList.toggle('active');
}

// Get name list
export function getNames(data) {
    // Empty list to hold the new objects
    let objArray = []

    // Loop through all the basins
    data.forEach(element => {

        // Temporary hold list to get the datman names from each basin
        let tempList = [];

        // Temporary hold list to get the rev names from each basin
        let tempList_2 = [];

        // Loop through all the gages in the current basin and add the datman name to the temp list
        element['gages'].forEach(item => {
            tempList.push(item['tsid_datman']);
            tempList_2.push(item['tsid_stage_rev']);
        });

        let gagesList = tempList.filter(n => n != null);
        let gagesListRev = tempList_2.filter(n => n != null);

        // Add a new object with the basin name and gages list to the object array
        if (gagesList.length > 0) {
            objArray.push({
                basin: element['basin'],
                datman: gagesList,
                rev: gagesListRev,
            })
        };
    });
    console.log(objArray);
    return objArray;
}

export function popupMessage (msgType, message) {
    let popupTitle = document.getElementById('popup-title');
    let popupMessage = document.getElementById('popup-message');
    if (msgType === "warning") {
        popupTitle.innerHTML = "Warning";
    } else if (msgType === "error") {
        popupTitle.innerHTML = "Error";
    } else {
        popupTitle.innerHTML = "Message";
    }
    popupMessage.innerHTML = message;
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
