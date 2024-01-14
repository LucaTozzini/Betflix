import {useEffect, useState} from 'react';
import {
  Text,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {BlurView} from '@react-native-community/blur';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import Icon from 'react-native-vector-icons/Ionicons';

// Components
import CastRowComponent from '../components/CastRow.component';
import FooterComponent from '../components/Footer.component';

// Hooks
import useMediaRow from '../hooks/useMediaRow.hook';

export default ({route}) => {
  const {userId, userPin, address, mediaId} = route.params;
  const [media, setMedia] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(null);
  const [showOverview, setShowOverview] = useState(false);

  // Cast Row
  const castGap = 10;
  const castNum = 2.5;
  const castRowHook = useMediaRow({
    gap: castGap,
    numItems: castNum,
    margin: sideMarginSize,
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

  useEffect(() => {
    fetchItem();
  }, []);

  const BlurButton = ({Icon, onPress}) => {
    const size = 60;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{
          height: size,
          width: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        }}>
        <BlurView
          reducedTransparencyFallbackColor="white"
          blurType="light"
          blurAmount={8}
          style={{}}>
          <View
            style={{
              height: size,
              width: size,
              backgroundColor: 'rgba(0,0,0,0)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {Icon}
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const InfoScroll = () => {
    const styles = StyleSheet.create({
      scroll: {
        paddingHorizontal: 15,
        gap: 10,
      },
      item: {
        borderWidth: 1,
        borderColor: 'white',
        padding: 7,
        borderRadius: 10,
      },
      text: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
      },
    });

    const secToString = () => {
      let seconds = media.DURATION;
      const hours = Math.floor(seconds / 3600);
      seconds -= hours * 3600;
      const minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      seconds = Math.floor(seconds);
      return `${hours ? hours + 'h ' : ''}${minutes}m${
        !hours && seconds ? ' ' + seconds + 's' : ''
      }`;
    };

    const Item = ({text, backgroundColor, color, borderColor}) => (
      <View
        style={[
          styles.item,
          {backgroundColor},
          borderColor ? {borderColor} : {},
        ]}>
        <Text style={[styles.text, color ? {color} : {}]}>{text}</Text>
      </View>
    );

    return (
      <ScrollView
        horizontal
        contentContainerStyle={styles.scroll}
        showsHorizontalScrollIndicator={false}>
        <Item text={secToString()} backgroundColor="white" color="black" />
        <Item
          text={'TMDb ' + Math.floor(media.VOTE * 10) / 10}
          color="black"
          backgroundColor="rgb(80, 180, 255)"
          borderColor="rgb(80, 180, 255)"
        />
        {media.GENRES.map(i => (
          <Item key={'genre_' + i.GENRE_NAME} text={i.GENRE_NAME} />
        ))}
      </ScrollView>
    );
  };

  const OverviewModal = () => {
    return (
      <Modal
      animationType='slide'
        visible={showOverview}
        onRequestClose={() => setShowOverview(false)}
        transparent>
        <View style={styles.modal}>
          <ScrollView>
            <Text style={styles.title}>{media.TITLE}</Text>
            <Text style={styles.overview}>{media.OVERVIEW}</Text>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (!media) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <ImageBackground source={{uri: media.POSTER_L}} style={styles.image}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,.3)']}
            style={styles.linearGradient}>
            {inWatchlist ? (
              <BlurButton
                onPress={remWatchlist}
                Icon={<Icon name="checkmark" color="white" size={40} />}
              />
            ) : (
              <BlurButton
                onPress={addWatchlist}
                Icon={<Icon name="add" color="white" size={40} />}
              />
            )}
            <BlurButton Icon={<Icon name="play" color="white" size={40} />} />
          </LinearGradient>
        </ImageBackground>
      </View>
      <InfoScroll />
      <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
        {media.TITLE}
      </Text>
      <Text style={styles.year}>{media.YEAR}</Text>
      <TouchableOpacity onPress={() => setShowOverview(true)}>
        <Text style={styles.overview} numberOfLines={2}>{media.OVERVIEW}</Text>
        <OverviewModal />
      </TouchableOpacity>
      <CastRowComponent
        header={'Cast'}
        margin={sideMarginSize}
        gap={castGap}
        width={castRowHook.itemWidth}
        items={media.CAST}
      />
      <FooterComponent/>
    </ScrollView>
  );
};

const sideMarginSize = 10;

const styles = StyleSheet.create({
  container: {
    
  },
  imageContainer: {
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    marginBottom: 15,
  },
  image: {
    height: 500,
    backgroundColor: 'grey',
  },
  linearGradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: sideMarginSize,
    flexDirection: 'row',
  },
  title: {
    marginTop: 10,
    color: 'white',
    paddingHorizontal: sideMarginSize,
    fontSize: 30,
    textAlign: 'center',
    fontWeight: '400',
  },
  year: {
    textAlign: 'center',
    color: 'rgb(190,190,190)',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  overview: {
    color: 'white',
    fontSize: 17,
    paddingHorizontal: sideMarginSize,
    textAlign: "justify"
  },
  modal: {
    backgroundColor: 'black',
    flex: 1,
  },
});
