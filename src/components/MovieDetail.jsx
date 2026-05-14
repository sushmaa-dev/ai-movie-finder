import { useEffect, useState } from "react";


function MovieDetail(props){

    const token = import.meta.env.VITE_TMDB_TOKEN
    // console.log(props.selectedMovie);

    const [providerPlatform, setPlatform] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);


    const backdropUrl = "https://image.tmdb.org/t/p/original" + props.selectedMovie.backdrop_path;
    const moviePoster = "https://image.tmdb.org/t/p/w500" + props.selectedMovie.poster_path;

    const  currentDate = new Date(props.selectedMovie.media_type === 'movie' ? props.selectedMovie.release_date : props.selectedMovie.first_air_date);
    const finalDate = currentDate.toLocaleDateString('en-US');
   const ratingDetail= props.selectedMovie.vote_average.toFixed(1);


   const genresList = props.selectedMovie.media_type === 'movie' ? props.movieGenres : props.tvGenres;
   const getGenre = props.selectedMovie.genre_ids.map(id => {
        const matchID = genresList.find(g => g.id === id) 
        return matchID ? matchID.name : null

   }).filter(Boolean);

   
   const mediaType = props.selectedMovie.media_type === 'movie' ? 'movie' : 'tv';
   const movieID = props.selectedMovie.id;
    
   useEffect(()=>{
        fetch(`https://api.themoviedb.org/3/${mediaType}/${movieID}/watch/providers`, 
            {headers : { Authorization : "Bearer " + token}})  
        .then(res=>res.json())
        .then(data => {
            const providerRegion = navigator.language.split('-')[1] || 'US'
            const provider = data.results[providerRegion];
            setPlatform(provider);
            // console.log(provider);
        })

   }, [])

   useEffect(()=>{
    fetch(`https://api.themoviedb.org/3/${mediaType}/${movieID}/videos`, 
        {headers : { Authorization : "Bearer " + token}})
    .then(res=> res.json())
    .then(data => {
         const matchedVideo = data.results.find(v=> v.site === "YouTube" && v.type === "Trailer")
        
        setTrailerKey(matchedVideo ? matchedVideo.key : null);
    })
   }, [])


   const youtubeTrailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;

    return (
    <div className="movie-detail">
       <div className="backdrop" style={{backgroundImage : `url(${backdropUrl})`}}>
             <div className="backdrop-overlay"></div>
             <div className="backdrop-content">
                <div className="back-btn">
                         <button onClick={()=>{ props.setSelectedMovie(null)}}>← Back</button>
                </div>
                <div className="movieDetail-card"> 
                    <div className="movie-poster">
                              <img src={moviePoster} alt="movie-poster" />
                    </div>
                    <div className="movie-info">
                            <div className="movie-title-section">
                                  <h1>{props.selectedMovie.media_type === 'movie' ? props.selectedMovie.title : props.selectedMovie.name} <span className="movie-year"> ({ props.selectedMovie.media_type === 'movie' ?  props.selectedMovie.release_date.slice(0,4) :  props.selectedMovie.first_air_date.slice(0,4)})</span></h1>
                                  <div className="movieInfo-meta">
                                       <span>{finalDate}</span>
                                       <span>•</span>
                                       <span>{getGenre.join(', ')}</span>
                                       
                                  </div>
                            </div>
                            <div className="movie-rating">
                                  <span className="star">★</span>
                                  <span className="rating-value">{ratingDetail}</span>
                            </div>
                            {youtubeTrailerUrl &&
                            <button className="trailer-btn" onClick={()=> window.open(youtubeTrailerUrl, '_blank')}>▶ Play Trailer</button> 
                            }
                            <div className="movie-overview">
                                 <h3>Overview</h3>
                                 <p>{props.selectedMovie.overview}</p>
                            </div>
                            {providerPlatform && providerPlatform.flatrate && (
                            <div className="movie-stream">
                                 <h3>Now Streaming On</h3>
                                  <div className="platform">
                                     {providerPlatform.flatrate.filter(p => !p.provider_name.includes('with Ads'))
                                     .map(p=> (
                                
                                    <img 
                                        key = {p.provider_id}
                                        src={ `https://image.tmdb.org/t/p/w45${p.logo_path}`}
                                        alt = {p.provider_name}
                                        title={p.provider_name}
                                    />
                               
                             ) )}
                                  </div>
                                
                                
                            </div>
                            )}
                    </div>

                </div>  
        </div>   
       </div>



         
         
    </div>
        
    );
}

export default MovieDetail;