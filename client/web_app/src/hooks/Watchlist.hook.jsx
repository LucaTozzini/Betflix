import browseContext from '../contexts/browse.context';
import { useContext, useEffect } from 'react';
import currentUserContext from '../contexts/currentUser.context';

const WatchlistHook = () => {
    const { userId, userPin } = useContext(currentUserContext);
    const { setWatchlistMediaIds } = useContext(browseContext);
    const FetchWatchlist = async () => {
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId, userPin})}
        const response = await fetch('http://localhost/watchlist', options);
        const json = await response.json();
        const mediaIds = json.map(i => i.MEDIA_ID);
        setWatchlistMediaIds(mediaIds); 
    };
    useEffect(() => {FetchWatchlist()}, []);
};

export default WatchlistHook;