import { useNavigate } from 'react-router-dom';

function Navbar(props){
    const navigate = useNavigate();
    return (
       <nav>
         <div className='logo' onClick={()=>{
    props.setIsSearching(false)
    props.setGeminiErrorMessage('')
    navigate('/')
}} >Movie<span>Finder</span></div>
          <div className='ai-badge'>
            <div className="ai-dot"></div>
          AI Powered</div>
        </nav>
  
    );
}

export default Navbar;