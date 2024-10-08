import {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

const COLOR = "#181818"
const ICON_SIZE = 23;

export default function TabBar({hide}) {
  const navigation = useNavigation();

  const [focused, setFocused] = useState(0);

  function handleNav(to) {
    navigation.reset({index: 0, routes: [{name: to}]});
  }

  useEffect(() => {
    changeNavigationBarColor(COLOR)
  }, []);

  if(hide) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, focused != 0 ? {opacity: 0.5} : {}]}
        onPress={() => {
          handleNav('Home');
          setFocused(0);
        }}>
        <IonIcon
          name={focused == 0 ? 'home' : 'home-outline'}
          size={ICON_SIZE}
          color={'white'}
        />
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, focused != 1 ? {opacity: 0.5} : {}]}
        onPress={() => {
          handleNav('Search');
          setFocused(1);
        }}>
        <IonIcon
          name={focused == 1 ? 'search' : 'search-outline'}
          size={ICON_SIZE}
          color={'white'}
        />
        <Text style={styles.tabText}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, focused != 2 ? {opacity: 0.5} : {}]}
        onPress={() => {
          handleNav('Server');
          setFocused(2);
        }}>
        <IonIcon
          name={focused == 2 ? 'server' : 'server-outline'}
          size={ICON_SIZE}
          color={'white'}
        />
        <Text style={styles.tabText}>Server</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, focused != 3 ? {opacity: 0.5} : {}]}
        onPress={() => {
          handleNav('User');
          setFocused(3);
        }}>
        <IonIcon
          name={focused == 3 ? 'person' : 'person-outline'}
          size={ICON_SIZE}
          color={'white'}
        />
        <Text style={styles.tabText}>User</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'grey',
    backgroundColor: COLOR,
    paddingTop: 3,
    gap: 1
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 3,
    flex: 1,
    // backgroundColor: "green"
  },
  tabText: {color: 'white', fontSize: 10},
});
