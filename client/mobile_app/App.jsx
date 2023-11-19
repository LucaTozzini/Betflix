import { StatusBar, View, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';

// Helpers
import { storeData, getData } from './helpers/asyncStorage.helper';

// Screens
import Item from './screens/Item.screen';
import Home from './screens/Home.screen';
import Player from './screens/Player.screen';
import MyList from './screens/MyList.screen';
import Search from './screens/Search.screen';
import SelectUser from './screens/SelectUser.screen';
import SearchAddress from './screens/SearchAddress.screen';

// Contexts
import themeContext from './contexts/theme.context';
import serverContext from './contexts/server.context';
import currentUserContext from "./contexts/currentUser.context";

// Components
import BottomTabs from './components/BottomTabs.component';

// Hooks
import Authenticator from './hooks/Authenticator.hook';

// 
const SCREEN_HEIGHT = Dimensions.get('screen').height; // device height
const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 24; 
const WINDOW_HEIGHT = Dimensions.get('window').height;
const NAVIGATION_HEIGHT = SCREEN_HEIGHT - WINDOW_HEIGHT - STATUS_BAR_HEIGHT;

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
  const [ userImage, setUserImage ] = useState(null);
  const [ userName, setUserName ] = useState(null);
  const [ authenticated, setAuthenticated ] = useState(false);
  useEffect(() => {
    if(userId) storeData("userId", userId);
    if(userPin) storeData("userPin", userPin)
  }, [userId, userPin]);

  // Theme states
  const sideMargin = 20;
  const [backgroundColor, setBackgroundColor] = useState("#040a14");
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
    },
  };

  // Router
  const navigationRef = useNavigationContainerRef();
  const [ routeName, setRouteName ] = useState(null);

  const onRouteChange = () => {
    const curr = navigationRef.getCurrentRoute().name;
    setRouteName(curr)
  };

  // 
  const fetchStorage = async () => {
    const id = await getData("userId");
    const pin = await getData("userPin");
    setUserId(id || -1);
    setUserPin(pin || -1);
  };
  useEffect(() => {fetchStorage()}, []);

  if(!userId || !userPin) {
    return
  }
  else if(!addressValid) return <SearchAddress setServerAddress={setServerAddress} setAddressValid={setAddressValid}/>
  else return (
    <View style={{flex: 1, backgroundColor}}>
      <StatusBar translucent backgroundColor={'transparent'}/>
      <themeContext.Provider value={{
        sideMargin, 
        routeName,
        backgroundColor, 
        setBackgroundColor,
        NAVIGATION_HEIGHT
      }}>
      <serverContext.Provider value={{serverAddress}}>
      <currentUserContext.Provider value={{
        userId, 
        setUserId, 
        userPin, 
        setUserPin, 
        userImage, 
        setUserImage, 
        userName, 
        setUserName, 
        authenticated, 
        setAuthenticated,
      }}>
        <NavigationContainer 
          theme={navTheme}
          ref={navigationRef}
          onReady={onRouteChange}
          onStateChange={onRouteChange}
        >

          <Authenticator routeName={routeName}/>

          <Stack.Navigator screenOptions={{headerShown: false, animation: 'none'}} initialRouteName='home'>

            <Stack.Screen name="item" component={Item}/>
            <Stack.Screen name="search" component={Search}/>
            <Stack.Screen name="player" component={Player}/>
            <Stack.Screen name="home" component={Home} />
            <Stack.Screen name="selectUser" component={SelectUser} />
            <Stack.Screen name="myList" component={MyList}/>

          </Stack.Navigator>
          <BottomTabs routeName={routeName}/>

        </NavigationContainer>

      </currentUserContext.Provider>
      </serverContext.Provider>
      </themeContext.Provider>
    </View>
  );
};

export default App;