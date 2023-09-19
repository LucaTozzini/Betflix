import { useEffect, useContext, useState } from 'react';

// Icons
import { PiCardsBold, PiFilmReel, PiTelevisionSimpleBold, PiPlusBold } from "react-icons/pi";

// Context
import currentUserContext from '../contexts/currentUser.context';
import browseContext from '../contexts/browse.context';
import serverContext from '../contexts/server.context';

// Components
import Hero from '../components/Hero.component';
import MediaSection from '../components/MediaSection.component';

// Hooks
import WatchlistHook from '../hooks/Watchlist.hook';

// CSS
import styles from '../styles/Browse.screen.module.css';

const Home = () => {
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  
  const [ againMedia, setAgainMedia ] = useState(null);
  const [ latestMedia, setLatestMedia ] = useState(null);
  const [ topRatedMedia, setTopRatedMedia ] = useState(null);
  const [ eightiesMedia, setEightiesMedia ] = useState(null);
  const [ ninetiesMedia, setNinetiesMedia ] = useState(null);
  const [ continueMedia, setContinueMedia ] = useState(null);
  const [ watchlistMedia, setWatchlistMedia ] = useState(null);
  
  const [ showGenres, setShowGenres ] = useState(null);
  const [ movieGenres, setMovieGenres ] = useState(null);

  const [ browseState, setBrowseState ] = useState(0);

  const FetchMovieGenres = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/genres?limit=30&type=1`);
      const json = await response.json(); 
      setMovieGenres(json);
    }
    catch(err) {

    }
  };

  const FetchShowGenres = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/genres?limit=30&type=2`);
      const json = await response.json(); 
      setShowGenres(json);
    }
    catch(err) {

    }
  };

  const FetchContinue = async () => {
    try {
      const options = {method:'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin, limit: 30})};
      const response = await fetch(`${serverAddress}/users/continue`, options);
      const json = await response.json();
      setContinueMedia(json);
    }
    catch(err) {

    }
  }

  const FetchWatchlist = async () => {
    try{
      const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin})};
      const response = await fetch(`${serverAddress}/watchlist/`, options);
      const json = await response.json();
      setWatchlistMedia(json);
    }
    catch(err){

    }
  };

  const FetchWatchAgain = async () => {
    try{
      const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin, limit: 30})};
      const response = await fetch(`${serverAddress}/browse/watch-again`, options);
      const json = await response.json();
      setAgainMedia(json);
    }
    catch(err){
      
    }
  }

  const FetchLatestReleases = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/latest/releases?limit=30`);
      const json = await response.json();
      setLatestMedia(json);
    }
    catch(err) {
      
    }
  };

  const FetchTopRated = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/top-rated?limit=30&minVote=8.5`);
      const json = await response.json();
      setTopRatedMedia(json);
    }
    catch(err) {
      
    }
  };

  const Fetch80s = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/date-range?startDate=1980-01-01&endDate=1989-12-31`);
      const json = await response.json();
      setEightiesMedia(json);
    }
    catch(err) {
     
    }
  };

  const Fetch90s = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/date-range?startDate=1990-01-01&endDate=1999-12-31`);
      const json = await response.json();
      setNinetiesMedia(json);
    }
    catch(err) {
      
    }
  };

  useEffect(() => {
    if(browseState == 0) {
      if(!continueMedia) FetchContinue();
      if(!latestMedia) FetchLatestReleases();
      if(!topRatedMedia) FetchTopRated();
      if(!eightiesMedia) Fetch80s();
      if(!ninetiesMedia) Fetch90s();
    }
    else if(browseState == 1) {
      if(!movieGenres) FetchMovieGenres();
    }
    else if(browseState == 2) {
      if(!showGenres) FetchShowGenres();
    }
    else if(browseState == 3) {
      if(!watchlistMedia) FetchWatchlist();
      if(!againMedia) FetchWatchAgain();
    }
  }, [browseState]);

  return (
    <div className={styles.container}>
      <WatchlistHook/>
      <Hero key={'hr'} items={continueMedia} autoPlay={browseState == 0} heroTitle={browseState == 0 ? 'Continue Watching' : ''}/>

      <div className={styles.sectionsBar}>
      <button className={styles.sectionButton} onClick={() => setBrowseState(0)}>
          <PiCardsBold/>
          <h3>Browse</h3>
        </button>
        <button className={styles.sectionButton} onClick={() => setBrowseState(1)}>
          <PiFilmReel/>
          <h3>Movies</h3>
        </button>
        <button className={styles.sectionButton} onClick={() => setBrowseState(2)}>
          <PiTelevisionSimpleBold/>
          <h3>TV Shows</h3>
        </button>
        <button className={styles.sectionButton} onClick={() => setBrowseState(3)}>
          <PiPlusBold/>
          <h3>Watchlist</h3>
        </button>
      </div>

      {
        browseState == 0 ?
        <>
          <MediaSection key={'lr'} title={'Latest Releases'} items={latestMedia}/>
          <MediaSection key={'tr'} title={'Top Rated'} items={topRatedMedia}/>
          <MediaSection key={'8s'} title={'80s'} items={eightiesMedia}/>
          <MediaSection key={'9s'} title={'90s'} items={ninetiesMedia}/>
        </>
        : browseState == 1 ? 
        <>
          { movieGenres ? movieGenres.map(i => <MediaSection key={i.genre} title={i.genre} items={i.data}/>) : <></> }
        </>
        :browseState == 2 ?
        <>
          { showGenres ? showGenres.map(i => <MediaSection key={i.genre} title={i.genre} items={i.data}/>) : <></> }
        </>
        :browseState == 3 ?
        <>
          <MediaSection key={'wl'} title={'My List'} items={watchlistMedia}/>
          <MediaSection key={'wa'} title={'Watch Again'} items={againMedia}/>
        </> 
        : <></>
      }
    </div>
  );
};
  
export default Home;