import MovieCard from "./MovieCard";

function TrendingSection(props){

  const filteredResults = props.trendingAll.filter((eachItem) => {
                if(props.trendingType === 'All') return true;
                else if(props.trendingType === 'Movies') return eachItem.media_type === 'movie';
                else if(props.trendingType === 'TV Shows') return eachItem.media_type === 'tv';
               })



    return (
    <section className='trending'>
        <div className='trending-header'>
            <h2>Trending</h2>
            <div className='period-tabs'>
                <button 
                className= {props.trendingPeriod === 'Today' ? 'period-tab active' : 'period-tab' }
                onClick={()=>{props.setTrendingPeriod("Today")}}
                >Today</button>
                <button className={props.trendingPeriod === 'This Week' ? 'period-tab active' : 'period-tab' }
                onClick={()=>{props.setTrendingPeriod("This Week")}}
                >This Week</button>
            </div>
        </div>
        <div className='type-tabs'>
             <button className= {props.trendingType === 'All' ? 'type-tab active' : 'type-tab'}
             onClick={()=>{props.setTrendingType("All")}}
             >All</button>
             <button className= {props.trendingType === 'Movies' ? 'type-tab active' : 'type-tab'}
             onClick={()=>{props.setTrendingType("Movies")}}
             >Movies</button>
             <button className={props.trendingType === 'TV Shows' ? 'type-tab active' : 'type-tab'} 
             onClick={()=>{props.setTrendingType("TV Shows")}}
             >TV Shows</button>
        </div>
        <div className='card-grid'>
              
              
                 
               { filteredResults.map((eachItem) =>  
               
                 <MovieCard 
                    key={eachItem.id}
                    eachItem={eachItem}
                    onCardClick = {props.onCardClick}
                 />
               )}
                  
        </div>
         
  </section>
    );
}

export default TrendingSection;

