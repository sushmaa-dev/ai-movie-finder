import { useState } from "react";

function SearchBar(props){

   const [inputText, setInputText] = useState("");

  function handleChange(event){
     const newValue = event.target.value;
     
     setInputText(newValue);
  }

    return (
    <>
             {/* search or input  */}
        <div className='search-bar'>
            <input onChange={handleChange}
            onKeyDown={(event)=>{
                if(event.key === 'Enter'){
                    props.onSearch(inputText)
                    // if u want to reset input field again
                    setInputText('');
                }
            }}
            value = {inputText}
            type='text' placeholder='e.g. something scary but not too gory...'/>
            <div className="search-buttons">
                
                <button onClick={()=>{
                    props.onSearch(inputText)
                    // if u want to reset input field again
                    setInputText('');
                }}
                 className='search-btn'>Search</button>
            </div>
        </div>

        {/* suggestions  */}
        <div className='suggestions'>
          <span onClick={()=>{
            props.onSearch("something scary for tonight")
          }}>something scary for tonight</span>
          <span onClick={()=>{
            props.onSearch("Action Movies")
          }}>Action Movies</span>
          <span onClick={()=>{
            props.onSearch("best crime shows")
          }}>best crime shows</span>
          <span onClick={()=>{
            props.onSearch("feel good comedy")
          }}>feel good comedy</span>
          <span onClick={()=>{
            props.onSearch("mind bending sci-fi")
          }}>mind bending sci-fi</span>
        </div>
    </>
    
    );
}

export default SearchBar;