import { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

// Icons
import IonIcons from 'react-native-vector-icons/Ionicons';

// Contexts
import themeContext from '../contexts/theme.context';

// 
const bgCol = "#1e1e1e";

const BottomTabs = ({routeName}) => {
  const { backgroundColor } = useContext(themeContext);
  const iconSize = 26;
  const navigation = useNavigation();

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(["home", "item"].includes(routeName));
  }, [routeName]);

  useEffect(() => {
    if(show) {
      changeNavigationBarColor(bgCol);
    }
    else {
      changeNavigationBarColor(backgroundColor);
    } 
  }, [show]);
  
  if(show) return (
    <View style={styles.container}>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
        <>
          <IonIcons name={`home-${routeName == "home" ? "sharp" : "outline"}`} size={iconSize} color="white" />
          <Text style={styles.text}>Home</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('search')}>
        <>
          <IonIcons name="search-outline" size={iconSize} color="white" />
          <Text style={styles.text}>Search</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
        <>
          <IonIcons name="checkmark-outline" size={iconSize} color="white" />
          <Text style={styles.text}>My List</Text>
        </>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
        <>
          <IonIcons name="person-outline" size={iconSize} color="white" />
          <Text style={styles.text}>Change</Text>
        </>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: bgCol
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '200',
    color: 'white'
  },
});

export default BottomTabs;