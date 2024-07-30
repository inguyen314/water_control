
const popUpWindow = document.getElementById('popup-window');
const popUpWindowBtn = document.getElementById('popup-button');
const pageWrapDiv = document.querySelector('#page-container .page-wrap');
const popupTitle = document.getElementById('popup-title');
const popupMessage = document.getElementById('popup-message');

popUpWindowBtn.addEventListener('click', function() {
    popUpWindow.classList.toggle('hidden');
    pageWrapDiv.classList.toggle('blur');
})

export function popupWindowText(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
}
