import {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Animated, TouchableOpacity, Text} from 'react-native';
import Slider from 'react-native-slider';
import Video from 'react-native-video';
import {useNavigation} from '@react-navigation/native';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default ({route}) => {
  const navigation = useNavigation();
  const {setShowCast, userId, userPin, address, mediaId, episodeId} =
    route.params;
  // Data
  const [media, setMedia] = useState(null);
  const [episode, setEpisode] = useState(null);

  // Video States/Refs
  const [videoRef, setVideoRef] = useState(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [overlay, setOverlay] = useState(true);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [subtitles, setSubtitles] = useState(false);

  const fetchMedia = async () => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, userPin, mediaId}),
      };
      const response = await fetch(`${address}/browse/item`, options);
      const json = await response.json();
      setMedia(json);
    } catch (err) {}
  };

  const fetchEpisode = async () => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, userPin, episodeId}),
      };
      const response = await fetch(`${address}/browse/episode`, options);
      const json = await response.json();
      setEpisode(json);
    } catch (err) {}
  };

  const showOverlay = show => {
    Animated.timing(opacityAnim, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const secToString = seconds => {
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.floor(seconds);
    return `${hours ? hours + ':' : ''}${('0' + minutes).slice(-2)}:${(
      '0' + seconds
    ).slice(-2)}`;
  };

  const handleProgress = e => {
    const {currentTime, playableDuration, seekableDuration} = e;
    setCurrentTime(currentTime);
    if (seekableDuration !== totalTime) {
      setTotalTime(seekableDuration);
    }
  };

  const handleSeek = time => {
    if (videoRef) {
      videoRef.seek(time);
    }
  };

  const handleJump = jump => {
    if (videoRef) {
      const target = currentTime + jump;
      setCurrentTime(target);
      videoRef.seek(target);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    if (media && media.TYPE === 2) {
      fetchEpisode();
    }
  }, [media]);

  useEffect(() => {
    showOverlay(overlay);
  }, [overlay]);

  if (!media || (media.TYPE === 2 && !episode)) {
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Video
        ref={setVideoRef}
        resizeMode="contain"
        style={styles.video}
        repeat={true}
        source={{
          // uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          uri: `${address}/player/video?mediaId=${mediaId}&type=${media.TYPE}&episodeId=${episode?.EPISODE_ID}`,
        }}
        //
        paused={paused}
        // Events
        onProgress={handleProgress}
      />
      <TouchableOpacity
        activeOpacity={1}
        style={styles.touch}
        onPress={() => setOverlay(!overlay)}>
        <Animated.View style={[styles.overlay, {opacity: opacityAnim}]} pointerEvents={overlay? "auto" : "none"}>
          <View style={[styles.section, styles.top]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <IonIcon name="arrow-back" color="white" size={30} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {media.TYPE === 1 ? media.TITLE : ''}
            </Text>
            <TouchableOpacity onPress={() => setShowCast(true)}>
              <MaterialIcon name="cast" color="white" size={30} />
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.middle]}>
            <TouchableOpacity
              onPress={() => handleJump(-10)}
              style={styles.controlButton}>
              <MaterialIcon name="replay-10" color="white" size={50} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPaused(!paused)}
              style={styles.controlButton}>
              <MaterialIcon
                name={paused ? 'play-arrow' : 'pause'}
                color="white"
                size={75}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleJump(10)}
              style={styles.controlButton}>
              <MaterialIcon name="forward-10" color="white" size={50} />
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.bottom]}>
            <View style={styles.progress}>
              <View style={{flex: 1}}>
                <Slider
                  // Style
                  minimumTrackTintColor="white"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="white"
                  //
                  minimumValue={0}
                  maximumValue={totalTime || 0}
                  step={0.01}
                  value={currentTime || 0}
                  // Events
                  onSlidingStart={() => setPaused(true)}
                  onSlidingComplete={() => setPaused(false)}
                  onValueChange={handleSeek}
                />
              </View>
              <Text style={styles.time}>{secToString(currentTime)}</Text>
            </View>
            <View style={styles.options}>
              <TouchableOpacity
                onPress={() => setSubtitles(!subtitles)}
                style={styles.option}>
                <MaterialIcon
                  name={subtitles ? 'subtitles' : 'subtitles-off'}
                  size={30}
                  color="white"
                />
                <Text style={styles.optionText}>Subtitles</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <IonIcon name="language" size={30} color="white" />
                <Text style={styles.optionText}>Language</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <IonIcon
                  name="play-skip-forward-sharp"
                  size={30}
                  color="white"
                />
                <Text style={styles.optionText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  video: {
    flex: 1,
  },
  touch: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    flex: 1,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  section: {
    // flex: 1,
  },
  top: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    flex: 1
  },
  title: {
    color: 'white',
    fontSize: 17,
  },
  middle: {
    flex: 2,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
    // backgroundColor: "lightblue",
  },
  controlButton: {
    padding: 25,
    // backgroundColor: "lightgreen",
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 10,
  },
  time: {
    textAlign: 'center',
    width: 58,
    fontSize: 14,
    color: 'white',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 20,
  },
  optionText: {
    color: 'white',
    fontSize: 15,
  },
});
