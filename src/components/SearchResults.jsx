import { useState } from "react";
import MovieCard from "./MovieCard";

function SearchResults(props){

  const [searchActiveTab, setActiveTab] = useState(props.searchMediaType === 'tv' ? "TV Shows" : "Movies")
    
    return (

    <section className='trending'>
        <div className='trending-header'>
            <h4>Results for "{props.searchQuery.toLowerCase()}"</h4>
            
        </div>
        <div className='type-tabs'>
     {props.searchMediaType !== 'tv' && 
     <button className= {searchActiveTab === 'Movies' ? 'type-tab active' : 'type-tab'}
     onClick={()=>{setActiveTab("Movies")}}
     >Movies</button>}
     {props.searchMediaType !== 'movie' && 
     <button className={searchActiveTab === 'TV Shows' ? 'type-tab active' : 'type-tab'} 
     onClick={()=>{setActiveTab("TV Shows")}}
     >TV Shows</button>}
</div>

        {searchActiveTab === "Movies" && props.searchMovieRes.length === 0 &&
          <p>"No movie results found. Try checking TV Shows tab!"</p>
        }
        {searchActiveTab === "TV Shows" && props.searchTvRes.length === 0 &&
          <p>"No TV show results found. Try checking Movies tab!"</p>
        }
        <div className='card-grid'>         
               { searchActiveTab === "Movies" ? 
               props.searchMovieRes.map((eachItem) =>  
               
                 <MovieCard 
                    key={eachItem.id}
                    eachItem={eachItem}
                    
                    
                 />)
                : 
                props.searchTvRes.map((eachItem) =>  
               
                 <MovieCard 
                    key={eachItem.id}
                    eachItem={eachItem}
                  
                 />)
                
               }
                  
        </div>
{((props.isDiscover && !props.discoverExhausted) || (props.isAiTitles && !props.aiTitlesExhausted)) &&
(searchActiveTab === 'Movies' ? props.searchMovieRes.length > 0 : props.searchTvRes.length > 0) &&
<div className="load-more">
    <button onClick={()=>
        props.onLoadMore()
    }>Load More</button>
</div>
}
         
  </section>


    );
}

export default SearchResults;