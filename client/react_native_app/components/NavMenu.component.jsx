import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

const itemSize = 22;

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

  if (show) {
    return (
      <View style={styles.main}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate(0, 'browse')}>
          <Icon
            name={selected === 0 ? 'grid' : 'grid-outline'}
            size={itemSize}
            color="white"
          />
          <Text
            style={[styles.text, selected === 0 ? {fontWeight: 'bold'} : {}]}>
            Browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate(1, 'search')}>
          <Icon
            name={selected === 1 ? 'search' : 'search-outline'}
            size={itemSize}
            color="white"
          />
          <Text
            style={[styles.text, selected === 1 ? {fontWeight: 'bold'} : {}]}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate(2, 'watchlist')}>
          <Icon
            name={selected === 2 ? 'bookmark' : 'bookmark-outline'}
            size={itemSize}
            color="white"
          />
          <Text
            style={[styles.text, selected === 2 ? {fontWeight: 'bold'} : {}]}>
            My List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigate(3, 'user')}>
          <Icon
            name={selected === 3 ? 'person' : 'person-outline'}
            size={itemSize}
            color="white"
          />
          <Text
            style={[styles.text, selected === 3 ? {fontWeight: 'bold'} : {}]}>
            User
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  main: {
    paddingTop: 10,
    paddingBottom: 3,
    flexDirection: 'row',
    backgroundColor: color,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: 'white',
    fontSize: 11,
  },
});
