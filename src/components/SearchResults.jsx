import { useState } from "react";
import MovieCard from "./MovieCard";

function SearchResults(props){

    const [searchActiveTab, setActiveTab] = useState("Movies")
    



    return (

    <section className='trending'>
        <div className='trending-header'>
            <h4>Results for "{props.searchQuery.toLowerCase()}"</h4>
            
        </div>
        <div className='type-tabs'>
             
             <button className= {searchActiveTab === 'Movies' ? 'type-tab active' : 'type-tab'}
             onClick={()=>{setActiveTab("Movies")}}
             >Movies</button>
             <button className={searchActiveTab === 'TV Shows' ? 'type-tab active' : 'type-tab'} 
             onClick={()=>{setActiveTab("TV Shows")}}
             >TV Shows</button>
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
                    onCardClick = {props.onCardClick}
                    
                 />)
                : 
                props.searchTvRes.map((eachItem) =>  
               
                 <MovieCard 
                    key={eachItem.id}
                    eachItem={eachItem}
                    onCardClick = {props.onCardClick}
                 />)
                
               }
                  
        </div>
        {props.isDiscover &&
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