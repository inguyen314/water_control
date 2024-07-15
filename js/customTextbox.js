/*
author: Oscar R. Cordero-Pérez
date: 07/11/2024
*/

/*
This code will add a custom textbox to a div element

For this code to work and add the textbox, the div must have a class called "textbox-style" and the content must be the name of the style to be used.

Styles at this moment:
-Google style (google_style)
-Teams style (teams_style)
-Custom style 1 (style_1)
-Custom style 2 (style_2)

You can add multiple classes to the textbox by adding the 'data-class' attribute with the value of the classes you want to set.
You can add an id to the textbox by adding the 'data-id' attribute with the value of the id you want to set.
You can add a place holder text to the textbox by adding the 'data-placeholder' attribute with the value of the text you want to set as a placeholder.

If you don't add any of those attributes then it will use the default values.
Default values:
-class = undefine (it doesn't have classes)
-id = undefine (it doesn't have an id)
-placeholder = "Enter Text Here..."

The div should look like this in orther to work.
<div class="textbox-style" data-class="any-amount-of-class" data-id="any-id" data-placeholder="any-placeholder">Textbox Style</div>

If you want to change the width, height of the color of the bar that appears when you click on the textbox, you can add a 'style' attribute to the div.
The variables for those styles are:
color = --clr, --clr-1, clr-2 (Depends on the style)
width = --w
height = --h
font-size = --font-size

The div should look like this.
<div class="textbox-style" data-class="any-amount-of-class" data-id="any-id" data-placeholder="any-placeholder" style="--clr: red; --w: 400px; --h: 30px;">Textbox Style</div>
*/



let cssStyle = `
.textbox-style {
    --w: 500px;
    --h: 3em;
    --font-size: 1em;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--w);
    height: var(--h);
    padding: 0 15px;
}

.textbox-style.google-style span.material-symbols-outlined {
    color: #8f8e8e;
    font-size: 1.3em;
    z-index: 1;
}

.textbox-style.google-style input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    font-size: var(--font-size);
    padding-left: 10px;
    z-index: 1;
}

.textbox-style.google-style span.background-box {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid #c0bebe;
    border-radius: 1.5em;
    background: #fff;
}

.textbox-style.google-style input:hover ~ span.background-box {
    box-shadow: 0 1px 8px rgba(0,0,0,0.2);
}

/* Textbox Teams Style */
.textbox-style.teams-style {
    --clr: rgb(125, 30, 160);
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 500px;
    height: 2.5em;
    border: 1px solid #c0bebe;
    border-radius: 0.5em;
    background: #fff;
    overflow: hidden;
}

.textbox-style.teams-style input {
    position: absolute;
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    font-size: var(--font-size);
    padding-left: 1.5em;
}

.textbox-style.teams-style input:focus ~ span,
.textbox-style.teams-style input:hover ~ span {
    position: absolute;
    content: '';
    height: 0.15em;
    width: 100%;
    bottom: 0;
    background-color: var(--clr);
}

/* Textbox Style 1 */
.textbox-style {
    --clr-1: #e2e2e2;
    --clr-2: #e8e7e7;
    --clr-font: #000;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 400px;
    height: 40px;
}

.textbox-style.style-1 input {
    position: absolute;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding-left: 50px;
    z-index: 1;
    bottom: 0;
    transition: 0.5s;
    color: var(--clr-font);
    font-weight: 600;
    font-size: var(--font-size);
}

.textbox-style.style-1 input::placeholder {
    color: var(--clr-font);
    font-weight: 500;
}

.textbox-style.style-1 span {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: var(--clr-1);
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2),
                inset -2px -2px 5px rgba(255, 255, 255, 0.2);
    z-index: 0;
    bottom: 0;
    transition: 0.5s;
}

.textbox-style.style-1 input:focus ~ span {
    background: var(--clr-2);
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2),
                -5px -5px 10px rgba(245, 245, 245, 0.2);
    animation: movesUp 0.5s forwards;
    transition: 0.5s;
}

.textbox-style.style-1 input:focus {
    animation: movesUp 0.5s forwards;
    transition: 0.5s;
}

.textbox-style.style-1 input:not(:focus) ~ span {
    animation: movesDown 0.5s forwards;
}

.textbox-style.style-1 input:not(:focus) {
    animation: movesDown 0.5s forwards;
}

@keyframes movesUp {
    0% {
        bottom: 0px;
    }
    100% {
        bottom: 10px;
    }
}

@keyframes movesDown {
    0% {
        bottom: 10px;
    }
    100% {
        bottom: 0px;
    }
}

/* Textbox Style 2 */
.textbox-style.style-2 {
    --clr-1: #999;
    --clr-2: #fff;
    position: relative;
    border: none;
    border-radius: 1.5em;
    background: var(--clr-1);
}

.textbox-style.style-2 input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    font-size: var(--font-size);
    text-align: center;
    color: var(--clr-2);
    font-weight: 600;
}

.textbox-style.style-2 span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    color: var(--clr-2);
    font-size: var(--font-size);
    font-weight: 600;
    pointer-events: none;
    text-wrap: nowrap;
    transition: 0.5s;
}

.textbox-style.style-2 input:focus ~ span,
.textbox-style.style-2.has-content span {
    top: -0.8em;
    font-size: calc(var(--font-size) * 0.8);
    background: var(--clr-1);
    padding: 0.2em 1em 0em 1em;
    border-top-left-radius: 1em;
    border-top-right-radius: 1em;
    font-weight: 500;
    transition: 0.5s;
}

`;


