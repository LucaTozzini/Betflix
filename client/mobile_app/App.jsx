import { StatusBar } from 'react-native';
import { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

// Helpers
import { storeData, getData } from './helpers/asyncStorage.helper';

// Screens
import Item from './screens/Item.screen';
import Player from './screens/Player.screen';
import Browse from './screens/Browse.screen';
import SelectUser from './screens/SelectUser.screen';
import SearchAddress from './screens/SearchAddress.screen';

// Components
import NavigationBar from './components/NavigationBar.component';

// Contexts
import themeContext from './contexts/theme.context';
import browseContext from './contexts/browse.context';
import serverContext from './contexts/server.context';
import currentUserContext from "./contexts/currentUser.context";

const Stack = createNativeStackNavigator();

const App = () => {

  // 
  const [ serverAddress, setServerAddress ] = useState(null);

  // Current user context var
  const [ userId, setUserId ] = useState(null);
  const [ userPin, setUserPin ] = useState(null);
  const [ userData, setUserData ] = useState(null);
  const [ authenticated, setAuthenticated ] = useState(false);

  // Theme var
  const sideMargin = 20;
  const [textColor, setTextColor] = useState('white');
  const [navBarColor, setNavBarColor] = useState('#1e1e1e');
  const [navBarIconColor, setNavBarIconColor] = useState('white');
  const [backgroundColor, setBackgroundColor] = useState('black');
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
    },
  };

  useEffect(() => {
    if(!serverAddress) return;
    else storeData("serverAddress", serverAddress);
  }, [serverAddress]);

  if(!serverAddress) return <SearchAddress set={setServerAddress} address={serverAddress}/>

  if(serverAddress) return (
    <themeContext.Provider value={{backgroundColor, setBackgroundColor, textColor, setTextColor, navBarColor, setNavBarColor, navBarIconColor, setNavBarIconColor, sideMargin}}>
    <serverContext.Provider value={{serverAddress}}>
    <currentUserContext.Provider value={{userId, setUserId, userPin, setUserPin, userData, setUserData, authenticated, setAuthenticated}}>
    <browseContext.Provider value={{}}>
      <StatusBar translucent={false} backgroundColor={backgroundColor}/>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{headerShown: false, animation: 'none'}}>

          {/* Browse */}
          <Stack.Group>
            <Stack.Screen name="browse" component={Browse} />
            <Stack.Screen name="item" component={Item}/>
          </Stack.Group>
          {/* Users */}
          <Stack.Group>
            <Stack.Screen name="selectUser" component={SelectUser} />
          </Stack.Group>

          <Stack.Screen name="player" component={Player}/>

        </Stack.Navigator>
        <NavigationBar/>
      </NavigationContainer>

    </browseContext.Provider>
    </currentUserContext.Provider>
    </serverContext.Provider>
    </themeContext.Provider>
  );
};

export default App;