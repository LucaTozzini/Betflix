import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useEffect, useState} from 'react';
import IonIcon from 'react-native-vector-icons/Ionicons';

// Hooks
import useTitles from '../hooks/useTitles-hook';

// Components
import ScrollModal from './scroll modal-comp';
import { useNavigation } from '@react-navigation/native';

export default function EpisodeList({title_id}) {
  const {fetchEpisodes, fetchAvailableSeasons} = useTitles();
  const [availableSeasons, setAvailableSeasons] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [seasonNum, setSeasonNum] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    async function getAvailable() {
      const availableSeasons = await fetchAvailableSeasons(title_id);
      setSeasonNum(availableSeasons[0]);
      setAvailableSeasons(availableSeasons);
    }
    getAvailable();
  }, []);

  useEffect(() => {
    if (seasonNum) {
      async function getEpisodes() {
        const episodes = await fetchEpisodes(title_id, seasonNum);
        setEpisodes(episodes);
      }
      getEpisodes();
    }
  }, [seasonNum]);

  // A new Skeleton Episode component to display loading placeholders
  const SkeletonEpisode = () => (
    <View style={episodeStyle.container}>
      <View style={[episodeStyle.still, {backgroundColor: '#bbb'}]} />
      <View style={episodeStyle.details}>
        <Text style={[episodeStyle.number, {color: '#bbb'}]}>Episode ...</Text>
        <Text style={[episodeStyle.title, {color: '#bbb'}]}>Loading...</Text>
      </View>
    </View>
  );

  if (!availableSeasons || !seasonNum) {
    return (
      <View style={screenStyles.container}>
        {/* Display skeleton UI while loading */}
        {Array.from({length: 5}, (_, index) => (
          // Display 5 skeleton episodes as an example
          <SkeletonEpisode key={index} />
        ))}
      </View>
    );
  }

  const Episode = ({still, title, episode_numm, episode_id}) => (
    <TouchableOpacity style={episodeStyle.container} onPress={() => navigation.push("Player", {title_id, episode_id})}>
      <Image
        style={episodeStyle.still}
        source={{
          uri: still,
        }}
      />
      <View style={episodeStyle.details}>
        <Text style={episodeStyle.number}>Episode {episode_numm}</Text>
        <Text style={episodeStyle.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={screenStyles.container}>
        {availableSeasons.length > 1 && (
          <TouchableOpacity
            style={screenStyles.button}
            onPress={() => setShowModal(true)}>
            <Text style={screenStyles.buttonText}>Season {seasonNum}</Text>
            <IonIcon name="chevron-down" color="white" size={30} />
          </TouchableOpacity>
        )}

        {availableSeasons == 1 && (
          <View style={screenStyles.button}>
            <Text style={screenStyles.buttonText}>Season {seasonNum}</Text>
          </View>
        )}
        {episodes &&
          episodes.map(episode => (
            <Episode
              still={episode.still}
              title={episode.title}
              episode_num={episode.episode_num}
              episode_id={episode.episode_id}
              key={episode.episode_id}
            />
          ))}
      </View>

      <ScrollModal
        header={'Seasons'}
        visible={showModal}
        setVisible={setShowModal}>
        <ScrollView contentContainerStyle={modalStyles.scroll}>
          {availableSeasons?.map(season => (
            <TouchableOpacity
              key={'select_' + season}
              onPress={() => {
                setSeasonNum(season), setShowModal(false);
              }}>
              <Text style={modalStyles.season}>Season {season}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollModal>
    </>
  );
}

const MARGIN = 10;

const screenStyles = StyleSheet.create({
  container: {
    gap: 20,
    marginHorizontal: MARGIN,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  buttonText: {color: 'white', fontSize: 24},
});

const episodeStyle = StyleSheet.create({
  container: {
    gap: 15,
    alignItems: 'center',
    flexDirection: 'row',
  },
  still: {
    height: 70,
    width: 110,
    backgroundColor: 'grey',
    borderRadius: 10,
    objectFit: 'cover',
  },
  details: {flex: 1},
  number: {
    color: 'white',
    fontSize: 15,
  },
  title: {
    color: 'rgb(180, 180, 180)',
    fontSize: 18,
  },
});

const modalStyles = StyleSheet.create({
  scroll: {paddingVertical: 12},
  season: {
    fontSize: 24,
    paddingHorizontal: MARGIN,
    paddingVertical: 12,
    color: 'white',
    textAlign: 'center',
  },
});
