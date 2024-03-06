import {useContext, useEffect, useRef, useState, useCallback} from 'react';
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

//
import {useNavigation, useIsFocused} from '@react-navigation/native';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// Components
import CastRowComponent from '../components/CastRow.component';
import MediaRowComponent from '../components/posterRow.component';
import FooterComponent from '../components/Footer.component';
import EpisodeRowComponent from '../components/EpisodeRow.component';

// Hooks
import useMedia from '../hooks/useMedia.hook';
import {CastButton, useRemoteMediaClient} from 'react-native-google-cast';

// Contexts
import {globalContext} from '../App';

const bkgrd = 'black';
const mrgn = 10;

export default ({route}) => {
  const {
    address,
    posterRowSize,
    castRowSize,
    episodeRowSize,
    rowGap,
    horizontalMargin,
  } = useContext(globalContext);
  const client = useRemoteMediaClient();
  const isFocused = useIsFocused();
  const {mediaId} = route.params;
  const {
    item,
    seasonNum,
    season,
    inWatchlist,
    setSeasonNum,
    addWatchlist,
    remWatchlist,
  } = useMedia({mediaId});
  const navigation = useNavigation();
  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);

  // Season Selector
  const [seasonModal, setSeasonModal] = useState(false);

  // Animation
  const titleOpctAnim = useRef(new Animated.Value(0)).current;

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 180, 200],
    outputRange: [0, 0, 1],
  });
  const posterOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
  });

  const fetchGenre = genre =>
    new Promise(async (res, rej) => {
      try {
        const response = await fetch(
          `${address}/browse/genres?orderBy=random&genreName=${genre}&type=${item.TYPE}&limit=30`,
        );
        const json = await response.json();
        res(json);
      } catch (err) {
        rej(err);
      }
    });

  const fetchSimilar = async () => {
    try {
      if (item && item.GENRES.length !== 0) {
        const genres = item.GENRES.map(i => i.GENRE_NAME);
        if (genres.length > 2) {
          const rand1 = Math.floor(Math.random() * genres.length);
          const genre1 = await fetchGenre(genres[rand1]);
          setGenre1({
            genre_name: genres[rand1],
            items: genre1.filter(i => i.MEDIA_ID !== mediaId),
          });
          let rand2 = rand1;
          while (rand2 === rand1) {
            rand2 = Math.floor(Math.random() * genres.length);
          }
          const genre2 = await fetchGenre(genres[rand2]);
          setGenre2({
            genre_name: genres[rand2],
            items: genre2.filter(i => i.MEDIA_ID !== mediaId),
          });
        } else if (genres.length === 2) {
          const genre1 = await fetchGenre(genres[0]);
          const genre2 = await fetchGenre(genres[1]);
          setGenre1({
            genre_name: genres[0],
            items: genre1.filter(i => i.MEDIA_ID !== mediaId),
          });
          setGenre2({
            genre_name: genres[1],
            items: genre2.filter(i => i.MEDIA_ID !== mediaId),
          });
        } else if (genres.length === 1) {
          const genre1 = await fetchGenre(genres[0]);
          setGenre1({
            genre_name: genres[0],
            items: genre1.filter(i => i.MEDIA_ID !== mediaId),
          });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
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
      toValue: y > 320 ? 1 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const animatedEvent = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: false},
  );

  useEffect(() => {
    if (item) {
      fetchSimilar();
    }
  }, [item]);

  useEffect(() => {
    if (client && item && isFocused) {
      if (item.POSTER_W_L || item.BACKDROP_L) {
        client
          .queueInsertAndPlayItem({
            mediaInfo: {contentUrl: item.POSTER_W_L || item.BACKDROP_L},
          })
          .catch(err => console.error(err));
      } else {
        client.queueInsertAndPlayItem({
          mediaInfo: {
            contentUrl:
              'https://images.squarespace-cdn.com/content/v1/520b6dcee4b0734e32e29746/1553092004466-AP3WPCPOMHBJ87PJ67LG/Netflix_anim.gif',
          },
        });
      }
    }
  }, [client, item, isFocused]);

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
      height: 450,
      justifyContent: 'flex-end',
    },
    info: {
      flexDirection: 'row',
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
      fontSize: 12,
      paddingHorizontal: 15,
      paddingVertical: 5,
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
    seasonTouch: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: mrgn,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 0.1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      width: 160,
      borderRadius: 25,
    },
    seasonText: {
      color: 'white',
      fontSize: 20,
    },
    seasonModal: {
      backgroundColor: 'black',
      flex: 1,
    },
    seasonModalScroll: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 200,
    },
    seasonModalText: {
      backgroundColor: 'black',
      textAlign: 'center',
      fontSize: 29,
      color: 'white',
      fontWeight: 'bold',
      padding: 10,
    },
  });

  if (!item) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={styles.topBkgrd} />
      <View style={styles.topTitleContainer}>
        <Animated.Text style={styles.topTitleText} numberOfLines={1}>
          {item.TITLE}
        </Animated.Text>
      </View>
      <View style={styles.top}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => navigation.goBack()}>
          <MaterialIcon name="arrow-back" color="white" size={25} />
        </TouchableOpacity>
        <CastButton style={styles.topButton} />
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
            source={{uri: item.POSTER_NT_L ?? item.BACKDROP_S}}
          />
        </Animated.View>

        <LinearGradient
          colors={['transparent', bkgrd]}
          style={styles.gradient}
        />

        <View style={styles.main}>
          <View style={[styles.info, {marginHorizontal: horizontalMargin}]}>
            <Text style={styles.infoText}>{item.YEAR}</Text>
            <View style={styles.infoBreak} />
            <Text style={styles.infoText}>{secToString(item.DURATION)}</Text>
            {item.DURATION ? <View style={styles.infoBreak} /> : <></>}
            <Text style={styles.infoText}>{Math.floor(item.VOTE * 10)}%</Text>
          </View>
          <Text
            style={[styles.title, {marginHorizontal: horizontalMargin}]}
            adjustsFontSizeToFit
            numberOfLines={2}>
            {item.TITLE}
          </Text>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.genres,
                {paddingHorizontal: horizontalMargin},
              ]}>
              {item.GENRES.map(({GENRE_NAME}) => (
                <Text key={'GENRE_' + GENRE_NAME} style={styles.genre}>
                  {GENRE_NAME}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={[styles.buttons, {marginHorizontal: horizontalMargin}]}>
          <TouchableOpacity
            style={styles.play}
            onPress={() => navigation.navigate('player', {mediaId})}>
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
        <Text
          style={[styles.overview, {marginHorizontal: horizontalMargin}]}
          numberOfLines={3}>
          {item.OVERVIEW}
        </Text>

        {item.TYPE === 2 && (
          <TouchableOpacity
            style={[styles.seasonTouch, {marginHorizontal: horizontalMargin}]}
            onPress={() => setSeasonModal(true)}>
            <Text style={styles.seasonText}>Season {seasonNum}</Text>
            <MaterialIcon name="expand-more" color="white" size={20} />
          </TouchableOpacity>
        )}

        {season && season.length > 0 && (
          <EpisodeRowComponent
            items={season}
            gap={rowGap}
            margin={horizontalMargin}
            width={episodeRowSize.itemWidth}
          />
        )}

        <CastRowComponent
          items={item.CAST}
          header={'Cast'}
          gap={rowGap}
          margin={horizontalMargin}
          width={castRowSize.itemWidth}
        />

        {genre1 && (
          <MediaRowComponent
            items={genre1.items}
            header={`More In ${genre1.genre_name}`}
            gap={rowGap}
            margin={horizontalMargin}
            width={posterRowSize.itemWidth}
          />
        )}

        {genre2 && (
          <MediaRowComponent
            items={genre2.items}
            header={`More In ${genre2.genre_name}`}
            gap={rowGap}
            margin={horizontalMargin}
            width={posterRowSize.itemWidth}
          />
        )}

        <FooterComponent />
      </ScrollView>

      <Modal
        animationType="slide"
        visible={seasonModal}
        onRequestClose={() => setSeasonModal(false)}>
        <View style={styles.seasonModal}>
          <ScrollView contentContainerStyle={styles.seasonModalScroll}>
            {item.AVAILABLE_SEASONS?.map(({SEASON_NUM}) => (
              <TouchableOpacity
                key={'SEASON_NUM_' + SEASON_NUM}
                onPress={() => {
                  setSeasonNum(SEASON_NUM);
                  setSeasonModal(false);
                }}>
                <Text style={styles.seasonModalText}>SEASON {SEASON_NUM}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};
