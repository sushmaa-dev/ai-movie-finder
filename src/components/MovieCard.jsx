function MovieCard(props){

  const ratings = props.eachItem.vote_average.toFixed(1);
  const poster = "https://image.tmdb.org/t/p/w500" + props.eachItem.poster_path;

    return (
        <div className="card" onClick={()=>{ props.onCardClick(props.eachItem)}}>
            <div className="card-poster">
              <img src={poster} alt="movie-poster"  />
              <div className="card-overlay"></div>
              <span className="movie-badge">{props.eachItem.media_type }</span>
              <div className="card-info">
                  <div className="card-title">{ props.eachItem.media_type === 'movie' ? props.eachItem.title : props.eachItem.name}</div>
                  <div className="card-meta">
                      <span className="card-year">{ props.eachItem.media_type === 'movie' ?  props.eachItem.release_date.slice(0,4) :  props.eachItem.first_air_date.slice(0,4)}</span>
                      <span className="card-rating">★ {ratings}</span>
                  </div>
             
                </div>
            </div>
        </div>
    );
}

export default MovieCard;