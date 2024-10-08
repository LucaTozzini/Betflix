import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import ScrollModal from './scroll modal-comp';
import {useContext, useEffect, useState} from 'react';
import Ionicon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {globalContext} from '../../App';

export default function MediaRow({header, data, orientation}) {
  if (!data?.length) return null;
  const {colors} = useTheme();
  const navigation = useNavigation();
  const Item = ({image, title_id, logo}) => (
    <TouchableOpacity onPress={() => navigation.push('Title', {title_id})}>
      <Image
        style={[
          orientation == 'poster' ? itemStyles.poster : itemStyles.landscape,
          image === null ? {objectFit: 'contain'} : {},
        ]}
        source={{uri: image ?? logo}}
      />
    </TouchableOpacity>
  );
  return (
    <View style={screenStyles.container}>
      <Text style={[screenStyles.header, {color: colors.text}]}>{header}</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={screenStyles.scroll}
        data={data}
        keyExtractor={item => header + '_' + item.title_id}
        renderItem={({item: {title_id, landscape, poster, backdrop, logo}}) => (
          <Item
            image={orientation == 'poster' ? poster : landscape ?? backdrop}
            logo={logo}
            title_id={title_id}
          />
        )}
      />
    </View>
  );
}

export function ContinueRow({header, data}) {
  if (!data?.length) return null;
  const {colors} = useTheme();
  const navigation = useNavigation();
  const Item = ({
    image,
    title_id,
    episode_id,
    season_num,
    episode_num,
    progress,
  }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Player', {title_id, episode_id})}>
      <ImageBackground style={itemStyles.landscape} source={{uri: image}}>
        <LinearGradient
          style={itemStyles.gradient}
          colors={['transparent', 'rgba(10,10,10,0.8)']}>
          <View style={itemStyles.gradientRow}>
            <Ionicon name="play-circle" color="white" size={50} />
            {episode_id && (
              <Text style={itemStyles.episodeText}>
                S{season_num}:E{episode_num}
              </Text>
            )}
          </View>
          <View style={[itemStyles.progress, {width: progress * 100 + '%'}]} />
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
  return (
    <View style={screenStyles.container}>
      <Text style={[screenStyles.header, {color: colors.text}]}>{header}</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={screenStyles.scroll}
        data={data}
        keyExtractor={item => `${header}_${item.title_id}_${item.episode_id}`}
        renderItem={({
          item: {
            title_id,
            episode_id,
            season_num,
            episode_num,
            landscape,
            backdrop,
            duration,
            episode_duration,
            remaining,
          },
        }) => (
          <Item
            image={landscape ?? backdrop}
            title_id={title_id}
            episode_id={episode_id}
            season_num={season_num}
            episode_num={episode_num}
            progress={1 - remaining / (episode_duration ?? duration)}
          />
        )}
      />
    </View>
  );
}

export function YifiRow({data}) {
  if (!data?.length) return null;
  const {colors} = useTheme();
  const {useTorrents} = useContext(globalContext);
  const Item = ({image, title_id, title, torrents}) => {
    const [modal, setModal] = useState(false);
    const Torrent = ({url, quality, type, seeds, peers, size}) => {
      const [seedClr, setSeedClr] = useState('white');

      const handlePress = async uri => {
        await useTorrents.add(uri);
        setModal(false);
      };

      useEffect(() => {
        if (seeds > 49) setSeedClr('green');
        else if (seeds < 5) setSeedClr('red');
      }, [seeds]);

      return (
        <TouchableOpacity
          style={torrentStyles.container}
          onPress={() => handlePress(url)}>
          <Text style={torrentStyles.text}>{quality}</Text>
          <Text style={torrentStyles.text}>{type}</Text>
          <View style={torrentStyles.attribute}>
            <Ionicon name="arrow-up" size={15} color={seedClr} />
            <Text style={[torrentStyles.text, {color: seedClr}]}>
              {seeds}
              {seeds === 100 ? '+' : ''}
            </Text>
          </View>
          <View style={torrentStyles.attribute}>
            <Ionicon name="arrow-down" size={15} color="white" />
            <Text style={torrentStyles.text}>{peers}</Text>
          </View>
          <Text style={torrentStyles.text}>{size}</Text>
        </TouchableOpacity>
      );
    };

    return (
      <>
        <TouchableOpacity onPress={() => setModal(true)}>
          <Image style={itemStyles.poster} source={{uri: image}} />
        </TouchableOpacity>
        <ScrollModal header={title} visible={modal} setVisible={setModal}>
          <ScrollView contentContainerStyle={torrentStyles.scroll}>
            {torrents.map(i => (
              <Torrent
                key={i.url}
                url={i.url}
                quality={i.quality}
                type={i.type}
                seeds={i.seeds}
                peers={i.peers}
                size={i.size}
              />
            ))}
          </ScrollView>
        </ScrollModal>
      </>
    );
  };

  return (
    <View style={screenStyles.container}>
      <Text style={[screenStyles.header, {color: colors.text}]}>Torrents</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={screenStyles.scroll}
        data={data}
        keyExtractor={item => 'yifi_' + item.title_id}
        renderItem={({item: {title_id, poster, torrents, title}}) => (
          <Item
            image={poster}
            title_id={title_id}
            title={title}
            torrents={torrents}
          />
        )}
      />
    </View>
  );
}

const MARGIN = 10;

const screenStyles = StyleSheet.create({
  container: {flex: 1, width: '100%', gap: 4},
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: MARGIN,
    paddingVertical: 10,
  },
  scroll: {gap: 10, paddingHorizontal: MARGIN},
});

const itemStyles = StyleSheet.create({
  container: {},
  landscape: {
    height: 135,
    aspectRatio: 1.8,
    borderRadius: 10,
    backgroundColor: 'grey',
    objectFit: 'cover',
    overflow: 'hidden',
  },
  poster: {
    height: 220,
    aspectRatio: 0.65,
    borderRadius: 10,
    backgroundColor: 'grey',
    objectFit: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 3,
  },
  gradientRow: {
    paddingHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  episodeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  progress: {
    height: 6,
    backgroundColor: 'blue',
  },
});

const torrentStyles = StyleSheet.create({
  scroll: {gap: 10, padding: 10},
  container: {
    padding: 13,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    rowGap: 10,
    columnGap: 20,
    flexWrap: 'wrap',
  },
  attribute: {flexDirection: 'row', alignItems: 'center', gap: 2},
  text: {
    fontSize: 15,
    color: 'white',
  },
});
