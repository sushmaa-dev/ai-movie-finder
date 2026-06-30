import { useNavigate } from 'react-router-dom';

function MovieCard(props){
  const navigate = useNavigate();

  const ratings = props.eachItem.vote_average.toFixed(1);
  const poster = "https://image.tmdb.org/t/p/w500" + props.eachItem.poster_path;

    return (
       <div className="card" onClick={()=>{ navigate(`/${props.eachItem.media_type}/${props.eachItem.id}`)}}>
            <div className="card-poster">
              <img src={poster} alt="movie-poster"  />
              <div className="card-overlay"></div>
              <span className="movie-badge">{props.eachItem.media_type }</span>
              <div className="card-info">
                    {props.eachItem.vote_average > 0 && <span className="card-rating">{ratings}</span>}
             </div>
            </div>
        <div className="card-title">{ props.eachItem.media_type === 'movie' ? props.eachItem.title : props.eachItem.name}</div>
        </div>
    );
}

export default MovieCard;