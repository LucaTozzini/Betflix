import { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import changeNavigationBarColor, { hideNavigationBar, showNavigationBar } from 'react-native-navigation-bar-color';

// Contexts
import themeContext from '../contexts/theme.context';

const NavigationBar = () => {
  const { navBarColor, navBarIconColor } = useContext(themeContext);
  const navigation = useNavigation();
  const iconSize = 23;
  const [ route, setRoute ] = useState(null);
  const [ show, setShow ] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      const name = navigation.getCurrentRoute().name;
      setRoute(name);
    };
    navigation.addListener('state', handleChange);
    changeNavigationBarColor(navBarColor);
  }, []);

  useEffect(() => {
    setShow(!['player', 'selectUser'].includes(route));
  }, [route]);

  useEffect(() => {
    // if(show) showNavigationBar();
    // else hideNavigationBar();
  }, [show]);

  if(!show) return <></>

  return (
    <View style={[styles.container, {backgroundColor: navBarColor}]}>
      <TouchableOpacity
        style={styles.button}
        title="Browse"
        onPress={() => navigation.navigate('browse')}
      >
        <>
          <Icon name="th-large" size={iconSize} color={navBarIconColor} />
          <Text style={[styles.text, {color: navBarIconColor}]}>Browse</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        title="Select"
        onPress={() => navigation.navigate('selectUser')}
      >
        <>
          <Icon name="search" size={iconSize} color={navBarIconColor} />
          <Text style={[styles.text, {color: navBarIconColor}]}>Select</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        title="User"
        onPress={() => navigation.navigate('selectUser')}
      >
        <>
          <Icon name="user" size={iconSize} color={navBarIconColor} />
          <Text style={[styles.text, {color: navBarIconColor}]}>User</Text>
        </>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '200',
  }
});

export default NavigationBar;
