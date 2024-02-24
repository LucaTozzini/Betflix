import {useContext, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import Slider from 'react-native-slider';
import Video from 'react-native-video';
import {useNavigation} from '@react-navigation/native';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Contexts
import {globalContext} from '../App';

// Google Cast
import {useRemoteMediaClient, CastButton} from 'react-native-google-cast';

// Hooks
import usePlayer from '../hooks/usePlayer.hook';
import useSubtitles from '../hooks/useSubtitles.hook';

export default ({route}) => {
  const navigation = useNavigation();
  const client = useRemoteMediaClient();
  const {mediaId, episodeId} = route.params;
  const {address} = useContext(globalContext);

  const {item, episode, resume, updateContinue} = usePlayer({
    mediaId,
    episodeId,
  });
  const {subtitles, setLanguage, langDict, setImdbId, setParentImdbId} =
    useSubtitles();
  const [subModal, setSubModal] = useState(false);
  // Video States/Refs
  const [videoRef, setVideoRef] = useState(null);
  const [paused, setPaused] = useState(false);
  const [lastTime, setLastTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const [overlay, setOverlay] = useState(true);
  const [rate, setRate] = useState(1);

  //

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

    // if (subtitleLang && subtitleData) {
    //   const curr = subtitleData.find(
    //     i => i.start <= currentTime && i.end >= currentTime,
    //   );
    //   setCurrSubText(curr ? curr.part : null);
    // }
  };

  const handlePlayToggle = () => {
    setPaused(!paused);
  };

  const handleSeek = time => {
    console.log('SEEK', time);
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

  // Google Cast
  const castVideo = async () => {
    try {
      await client.loadMedia({
        autoplay: true,
        playbackRate: 1,
        startTime: currentTime,
        mediaInfo: {
          contentUrl: `${address}/player/video?mediaId=${mediaId}&type=${
            item.TYPE
          }&episodeId=${episode ? episode.EPISODE_ID : -1}`,
          contentType: 'video/mp4',
          metadata:
            item.TYPE === 1
              ? {
                  type: 'movie',
                  title: item.TITLE,
                }
              : {
                  type: 'tvShow',
                  episodeNumber: episode.EPISODE_NUM,
                  seasonNumber: episode.SEASON_NUM,
                  seriesTitle: item.TITLE,
                  title: episode.TITLE,
                },
        },
      });
      const st = await client.getMediaStatus();
      console.log(st);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (item && (item.TYPE === 1 || episode)) {
      if (episode) {
        setParentImdbId(item.IMDB_ID);
        setImdbId(episode.IMDB_ID);
      } else {
        setImdbId(item.IMDB_ID);
      }
    }
  }, [item, episode]);

  useEffect(() => {
    if (currentTime && Math.abs(currentTime - lastTime) > 1) {
      updateContinue({
        progressTime: currentTime,
        endTime: totalTime - currentTime,
      });
      setLastTime(currentTime);
    }
  }, [currentTime]);

  useEffect(() => {
    if (client && item && (item.TYPE === 1 || episode)) {
      setOverlay(true);
      castVideo();
    }
  }, [client, item, episode]);

  useEffect(() => {
    if (resume) {
      setCurrentTime(resume);
    }
  }, [resume]);

  if (!item || (item.TYPE === 2 && !episode) || resume === null) {
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  return (
    <View style={{flex: 1}}>
      {!client && (
        <TouchableOpacity
          style={styles.video}
          onPress={() => setOverlay(true)}
          activeOpacity={1}>
          <Video
            ref={setVideoRef}
            resizeMode="contain"
            style={{flex: 1}}
            repeat={true}
            source={{
              uri: `${address}/player/video?mediaId=${mediaId}&type=${item.TYPE}&episodeId=${episode?.EPISODE_ID}`,
            }}
            rate={rate}
            paused={paused}
            onProgress={handleProgress}
            onLoad={() => handleSeek(resume)}
          />
        </TouchableOpacity>
      )}

      {overlay && (
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{padding: 10}}>
              <IonIcon name="arrow-back" color="white" size={30} />
            </TouchableOpacity>
            <Text
              style={{color: 'white', fontSize: 20}}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {item.TYPE === 1 ? item.TITLE : ''}
            </Text>
            <CastButton
              style={{
                tintColor: 'white',
                height: 30,
                width: 30,
                padding: 10,
                margin: 0,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              if (!client) setOverlay(false);
            }}
            activeOpacity={1}
            style={{
              flexDirection: 'row',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}>
            <TouchableOpacity
              onPress={() => handleJump(-10)}
              style={{padding: 20}}>
              <MaterialIcon name="replay-10" color="white" size={50} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePlayToggle} style={{padding: 20}}>
              <MaterialIcon
                name={paused ? 'play-arrow' : 'pause'}
                color="white"
                size={75}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleJump(10)}
              style={{padding: 20}}>
              <MaterialIcon name="forward-10" color="white" size={50} />
            </TouchableOpacity>
          </TouchableOpacity>

          <View>
            <Slider
              // Style
              minimumTrackTintColor="white"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor="white"
              style={{height: 50}}
              //
              minimumValue={0}
              maximumValue={totalTime || 0}
              step={0.01}
              value={currentTime}
              // Events
              onSlidingStart={() => setPaused(true)}
              onSlidingComplete={() => setPaused(false)}
              onValueChange={handleSeek}
            />
            <View>
              <TouchableOpacity onPress={() => setSubModal(true)}>
                <MaterialCommunityIcons
                  name={subtitles ? 'subtitles' : 'subtitles-outline'}
                  color="white"
                  size={30}
                />
              </TouchableOpacity>
              {/* <Text style={{color: 'white', fontSize: 20}}>{currentTime}</Text> */}
            </View>
          </View>
        </View>
      )}

      {subtitles && (
        <View
          style={{
            position: 'absolute',
            bottom: overlay ? 80 : 20,
            left: 0,
            right: 0,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Text
            style={{color: 'white', backgroundColor: 'black', fontSize: 20}}>
            {
              subtitles.find(
                ({start, end}) => start <= currentTime && end >= currentTime,
              )?.part
            }
          </Text>
        </View>
      )}

      {/* Modal */}
      <Modal visible={subModal} onRequestClose={() => setSubModal(false)}>
        <View style={{flex: 1, backgroundColor: 'black'}}>
          <ScrollView contentContainerStyle={{gap: 20}}>
            <TouchableOpacity onPress={() => setLanguage(null)}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                Off
              </Text>
            </TouchableOpacity>
            {langDict.map(i => (
              <TouchableOpacity onPress={() => setLanguage(i.language_code)}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                    textAlign: 'center',
                  }}>
                  {i.language_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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
    flex: 1,
    // backgroundColor: "lightblue"
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
