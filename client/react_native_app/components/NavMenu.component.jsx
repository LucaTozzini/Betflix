import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    height: 50,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const itemSize = 30;

export default () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(0);

  const navigate = (selected, name) => {
    setSelected(selected); 
    navigation.reset({index: 0, routes: [{name}]})
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigate(0, "browse")}>
        <Icon
          name={selected === 0 ? 'grid' : 'grid-outline'}
          size={itemSize}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigate(1, "search")}>
        <Icon
          name={selected === 1 ? 'search' : 'search-outline'}
          size={itemSize}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigate(2, "watchlist")}>
        <Icon
          name={selected === 2 ? 'bookmark' : 'bookmark-outline'}
          size={itemSize}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigate(3, "browse")}>
        <Icon
          name={selected === 3 ? 'person' : 'person-outline'}
          size={itemSize}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};
