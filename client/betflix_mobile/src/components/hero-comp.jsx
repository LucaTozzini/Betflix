import {StyleSheet, View, Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

export default function Hero({item}) {
  if(!item) {
    return null
  }
  const navigation = useNavigation();

  const handlePlayPress = () => {
    navigation.navigate('Player', {title_id: item.title_id, episode_id: null});
  };

  const handleImagePress = () => {
    navigation.navigate('Title', {title_id: item.title_id});
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleImagePress}>
      <Image
        source={{uri: item.landscape}}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPress}>
          <Ionicons name="play-circle" size={80} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9, // Common aspect ratio for hero images
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  playText: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
