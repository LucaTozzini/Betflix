import { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

// Contexts
import themeContext from '../contexts/theme.context';

const BottomTabs = () => {
  const [ show, setShow ] = useState(true);
  const [ route, setRoute ] = useState(null);
  const { bottomTabsColor, bottomTabsIconColor, backgroundColor } = useContext(themeContext);
  
  const iconSize = 23;
  const navigation = useNavigation();

  useEffect(() => {
    const handleChange = () => {
      const name = navigation.getCurrentRoute().name;
      setRoute(name);
    };
    navigation.addListener('state', handleChange);
  }, []);

  useEffect(() => {
    setShow(!['player', 'selectUser'].includes(route));
  }, [route]);

  useEffect(() => {
    if(show) changeNavigationBarColor(bottomTabsColor);
    else changeNavigationBarColor(backgroundColor);
  }, [show])

  if(show) return (
    <View style={[styles.container, {backgroundColor: bottomTabsColor}]}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('browse')}
      >
        <>
          <Icon name="th-large" size={iconSize} color={bottomTabsIconColor} />
          <Text style={[styles.text, {color: bottomTabsIconColor}]}>Browse</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('search')}
      >
        <>
          <Icon name="search" size={iconSize} color={bottomTabsIconColor} />
          <Text style={[styles.text, {color: bottomTabsIconColor}]}>Search</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('selectUser')}
      >
        <>
          <Icon name="user" size={iconSize} color={bottomTabsIconColor} />
          <Text style={[styles.text, {color: bottomTabsIconColor}]}>User</Text>
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
    paddingVertical: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '200',
  }
});

export default BottomTabs;