import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Icons
import Icon from 'react-native-vector-icons/Ionicons';

export default ({margin, item}) => {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const imageHeight = (width - (2 * margin)) * 1.5;
  
  const styles = StyleSheet.create({
    container: {
      height: imageHeight,
      marginHorizontal: margin,
      overflow: 'hidden',
    },
    image: {
			backgroundColor: 'grey',
      flex: 1,
			borderRadius: 20,
			overflow: "hidden",
			borderWidth: 1,
			borderColor: "rgba(255, 255, 255, .2)",
			justifyContent: "flex-end"
    },
		button: {
			flexDirection: "row",
			backgroundColor: "white",
			alignItems: "center",
			justifyContent: "center",
			padding: 10,
			margin: 10,
			borderRadius: 10,
			gap: 5,
			
		},
		text: {
			fontSize: 20
		}
  });

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={() => navigation.navigate("media", {mediaId: item.MEDIA_ID})}>
      <ImageBackground style={styles.image} source={{uri: item.POSTER_L}}>
        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={() => navigation.navigate("player")}>
          <Icon name="play" color="black" size={35} />
          <Text style={styles.text}>Play</Text>
        </TouchableOpacity>
      </ImageBackground>
    </TouchableOpacity>
  );
};
