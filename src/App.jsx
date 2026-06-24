import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrendingSection from './components/TrendingSection';
import Footer from './components/Footer';
import SearchResults from './components/SearchResults';
import MovieDetail from './components/MovieDetail';

function App() {

   const token = import.meta.env.VITE_TMDB_TOKEN
   const tokenKey = import.meta.env.VITE_GEMINI_KEY
    
   // state fr fetching genres fr tv and movie on page load
   const [movieGenres, setMovieGenres] = useState([]);
   const [tvGenres, setTvGenres] = useState([]);

   const [movies, setMovies] = useState([]); 
   const [trendingPeriod, setTrendingPeriod] = useState("Today");
   const [trendingType, setTrendingType] = useState("All");

   // for shoowing searchResults
   const [searchMovieRes, setSearchMovieRes] = useState([]);
   const [searchTvRes, setSearchTvRes] = useState([]);
   const [isSearching, setIsSearching] = useState(false);
    
   // state which stores user's input
   const [searchQuery, setSearchQuery] = useState('');

   // state to store the movie data, when on particular movieCard is clicked
   const [selectedMovie, setSelectedMovie] = useState(null);

   // state to store the page number fr SearchResults
    const [pageNum, setPageNum]= useState(1);
  
   
   // states to store movie url and tv show url 
   const [currentMovieURL, setCurrentMovieURL] = useState(''); 
   const [currentTvURL, setCurrentTvURL] = useState(''); 
 
   // state to check which endpoint is selected: search or discover
   const [isDiscover, setIsDiscover] = useState(false);

   // states for ai_titles path (complex queries)
   const [aiTitlesList, setAiTitlesList] = useState([]);
   const [aiTitlesOffset, setAiTitlesOffset] = useState(0);

   const [aiTitlesMediaType, setAiTitlesMediaType] = useState('all');
   const [discoverExhausted, setDiscoverExhausted] = useState(false);

   // state to store API limit error, handling Limit reached error (429)
   const [geminiErrorMessage, setGeminiErrorMessage] = useState('');

   const [searchMediaType, setSearchMediaType] = useState('all');


   const period = trendingPeriod === 'Today' ? 'day' : 'week'

   useEffect(()=>{
      fetch('https://api.themoviedb.org/3/trending/all/'+period, 
         {headers : { Authorization: "Bearer " + token} })
      .then(res => res.json())
      .then(data => setMovies(data.results))
   }, [trendingPeriod])


   
   useEffect( ()=>{
     
      Promise.all([
         fetch('https://api.themoviedb.org/3/genre/movie/list', 
            {headers : { Authorization :"Bearer " + token }}),
         fetch('https://api.themoviedb.org/3/genre/tv/list', 
            {headers: { Authorization : "Bearer " + token }})
      ]).then(([movieGenres, tvGenRes]) => Promise.all([movieGenres.json(), tvGenRes.json()]))
      .then(([movieGenData, tvGenData]) => {
         setMovieGenres(movieGenData.genres);
         setTvGenres(tvGenData.genres);
      })
}, [])


   function handleCardClick(movie){
       setSelectedMovie(movie);
       setGeminiErrorMessage('');
       window.scrollTo(0,0);

   } 

   function handleLoadMore(){

      // ai_titles path — use cursor/offset
      if(aiTitlesList.length > 0){
         const nextBatch = aiTitlesList.slice(aiTitlesOffset, aiTitlesOffset + 10);
         
         if(nextBatch.length === 0) return;

         const baseURL = "https://api.themoviedb.org/3/"

         const moviePromises = aiTitlesMediaType !== 'tv' ? nextBatch.map(item =>
            fetch(`${baseURL}search/movie?query=${encodeURIComponent(item.title)}&page=1`,
               {headers: {Authorization: "Bearer " + token}})
            .then(res => res.json())
            .then(data => {
         if(data.results && data.results.length > 0){
            const match = item.language 
   ? data.results.find(r => r.original_language === item.language && r.poster_path && r.vote_average > 0 && (r.release_date || r.first_air_date)) || null
   : data.results[0];
return match ? {...match, media_type: 'movie'} : null;
         }
         return null;
      })
         ) : [];

         const tvPromises = aiTitlesMediaType !== 'movie' ? nextBatch.map(item =>
            fetch(`${baseURL}search/tv?query=${encodeURIComponent(item.title)}&page=1`,
               {headers: {Authorization: "Bearer " + token}})
            .then(res => res.json())
            .then(data => {
         if(data.results && data.results.length > 0){
            const match = item.language 
   ? data.results.find(r => r.original_language === item.language && r.poster_path && r.vote_average > 0 && (r.release_date || r.first_air_date)) || null
   : data.results[0];
return match ? {...match, media_type: 'tv'} : null;
         }
         return null;
      })
         ) : [];
         Promise.all([Promise.all(moviePromises), Promise.all(tvPromises)])
         .then(([movieResults, tvResults]) => {
            const validMovies = movieResults.filter(m => m !== null);
            const validTv = tvResults.filter(t => t !== null);
            setSearchMovieRes((prev) => [...prev, ...validMovies]);
            setSearchTvRes((prev) => [...prev, ...validTv]);
            setAiTitlesOffset(aiTitlesOffset + 10);
         })

      }else{
         // existing discover path
         const nextPage = pageNum + 1;
         setPageNum(nextPage);

         Promise.all([
            fetch(`${currentMovieURL}&page=${nextPage}`, {headers: {Authorization: "Bearer " + token}}),
            fetch(`${currentTvURL}&page=${nextPage}`, {headers: {Authorization: "Bearer " + token}})
         ])
         .then(([movieRes, tvRes]) => Promise.all([movieRes.json(), tvRes.json()]))
         .then(([movieData, tvData]) => {
            const moviesWithMediaType = movieData.results
               .filter(movie => movie.poster_path && movie.vote_average > 0 && movie.release_date)
               .map(movie => {
                  return {...movie, media_type: 'movie'}
               })
            const tvWithMediaType = tvData.results
               .filter(tv => tv.poster_path && tv.vote_average > 0 && tv.first_air_date)
               .map(tv => {
                  return {...tv, media_type: 'tv'}
               })
            setSearchMovieRes((prev) => [...prev, ...moviesWithMediaType]);
            setSearchTvRes((prev) => [...prev, ...tvWithMediaType]);
            if(movieData.results.length === 0 && tvData.results.length === 0){
               setDiscoverExhausted(true);
            }
         })
      }
   }

   
   
  function handleSearch(inputText){
      
      setPageNum(1);
      setAiTitlesList([]);
      setAiTitlesOffset(0);
      setAiTitlesMediaType('all');
         setDiscoverExhausted(false);
         
      const currentYear = new Date().getFullYear();
 
        fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key='+tokenKey, {
         method: 'POST' ,
         headers : {
            'Content-Type' : 'application/json'
         },
         body: JSON.stringify({
            contents : [{
               parts : [{
                  text: `You are a movie and TV show expert. Analyze this user input and return JSON only, no extra text, no markdown, no code blocks.
                  User input: ${inputText}
                  
                  IMPORTANT RULES BEFORE DECIDING PATH:
                  - If user says "new", "recent", "latest", "new releases", "recently released", "just released", "this year" → ALWAYS use PATH 1 with primary_release_year: ${currentYear} and sort_by: "release_date.desc"
                  - If user says "new", "recent" or "latest" combined with a specific language (e.g. "new telugu movies", "latest hindi films", "recent korean shows") → ALWAYS use PATH 1 with primary_release_year: ${currentYear} and sort_by: "popularity.desc"
                  - If user mentions a specific person (actor, director) → ALWAYS use PATH 2
                  - If user says "movies like X" or "similar to X" → ALWAYS use PATH 2
                  - If user describes a vibe, theme, or concept that cannot be mapped to a genre → ALWAYS use PATH 2
                  - If the input contains a recognizable genre from this list: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western → ALWAYS use PATH 1 discover, even if there are descriptive words or adjectives around it
                  
                  PATH 1 - If the input is a GENERIC query where you can extract clear structured params like genre, year, language, sort order, rating (e.g. "thriller movies 2026", "top rated korean shows", "popular horror", "new releases", "recently released movies"):
                  Return:
                  {
                    "endpoint": "discover",
                    "query": null,
                    "media_type": "Use 'movie' ONLY if user explicitly mentions movies or films. Use 'tv' ONLY if user explicitly mentions shows, series, or tv. Use 'all' for everything else where media type is not clearly specified.",
                    "genre": "exact TMDB movie genre: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western. Map moods: feel good -> Comedy, dark/creepy -> Horror, emotional -> Drama, tense -> Thriller. null if not applicable.",
                    "tv_genre": "exact TMDB TV genre: Action & Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Kids, Mystery, News, Reality, Sci-Fi & Fantasy, Soap, Talk, War & Politics, Western. If user mentions Thriller or Horror or uses mood 'dark/creepy' return Mystery, Romance return Drama, Rom-com or Romantic Comedy return Comedy, Fantasy or Science Fiction return Sci-Fi & Fantasy. null if not applicable.",
                    "primary_release_year": "year as number if mentioned. If user says new, recent, latest, new releases, recently released, this year -> return ${currentYear}. Otherwise null.",
                    "vote_average_gte": "8 if user mentions top rated or highly rated, otherwise null",
                    "with_original_language": "language code like hi for hindi, ko for korean, kn for kannada, ta for tamil, te for telugu, es for spanish, fr for french, ja for japanese, otherwise null",
                    "sort_by": "popularity.desc for popular, vote_average.desc for top rated, release_date.desc for newest or recent or new or latest, otherwise popularity.desc",
                    "titles": null
                  }
                  
                  PATH 2 - If the input is a COMPLEX query OR a SPECIFIC movie/TV show title (person names, actors, directors, specific titles like "Inception" or "Breaking Bad", concepts like movies like X, descriptive vibes, cultural context, specific franchises, themes that cant be mapped to a genre):
                  Return:
                  {
                    "endpoint": "ai_titles",
                    "query": null,
                    "media_type": "Use your knowledge to determine: if the titles are all movies return 'movie', if all TV shows return 'tv', if mixed or unknown return 'all'.",
                    "genre": null,
                    "tv_genre": null,
                    "primary_release_year": null,
                    "vote_average_gte": null,
                    "with_original_language": null,
                    "sort_by": null,
                    "titles": [{"title": "Title 1", "language": "language code e.g. kn, hi, en, ko, ta, te"}, {"title": "Title 2", "language": "language code"}, ...up to 20 real titles you are confident exist. Do NOT make up or hallucinate titles. If fewer than 20 exist for this query, return however many you are confident about. Quality over quantity.]
                  }
                  
                  PATH 1 examples: "thriller movies 2026", "top rated korean shows", "popular horror movies", "new releases", "recently released movies", "feel good comedy", "kannada movies", "hindi movies 2025"
                  PATH 2 examples: "rishab shetty films", "movies like Inception", "kannada movies that went global", "mind bending thriller with twist ending", "christopher nolan movies", "Inception", "Breaking Bad", "Kantara", "Peaky Blinders"`
            }]
            }]
         })
        })
        .then(res=>res.json())
        .then(data => {
         if(!data.candidates){
            setGeminiErrorMessage("Search limit reached. Please try again later.");
         }else{
            setGeminiErrorMessage('');
            setSearchQuery(inputText);

         const rawText = data.candidates[0].content.parts[0].text
         const geminiResult =    JSON.parse(rawText)
        
//  matching genre from geminiresult to movigenre array we fetched from TMDB and attaching id to the geminiresults.
         const matchedMovieGenre = geminiResult.genre ? movieGenres.find(g=> g.name === geminiResult.genre ) : null
         geminiResult.genreId=  matchedMovieGenre ? matchedMovieGenre.id : null
           

 //  matching genre from geminiresult to tvGenre array we fetched from TMDB and attaching id to the geminiresults.           
         const matchedTvGenre= geminiResult.tv_genre ? tvGenres.find(g=> g.name === geminiResult.tv_genre )  : null
        geminiResult.tvGenreId= matchedTvGenre ? matchedTvGenre.id : null
            // taking geminiresults to create endpoints fr search and discover  fr TMDB api
            const baseURL = "https://api.themoviedb.org/3/"
            
            let movieURL= ''
            let tvURL = ''
            if(geminiResult.endpoint === 'ai_titles'){
   setIsDiscover(false);
   const titles = geminiResult.titles || [];
   setAiTitlesList(titles);
   setAiTitlesOffset(0);
   setAiTitlesMediaType(geminiResult.media_type || 'all');
   setSearchMediaType(geminiResult.media_type || 'all');

   const firstBatch = titles.slice(0, 10);

   const moviePromises = geminiResult.media_type !== 'tv' ? firstBatch.map(item =>
      fetch(`${baseURL}search/movie?query=${encodeURIComponent(item.title)}&page=1`,
         {headers: {Authorization: "Bearer " + token}})
      .then(res => res.json())
      .then(data => {
         if(data.results && data.results.length > 0){
            const match = item.language 
   ? data.results.find(r => r.original_language === item.language && r.poster_path && r.vote_average > 0 && (r.release_date || r.first_air_date)) || null
   : data.results[0];
return match ? {...match, media_type: 'movie'} : null;
         }
         return null;
      })
   ) : [];

   const tvPromises = geminiResult.media_type !== 'movie' ? firstBatch.map(item =>
      fetch(`${baseURL}search/tv?query=${encodeURIComponent(item.title)}&page=1`,
         {headers: {Authorization: "Bearer " + token}})
      .then(res => res.json())
     .then(data => {
         if(data.results && data.results.length > 0){
            const match = item.language 
   ? data.results.find(r => r.original_language === item.language && r.poster_path && r.vote_average > 0 && (r.release_date || r.first_air_date)) || null
   : data.results[0];
return match ? {...match, media_type: 'tv'} : null;
         }
         return null;
      })
   ) : [];

   Promise.all([Promise.all(moviePromises), Promise.all(tvPromises)])
   .then(([movieResults, tvResults]) => {
      const validMovies = movieResults.filter(m => m !== null);
      const validTv = tvResults.filter(t => t !== null);
      setSearchMovieRes(validMovies);
      setSearchTvRes(validTv);
      setAiTitlesOffset(10);
      setIsSearching(true);
   })
            }else{
               setIsDiscover(true);
               setSearchMediaType(geminiResult.media_type || 'all');
               const today = new Date().toISOString().split('T')[0];
               const params = new URLSearchParams();

               if(geminiResult.genreId) params.append('with_genres', geminiResult.genreId);
               if(geminiResult.vote_average_gte) params.append('vote_average.gte', geminiResult.vote_average_gte);
               if(geminiResult.with_original_language) params.append('with_original_language', geminiResult.with_original_language);
               if(geminiResult.sort_by) params.append('sort_by', geminiResult.sort_by)
               if(geminiResult.primary_release_year) params.append('primary_release_year', geminiResult.primary_release_year);
               if(geminiResult.sort_by === 'release_date.desc') {
                  params.append('release_date.lte', today);
                  params.append('vote_count.gte', '50');

               }
               movieURL = `${baseURL}discover/movie?${params.toString()}`;
               setCurrentMovieURL(movieURL);
               if(geminiResult.primary_release_year) { 
                   params.delete('primary_release_year');
                   params.append('first_air_date_year', geminiResult.primary_release_year); 
                  }
               
               if(geminiResult.sort_by === 'release_date.desc') {
                   params.delete('sort_by');
                    params.delete('release_date.lte');
                    params.delete('vote_count.gte');
                   params.append('sort_by', 'first_air_date.desc');
                   params.append('first_air_date.lte', today);
                   params.append('vote_count.gte', '50');
                  }   

               if(geminiResult.genreId) params.delete('with_genres');
               if(geminiResult.tvGenreId) params.append('with_genres', geminiResult.tvGenreId)   ;
               
               
               tvURL = `${baseURL}discover/tv?${params.toString()}`;
               setCurrentTvURL(tvURL);
               }
                 
               
               // we will call both movie and tv show urls and get thier results
               if(geminiResult.endpoint !== 'ai_titles'){
               Promise.all([
                  fetch(`${movieURL}&page=1`, {headers : { Authorization : "Bearer " + token }}),
                  fetch(`${tvURL}&page=1`, {headers : { Authorization : "Bearer " + token }})
               ])
               .then(([movieRes, tvRes]) => Promise.all([movieRes.json(), tvRes.json()]))
               .then(([movieData, tvData]) => {
                 const moviesWithMediaType = movieData.results
                    .filter(movie => movie.poster_path && movie.vote_average > 0 && movie.release_date)
                    .map(movie => {
                        return {...movie, media_type : 'movie'}
                    })

               const tvWithMediaType = tvData.results
                    .filter(tv => tv.poster_path && tv.vote_average > 0 && tv.first_air_date)
                    .map(tv => {
                        return {...tv, media_type : 'tv'}
                    })
                    setSearchMovieRes(moviesWithMediaType);
                    setSearchTvRes(tvWithMediaType);    
                  setIsSearching(true);
               })
               }
         }
        })
  }


 return (
  <div className='app'>
     
     {/* nav bar  */}
     <Navbar 
      setIsSearching={setIsSearching}
      setSelectedMovie = {setSelectedMovie}
      setGeminiErrorMessage={setGeminiErrorMessage}
     />

    
{ !selectedMovie &&  <Hero onSearch={handleSearch}/> }  

{geminiErrorMessage && <p className='gemini-error'>{geminiErrorMessage}</p>}

{ selectedMovie ? 

         < MovieDetail 
            selectedMovie = {selectedMovie}
            setSelectedMovie = {setSelectedMovie}
            movieGenres={movieGenres}
            tvGenres = {tvGenres}
            onCardClick = {handleCardClick}
         /> 

         : isSearching ? 
      
   < SearchResults 
      key = {searchQuery}
      searchMovieRes = {searchMovieRes}
      searchTvRes = {searchTvRes}
      searchQuery = {searchQuery}
      onCardClick = {handleCardClick}
      onLoadMore = {handleLoadMore}
      isDiscover = {isDiscover}
      isAiTitles = {aiTitlesList.length > 0}
      aiTitlesExhausted = {aiTitlesOffset >= aiTitlesList.length}
       discoverExhausted = {discoverExhausted}
       searchMediaType = {searchMediaType}
   />
   : 
   
   <TrendingSection 
      trendingAll = {movies}
      trendingPeriod = {trendingPeriod}
      setTrendingPeriod = {setTrendingPeriod}
      trendingType = {trendingType}
      setTrendingType = {setTrendingType}
      onCardClick = {handleCardClick}
   />
  
   }

  {/* footer  */}
   <Footer />

    


  </div>
 );
}

export default App
