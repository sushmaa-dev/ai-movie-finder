import { useState } from "react";
import MovieCard from "./MovieCard";

function TrendingSection(props){

    const [activeSection, setActiveSection] = useState('trending');
    const [popularTab, setPopularTab] = useState('streaming');

  const filteredResults = props.trendingAll.filter((eachItem) => {
                if(props.trendingType === 'All') return true;
                else if(props.trendingType === 'Movies') return eachItem.media_type === 'movie';
                else if(props.trendingType === 'TV Shows') return eachItem.media_type === 'tv';
               })

    const streamingResults = [...props.popularMovies, ...props.popularTv]
    .sort(() => Math.random() - 0.5);

  const popularResults = popularTab === 'streaming' ? streamingResults
    : popularTab === 'ontv' ? props.onTv
    : props.inTheatres;

    return (
    <section className='trending'>
        <div className='trending-header'>
            <div className='main-section-tabs'>
                <button className={activeSection === 'trending' ? 'main-section-tab active' : 'main-section-tab'} onClick={()=> setActiveSection('trending')}>Trending</button>
                <button className={activeSection === 'popular' ? 'main-section-tab active' : 'main-section-tab'} onClick={()=> setActiveSection('popular')}>Popular</button>
            </div>
          {activeSection === 'trending' && (
            <div className='period-tabs'>
                <button 
                className= {props.trendingPeriod === 'Today' ? 'period-tab active' : 'period-tab' }
                onClick={()=>{props.setTrendingPeriod("Today")}}
                >Today</button>
                <button className={props.trendingPeriod === 'This Week' ? 'period-tab active' : 'period-tab' }
                onClick={()=>{props.setTrendingPeriod("This Week")}}
                >This Week</button>
            </div>
          )}
        </div>
  {activeSection === 'trending' ? (
    <>   
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
            {filteredResults.map((eachItem) =>
              <MovieCard key={eachItem.id} eachItem={eachItem} />
            )}
       </div>
    </>
  ) : (
    <>
    <div className='type-tabs'>
              <button className={popularTab === 'streaming' ? 'type-tab active' : 'type-tab'}
                onClick={()=> setPopularTab('streaming')}>Streaming</button>
              <button className={popularTab === 'ontv' ? 'type-tab active' : 'type-tab'}
                onClick={()=> setPopularTab('ontv')}>On TV</button>
              <button className={popularTab === 'theatres' ? 'type-tab active' : 'type-tab'}
                onClick={()=> setPopularTab('theatres')}>In Theatres</button>
            </div>
            <div className='card-grid'>
              {popularResults.map((eachItem) =>
                <MovieCard key={eachItem.id} eachItem={eachItem} />
              )}
            </div>
          </>
        )}

  </section>
    );
}

export default TrendingSection;

