/*
author: Oscar R. Cordero-Pérez
date: 07/11/2024
*/

/*
This code will add a custom textbox to a div element

For this code to work and add the textbox, the div must have a class called "textbox-div".

You can add an id to the textbox by adding the 'data-id' attribute with the value of the id you want to set.
You can add a place holder text to the textbox by adding the 'data-placeholder' attribute with the value of the text you want to set as a placeholder.

If you don't add any of those attributes then it will use the default values.
Default values:
-id = undefine (it doesn't have an id)
-placeholder = "Enter Text Here..."

The div should look like this in orther to work.
<div class="textbox-div" data-id="any-id" data-placeholder="any-placeholder"></div>

If you want to change the width, height of the color of the bar that appears when you click on the textbox, you can add a 'style' attribute to the div.
The variables for those styles are:
color = --clr
width = --w
height = --h

The div should look like this.
<div class="textbox-div" data-id="any-id" data-placeholder="any-placeholder" style="--clr: red; --w: 400px; --h: 30px;"></div>
*/

/* Create HTML inner text for textbox */
let textboxInnerText = `
<input type="text" placeholder="Enter Text Here...">
<span></span>
`;


/* Create Style for textbox */
let textboxStyle = `
.textbox-div {
    --clr: rgba(112, 14, 204, 0.5);
    --w: 400px;
    --h: 30px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid grey;
    border-radius: 5px;
    overflow: hidden;
    width: var(--w);
    height: var(--h);
}

.textbox-div input {
    background: transparent;
    border: none;
    width: 100%;
    height: 100%;
    padding-left: 15px;
    outline: none;
    font-size: 1em;
}

.textbox-div input:focus ~ span {
    position: absolute;
    width: 100%;
    height: 2px;
    background: var(--clr);
    bottom: 0px;
}
`;

/* Convert any div.textbox-div to the custom textbox */
let newTextbox = document.querySelectorAll('.textbox-div');
newTextbox.forEach(element => {
    // If there is an Arial Placeholder then it will be passed as the textbox placeholder
    if (element.dataset.placeholder && element.dataset.id) {
        element.innerHTML = `
            <input type="text" placeholder="${element.dataset.placeholder} id="${element.dataset.id}">
            <span></span>
        `;
    } else if (element.dataset.placeholder) {
        element.innerHTML = `
            <input type="text" placeholder="${element.dataset.placeholder}">
            <span></span>
        `;
    } else if (element.dataset.id) {
        element.innerHTML = `
            <input type="text" id="${element.dataset.id}" placeholder="Enter Text Here...">
            <span></span>
        `;
    } else {
        element.innerHTML = textboxInnerText;
    }
});

/* Add style to the textbox */
// If there is no style element then it will create one
if (document.querySelector('head style')) {
    let styleElement = document.querySelector('head style');
    styleElement.textContent += textboxStyle;
} else {
    let newStyleElement = document.createElement('style');
    newStyleElement.textContent = textboxStyle;
    document.querySelector('head').appendChild(newStyleElement);
}