let textboxList = document.querySelectorAll('.textbox-style');

textboxList.forEach(textbox => {

    if (textbox.textContent === "google_style"){
        textbox.classList.add('google-style');
        textbox.innerHTML = `<span class="material-symbols-outlined">search</span>`;
        if (textbox.dataset.id && textbox.dataset.class) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" id="${textbox.dataset.id}" autocomplete="off"></input>`;
        } else if (textbox.dataset.id) {
            textbox.innerHTML += `<input type="text" id="${textbox.dataset.id}" autocomplete="off"></input>`;
        } else if (textbox.dataset.class) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" autocomplete="off"></input>`;
        } else {
            textbox.innerHTML += `<input type="text" autocomplete="off"></input>`;
        }
        textbox.innerHTML += `<span class="background-box"></span>`;
        
    } else if (textbox.textContent === "teams_style") {
        textbox.classList.add('teams-style');
        textbox.innerHTML = "";
        if (textbox.dataset.id && textbox.dataset.class && textbox.dataset.placeholder) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" id="${textbox.dataset.id}" placeholder="${textbox.dataset.placeholder}" autocomplete="off"></input>`;
        } else if (textbox.dataset.id) {
            textbox.innerHTML += `<input type="text" id="${textbox.dataset.id}" placeholder="Enter Text Here..." autocomplete="off"></input>`;
        } else if (textbox.dataset.class) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" placeholder="Enter Text Here..." autocomplete="off"></input>`;
        } else if (textbox.dataset.placeholder) {
            textbox.innerHTML += `<input type="text" placeholder="${textbox.dataset.placeholder}" autocomplete="off"></input>`;
        } else {
            textbox.innerHTML += `<input type="text" placeholder="Enter Text Here..." autocomplete="off"></input>`;
        }
        textbox.innerHTML += `<span></span>`;

    } else if (textbox.textContent === "style_1") {
        textbox.classList.add('style-1');
        textbox.innerHTML = "";
        if (textbox.dataset.id && textbox.dataset.class && textbox.dataset.placeholder) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" id="${textbox.dataset.id}" placeholder="${textbox.dataset.placeholder}" autocomplete="off"></input>`;
        } else if (textbox.dataset.id) {
            textbox.innerHTML += `<input type="text" id="${textbox.dataset.id}" placeholder="Enter Text Here..." autocomplete="off"></input>`;
        } else if (textbox.dataset.class) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" placeholder="Enter Text Here..." autocomplete="off"></input>`;
        } else if (textbox.dataset.placeholder) {
            textbox.innerHTML += `<input type="text" placeholder="${textbox.dataset.placeholder}" autocomplete="off"></input>`;
        } else {
            textbox.innerHTML += `<input type="text" placeholder="Enter Text Here..." autocomplete="off"></input>`;
        }
        textbox.innerHTML += `<span></span>`;

    } else if (textbox.textContent === "style_2") {
        textbox.classList.add('style-2');
        textbox.innerHTML = "";
        if (textbox.dataset.id && textbox.dataset.class) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" id="${textbox.dataset.id}" autocomplete="off"></input>`;
        } else if (textbox.dataset.id) {
            textbox.innerHTML += `<input type="text" id="${textbox.dataset.id}" autocomplete="off"></input>`;
        } else if (textbox.dataset.class) {
            textbox.innerHTML += `<input type="text" class="${textbox.dataset.class}" autocomplete="off"></input>`;
        } else {
            textbox.innerHTML += `<input type="text" autocomplete="off"></input>`;
        }

        if (textbox.dataset.placeholder) {
            textbox.innerHTML += `<span>${textbox.dataset.placeholder}</span>`;
        } else {
            textbox.innerHTML += `<span>Enter Text Here...</span>`;
        }

        // Add event listener
        textbox.firstChild.addEventListener('input', function() {
            if (textbox.firstChild.value.length > 0) {
                textbox.classList.add('has-content');
            } else {
                textbox.classList.remove('has-content');
            }
        });

    }

});

let styleElement = document.querySelector('head style');
if (styleElement) {
    styleElement.textContent += cssStyle;
} else {
    styleElement = document.createElement('style');
    styleElement.textContent = cssStyle;
    document.querySelector('head').appendChild(styleElement);
}

let headElement = document.querySelector('head');
let linkExist = false;
headElement.childNodes.forEach(child => {
    if (child.nodeName === "LINK") {
        if (child.href.includes('Material+Symbols+Outlined')) {
            linkExist = true;
        }
    };
});

if (!linkExist) {
    let newLink = document.createElement('link');
    newLink.rel = "stylesheet";
    newLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
    headElement.appendChild(newLink);
};

