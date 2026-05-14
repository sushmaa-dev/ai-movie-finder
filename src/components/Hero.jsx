import SearchBar from "./SearchBar";

function Hero(props){
    return (
    <section className='hero'>
       <p className='tagline'>Movie & TV Discovery</p>
       <h1>Find what to watch, <br /> <span>just by describing it.</span></h1>
       <p className='subtitle'>Type a mood, a vibe, a title, or a genre. AI understands you naturally.</p>
    
       <SearchBar onSearch={props.onSearch}/>
    </section>
    );
}

export default Hero;