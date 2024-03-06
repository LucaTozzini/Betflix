// // React
import {createContext, useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';

// // Navigation
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// // Navigation Bar
import SystemNavigationBar from 'react-native-system-navigation-bar';

// // Orientation
import {
  OrientationLocker,
  PORTRAIT,
  LANDSCAPE,
} from 'react-native-orientation-locker';

// // Screens
import BrowseScreen from './screens/Browse.screen';
import SearchScreen from './screens/Search.screen';
import UsersScreen from './screens/Users.screen';
import UserScreen from './screens/User.screen';
import AddressScreen from './screens/Address.screen';
import TorrentsScreen from './screens/Torrents.screen';
import ItemScreen from './screens/Item.screen';
import PlayerScreen from './screens/Player.screen';
import ServerScreen from './screens/Server.screen';
import NewUserScreen from './screens/NewUser.screen';
import NoServerScreen from './screens/NoServer.screen';

// Components
import NavMenuComponent from './components/NavMenu.component';

// Hooks
import useUserHook from './hooks/useUser.hook';
import useAddress from './hooks/useAddress.hook';
import useRowSizeHook from './hooks/useRowSize.hook';
import {useRemoteMediaClient} from 'react-native-google-cast';

//
const Stack = createNativeStackNavigator();
export const globalContext = createContext();

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function App() {
  const [showNav, setShowNav] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [routeName, setRouteName] = useState(null);
  const [orientation, setOrientation] = useState(PORTRAIT);
  const [rowGap, setRowGap] = useState(7);
  const [horizontalMargin, setHorizontalMargin] = useState(7);
  const [numPosters, setNumPosters] = useState(3);
  const [numContinues, setNumContinues] = useState(1);
  const [numCast, setNumCast] = useState(3);
  const [numEpisodes, setNumEpisodes] = useState(1.5);

  // Use Hooks
  const address = useAddress();
  const userHook = useUserHook({address});
  const client = useRemoteMediaClient();
  const posterRowSize = useRowSizeHook({
    gap: rowGap,
    margin: horizontalMargin,
    numItems: numPosters,
  });
  const continueRowSize = useRowSizeHook({
    gap: rowGap,
    margin: horizontalMargin,
    numItems: numContinues,
  });
  const castRowSize = useRowSizeHook({
    gap: rowGap,
    margin: horizontalMargin,
    numItems: numCast,
  });
  const episodeRowSize = useRowSizeHook({
    gap: rowGap,
    margin: horizontalMargin,
    numItems: numEpisodes,
  });

  const castImage = () => {
    client
      .loadMedia({
        mediaInfo: {
          contentUrl:
            'https://images.squarespace-cdn.com/content/v1/520b6dcee4b0734e32e29746/1553092004466-AP3WPCPOMHBJ87PJ67LG/Netflix_anim.gif',
        },
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (client && routeName !== 'item' && routeName !== 'player') {
      castImage();
    }
  }, [client, routeName]);

  const handleStateChange = state => {
    const routeName = state?.routes[state?.routes.length - 1].name;
    setRouteName(routeName);

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

  if (address === null) {
    return (
      <>
        <OrientationLocker orientation={PORTRAIT} />
        <AddressScreen />
      </>
    );
  }

  if(address === -1) {
    console.log(address);
    return (
      <>
      <OrientationLocker orientation={PORTRAIT} />
      <NoServerScreen/>
      </>
    )
  }

  if (!userHook.userId) {
    return (
      <>
        <OrientationLocker orientation={PORTRAIT} />
        <globalContext.Provider value={{address, ...userHook}}>
          <View style={styles.container}>
            <NavigationContainer
              theme={NavigationTheme}
              onStateChange={handleStateChange}>
              <Stack.Navigator
                screenOptions={{headerShown: false}}
                initialRouteName="users">
                <Stack.Screen name="users" component={UsersScreen} />
                <Stack.Screen name="new_user" component={NewUserScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </globalContext.Provider>
      </>
    );
  }

  return (
    <>
      <StatusBar
        translucent
        hidden={!showStatusBar}
        backgroundColor={'transparent'}
      />
      <OrientationLocker orientation={orientation} />

      <globalContext.Provider
        value={{
          ...userHook,
          routeName,
          address,
          rowGap,
          horizontalMargin,
          posterRowSize,
          continueRowSize,
          episodeRowSize,
          castRowSize,
        }}>
        <NavigationContainer
          theme={NavigationTheme}
          onStateChange={handleStateChange}>
          <View style={styles.container}>
            <Stack.Navigator
              screenOptions={{animation: 'none', headerShown: false}}>
              <Stack.Screen name="browse" component={BrowseScreen} />
              <Stack.Screen name="search" component={SearchScreen} />
              <Stack.Screen name="user" component={UserScreen} />
              <Stack.Screen name="item" component={ItemScreen} />
              <Stack.Screen name="player" component={PlayerScreen} />
              <Stack.Screen name="server" component={ServerScreen} />
              <Stack.Screen name="torrents" component={TorrentsScreen} />
            </Stack.Navigator>
          </View>

          <NavMenuComponent show={showNav} />
        </NavigationContainer>
      </globalContext.Provider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
