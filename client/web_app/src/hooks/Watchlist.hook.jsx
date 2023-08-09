import browseContext from '../contexts/browse.context';
import { useContext, useEffect } from 'react';
import currentUserContext from '../contexts/currentUser.context';
import serverContext from '../contexts/server.context';

const WatchlistHook = () => {
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin } = useContext(currentUserContext);
    const { setWatchlistMediaIds } = useContext(browseContext);
    const FetchWatchlist = async () => {
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId, userPin})}
        const response = await fetch(`${serverAddress}/watchlist`, options);
        const json = await response.json();
        const mediaIds = json.map(i => i.MEDIA_ID);
        setWatchlistMediaIds(mediaIds); 
    };
    useEffect(() => {FetchWatchlist()}, []);
};

export default WatchlistHook;