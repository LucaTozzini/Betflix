import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';

// Icons
import Icon from 'react-native-vector-icons/Ionicons';

export default ({margin}) => {
  const {width} = useWindowDimensions();
  const imageHeight = (width - (2 * margin)) * 1.5;
  const styles = StyleSheet.create({
    container: {
      height: imageHeight,
      marginHorizontal: margin,
      overflow: 'hidden',
      // backgroundColor: 'lightblue',
    },
    image: {
			backgroundColor: 'grey',
      flex: 1,
			borderRadius: 20,
			overflow: "hidden",
			borderWidth: 1,
			borderColor: "rgba(255, 255, 255, .5)",
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
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <ImageBackground style={styles.image} source={{uri: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/11bea319098925.562d4ee6c5cc0.png"}}>
        <TouchableOpacity style={styles.button} activeOpacity={0.7}>
          <Icon name="play" color="black" size={35} />
          <Text style={styles.text}>Play</Text>
        </TouchableOpacity>
      </ImageBackground>
    </TouchableOpacity>
  );
};
