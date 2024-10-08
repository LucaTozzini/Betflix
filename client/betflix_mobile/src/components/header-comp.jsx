import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
} from 'react-native';
import {globalContext} from '../../App';
import {useContext} from 'react';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {CastButton} from 'react-native-google-cast'; // Import CastButton

export function SpacerHeader() {
  return <View style={styles.spacer} />;
}

export function BrowseHeader() {
  const {useUsers} = useContext(globalContext);

  return (
    <View style={[styles.container, {paddingHorizontal: MARGIN}]}>
      <Text style={styles.title}>Hello, {useUsers.current.name}</Text>
      <CastButton style={styles.castButton} />
    </View>
  );
}

export function TitleHeader({backgroundColor, title, titleOpacity}) {
  const naviagtion = useNavigation();
  return (
    <Animated.View
      style={[
        styles.container,
        styles.absolute,
        {
          paddingTop: StatusBar.currentHeight,
          height: headerHeight + StatusBar.currentHeight,
          backgroundColor,
          paddingRight: MARGIN,
        },
      ]}>
      <TouchableOpacity onPress={naviagtion.goBack} style={styles.backButton}>
        <View style={styles.backIconContainer}>
          <IonIcon name="arrow-back" color="white" size={30} />
        </View>
      </TouchableOpacity>
      <Animated.Text
        style={[styles.title, {opacity: titleOpacity}]}
        numberOfLines={1}>
        {title}
      </Animated.Text>
    </Animated.View>
  );
}

export function PlayerHeader({title}) {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, {marginRight: MARGIN}]}>
      <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
        <IonIcon name="arrow-back" color="white" size={30} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <CastButton style={[styles.castButton, {marginRight: MARGIN}]} />
    </View>
  );
}

const headerHeight = 50;
const MARGIN = 10;
const styles = StyleSheet.create({
  spacer: {height: headerHeight},
  container: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    width: "100%"
  },
  absolute: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  backButton: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: MARGIN,
  },
  backIconContainer: {
    borderRadius: 6,
    padding: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  castButton: {
    width: 33, // Adjust as needed
    height: 33, // Adjust as needed
    tintColor: 'white', // Customize the button color
  },
});
