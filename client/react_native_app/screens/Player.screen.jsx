import {useEffect, useRef, useState} from 'react';
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
import vttToJson from 'vtt-2-json';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const langDict = [
  {
    language_code: 'af',
    language_name: 'Afrikaans',
  },
  {
    language_code: 'sq',
    language_name: 'Albanian',
  },
  {
    language_code: 'ar',
    language_name: 'Arabic',
  },
  {
    language_code: 'an',
    language_name: 'Aragonese',
  },
  {
    language_code: 'hy',
    language_name: 'Armenian',
  },
  {
    language_code: 'at',
    language_name: 'Asturian',
  },
  {
    language_code: 'eu',
    language_name: 'Basque',
  },
  {
    language_code: 'be',
    language_name: 'Belarusian',
  },
  {
    language_code: 'bn',
    language_name: 'Bengali',
  },
  {
    language_code: 'bs',
    language_name: 'Bosnian',
  },
  {
    language_code: 'br',
    language_name: 'Breton',
  },
  {
    language_code: 'bg',
    language_name: 'Bulgarian',
  },
  {
    language_code: 'my',
    language_name: 'Burmese',
  },
  {
    language_code: 'ca',
    language_name: 'Catalan',
  },
  {
    language_code: 'zh-cn',
    language_name: 'Chinese (simplified)',
  },
  {
    language_code: 'cs',
    language_name: 'Czech',
  },
  {
    language_code: 'da',
    language_name: 'Danish',
  },
  {
    language_code: 'nl',
    language_name: 'Dutch',
  },
  {
    language_code: 'en',
    language_name: 'English',
  },
  {
    language_code: 'eo',
    language_name: 'Esperanto',
  },
  {
    language_code: 'et',
    language_name: 'Estonian',
  },
  {
    language_code: 'fi',
    language_name: 'Finnish',
  },
  {
    language_code: 'fr',
    language_name: 'French',
  },
  {
    language_code: 'ka',
    language_name: 'Georgian',
  },
  {
    language_code: 'de',
    language_name: 'German',
  },
  {
    language_code: 'gl',
    language_name: 'Galician',
  },
  {
    language_code: 'el',
    language_name: 'Greek',
  },
  {
    language_code: 'he',
    language_name: 'Hebrew',
  },
  {
    language_code: 'hi',
    language_name: 'Hindi',
  },
  {
    language_code: 'hr',
    language_name: 'Croatian',
  },
  {
    language_code: 'hu',
    language_name: 'Hungarian',
  },
  {
    language_code: 'is',
    language_name: 'Icelandic',
  },
  {
    language_code: 'id',
    language_name: 'Indonesian',
  },
  {
    language_code: 'it',
    language_name: 'Italian',
  },
  {
    language_code: 'ja',
    language_name: 'Japanese',
  },
  {
    language_code: 'kk',
    language_name: 'Kazakh',
  },
  {
    language_code: 'km',
    language_name: 'Khmer',
  },
  {
    language_code: 'ko',
    language_name: 'Korean',
  },
  {
    language_code: 'lv',
    language_name: 'Latvian',
  },
  {
    language_code: 'lt',
    language_name: 'Lithuanian',
  },
  {
    language_code: 'lb',
    language_name: 'Luxembourgish',
  },
  {
    language_code: 'mk',
    language_name: 'Macedonian',
  },
  {
    language_code: 'ml',
    language_name: 'Malayalam',
  },
  {
    language_code: 'ms',
    language_name: 'Malay',
  },
  {
    language_code: 'ma',
    language_name: 'Manipuri',
  },
  {
    language_code: 'mn',
    language_name: 'Mongolian',
  },
  {
    language_code: 'no',
    language_name: 'Norwegian',
  },
  {
    language_code: 'oc',
    language_name: 'Occitan',
  },
  {
    language_code: 'fa',
    language_name: 'Persian',
  },
  {
    language_code: 'pl',
    language_name: 'Polish',
  },
  {
    language_code: 'pt-pt',
    language_name: 'Portuguese',
  },
  {
    language_code: 'ru',
    language_name: 'Russian',
  },
  {
    language_code: 'sr',
    language_name: 'Serbian',
  },
  {
    language_code: 'si',
    language_name: 'Sinhalese',
  },
  {
    language_code: 'sk',
    language_name: 'Slovak',
  },
  {
    language_code: 'sl',
    language_name: 'Slovenian',
  },
  {
    language_code: 'es',
    language_name: 'Spanish',
  },
  {
    language_code: 'sw',
    language_name: 'Swahili',
  },
  {
    language_code: 'sv',
    language_name: 'Swedish',
  },
  {
    language_code: 'sy',
    language_name: 'Syriac',
  },
  {
    language_code: 'ta',
    language_name: 'Tamil',
  },
  {
    language_code: 'te',
    language_name: 'Telugu',
  },
  {
    language_code: 'tl',
    language_name: 'Tagalog',
  },
  {
    language_code: 'th',
    language_name: 'Thai',
  },
  {
    language_code: 'tr',
    language_name: 'Turkish',
  },
  {
    language_code: 'uk',
    language_name: 'Ukrainian',
  },
  {
    language_code: 'ur',
    language_name: 'Urdu',
  },
  {
    language_code: 'uz',
    language_name: 'Uzbek',
  },
  {
    language_code: 'vi',
    language_name: 'Vietnamese',
  },
  {
    language_code: 'ro',
    language_name: 'Romanian',
  },
  {
    language_code: 'pt-br',
    language_name: 'Portuguese (Brazilian)',
  },
  {
    language_code: 'me',
    language_name: 'Montenegrin',
  },
  {
    language_code: 'zh-tw',
    language_name: 'Chinese (traditional)',
  },
  {
    language_code: 'ze',
    language_name: 'Chinese bilingual',
  },
];

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
  const overlayTime = 5000;
  const [overlayTimeout, setOverlayTimeout] = useState(null);
  const [rate, setRate] = useState(1);

  // suntitles
  const [subtitleData, setSubtitleData] = useState(null);
  const [currSubText, setCurrSubText] = useState(null);
  const [subtitleTextColor, setSubtitleTextColor] = useState("white");
  const [subtitleLang, setSubtitleLang] = useState('en');
  const [subModal, setSubModal] = useState(false);
  const [availableSubs, setAvaialbleSubs] = useState([]);
  const [quickSubs, setQuickSubs] = useState([]);
  const [subTab, setSubTab] = useState(0);

  // console.log(`${address}/subtitles/?imdbId=${media.IMDB_ID}&language=en&type=vtt`)

  // Fetches
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

  const fetchAvailableSubs = async () => {
    try {
      const response = await fetch(
        `${address}/subtitles/available?imdbId=${media.IMDB_ID}`,
      );
      const json = await response.json();
      const results = json
        .filter(i => i.EXT === 'srt')
        .map(i => langDict.find(x => x.language_code === i.LANG));
      setAvaialbleSubs(results);
    } catch (err) {}
  };

  const fetchSub = async () => {
    try {
      const response = await fetch(
        `${address}/subtitles?imdbId=${media.IMDB_ID}&language=${subtitleLang}&type=vtt`,
      );
      const text = await response.text();
      const data = await vttToJson(text);
      const parsed = [];
      for (const {start, end, part} of data) {
        // console.log(index);
        parsed.push({
          start: start / 1000,
          end: end / 1000,
          part: part.slice(
            0,
            part.length -
              part.split('\n')[part.split('\n').length - 1].length -
              3,
          ),
        });
      }
      setSubtitleData(parsed);
    } catch (err) {
      console.error(err.message);
    }
  };

  //
  const showOverlay = show => {
    Animated.timing(opacityAnim, {
      toValue: show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (show) {
      resetTimeout();
    } else {
      clearTimeout(overlayTimeout);
    }
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

    if (subtitleLang && subtitleData) {
      const curr = subtitleData.find(
        i => i.start <= currentTime && i.end >= currentTime,
      );
      setCurrSubText(curr ? curr.part : null);
    }
  };

  const handlePlayToggle = () => {
    setPaused(!paused);
    resetTimeout();
  };

  const handleSeek = time => {
    if (videoRef) {
      videoRef.seek(time);
    }
    resetTimeout();
  };

  const handleJump = jump => {
    if (videoRef) {
      const target = currentTime + jump;
      setCurrentTime(target);
      videoRef.seek(target);
    }
    resetTimeout();
  };

  const resetTimeout = () => {
    clearTimeout(overlayTimeout);
    const to = setTimeout(() => setOverlay(false), overlayTime);
    setOverlayTimeout(to);
  };

  useEffect(() => {
    fetchMedia();
    resetTimeout();
  }, []);

  useEffect(() => {
    if (media && media.TYPE === 2) {
      fetchEpisode();
    }
  }, [media]);

  useEffect(() => {
    showOverlay(overlay);
  }, [overlay]);

  useEffect(() => {
    if (subModal) {
      fetchAvailableSubs();
      setPaused(true);
    }
  }, [subModal]);

  useEffect(() => {
    const start = [
      langDict.find(i => i.language_code === 'en'),
      langDict.find(i => i.language_code === 'es'),
      langDict.find(i => i.language_code === 'fr'),
      langDict.find(i => i.language_code === 'it'),
    ];
    const filter = start.filter(
      i =>
        availableSubs.findIndex(a => a.language_code === i.language_code) ===
        -1,
    );
    setQuickSubs(filter);
  }, [availableSubs]);

  useEffect(() => {
    if (media) {
      fetchSub();
    }
  }, [media, subtitleLang]);

  const SubtitleButton = ({selected, text, handlePress}) => (
    <TouchableOpacity onPress={handlePress} style={styles.subModalButton}>
      {selected ? <MaterialIcon name="check" color="white" size={30} /> : <></>}
      <Text
        style={[
          styles.subModalText,
          selected ? {} : {color: 'rgb(130,130,130)'},
        ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

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
          uri: `${address}/player/video?mediaId=${mediaId}&type=${media.TYPE}&episodeId=${episode?.EPISODE_ID}`,
        }}
        rate={rate}
        //
        paused={paused}
        // Events
        onProgress={handleProgress}
      />

      <View style={[styles.subtitleContainer, overlay ? {bottom: 70} : {}]}>
        {currSubText ? (
          <Text style={[styles.subtitleText, {color: subtitleTextColor}]}>{currSubText}</Text>
        ) : (
          <></>
        )}
      </View>

      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.touch}
        onPress={() => setOverlay(!overlay)}>
        <Animated.View
          style={[styles.overlay, {opacity: opacityAnim}]}
          pointerEvents={overlay ? 'auto' : 'none'}>
          <View
            style={[
              styles.section,
              styles.top,
              {paddingTop: StatusBar.currentHeight},
            ]}>
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
              onPress={handlePlayToggle}
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
                onPress={() => setSubModal(true)}
                style={styles.option}>
                <MaterialIcon
                  name={subtitleLang ? 'subtitles' : 'subtitles-off'}
                  size={30}
                  color="white"
                />
                <Text style={styles.optionText}>Subtitles</Text>
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

      {/* Modals */}
      <Modal
        visible={subModal}
        onRequestClose={() => setSubModal(false)}
        animationType="slide">
        <View style={styles.subModal}>
          
          {/* Tabs */}
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              overflow: 'hidden',
              borderRadius: 10,
              marginVertical: 10,
            }}>
            <TouchableOpacity>
              <Text
                onPress={() => setSubTab(0)}
                style={{
                  color: subTab === 0 ? 'black' : 'white',
                  backgroundColor: subTab === 0 ? 'white' : 'rgb(40,40,40)',
                  padding: 10,
                  fontSize: 15,
                }}>
                Available
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                onPress={() => setSubTab(1)}
                style={{
                  color: subTab === 1 ? 'black' : 'white',
                  backgroundColor: subTab === 1 ? 'white' : 'rgb(40,40,40)',
                  padding: 10,
                  fontSize: 15,
                }}>
                Download
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scroll */}
          <ScrollView contentContainerStyle={styles.subModalScroll}>
            {subTab === 0 ? (
              <>
                <View style={styles.subModalSection}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    <Text style={styles.subModalHeader}>Language</Text>
                    <IonIcon name="language" color="white" size={30} />
                  </View>
                  <View style={styles.subModalList}>
                    {availableSubs.map(i => (
                      <SubtitleButton
                        text={i.language_name}
                        selected={subtitleLang === i.language_code}
                        handlePress={() => setSubtitleLang(i.language_code)}
                      />
                    ))}
                    <SubtitleButton
                      text={'None'}
                      selected={subtitleLang === null}
                      handlePress={() => setSubtitleLang(null)}
                    />
                  </View>
                </View>

                <View style={styles.subModalSection}>
                <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    <Text style={styles.subModalHeader}>Colors</Text>
                    <MaterialIcon name="format-color-text" color="white" size={30} />
                  </View>
                    <View style={styles.subModalList}>
                      <SubtitleButton text="White" selected={subtitleTextColor === "white"} handlePress={() => setSubtitleTextColor("white")} />
                      <SubtitleButton text="Yellow" selected={subtitleTextColor === "yellow"} handlePress={() => setSubtitleTextColor("yellow")} />                      
                    </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.subModalSection}>
                  <Text style={styles.subModalHeader}>Quick Download</Text>
                  <View style={styles.subModalList}>
                    {quickSubs.map(i => (
                      <SubtitleButton
                        text={i.language_name}
                        handlePress={() => {}}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.subModalSection}>
                  <Text style={styles.subModalHeader}>Manual Download</Text>
                  <TextInput
                    style={styles.subModalSearch}
                    placeholder="Search language"
                  />
                  <View style={styles.subModalList}>
                    {quickSubs.map(i => (
                      <SubtitleButton
                        text={i.language_name}
                        handlePress={() => {}}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  video: {
    flex: 1,
  },
  subtitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    top: 0,
    // backgroundColor: 'lightblue',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  subtitleText: {
    color: 'white',
    fontSize: 20,
    backgroundColor: '#00000066',
    padding: 5,
    paddingHorizontal: 10,
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

  // Subttile modal
  subModal: {
    backgroundColor: 'black',
    flex: 1,
  },
  subModalScroll: {
    gap: 20,
    paddingBottom: 50,
  },
  subModalHeader: {
    color: 'white',
    fontSize: 30,
  },
  subModalList: {},
  subModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subModalText: {
    color: 'white',
    fontSize: 25,
  },
  subModalSearch: {
    backgroundColor: 'white',
    fontSize: 16,
  },
});
