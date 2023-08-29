import { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import { useCastState } from 'react-native-google-cast'

// Contexts
import themeContext from '../contexts/theme.context';

// Components
import GoogleCastDevicesModal from './GoogleCastDevicesModal.component';

const BottomTabs = () => {
  const [ show, setShow ] = useState(true);
  const [ route, setRoute ] = useState(null);
  const castState = useCastState();

  const [ modal, setModal ] = useState(false);
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
  }, [show]);

  
  if(show) return (
    <View style={[styles.container, {backgroundColor: bottomTabsColor}]}>
      <GoogleCastDevicesModal show={modal} setShow={setModal} initBackground={true}/>
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
        onPress={() => setModal(true)}
      >
        <>
          <MaterialIcons name={castState == 'connected' ? "cast-connected" : "cast"} size={iconSize} color={bottomTabsIconColor} />
          <Text style={[styles.text, {color: bottomTabsIconColor}]}>Cast</Text>
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
  },
});

export default BottomTabs;
