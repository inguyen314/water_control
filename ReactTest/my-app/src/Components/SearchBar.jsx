
import '../ComponentsCSS/searchBar.css';

function SearchBar(props) {
    return (
    <div className="search-bar">
      <input type="text" placeholder={props.placeHolder}/>
      <span className="material-symbols-outlined">search</span>
    </div>
    );
  }
  
  export default SearchBar;
