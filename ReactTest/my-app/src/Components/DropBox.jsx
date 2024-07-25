import React, { useState } from 'react';
import '../ComponentsCSS/dropBox.css';

function Dropbox(props) {
    // State to manage the active class
    const [activeClass, setActiveClass] = useState('');

    // Function to handle label click
    const handleLabelClick = () => {
        if (activeClass === 'active') {
            setActiveClass('');
        } else {
            setActiveClass('active');
        }
    };

    return (
        <div className="custom-combobox">
        <label onClick={handleLabelClick} className={activeClass}>
            <span data-value="Some-Text Value">Make a Selection</span>
        </label>
        <ul className={activeClass}>
            <a href="#"><li data-value="Item one value">Item 1</li></a>
            <a href="#"><li data-value="Item two value">Item 2</li></a>
            <a href="#"><li data-value="Item three value">Item 3</li></a>
            <a href="#"><li data-value="Item four value">Item 4</li></a>
            <a href="#"><li data-value="Item five value">Item 5</li></a>
        </ul>
    </div>
    );
  }
  
  export default Dropbox;