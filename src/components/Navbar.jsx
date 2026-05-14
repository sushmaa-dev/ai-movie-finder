function Navbar(props){
    return (
       <nav>
          <div className='logo' onClick={()=>{
            props.setIsSearching(false)
            props.setSelectedMovie(null)
            props.setGeminiErrorMessage('')
          }} >Movie<span>Finder</span></div>
          <div className='ai-badge'>
            <div className="ai-dot"></div>
          AI Powered</div>
        </nav>
  
    );
}

export default Navbar;