import { useEffect, useRef, useState } from "react";

// Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from './layouts/Browse.layout';

// Screens
import Home from './screens/Home.screen';
import Item from "./screens/Item.screen";
import NoPage from './screens/NoPage.screen';
import Player from "./screens/Player.screen";
import Search from "./screens/Search.screen";
import NewUser from "./screens/NewUser.screen";
import Database from "./screens/Database.screen";
import SelectUser from "./screens/SelectUser.screen";
import SearchAddress from "./screens/SearchAddress.screen";
import PlayerReroute from "./screens/PlayerReroute.screen";

// Contexts
import currentUserContext from "./contexts/currentUser.context";
import mediaItemSizeContext from "./contexts/mediaItemSize.context";
import browseContext from "./contexts/browse.context";
import serverContext from "./contexts/server.context";

function App() {
  // 
  const [ serverValid, setServerValid ] = useState(false);
  const [ serverAddress, setServerAddress ] = useState(() => window.localStorage.getItem('serverAddress') || null);
  useEffect(() => {
    window.localStorage.setItem('serverAddress', serverAddress);
  }, [serverAddress]);

  // Current user context var
  const [ userId, setUserId ] = useState(localStorage.getItem('userId') || null);
  const [ userPin, setUserPin ] = useState(localStorage.getItem('userPin') || null);
  const [ userData, setUserData ] = useState(JSON.parse(localStorage.getItem('userData')) || {});
  const [ authenticated, setAuthenticated ] = useState(false);

  // Item size context var
  const mediaScrollRef = useRef(null);
  const [ itemWidth, setItemWidth ] = useState();
  const [ itemsGap, setItemsGap ] = useState();
  const [ itemsOnPage, setItemsOnPage ] = useState();
  const [ manualTrigger, setManualTrigger ] = useState(false);

  // Browse context var
  const [watchlistMediaIds, setWatchlistMediaIds] = useState([]);
  const [genreBrowseMedia, setGenreBrowseMedia] = useState(JSON.parse(localStorage.getItem('genreBrowseMedia')) || null);
  

  useEffect(() => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userPin', userPin);
  }, [userId, userData, userPin]);

  useEffect(() => {
    localStorage.setItem('genreBrowseMedia', JSON.stringify(genreBrowseMedia))
  }, [genreBrowseMedia]);

  
  if(!serverValid) return <SearchAddress address={serverAddress} set={setServerAddress} valid={setServerValid}/>
  return (
    <serverContext.Provider value={{serverAddress}}>
    <currentUserContext.Provider value={{userId, setUserId, userPin, setUserPin, userData, setUserData, authenticated, setAuthenticated}}>
    <mediaItemSizeContext.Provider value={{mediaScrollRef, itemWidth, setItemWidth, itemsGap, setItemsGap, itemsOnPage, setItemsOnPage, manualTrigger, setManualTrigger}}>
    <browseContext.Provider value={{watchlistMediaIds, setWatchlistMediaIds, genreBrowseMedia, setGenreBrowseMedia}}>
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={<Layout/>}>
            <Route index element={<Navigate to='/browse/home'/> }/>
            <Route path="*" element={<NoPage/>}/>
          </Route>

          <Route path="/browse" element={<Layout/>}>
            <Route path="home" element={<Home/>}/>
            <Route path="item/:mediaId" element={<Item/>}/>
            <Route path="search" element={<Search/>}/>
          </Route>

          <Route path="player">
            <Route path=":mediaId/:episodeId" element={<Player/>}/>
            <Route path="reroute/:mediaId/:episodeId" element={<PlayerReroute/>}/>
          </Route>

          <Route path="/users">
            <Route path="select" element={<SelectUser/>}/>
            <Route path="new" element={<NewUser/>}/>
          </Route>

          <Route path="/database" element={<Layout/>}>
            <Route index element={<Database/>}/>
          </Route>

        </Routes>
      </BrowserRouter>
    </browseContext.Provider>
    </mediaItemSizeContext.Provider>
    </currentUserContext.Provider>
    </serverContext.Provider>
  );
};

export default App;
