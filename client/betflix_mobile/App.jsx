import * as React from 'react';
import {View} from 'react-native';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

// Components
import TabBar from './src/components/tab bar-comp';

// Screens
import UserScreen from './src/screens/user.screen';
import TitleScreen from './src/screens/title.screen';
import UsersScreen from './src/screens/users.screen';
import BrowseScreen from './src/screens/browse.screen';
import SearchScreen from './src/screens/search.screen';
import ServerScreen from './src/screens/server.screen';
import PlayerScreen from './src/screens/player.screen';
import PersonScreen from './src/screens/person.screen';
import LoadingScreen from './src/screens/loading.screen';
import NewUserScreen from './src/screens/new_user.screen';

// Hooks
import useCastHook from './src/hooks/useCast-hook';
import useUsersHook from './src/hooks/useUsers-hook';
import useContinueHook from './src/hooks/useContinue-hook';
import useTorrentsHook from './src/hooks/useTorrents-hook';
import useWatchlistHook from './src/hooks/useWatchlist-hook';
import useBonjourHook from './src/hooks/useBonjour-hook';

// Exports
export const globalContext = React.createContext();
export const addressContext = React.createContext();

function Main() {
  const {address} = useBonjourHook();

  if (!address) return null;

  return (
    <addressContext.Provider value={address}>
      <App />
    </addressContext.Provider>
  );
}

function App() {
  const [hideTabs, setHideTabs] = React.useState(false);
  const [navState, setNavState] = React.useState(null);

  const useCast = useCastHook({navState});
  const useUsers = useUsersHook();
  const useTorrents = useTorrentsHook();
  const useContinue = useContinueHook({current: useUsers.current});
  const useWatchlist = useWatchlistHook({current: useUsers.current});

  if (!useUsers.current) {
    return (
      <globalContext.Provider value={{useUsers, useWatchlist}}>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator>
            <Stack.Screen name="Users" component={UsersScreen} />
            <Stack.Screen name="New User" component={NewUserScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </globalContext.Provider>
    );
  }

  return (
    <globalContext.Provider
      value={{
        // hooks
        useCast,
        useUsers,
        useContinue,
        useTorrents,
        useWatchlist,
        //
        setHideTabs,
      }}>
      <NavigationContainer theme={DarkTheme} onStateChange={setNavState}>
        <View style={{flex: 1}}>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={BrowseScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Server" component={ServerScreen} />
            <Stack.Screen name="User" component={UserScreen} />
            <Stack.Screen name="Title" component={TitleScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="Person" component={PersonScreen} />
          </Stack.Navigator>
        </View>
        <TabBar hide={hideTabs} />
      </NavigationContainer>
    </globalContext.Provider>
  );
}

export default Main;
