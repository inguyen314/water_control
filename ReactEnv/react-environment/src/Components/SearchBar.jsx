

function SearchBar(props) {

  const { placeHolder = 'Search' } = props

    return (
    <div className="search-bar
                    w-96 h-8 px-2
                    flex justify-center items-center gap-4
                    border-1 border-stone-700 rounded-lg
                    bg-white">
      <input type="text" placeholder={placeHolder} className="text-box
                                                              w-full
                                                              text-center outline-none
                                                              bg-transparent"/>
      <span className="material-symbols-outlined
                       text-xl
                       text-gray-500">
      search</span>
    </div>
    );
  }
  
  export default SearchBar;
