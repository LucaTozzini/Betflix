import {
  View,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Animated,
} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';

// Hooks
import useTitles from '../hooks/useTitles-hook';

// Contexts
import {globalContext} from '../../App';

// Components
import MediaRow from '../components/media row-comp';
import {TitleHeader} from '../components/header-comp';
import PeopleRow from '../components/people row-comp';
import EpisodeList from '../components/episode list-comp';

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function TitleScreen({route}) {
  const {title_id} = route.params;
  const {useWatchlist} = useContext(globalContext);
  const navigation = useNavigation();
  const {colors} = useTheme();
  const {fetchItem, fetchSimilar} = useTitles();

  const [item, setItem] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [expandOverview, setExpandOverview] = useState(false);

  const [scrollY] = useState(new Animated.Value(0));
  const backgroundColor = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: ['transparent', 'black'],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [199, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: false},
  );

  async function initialize() {
    const item = await fetchItem(title_id);
    setItem(item);
    await useWatchlist.get();
    const inWatchlist = await useWatchlist.has(title_id);
    setInWatchlist(inWatchlist);
  }

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    async function init() {
      const similarTitles = await fetchSimilar(title_id);
      setSimilar(similarTitles);
    }
    init();
  }, []);

  const formatRuntime = runtime => {
    // Convert seconds to minutes
    const minutes = Math.floor(runtime / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours > 0 ? hours + 'h ' : ''}${remainingMinutes}m`;
  };

  const handleWatchlist = async () => {
    const success = inWatchlist
      ? await useWatchlist.rem(title_id)
      : await useWatchlist.add(title_id);
    if (success) {
      setInWatchlist(!inWatchlist);
    }
  };

  if (!item) {
    return null;
  }

  return (
    <>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <TitleHeader
        backgroundColor={backgroundColor}
        titleOpacity={titleOpacity}
        title={item.title}
      />
      <ScrollView
        contentContainerStyle={screenStyles.scroll}
        scrollEventThrottle={16} // Adjust this value to control the scroll event frequency
        onScroll={handleScroll}>
        <ImageBackground
          source={{
            uri: item.backdrop,
          }}
          style={screenStyles.image}>
          <LinearGradient
            locations={[0.5, 1]}
            colors={['transparent', colors.background]}
            style={screenStyles.imageGradient}>
            <Text
              style={screenStyles.title}
              numberOfLines={3}
              adjustsFontSizeToFit>
              {item.title}
            </Text>
            <View style={screenStyles.details}>
              <Text style={screenStyles.year}>{item.date.split('-')[0]}</Text>
              <Text style={screenStyles.rating}>
                {item.rating?.length ? item.rating : 'NR'}
              </Text>
              {item.duration && (
                <Text style={screenStyles.runtime}>
                  {formatRuntime(item.duration)}
                </Text>
              )}
              <Text style={screenStyles.genre} numberOfLines={1}>
                {item.genres.join(', ')}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={screenStyles.buttons}>
          <TouchableOpacity
            style={screenStyles.playButton}
            onPress={() =>
              navigation.navigate('Player', {title_id, episode_id: null})
            }>
            <IonIcon name="play" color="black" size={30} />
            <Text style={screenStyles.playButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWatchlist}>
            <IonIcon
              name={inWatchlist ? 'checkmark-circle' : 'add-circle-outline'}
              color="white"
              size={50}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setExpandOverview(!expandOverview)}
          activeOpacity={0.9}>
          <Text
            numberOfLines={expandOverview ? null : 3}
            style={screenStyles.overview}>
            {item.overview}
          </Text>
        </TouchableOpacity>

        {item.type == 2 && <EpisodeList title_id={title_id} />}

        {item.revenue > 0 && item.budget > 0 && (
          <View style={screenStyles.financial}>
            <Text style={screenStyles.financialText}>
              Budget: {USD.format(item.budget)}
            </Text>
            <Text style={screenStyles.financialText}>
              Revenue: {USD.format(item.revenue)}
            </Text>
          </View>
        )}

        <PeopleRow data={item.cast} header={'Cast'} paddingHorizontal={20} />
        {similar && <MediaRow header={'Similar Titles'} data={similar} />}
      </ScrollView>
    </>
  );
}

const MARGIN = 10;

const screenStyles = StyleSheet.create({
  scroll: {gap: 20, paddingBottom: 30},
  image: {
    height: 300,
    objectFit: 'cover',
  },
  imageGradient: {
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: MARGIN,
  },
  title: {
    color: 'white',
    fontSize: 40,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  year: {
    color: 'white',
    fontSize: 17,
  },
  rating: {
    color: 'grey',
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'grey',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 13,
  },
  runtime: {
    // New style for the runtime
    color: 'grey',
    fontSize: 17,
  },
  genre: {
    color: 'grey',
    fontSize: 17,
    flex: 1,
  },
  buttons: {
    marginHorizontal: MARGIN,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    borderRadius: 100,
    padding: 15,
  },
  playButtonText: {fontWeight: 'bold', fontSize: 20, color: 'black'},
  overview: {color: 'white', fontSize: 20, marginHorizontal: MARGIN},
  financial: {marginHorizontal: MARGIN},
  financialText: {color: 'rgb(180,180,180)', fontSize: 16},
});
