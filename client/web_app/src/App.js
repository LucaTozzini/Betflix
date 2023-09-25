import { useEffect, useRef, useState } from "react";

// Router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MenuLayout from './layouts/Menu.layout';

// Screens
import Home from './screens/Home.screen';
import Item from "./screens/Item.screen";
import NoPage from './screens/NoPage.screen';
import Player from "./screens/Player.screen";
import Search from "./screens/Search.screen";
import Person from "./screens/Person.screen";
import NewUser from "./screens/NewUser.screen";
import Database from "./screens/Database.screen";
import SelectUser from "./screens/SelectUser.screen";
import UserSettings from "./screens/UserSettings.screen";
import SearchAddress from "./screens/SearchAddress.screen";
import PlayerReroute from "./screens/PlayerReroute.screen";

// Contexts
import currentUserContext from "./contexts/currentUser.context";
import browseContext from "./contexts/browse.context";
import serverContext from "./contexts/server.context";

// Hooks
import Authenticator from "./hooks/Authenticator.hook";

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
  const [ isAdmin, setIsAdmin ] = useState(null);
  const [ isChild, setIsChild ] = useState(null);
  const [ userName, setUserName ] = useState(null);
  const [ userImage, setUserImage ] = useState(null);
  const [ authenticated, setAuthenticated ] = useState(false);

  // Browse context var
  const [watchlistMediaIds, setWatchlistMediaIds] = useState([]);
  const [genreBrowseMedia, setGenreBrowseMedia] = useState(JSON.parse(localStorage.getItem('genreBrowseMedia')) || null);
  

  useEffect(() => {
    if(userId) {
      localStorage.setItem('userId', userId);
    }
    else {
      localStorage.removeItem('userId');
    }

    if(userPin) {
      localStorage.setItem('userPin', userPin);
    }
    else {
      localStorage.removeItem('userPin');
    }

  }, [userId, userPin]);

  useEffect(() => {
    localStorage.setItem('genreBrowseMedia', JSON.stringify(genreBrowseMedia))
  }, [genreBrowseMedia]);

  
  if(!serverValid) return <SearchAddress address={serverAddress} set={setServerAddress} valid={setServerValid}/>
  return (
    <serverContext.Provider value={{serverAddress}}>
    <browseContext.Provider value={{watchlistMediaIds, setWatchlistMediaIds, genreBrowseMedia, setGenreBrowseMedia}}>
    <currentUserContext.Provider value={{userId, setUserId, userPin, setUserPin, isAdmin, setIsAdmin, isChild, setIsChild, userImage, setUserImage, userName, setUserName, authenticated, setAuthenticated}}>
      <BrowserRouter>
        <Authenticator/>
        <Routes>
          <Route path="/" element={<MenuLayout/>}>
            <Route index element={<Navigate to='/browse'/> }/>
            <Route path="database" element={<Database/>}/>
            <Route path="*" element={<NoPage/>}/>
          </Route>

          <Route path="/browse" element={<MenuLayout/>}>
            <Route index element={<Home/>}/>
            <Route path="search" element={<Search/>}/>
            <Route path="item/:mediaId" element={<Item/>}/>
            <Route path="person/:personId" element={<Person/>}/>
          </Route>

          <Route path="player">
            <Route path=":mediaId/:episodeId" element={<Player/>}/>
            <Route path="reroute/:mediaId/:episodeId" element={<PlayerReroute/>}/>
          </Route>

          <Route path="/users">
            <Route index element={<SelectUser/>}/>
            <Route path="new" element={<NewUser/>}/>
            <Route path="settings" element={<UserSettings/>}/>
          </Route>

        </Routes>
      </BrowserRouter>
    </currentUserContext.Provider>
    </browseContext.Provider>
    </serverContext.Provider>
  );
};

export default App;
