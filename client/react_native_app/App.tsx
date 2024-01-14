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

// Screens
import BrowseScreen from './screens/Browse.screen';
import SearchScreen from './screens/Search.screen';
import WatchListScreen from './screens/WatchList.screen';
import UsersScreen from './screens/Users.screen';
import UserScreen from './screens/User.screen';
import AddressScreen from './screens/Address.screen';
import TorrentsScreen from './screens/Torrents.screen';
import MediaScreen from './screens/Media.screen';

// Components
import NavMenuComponent from './components/NavMenu.component';

// Hooks
import useAuthentication from './hooks/useAuthentication.hook';
import useServer from './hooks/useServer.hooks';
import {useState} from 'react';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function App() {
  const [showCast, setShowCast] = useState(false);
  const {address} = useServer();
  const {userId, userPin, userName, userImage, admin, child, login, logout} =
    useAuthentication({address});

  if (!address) {
    return <AddressScreen />;
  }

  if (!userId) {
    return <UsersScreen login={login} address={address} />;
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
    <NavigationContainer theme={MyTheme}>
      {/* Status Bar */}
      <StatusBar translucent backgroundColor={'transparent'} />

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
          </Stack.Navigator>
      </View>
      <NavMenuComponent />

      {/* Cast */}
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
