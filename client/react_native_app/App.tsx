import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

// Screens
import BrowseScreen from './screens/Browse.screen';
import SearchScreen from './screens/Search.screen';
import WatchListScreen from './screens/WatchList.screen';

// Components
import NavMenuComponent from './components/NavMenu.component';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#121212'
  },
};

function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <View style={styles.container}>
        <View style={styles.main}>
          <Stack.Navigator screenOptions={{animation: 'none', headerShown: false}}>
            <Stack.Screen name="browse" component={BrowseScreen} />
            <Stack.Screen name="search" component={SearchScreen} />
            <Stack.Screen name="watchlist" component={WatchListScreen} />
          </Stack.Navigator>
        </View>
        <NavMenuComponent />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
});

export default App;
