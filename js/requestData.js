
// Fetch Json Data
export function fetchJsonFile(urlToFetch, sucessFunction, errorFunction=function(){alert("There was an error getting the data.")}){
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
        errorFunction(error);
    })
}