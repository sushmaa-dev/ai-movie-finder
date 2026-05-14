import { useState, useEffect } from 'react'
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

   // state to store API limit error, handling Limit reached error (429)
   const [geminiErrorMessage, setGeminiErrorMessage] = useState('');

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
      
      const nextPage = pageNum +1;
      setPageNum(nextPage);

       Promise.all([
                  fetch(`${currentMovieURL}&page=${nextPage}`, {headers : { Authorization : "Bearer " + token }}),
                  fetch(`${currentTvURL}&page=${nextPage}`, {headers : { Authorization : "Bearer " + token }})
       ])
       .then(([movieRes, tvRes]) => Promise.all([movieRes.json(), tvRes.json()]))
       .then(([movieData, tvData]) => {
                 const moviesWithMediaType = movieData.results.map(movie => {
                  return {...movie, media_type : 'movie'}
                 })

               const tvWithMediaType = tvData.results.map(tv => {
                  return {...tv, media_type : 'tv'}
                 })
                  
                    setSearchMovieRes((prev)=> [...prev, ...moviesWithMediaType]);
                    setSearchTvRes((prev) => [...prev, ...tvWithMediaType]);    
                  
               })
      
   }

   
   
  function handleSearch(inputText){
      
      setPageNum(1);
     
 
        fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+tokenKey, {
         method: 'POST' ,
         headers : {
            'Content-Type' : 'application/json'
         },
         body: JSON.stringify({
            contents : [{
               parts : [{
                 text: `Analyze this user input and return JSON only, no extra text, no markdown, no code blocks.
                        User input: ${inputText}

If the user is searching for a specific movie or TV show title, use search endpoint.
If the user is describing what they want to watch (mood, genre, year, language etc), use discover endpoint.

Return exactly this format:
{
  "endpoint": "search" or "discover",
  "query": "movie or show title if search, otherwise null. Strip words like 'movie', 'film', 'show', 'series', 'tv' from the title — only include the actual title name.",
  "media_type": "movie or tv show or all",
  "genre": "Use exact TMDB movie genre name based on user input: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, TV Movie, Thriller, War, Western. IF the user mentions a mood, map it: 'feel good/light hearted' -> Comedy, 'dark/creepy' -> Horror, 'emotional/heartbreaking' -> Drama, 'tense' -> Thriller, 'rom-com/romantic comedy' -> Romance. ALWAYS return this even if user mentions TV shows. Otherwise null.",
  "tv_genre": "Use exact TMDB TV genre name: Action & Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Kids, Mystery, News, Reality, Sci-Fi & Fantasy, Soap, Talk, War & Politics, Western. If user mentions Thriller or Horror or uses mood 'dark/creepy' return Mystery, Romance return Drama, Rom-com or Romantic Comedy return Comedy, Fantasy or Science Fiction return Sci-Fi & Fantasy. ALWAYS return this even if user mentions movies. Otherwise null.",
  "primary_release_year": "year as number if mentioned, otherwise null",
  "vote_average_gte": "8 if user mentions top rated or highly rated, otherwise null",
  "with_original_language": "language code like hi for hindi, ko for korean, es for spanish, otherwise null",
  "sort_by": "popularity.desc for popular, vote_average.desc for top rated, release_date.desc for newest, otherwise popularity.desc"
}`
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
         // console.log(geminiResult);
//  matching genre from geminiresult to movigenre array we fetched from TMDB and attaching id to the geminiresults.
         const matchedMovieGenre = geminiResult.genre ? movieGenres.find(g=> g.name === geminiResult.genre ) : null
         geminiResult.genreId=  matchedMovieGenre ? matchedMovieGenre.id : null
            // console.log(geminiResult);

 //  matching genre from geminiresult to tvGenre array we fetched from TMDB and attaching id to the geminiresults.           
         const matchedTvGenre= geminiResult.tv_genre ? tvGenres.find(g=> g.name === geminiResult.tv_genre )  : null
        geminiResult.tvGenreId= matchedTvGenre ? matchedTvGenre.id : null
            // taking geminiresults to create endpoints fr search and discover  fr TMDB api
            const baseURL = "https://api.themoviedb.org/3/"
            
            let movieURL= ''
            let tvURL = ''
            if(geminiResult.endpoint === 'search'){
                  setIsDiscover(false);
                  movieURL = `${baseURL}search/movie?query=${geminiResult.query}`
                  
                  tvURL = `${baseURL}search/tv?query=${geminiResult.query}`
            }else{
               setIsDiscover(true);
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
                   params.append('sort_by', 'first_air_date.desc');
                   params.append('first_air_date.lte', today);
                   params.append('vote_count.gte', '50');
                  }   

               if(geminiResult.genreId) params.delete('with_genres');
               if(geminiResult.tvGenreId) params.append('with_genres', geminiResult.tvGenreId)   ;
               
               // console.log(geminiResult);

               tvURL = `${baseURL}discover/tv?${params.toString()}`;
               setCurrentTvURL(tvURL);
               }
                 
               // console.log(tvURL);
               // we will call both movie and tv show urls and get thier results
               Promise.all([
                  fetch(`${movieURL}&page=1`, {headers : { Authorization : "Bearer " + token }}),
                  fetch(`${tvURL}&page=1`, {headers : { Authorization : "Bearer " + token }})
               ])
               .then(([movieRes, tvRes]) => Promise.all([movieRes.json(), tvRes.json()]))
               .then(([movieData, tvData]) => {
                 const moviesWithMediaType = movieData.results.map(movie => {
                  return {...movie, media_type : 'movie'}
                 })

               const tvWithMediaType = tvData.results.map(tv => {
                  return {...tv, media_type : 'tv'}
                 })
                  // console.log(moviesWithMediaType);
                  // console.log(tvWithMediaType); 
                    setSearchMovieRes(moviesWithMediaType);
                    setSearchTvRes(tvWithMediaType);    
                  setIsSearching(true);
               })
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
