import {createContext, useEffect, useState} from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  OrientationLocker,
  PORTRAIT,
  LANDSCAPE,
} from 'react-native-orientation-locker';

// Screens
import BrowseScreen from './screens/Browse.screen';
import SearchScreen from './screens/Search.screen';
import UsersScreen from './screens/Users.screen';
import UserScreen from './screens/User.screen';
import AddressScreen from './screens/Address.screen';
import TorrentsScreen from './screens/Torrents.screen';
import MediaScreen from './screens/Media.screen';
import PlayerScreen from './screens/Player.screen';
import ServerScreen from './screens/Server.screen';

// Components
import NavMenuComponent from './components/NavMenu.component';

// Hooks
import useUserHook from './hooks/useUser.hook';
import useServer from './hooks/useServer.hooks';
import {useRemoteMediaClient} from 'react-native-google-cast';
//
const Stack = createNativeStackNavigator();
export const globalContext = createContext();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function App() {
  const [showNav, setShowNav] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [route, setRoute] = useState(null);
  const {address} = useServer();
  const [orientation, setOrientation] = useState(PORTRAIT);
  const userHook = useUserHook({address});
  const client = useRemoteMediaClient();

  const castImage = () => {
    client.loadMedia({
      mediaInfo: {
        contentUrl:
          'https://images.squarespace-cdn.com/content/v1/520b6dcee4b0734e32e29746/1553092004466-AP3WPCPOMHBJ87PJ67LG/Netflix_anim.gif',
      },
    }).catch(err => console.error(err));
  }

  useEffect(() => {
    if(client && route !== "media" && route !== "player") {
      castImage();
    }
  }, [client, route]);

  const handleStateChange = state => {
    const routeName = state?.routes[state?.routes.length - 1].name;
    setRoute(routeName);

    if (routeName === 'player') {
      SystemNavigationBar.navigationHide();
      setOrientation(LANDSCAPE);
      setShowStatusBar(false);
      setShowNav(false);
    } else {
      SystemNavigationBar.navigationShow();
      setOrientation(PORTRAIT);
      setShowStatusBar(true);
      setShowNav(true);
    }

    if (routeName === 'browse') {
      userHook.fetchWatchlist();
      userHook.fetchContinue();
    }
  };

  useEffect(() => {
    console.log(address);
  }, [address]);

  if (!address) {
    return (
      <>
        <OrientationLocker orientation={PORTRAIT} />
        <AddressScreen />
      </>
    );
  }

  if (
    !userHook.userId ||
    userHook.admin === null ||
    (userHook.admin === 1 && userHook.userPin === null)
  ) {
    return (
      <>
        <OrientationLocker orientation={PORTRAIT} />
        <UsersScreen login={userHook.login} address={address} />
      </>
    );
  }

  return (
    <globalContext.Provider value={{...userHook, route, address}}>
      <NavigationContainer theme={MyTheme} onStateChange={handleStateChange}>
        {/* Status Bar */}
        <StatusBar
          translucent
          hidden={!showStatusBar}
          backgroundColor={'transparent'}
        />

        {/* Lock Orientation */}
        <OrientationLocker orientation={orientation} />

        {/* Main */}
        <View style={styles.container}>
          <Stack.Navigator
            screenOptions={{animation: 'none', headerShown: false}}>
            <Stack.Screen name="browse" component={BrowseScreen} />
            <Stack.Screen name="search" component={SearchScreen} />
            <Stack.Screen name="user" component={UserScreen} />
            <Stack.Screen name="media" component={MediaScreen} />
            <Stack.Screen name="player" component={PlayerScreen} />
            <Stack.Screen name="server" component={ServerScreen} />
            <Stack.Screen name="torrents" component={TorrentsScreen} />
          </Stack.Navigator>
        </View>

        {/* NavBar */}
        <NavMenuComponent show={showNav} />
      </NavigationContainer>
    </globalContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
