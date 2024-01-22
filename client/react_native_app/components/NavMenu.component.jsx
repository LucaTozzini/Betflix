import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

const itemSize = 30;

const color = '#212121';
export default ({show}) => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(0);

  const navigate = (selected, name) => {
    setSelected(selected);
    navigation.reset({index: 0, routes: [{name}]});
  };

  useEffect(() => {
    SystemNavigationBar.setNavigationColor(color);
  }, []);

  const Tab = ({routeName, iconName, iconNameSelected, index, imageUri}) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigate(index, routeName)}>
      <Icon
        name={selected === index ? iconNameSelected : iconName}
        size={itemSize}
        color={selected === index ? "white" : "rgb(180,180,180)"}
      />
    </TouchableOpacity>
  );

  if (show) {
    return (
      <View style={styles.main}>
        <Tab index={0} routeName="browse"    iconName="home-outline"   iconNameSelected="home"   />
        <Tab index={1} routeName="search"    iconName="search-outline" iconNameSelected="search" />
        <Tab index={2} routeName="watchlist" iconName="albums-outline" iconNameSelected="albums" />
        <Tab index={3} routeName="user"      iconName="person-outline" iconNameSelected="person" />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  main: {
    paddingVertical: 10,
    flexDirection: 'row',
    backgroundColor: color,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
});
