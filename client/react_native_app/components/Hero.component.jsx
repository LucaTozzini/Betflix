import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Image,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// Icons
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

export default ({margin, item}) => {
  const navigation = useNavigation();
  const {width} = useWindowDimensions();
  const background = item.POSTER_NT_L || item.BACKDROP_L;
  if (background) {
    return (
      <ImageBackground
        source={{uri: background}}
        style={[styles.container, {width, height: width * 1.4}]}>
        <LinearGradient
          locations={[0.0, 1]}
          colors={['transparent', 'black']}
          style={styles.gradient}>
          <TouchableOpacity
            style={{flex: 1}}
            activeOpacity={0.8}
            onPress={() => navigation.push('media', {mediaId: item.MEDIA_ID})}>
            <LinearGradient
              locations={[0.3, 1]}
              colors={['transparent', '#ffffff33']}
              style={[
                styles.overlay,
                {
                  marginHorizontal: margin,
                  marginVertical: margin * 0.5,
                  borderRadius: width * 0.03,
                },
              ]}>
              {item.LOGO_L && (
                <Image
                  source={{uri: item.LOGO_L}}
                  style={[styles.logo, {height: width * 0.25}]}
                />
              )}
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.push('player', {mediaId: item.MEDIA_ID})
                  }>
                  <Text style={styles.text}>Play</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  logo: {
    resizeMode: 'contain',
    width: '80%',
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    margin: 10,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 17,
  },
});
