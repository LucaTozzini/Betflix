import { useEffect, useState, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

// Icons
import IonIcons from 'react-native-vector-icons/Ionicons';

// Contexts
import themeContext from '../contexts/theme.context';

const BottomTabs = ({routeName}) => {
  const { backgroundColor, NAVIGATION_HEIGHT } = useContext(themeContext);
  const iconSize = 25;
  const navigation = useNavigation();


  const [ show, setShow ] = useState(false);

  useEffect(() => {
    setShow(!["selectUser", "player"].includes(routeName));
  }, [routeName]);

  useEffect(() => {
    if(show) {
      changeNavigationBarColor("transparent");
    }
    else {
      changeNavigationBarColor(backgroundColor);
    } 
  }, [show]);
  
  if(show) return (
    <View style={[styles.container, {bottom: NAVIGATION_HEIGHT}]}>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
        <>
          <IonIcons name={`home-${routeName == "home" ? "sharp" : "outline"}`} size={iconSize} color="white" />
          {/* <Text style={styles.text}>Home</Text> */}
        </>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('search')}>
        <>
          <IonIcons name="search-outline" size={iconSize} color="white" />
          {/* <Text style={styles.text}>Search</Text> */}
        </>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
        <>
          <IonIcons name="checkmark-outline" size={iconSize} color="white" />
          {/* <Text style={styles.text}>My List</Text> */}
        </>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('home')}>
        <>
          <IonIcons name="person-outline" size={iconSize} color="white" />
          {/* <Text style={styles.text}>Change</Text> */}
        </>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: "rgb(40,40,40)",
    position: "absolute",
    paddingHorizontal: "5%",
    width: "75%",
    alignSelf: "center",
    borderRadius: 30,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '200',
    color: 'white'
  },
});

export default BottomTabs;