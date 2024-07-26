import React, { useState } from 'react';

function Dropbox(props) {
    // State to manage the active class
    const [activeClass, setActiveClass] = useState('');

    // Active Style
    let conditionClasses = '';

    // Function to handle label click
    const handleLabelClick = () => {
        if (activeClass === 'active') {
            setActiveClass('');
            conditionClasses = '';            
        } else {
            setActiveClass('active');
            conditionClasses = '';
        }
    };

    return (
        <div className="custom-combobox
                        relative
                        w-96 h-8
                        flex flex-col
                        border border-gray-500 rounded-lg
                        bg-white">
            <label onClick={handleLabelClick} className={`${activeClass} ${conditionClasses}
                                                        relative
                                                        w-full h-full
                                                        flex justify-center items-center`}>
                <span data-value="Some-Text Value" className=''>Make a Selection</span>

            </label>
            <ul className={`${activeClass}
                            absolute`}>
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