import {useEffect, useRef, useState} from 'react';
import {
  Text,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';
import {useNavigation} from '@react-navigation/native';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// Components
import CastRowComponent from '../components/CastRow.component';
import MediaRowComponent from '../components/MediaRow.component';
import FooterComponent from '../components/Footer.component';

// Hooks
import useMediaRow from '../hooks/useMediaRow.hook';

const bkgrd = 'black';
const mrgn = 10;

export default ({route}) => {
  const {userId, userPin, address, mediaId, setShowCast} = route.params;
  const navigation = useNavigation();
  const [media, setMedia] = useState(null);
  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(null);

  // Animation
  const imgOpctAnim = useRef(new Animated.Value(1)).current;
  const topBkgrdOpctAnim = useRef(new Animated.Value(0)).current;
  const titleOpctAnim = useRef(new Animated.Value(0)).current;

  const scrollY = useRef(new Animated.Value(0)).current;
  const clampY = Animated.diffClamp(scrollY, 0, 250);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 180, 200],
    outputRange: [0, 0, 1],
  });
  const posterOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
  });

  // Cast Row
  const castGap = 10;
  const castNum = 2.5;
  const castRowHook = useMediaRow({
    gap: castGap,
    numItems: castNum,
    margin: mrgn,
  });

  // Media Row
  const mediaGap = 10;
  const mediaNum = 3;
  const mediaRowHook = useMediaRow({
    gap: mediaGap,
    numItems: mediaNum,
    margin: mrgn,
  });

  const fetchItem = async () => {
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
      setInWatchlist(json.IN_WATCHLIST);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchGenre = genre =>
    new Promise(async (res, rej) => {
      try {
        const response = await fetch(
          `${address}/browse/genres?orderBy=random&genreName=${genre}&type=${media.TYPE}&limit=30`,
        );
        const json = await response.json();
        res(json);
      } catch (err) {
        rej(err);
      }
    });

  const fetchSimilar = async () => {
    try {
      if (media && media.GENRES.length !== 0) {
        const genres = media.GENRES.map(i => i.GENRE_NAME);
        if (genres.length > 2) {
          const rand1 = Math.floor(Math.random() * genres.length);
          const genre1 = await fetchGenre(genres[rand1]);
          setGenre1({genre_name: genres[rand1], items: genre1});
          let rand2 = rand1;
          while (rand2 === rand1) {
            rand2 = Math.floor(Math.random() * genres.length);
          }
          const genre2 = await fetchGenre(genres[rand2]);
          setGenre2({genre_name: genres[rand2], items: genre2});
        } else if (genres.length === 2) {
          const genre1 = await fetchGenre(genres[0]);
          const genre2 = await fetchGenre(genres[1]);
          setGenre1({genre_name: genres[0], items: genre1});
          setGenre2({genre_name: genres[1], items: genre2});
        } else if (genres.length === 1) {
          const genre1 = await fetchGenre(genres[0]);
          setGenre1({genre_name: genres[0], items: genre1});
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const addWatchlist = async () => {
    try {
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, userPin, mediaId: media.MEDIA_ID}),
      };
      const response = await fetch(`${address}/watchlist/add`, options);
      if (response.status === 201) {
        setInWatchlist(true);
      }
    } catch (err) {}
  };

  const remWatchlist = async () => {
    try {
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, userPin, mediaId: media.MEDIA_ID}),
      };
      const response = await fetch(`${address}/watchlist/remove`, options);
      if (response.status === 202) {
        setInWatchlist(false);
      }
    } catch (err) {}
  };

  const secToString = seconds => {
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.floor(seconds);
    return `${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm' : ''}${
      seconds && !minutes && !hours ? seconds + 's' : ''
    }`;
  };

  const handleWatchlist = () => {
    if (inWatchlist) {
      remWatchlist();
    } else {
      addWatchlist();
    }
  };

  const handleScroll = e => {
    const y = e.nativeEvent.contentOffset.y;

    Animated.timing(titleOpctAnim, {
      toValue: y > 350 ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const animatedEvent = Animated.event([
    {nativeEvent: {contentOffset: {y: scrollY}}},
  ]);

  useEffect(() => {
    fetchItem();
  }, []);

  useEffect(() => {
    fetchSimilar();
  }, [media]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bkgrd,
    },
    topBkgrd: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: StatusBar.currentHeight + 50,
      backgroundColor: 'black',
      zIndex: 2000,
      opacity: headerOpacity,
    },
    topTitleContainer: {
      position: 'absolute',
      top: StatusBar.currentHeight + 5,
      left: mrgn + 50,
      right: mrgn + 50,
      height: 40,
      // backgroundColor: "lightblue",
      zIndex: 2001,
      justifyContent: 'center',
      // alignItems: "center",
    },
    topTitleText: {
      color: 'white',
      fontSize: 18,
      opacity: titleOpctAnim,
    },
    top: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2001,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: StatusBar.currentHeight + 5,
      paddingHorizontal: mrgn,
      paddingBottom: 5,
    },
    topButton: {
      height: 40,
      width: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    poster: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: StatusBar.currentHeight + 450,
      justifyContent: 'flex-end',
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 50,
      height: StatusBar.currentHeight + 400,
    },

    scroll: {
      gap: 15,
    },
    main: {
      // backgroundColor: 'green',
      height: 450,
      justifyContent: 'flex-end',
    },
    info: {
      flexDirection: 'row',
      marginHorizontal: mrgn,
      gap: 7,
      alignItems: 'center',
    },
    infoText: {
      color: 'rgb(200, 200, 200)',
      fontSize: 16,
    },
    infoBreak: {
      height: 4,
      width: 4,
      borderRadius: 2,
      backgroundColor: 'rgb(170, 170, 170)',
    },
    title: {
      color: 'white',
      fontSize: 45,
      marginHorizontal: mrgn,
      marginBottom: 5,
    },
    genres: {
      gap: 5,
      paddingHorizontal: mrgn,
    },
    genre: {
      color: 'white',
      fontSize: 17,
      paddingHorizontal: 18,
      paddingVertical: 7,
      borderRadius: 10,
      backgroundColor: 'rgb(40,40,40)',
      borderWidth: 1,
      borderColor: 'rgb(60,60,60)',
    },
    buttons: {
      flexDirection: 'row',
      gap: 10,
      height: 60,
      marginHorizontal: mrgn,
    },
    play: {
      flex: 1,
      backgroundColor: 'white',
      flexDirection: 'row',
      gap: 7,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
    },
    playText: {
      fontSize: 20,
      // fontWeight: "bold",
      color: 'black',
    },
    watchlist: {
      width: 60,
      borderWidth: 1,
      borderColor: 'rgb(60,60,60)',
      backgroundColor: 'rgb(40,40,40)',
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overview: {
      color: 'white',
      fontSize: 17,
      marginHorizontal: mrgn,
    },
  });

  if (!media) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={styles.topBkgrd} />
      <View style={styles.topTitleContainer}>
        <Animated.Text style={styles.topTitleText} numberOfLines={1}>
          {media.TITLE}
        </Animated.Text>
      </View>
      <View style={styles.top}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}>
          <MaterialIcon name="arrow-back" color="white" size={25} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setShowCast(true)}>
          <MaterialIcon name="cast" color="white" size={25} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        onScroll={event => {
          handleScroll(event);
          animatedEvent(event);
        }}>
        <Animated.View style={{opacity: posterOpacity}}>
          <ImageBackground
            style={styles.poster}
            source={{uri: media.POSTER_NT_L}}
          />
        </Animated.View>

        <LinearGradient
          colors={['transparent', bkgrd]}
          style={styles.gradient}
        />

        <View style={styles.main}>
          <View style={styles.info}>
            <Text style={styles.infoText}>{media.YEAR}</Text>
            <View style={styles.infoBreak} />
            <Text style={styles.infoText}>{secToString(media.DURATION)}</Text>
            <View style={styles.infoBreak} />
            <Text style={styles.infoText}>{Math.floor(media.VOTE * 10)}%</Text>
          </View>
          <Text style={styles.title} adjustsFontSizeToFit numberOfLines={2}>
            {media.TITLE}
          </Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genres}>
              {media.GENRES.map(genre => (
                <Text style={styles.genre}>{genre.GENRE_NAME}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.play}
            onPress={() =>
              navigation.navigate('player', {mediaId: media.MEDIA_ID})
            }>
            <MaterialIcon name="play-arrow" size={50} color="black" />
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.watchlist} onPress={handleWatchlist}>
            <MaterialIcon
              size={45}
              color="white"
              name={inWatchlist ? 'check' : 'add'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.overview} numberOfLines={3}>
          {media.OVERVIEW}
        </Text>
        <CastRowComponent
          items={media.CAST}
          gap={castGap}
          margin={mrgn}
          width={castRowHook.itemWidth}
          header="Cast"
        />

        {genre1 ? (
          <MediaRowComponent
            gap={mediaGap}
            margin={mrgn}
            width={mediaRowHook.itemWidth}
            header={genre1.genre_name}
            items={genre1.items}
          />
        ) : (
          <></>
        )}

        {genre2 ? (
          <MediaRowComponent
            gap={mediaGap}
            margin={mrgn}
            width={mediaRowHook.itemWidth}
            header={genre2.genre_name}
            items={genre2.items}
          />
        ) : (
          <></>
        )}

        <FooterComponent />
      </ScrollView>
    </View>
  );
};
