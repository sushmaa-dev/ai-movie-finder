import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";


function MovieDetail(props){

    const token = import.meta.env.VITE_TMDB_TOKEN
    const { id } = useParams();
    const navigate = useNavigate();
    const mediaType = props.mediaType;

    const [movieData, setMovieData] = useState(null);
    const [providerPlatform, setPlatform] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const recGridRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const [numberOfSeasons, setNumberOfSeasons] = useState(null);  

useEffect(()=>{
    setMovieData(null);
    fetch(`https://api.themoviedb.org/3/${mediaType}/${id}`, 
        {headers : { Authorization : "Bearer " + token}})
    .then(res=> res.json())
    .then(data => {
        setMovieData(data);
    })
}, [id])

    
   useEffect(()=>{
        fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers`, 
            {headers : { Authorization : "Bearer " + token}})  
        .then(res=>res.json())
        .then(data => {
            const providerRegion = navigator.language.split('-')[1] || 'US'
            const provider = data.results[providerRegion];
            setPlatform(provider);
            // console.log(provider);
        })

   }, [id])

   useEffect(()=>{
    fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/videos`, 
        {headers : { Authorization : "Bearer " + token}})
    .then(res=> res.json())
    .then(data => {
         const matchedVideo = data.results.find(v=> v.site === "YouTube" && v.type === "Trailer")
        
        setTrailerKey(matchedVideo ? matchedVideo.key : null);
    })
   }, [id])

   useEffect(()=>{
    fetch(`https://api.themoviedb.org/3/${mediaType}/${id}/recommendations`, 
        {headers : { Authorization : "Bearer " + token}})
    .then(res=> res.json())
    .then(data => {
        setRecommendations(data.results || []);
    })
}, [id])

  useEffect(()=>{
    if(mediaType === 'tv'){
        fetch(`https://api.themoviedb.org/3/tv/${id}`, 
            {headers : { Authorization : "Bearer " + token}})
        .then(res=> res.json())
        .then(data => {
            setNumberOfSeasons(data.number_of_seasons);
        })
    }
}, [id])

if(!movieData) return <div style={{color: 'white', padding: '40px'}}>Loading...</div>;

    const backdropUrl = "https://image.tmdb.org/t/p/original" + movieData.backdrop_path;
    const moviePoster = "https://image.tmdb.org/t/p/w500" + movieData.poster_path;

    const currentDate = new Date(mediaType === 'movie' ? movieData.release_date : movieData.first_air_date);
    const finalDate = currentDate.toLocaleDateString('en-US');
    const ratingDetail = movieData.vote_average ? movieData.vote_average.toFixed(1) : '0.0';

    const genresList = mediaType === 'movie' ? props.movieGenres : props.tvGenres;
    const getGenre = (movieData.genres || []).map(g => g.name);

   


   const youtubeTrailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;

   function scrollLeft(){
    recGridRef.current.scrollBy({left: -300, behavior: 'smooth'});
   }

   function scrollRight(){
    recGridRef.current.scrollBy({left: 300, behavior: 'smooth'});
   }

   function handleScroll(){
    const grid = recGridRef.current;
    if(grid){
        setShowLeftArrow(grid.scrollLeft > 0);
        setShowRightArrow(grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 10);
    }
}

    return (
    <div className="movie-detail">
       <div className="backdrop" style={{backgroundImage : `url(${backdropUrl})`}}>
             <div className="backdrop-overlay"></div>
             <div className="backdrop-content">
                <div className="back-btn">
                         <button onClick={()=>{ navigate(-1)}}>← Back</button>
                </div>
                <div className="movieDetail-card"> 
                    <div className="movie-poster">
                              <img src={moviePoster} alt="movie-poster" />
                    </div>
                    <div className="movie-info">
                    <div className="movie-title-section">
     <h1>{mediaType === 'movie' ? movieData.title : movieData.name}</h1>
      <div className="movieInfo-meta">
           <span className="detail-badge detail-badge-type">{mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
           <span className="detail-badge detail-badge-year">{mediaType === 'movie' ? movieData.release_date?.slice(0,4) : movieData.first_air_date?.slice(0,4)}</span>
{mediaType === 'tv' && numberOfSeasons && (
    <span className="detail-badge detail-badge-seasons">{numberOfSeasons} {numberOfSeasons === 1 ? 'Season' : 'Seasons'}</span>
)}
           {getGenre.map(genre => (
               <span key={genre} className="detail-badge">{genre}</span>
           ))}
      </div>
</div>
                          <div className="movie-rating">
{movieData.vote_average > 0 && (
      <>
      <span className="star">★</span>
      <span className="rating-value">{ratingDetail}</span>
      </>
)}
</div>
                            {youtubeTrailerUrl &&
                            <button className="trailer-btn" onClick={()=> window.open(youtubeTrailerUrl, '_blank')}>▶ Play Trailer</button> 
                            }
                            <div className="movie-overview">
                                 <h3>Overview</h3>
                                 <p>{movieData.overview}</p>
                            </div>
                            {providerPlatform && providerPlatform.flatrate && (
                                <div className="movie-stream">
                                  <div className="stream-heading">
                                          <div className="stream-accent"></div>
                                          <h3>Now Streaming On</h3>
                                  </div>
                                 
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

       {recommendations.length > 0 && (
        <div className="recommendations">
            <h3>More Like This</h3>
            <div className="recommendations-wrapper">
            {showLeftArrow && <button className="rec-arrow rec-arrow-left" onClick={scrollLeft}>‹</button>}
    <div className="recommendations-grid" ref={recGridRef} onScroll={handleScroll}>
                {recommendations.filter(r => r.poster_path && r.vote_average > 0).slice(0, 20).map(rec => (
                  <div key={rec.id} className="rec-card" onClick={() => navigate(`/${rec.media_type || mediaType}/${rec.id}`)}>
                    <img src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path || rec.poster_path}`} alt={rec.title || rec.name} />
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
    <p style={{margin: 0}}>{rec.title || rec.name}</p>
    <span style={{marginTop: 0, paddingRight: '8px', letterSpacing: '0.5px'}}>★ {rec.vote_average.toFixed(1)}</span>
</div>
                    </div>
                ))}
                </div>
                {showRightArrow && <button className="rec-arrow rec-arrow-right" onClick={scrollRight}>›</button>}
</div>
        </div>
       )}

         
         
    </div>
        
    );
}

export default MovieDetail;