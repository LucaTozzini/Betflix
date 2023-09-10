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
  
  const [ latestMedia, setLatestMedia ] = useState(null);
  const [ continueItems, setContinueItems ] = useState(null);
  const [ watchlistMedia, setWatchlistMedia ] = useState(null);
  const [ topRatedMedia, setTopRatedMedia ] = useState(null);
  const [ eightiesMedia, setEightiesMedia ] = useState(null);
  const [ ninetiesMedia, setNinetiesMedia ] = useState(null);
  const { genreBrowseMedia, setGenreBrowseMedia } = useContext(browseContext);

  const [ browseState, setBrowseState ] = useState(0);
    
  const [ remix, setRemix ] = useState(false);

  const FetchGenreBrowseMedia = async () => {
    const response = await fetch(`${serverAddress}/browse/genres`);
    const json = await response.json(); 
    setGenreBrowseMedia(json);
  };

  const FetchContinue = async () => {
    const options = {method:'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin, limit: 30})};
    const response = await fetch(`${serverAddress}/users/continue`, options);
    const json = await response.json();
    setContinueItems(json);
  }


  const FetchWatchlist = async () => {
      try{
          const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin})};
          const response = await fetch(`${serverAddress}/watchlist/`, options);
          const json = await response.json();
          setWatchlistMedia(json);
      }
      catch(err){
          console.error(err.message);
      }
  };

  const FetchLatestReleases = async () => {
    try {
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, limit: 35}) };
      const response = await fetch(`${serverAddress}/browse/latest/releases`, options);
      const json = await response.json();
      setLatestMedia(json);
    }
    catch(err) {
      console.error(err.message);
    }
  };

  const FetchTopRated = async () => {
    try {
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, limit: 35, minVote: 8.5}) };
      const response = await fetch(`${serverAddress}/browse/top-rated`, options);
      const json = await response.json();
      setTopRatedMedia(json);
    }
    catch(err) {
      console.error(err.message);
    }
  };

  const Fetch80s = async () => {
    try {
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, startDate: '1980-01-01', endDate: '1989-12-31'}) };
      const response = await fetch(`${serverAddress}/browse/date-range`, options);
      const json = await response.json();
      setEightiesMedia(json);
    }
    catch(err) {
      console.error(err.message);
    }
  };

  const Fetch90s = async () => {
    try {
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({userId, userPin, startDate: '1990-01-01', endDate: '1999-12-31'}) };
      const response = await fetch(`${serverAddress}/browse/date-range`, options);
      const json = await response.json();
      setNinetiesMedia(json);
    }
    catch(err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if(!genreBrowseMedia) FetchGenreBrowseMedia();
    FetchWatchlist();
    FetchContinue();
    FetchLatestReleases();
    FetchTopRated();
    Fetch80s();
    Fetch90s();
  }, []);

  useEffect(() => {
    if(remix) FetchGenreBrowseMedia();
    setRemix(false);
  }, [remix])

  return (
    <div className={styles.container}>
      <WatchlistHook/>
      <Hero key={'hr'} items={continueItems} autoPlay={browseState == 0} heroTitle={browseState == 0 ? 'Continue Watching' : ''}/>

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
          <h3>My Watchlist</h3>
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
        <></>
        :browseState == 2 ?
        <>
          { genreBrowseMedia ? genreBrowseMedia.map(i => <MediaSection key={i.genre} title={i.genre} items={i.data}/>) : <></> }
        </>
        :browseState == 3 ?
        <>
          <MediaSection key={'wl'} title={'My Watchlist'} items={watchlistMedia}/>
        </> 
        : <></>
      }
    </div>
  );
};
  
export default Home;