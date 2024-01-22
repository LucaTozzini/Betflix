import {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Hooks
import useMediaRowHook from '../hooks/useMediaRow.hook';

// Components
import MediaRowComponent from '../components/MediaRow.component';
import CastRowComponent from '../components/CastRow.component';
import YifiRowComponent from '../components/YifiRow.component';

export default ({route}) => {
  const {address} = route.params;
  const [titles, setTitles] = useState([]);
  const [people, setPeople] = useState([]);
  const [yifi, setYifi] = useState([]);
  const numItems = 3,
    gap = 5,
    margin = 10;
  const {itemWidth} = useMediaRowHook({gap, margin, numItems});
  const searchTime = 1000;
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchTitle = async query => {
    try {
      const response = await fetch(
        `${address}/search/title?value=${query}&limit=30`,
      );
      const json = await response.json();
      setTitles(json);
    } catch (err) {}
  };

  const fetchPeople = async query => {
    try {
      const response = await fetch(
        `${address}/search/person?value=${query}&limit=30`,
      );
      const json = await response.json();
      console.log(json);
      setPeople(json);
    } catch (err) {}
  };

  const fetchYifi = async query => {
    try {
      const response = await fetch(
        `https://yts.mx/api/v2/list_movies.json?query_term=${query}&order_by=seeds`,
      );
      const json = await response.json();
      const movies = json.data.movies.map(
        ({title, medium_cover_image, torrents, year}) => ({
          title,
          year,
          image: medium_cover_image,
          torrents,
        }),
      );
      setYifi(movies);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleInput = e => {
    e = e.trim(); 
    clearTimeout(searchTimeout);
    if (e.length !== 0) {
      const newTimeout = setTimeout(() => {
        fetchTitle(e);
        fetchPeople(e);
        fetchYifi(e);
      }, searchTime);
      setSearchTimeout(newTimeout);
    } else {
      setYifi([]);
      setTitles([]);
      setPeople([]); 
    }
  };

  return (
    <>
      <ImageBackground
        style={{height: StatusBar.currentHeight + 50}}
        source={{
          uri: 'https://static.vecteezy.com/system/resources/previews/020/914/538/non_2x/long-gradient-backround-abstract-blurred-background-color-smooth-gradient-texture-shiny-bright-website-pattern-banner-header-or-sidebar-graphic-art-image-degarde-free-photo.jpg',
        }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'black']}
          style={{flex: 1}}
        />
      </ImageBackground>
      <TextInput
        style={[styles.input]}
        placeholder="Search media, people, collections..."
        onChangeText={handleInput}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <MediaRowComponent
          items={titles}
          header="Matches"
          width={itemWidth}
          gap={gap}
          margin={margin}
        />

        <CastRowComponent
          items={people}
          header="People"
          width={itemWidth}
          gap={gap}
          margin={margin}
        />

        <YifiRowComponent
          items={yifi}
          header="Available Downloads"
          width={itemWidth}
          gap={gap}
          margin={margin}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  input: {
    fontSize: 15,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
});
