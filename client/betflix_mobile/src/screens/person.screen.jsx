import {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Hooks
import useTitles from '../hooks/useTitles-hook';
import usePerson from '../hooks/usePerson-hook';

// Components
import MediaRow from '../components/media row-comp';

export default function PersonScreen({route}) {
  const {person_id} = route.params;
  const {fetchFilmography} = useTitles();
  const {fetchPerson} = usePerson();

  const [person, setPerson] = useState(null);
  const [filmography, setFilmography] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    async function loadPerson() {
      const data = await fetchPerson(person_id);
      setPerson(data);
    }
    loadPerson();
  }, []);

  useEffect(() => {
    async function loadFilmography() {
      const data = await fetchFilmography(person_id);
      setFilmography(data);
    }
    loadFilmography();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!person) {
    return null;
  }

  return (
    <>
      <StatusBar backgroundColor={'black'} translucent={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={{uri: person.image}} style={styles.image} />
          <Text style={styles.name}>{person.name}</Text>
          <View style={styles.dates}>
            <Text style={styles.date}>{formatDate(person.birth_date)}</Text>
            {person.death_date && (
              <Text style={styles.date}> - {formatDate(person.death_date)}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
          <Text
            style={styles.bio}
            numberOfLines={showFullBio ? null : 4}
            ellipsizeMode="tail">
            {person.bio}
          </Text>
        </TouchableOpacity>

        <MediaRow data={filmography ?? []} header={'Filmography'} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'white',
  },
  dates: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {color: 'white', fontSize: 16,},

  bio: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    paddingHorizontal: 20,
  },
});