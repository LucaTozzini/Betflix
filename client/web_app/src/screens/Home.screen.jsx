import { useEffect, useContext, useState } from 'react';

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
  

  const [ showTop, setShowTop ] = useState(true);
  const [ showLatest, setShowLatest ] = useState(true);
  const [ showGenres, setShowGenres ] = useState(false);
  const [ showEighties, setShowEighties ] = useState(true);
  const [ showNineties, setShowNineties ] = useState(true);
  const [ showWatchlist, setShowWatchlist ] = useState(true);
  
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
    if(showWatchlist) FetchWatchlist();
  }, [showWatchlist]);

  useEffect(() => {
    if(remix) FetchGenreBrowseMedia();
    setRemix(false);
  }, [remix])

  return (
    <>
    <Hero items={continueItems}/>
    <div className={styles.container}>
      <WatchlistHook/>

      <div className={styles.sectionsBar}>
        <button style={{opacity: !remix ? 1 : 0.6}} onClick={() => setRemix(true)}>Remix</button>
        <button style={{opacity: showWatchlist ? 1 : 0.6}} onClick={() => setShowWatchlist(!showWatchlist)}>Watchlist</button>
        <button style={{opacity: showLatest ? 1 : 0.6}} onClick={() => setShowLatest(!showLatest)}>Latest</button>
        <button style={{opacity: showTop ? 1 : 0.6}} onClick={() => setShowTop(!showTop)}>Top Rated</button>
        <button style={{opacity: showEighties ? 1 : 0.6}} onClick={() => setShowEighties(!showEighties)}>80s</button>
        <button style={{opacity: showNineties ? 1 : 0.6}} onClick={() => setShowNineties(!showNineties)}>90s</button>
        <button style={{opacity: showGenres ? 1 : 0.6}} onClick={() => setShowGenres(!showGenres)}>Genres</button>
      </div>
      { showWatchlist ? <MediaSection title={'My Watchlist'} items={watchlistMedia} force={true}/> : <></> }
      { showLatest ? <MediaSection title={'Latest Releases'} items={latestMedia}/> : <></> }
      { showTop ? <MediaSection title={'Top Rated'} items={topRatedMedia}/> : <></> }
      { showEighties ? <MediaSection title={'80s'} items={eightiesMedia}/> : <></> }
      { showNineties ? <MediaSection title={'90s'} items={ninetiesMedia}/> : <></> }
      { showGenres && genreBrowseMedia ? genreBrowseMedia.map(i => <MediaSection key={i.genre} title={i.genre} items={i.data}/>) : <></> }
    </div>
    </>
  );
};
  
export default Home;