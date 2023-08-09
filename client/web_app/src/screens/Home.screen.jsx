import { useEffect, useContext, useState } from 'react';

// Context
import currentUserContext from '../contexts/currentUser.context';
import browseContext from '../contexts/browse.context';
import itemSizeContext from '../contexts/mediaItemSize.context';
import serverContext from '../contexts/server.context';

// Components
import MediaSection from '../components/MediaSection.component';
import Hero from '../components/Hero.component';

// Hooks
import MediaItemSizeCalculator from '../hooks/MediaItemSizeCalculator.hook';
import WatchlistHook from '../hooks/Watchlist.hook';

// CSS
import styles from '../styles/Browse.screen.module.css';

const Home = () => {
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  const { genreBrowseMedia, setGenreBrowseMedia } = useContext(browseContext);
  const [ watchlistMedia, setWatchlistMedia ] = useState([]);
  const { setManualTrigger } = useContext(itemSizeContext);
  const [ continueItems, setContinueItems ] = useState(null);

  const [ showGenres, setShowGenres ] = useState(true);
  const [ showWatchlist, setShowWatchlist ] = useState(true);
  const [ remix, setRemix ] = useState(false);

  const FetchGenreBrowseMedia = async () => {
    const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId, userPin})}
    const response = await fetch(`${serverAddress}/browse/genres`, options);
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

  useEffect(() => {
    if(!genreBrowseMedia) FetchGenreBrowseMedia();
    FetchWatchlist();
    FetchContinue();
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
      <MediaItemSizeCalculator/>

      <div className={styles.sectionsBar}>
        <button style={{opacity: !remix ? 1 : 0.6}} onClick={() => setRemix(true)}>Remix</button>
        <button style={{opacity: showWatchlist ? 1 : 0.6}} onClick={() => {setShowWatchlist(!showWatchlist); setManualTrigger(true)}}>Watchlist</button>
        <button style={{opacity: showGenres ? 1 : 0.6}} onClick={() => {setShowGenres(!showGenres); setManualTrigger(true)}}>Genres</button>
      </div>
      { showWatchlist ? <MediaSection title={'My Watchlist'} items={watchlistMedia} force={true}/> : <></> }
      { showGenres && genreBrowseMedia ? genreBrowseMedia.map(i => <MediaSection key={i.genre} title={i.genre} items={i.data}/>) : <></> }
    </div>
    </>
  );
}
  
  export default Home;