import { StatusBar } from 'react-native';
import { useState, useEffect } from 'react';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Helpers
import { storeData } from './helpers/asyncStorage.helper';

// Screens
import Item from './screens/Item.screen';
import Player from './screens/Player.screen';
import Browse from './screens/Browse.screen';
import Search from './screens/Search.screen';
import SelectUser from './screens/SelectUser.screen';
import SearchAddress from './screens/SearchAddress.screen';

// Contexts
import themeContext from './contexts/theme.context';
import browseContext from './contexts/browse.context';
import serverContext from './contexts/server.context';
import currentUserContext from "./contexts/currentUser.context";

// Components
import Header from './components/Header.component';
import BottomTabs from './components/BottomTabs.component';

// Hooks
import GetStorage from './hooks/GetStorage.hook';

const Stack = createNativeStackNavigator();

const App = () => {

  // Server states
  const [ serverAddress, setServerAddress ] = useState(null);
  const [ addressValid, setAddressValid ] = useState(false);
  useEffect(() => {
    if(serverAddress) storeData("serverAddress", serverAddress);
  }, [serverAddress]);

  // Current-User states
  const [ userId, setUserId ] = useState(null);
  const [ userPin, setUserPin ] = useState(null);
  const [ userData, setUserData ] = useState(null);
  const [ authenticated, setAuthenticated ] = useState(false);
  useEffect(() => {
    if(userId) storeData("userId", userId);
  }, [userId])

  useEffect(() => {
    if(userPin) storeData("userPin", userPin);
  }, [userPin]);

  useEffect(() => {
    if(userData) storeData("userData", userData);
  }, [userData]);


  // Theme states
  const sideMargin = 20;
  const [textColor, setTextColor] = useState('white');
  const [bottomTabsColor, setBottomTabsColor] = useState('#1e1e1e');
  const [bottomTabsIconColor, setBottomTabsIconColor] = useState('white');
  const [backgroundColor, setBackgroundColor] = useState('black');
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
    },
  };

  if(!serverAddress || !userId || !userPin || !userData) return <GetStorage setServerAddress={setServerAddress} setUserId={setUserId} setUserPin={setUserPin} setUserData={setUserData}/>
  else if(!addressValid) return <SearchAddress set={setServerAddress} address={serverAddress} valid={setAddressValid}/>
  else return (
    <themeContext.Provider value={{backgroundColor, setBackgroundColor, textColor, setTextColor, bottomTabsColor, setBottomTabsColor, bottomTabsIconColor, setBottomTabsIconColor, sideMargin}}>
    <serverContext.Provider value={{serverAddress}}>
    <currentUserContext.Provider value={{userId, setUserId, userPin, setUserPin, userData, setUserData, authenticated, setAuthenticated}}>
    <browseContext.Provider value={{}}>
      <StatusBar translucent backgroundColor={'transparent'}/>
      <NavigationContainer theme={navTheme}>
        
        <Header/>
        <Stack.Navigator screenOptions={{headerShown: false, animation: 'none'}}>

          <Stack.Screen name="item" component={Item}/>
          <Stack.Screen name="search" component={Search}/>
          <Stack.Screen name="player" component={Player}/>
          <Stack.Screen name="browse" component={Browse} />
          <Stack.Screen name="selectUser" component={SelectUser} />

        </Stack.Navigator>
        <BottomTabs/>

      </NavigationContainer>

    </browseContext.Provider>
    </currentUserContext.Provider>
    </serverContext.Provider>
    </themeContext.Provider>
  );
};

export default App;