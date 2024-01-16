import {useEffect, useState} from 'react';
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
const Stack = createNativeStackNavigator();
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  OrientationLocker,
  PORTRAIT,
  LANDSCAPE,
} from 'react-native-orientation-locker';

// Screens
import BrowseScreen from './screens/Browse.screen';
import SearchScreen from './screens/Search.screen';
import WatchListScreen from './screens/WatchList.screen';
import UsersScreen from './screens/Users.screen';
import UserScreen from './screens/User.screen';
import AddressScreen from './screens/Address.screen';
import TorrentsScreen from './screens/Torrents.screen';
import MediaScreen from './screens/Media.screen';
import PlayerScreen from './screens/Player.screen';

// Components
import NavMenuComponent from './components/NavMenu.component';

// Hooks
import useAuthentication from './hooks/useAuthentication.hook';
import useServer from './hooks/useServer.hooks';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function App() {
  const [showCast, setShowCast] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const {address} = useServer();
  const [orientation, setOrientation] = useState(PORTRAIT);
  const {userId, userPin, userName, userImage, admin, child, login, logout} =
    useAuthentication({address});

  const handleStateChange = state => {
    const routeName = state?.routes[state?.routes.length - 1].name;

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
  };

  if (!address) {
    return (
      <>
        <OrientationLocker orientation={PORTRAIT} />
        <AddressScreen />
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <OrientationLocker orientation={PORTRAIT} />
        <UsersScreen login={login} address={address} />
      </>
    );
  }

  const CastModal = () => {
    const {width} = useWindowDimensions();
    const gap = 10;
    const margin = 20;
    const styles = StyleSheet.create({
      container: {
        backgroundColor: 'black',
        paddingHorizontal: margin,
      },
      header: {
        color: 'white',
        paddingTop: 20,
        fontSize: 30,
        fontWeight: 'bold',
        backgroundColor: 'black',
      },
      devices: {
        gap,
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      device: {
        width: (width - margin - margin - gap) / 2,
        height: (width - margin - margin - gap) / 2,
        backgroundColor: 'grey',
      },
    });

    const Device = () => {
      return <TouchableOpacity style={styles.device}></TouchableOpacity>;
    };

    return (
      <Modal
        visible={showCast}
        onRequestClose={() => setShowCast(false)}
        animationType="slide">
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
          <View>
            <Text style={styles.header}>Cast</Text>
          </View>
          <View style={styles.devices}>
            <Device />
            <Device />
            <Device />
            <Device />
          </View>
        </ScrollView>
      </Modal>
    );
  };

  return (
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
          <Stack.Screen
            name="browse"
            component={BrowseScreen}
            initialParams={{address, userName, setShowCast}}
          />
          <Stack.Screen
            name="search"
            component={SearchScreen}
            initialParams={{address}}
          />
          <Stack.Screen
            name="watchlist"
            component={WatchListScreen}
            initialParams={{address, userId, userPin}}
          />
          <Stack.Screen
            name="user"
            component={UserScreen}
            initialParams={{logout, userName, userImage, admin, child}}
          />
          <Stack.Screen
            name="torrents"
            component={TorrentsScreen}
            initialParams={{userId, userPin, address}}
          />
          <Stack.Screen
            name="media"
            component={MediaScreen}
            initialParams={{userId, userPin, address}}
          />
          <Stack.Screen
            name="player"
            component={PlayerScreen}
            initialParams={{setShowCast, userId, userPin, address}}
          />
        </Stack.Navigator>
      </View>

      {/* NavBar */}
      <NavMenuComponent show={showNav} />

      {/* Modal */}
      <CastModal />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
