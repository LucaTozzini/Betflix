import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

import throttle from 'lodash.throttle';

// Hooks
import useTitles from '../hooks/useTitles-hook';

// Contexts
import {globalContext, SERVER_ADDRESS} from '../../App';

// Components
import {PlayerHeader} from '../components/header-comp';

const updateProgressThrottled = throttle(async function (
  user_id,
  title_id,
  episode_id,
  currentTime,
  videoDuration,
) {
  const remaining = videoDuration - currentTime;
  episode_id = episode_id ?? -1;

  const response = await fetch(
    `http://${SERVER_ADDRESS}/continue?${new URLSearchParams({
      user_id,
      title_id,
      episode_id,
      remaining,
    })}`,
    {method: 'POST'},
  );
},
5000);

export default function Player({route}) {
  const {title_id, episode_id} = route.params;
  const {fetchItem} = useTitles();
  const {setHideTabs, useUsers, useCast} = useContext(globalContext);

  const [item, setItem] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [controlsShow, setControlsShow] = useState(true);

  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const fetchData = async () => {
    const item = await fetchItem(title_id);
    setItem(item);
  };

  const fetchRemainingTime = async () => {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/continue/${useUsers.current.user_id}/${title_id}/${
        episode_id ?? -1
      }`,
    );
    const entry = await response.json();
    if (entry) {
      setRemainingTime(entry.remaining);
    } else {
      setRemainingTime(-1);
    }
  };

  useEffect(() => {
    setHideTabs(true);

    return () => {
      setHideTabs(false);
    };
  }, []);

  useEffect(() => {
    fetchData();
    fetchRemainingTime();
    if (episode_id) {
      setVideoUrl(`http://${SERVER_ADDRESS}/player/stream/2/${episode_id}`);
    } else {
      setVideoUrl(`http://${SERVER_ADDRESS}/player/stream/1/${title_id}`);
    }
  }, [title_id]);

  useEffect(() => {
    if (useCast.playerState) {
      setPaused(useCast.playerState === 'paused');
      setIsBuffering(
        useCast.playerState === 'buffering' ||
          useCast.playerState === 'loading',
      );
    }
  }, [useCast.playerState]);

  useEffect(() => {
    if (useCast.progress) {
      onProgress({currentTime: useCast.progress});
    }
  }, [useCast.progress]);

  useEffect(() => {
    if (useCast.duration) {
      setVideoDuration(useCast.duration);
    }
  }, [useCast.duration]);

  useEffect(() => {
    if (useCast.client && videoUrl) {
      useCast.castVideo(videoUrl, currentTime);
    }
  }, [useCast.client, videoUrl]);

  const formatSeconds = seconds => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return (h ? `${h}:` : '') + `${('0' + m).slice(-2)}:${('0' + s).slice(-2)}`;
  };

  const onProgress = data => {
    setCurrentTime(data.currentTime);
    updateProgressThrottled(
      useUsers.current.user_id,
      title_id,
      episode_id,
      currentTime,
      videoDuration,
    );
  };

  const onLoad = data => {
    setVideoDuration(data.duration);
    console.log(data.duration, remainingTime);
    if (remainingTime > 0) {
      videoRef.current.seek(data.duration - remainingTime);
    }
  };

  const toggleControls = () => {
    if (controlsShow) {
      hideControls();
    } else {
      showControls();
    }
  };

  const togglePlayPause = () => {
    if (controlsShow) {
      if (useCast.client) {
        paused ? useCast.client.play() : useCast.client.pause();
      } else {
        setPaused(!paused);
      }
    }
    showControls();
  };

  const seekTime = value => {
    if (controlsShow) {
      if (useCast.client) {
        useCast.seek(value);
      } else if (videoRef.current) {
        videoRef.current.seek(value);
      }
    }
    showControls();
  };

  const showControls = () => {
    setControlsShow(true);
    clearTimeout(timeoutRef.current);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    timeoutRef.current = setTimeout(hideControls, 5000);
  };

  const hideControls = () => {
    setControlsShow(false);
    clearTimeout(timeoutRef.current);
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const skipForward = () => {
    const newTime = currentTime + 10;
    if (newTime > videoDuration) {
      seekTime(videoDuration); // Don't exceed video duration
    } else {
      seekTime(newTime);
    }
    showControls();
  };

  const skipBackward = () => {
    if (videoRef.current) {
      const newTime = currentTime - 10;
      if (newTime < 0) {
        videoRef.current.seek(0); // Don't go below 0
      } else {
        videoRef.current.seek(newTime);
      }
      showControls();
    }
  };

  if (!item || !remainingTime) {
    return null;
  }

  return (
    <>
      {videoUrl && !useCast.client && (
        <Video
          ref={videoRef}
          source={{uri: videoUrl}}
          style={styles.video}
          paused={paused}
          onProgress={onProgress}
          onLoad={onLoad}
          onBuffer={({isBuffering}) => setIsBuffering(isBuffering)}
          resizeMode="contain"
          fullscreen={true}
        />
      )}

      <View
        activeOpacity={1}
        onPressOut={toggleControls}
        style={styles.controlsTouchable}>
        <Animated.View
          style={[styles.controlsContainer, {opacity: controlsOpacity}]}>
          {/* Center */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.controlsRowCenter}
            onPress={toggleControls}>
            <TouchableOpacity onPress={skipBackward} style={styles.skipButton}>
              <Icon name="replay-10" size={30} color="white" />
            </TouchableOpacity>

            {isBuffering ? (
              <ActivityIndicator
                style={styles.playButton}
                size="large"
                color="white"
              />
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={togglePlayPause}
                style={styles.playButton}>
                <Icon
                  name={paused ? 'play-arrow' : 'pause'}
                  size={50}
                  color="white"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={skipForward} style={styles.skipButton}>
              <Icon name="forward-10" size={30} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
          
          {/* Top */}
          <PlayerHeader title={item.title} />

          {/* Bottom */}
          <View style={styles.controlsSection}>
            <View style={styles.controlsRow}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={videoDuration}
                value={currentTime}
                onValueChange={seekTime}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
                thumbTintColor="#FFFFFF"
              />
              <Text style={styles.time}>{formatSeconds(currentTime)}</Text>
            </View>
            <View
              style={[styles.controlsRow, {justifyContent: 'center', gap: 30}]}>
              <TouchableOpacity style={styles.controlsButton}>
                <Icon name="stop-circle" color="white" size={30} />
                <Text style={styles.controlsText}>From beginning</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlsButton}>
                <Icon name="comment" color="white" size={27} />
                <Text style={styles.controlsText}>Subtitles</Text>
              </TouchableOpacity>

              {item.type == 2 && (
                <TouchableOpacity style={styles.controlsButton}>
                  <Icon name="skip-next" color="white" size={40} />
                  <Text style={styles.controlsText}>Next episode</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsTouchable: {...StyleSheet.absoluteFillObject},
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlsSection: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    gap: 5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlsRowCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  controlsButton: {flexDirection: 'row', alignItems: 'center', gap: 7},
  controlsText: {color: 'white'},
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playButton: {
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    padding: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
    marginLeft: -10,
  },
  time: {
    color: 'white',
    fontSize: 16,
  },
  bufferingText: {
    color: 'white',
    fontSize: 16,
  },
});
