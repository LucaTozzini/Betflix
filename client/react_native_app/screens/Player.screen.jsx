import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import Video from 'react-native-video';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';

export default ({route}) => {
  const navigation = useNavigation();
  const {setShowCast} = route.params;
  const [videoRef, setVideoRef] = useState(null);
	const [paused, setPaused] = useState(false);

	const handleProgress = e => {
		console.log(e.currentTime);
	}

  return (
    <>
      <Video
        ref={setVideoRef}
        resizeMode="contain"
        style={styles.video}
        repeat={true}
        source={{
          uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        }}

				// 
				paused={paused}

				// Events
				onProgress = {handleProgress}
      />
      <View style={styles.overlay}>
        <View style={[styles.section, styles.top]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IonIcon name="arrow-back" color="white" size={30} />
          </TouchableOpacity>
          <Text style={styles.title}>S1:E2 "Episode Title"</Text>
          <TouchableOpacity onPress={() => setShowCast(true)}>
            <MaterialIcon name="cast" color="white" size={30} />
          </TouchableOpacity>
        </View>
        <View style={[styles.section, styles.middle]}>
          <TouchableOpacity>
            <IonIcon name="play-back" color="white" size={50} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPaused(!paused)}>
            <IonIcon name={paused ? "play" : "pause"} color="white" size={60} />
          </TouchableOpacity>
          <TouchableOpacity>
            <IonIcon name="play-forward" color="white" size={50} />
          </TouchableOpacity>
        </View>
        <View style={[styles.section, styles.bottom]}>
          <View style={styles.progress}></View>
          <View style={styles.options}>
            <TouchableOpacity></TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  video: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  section: {
    flex: 1,
    // backgroundColor: "lightblue",
    paddingVertical: 10,
  },
  top: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 17,
  },
  middle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 120,
  },
  bottom: {},
});
