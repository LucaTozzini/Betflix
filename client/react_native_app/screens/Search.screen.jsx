import {useContext, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  StatusBar,
  ScrollView,
  ImageBackground,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Components
import MediaRowComponent from '../components/posterRow.component';
import CastRowComponent from '../components/CastRow.component';
import YifiRowComponent from '../components/YifiRow.component';
import FooterComponent from '../components/Footer.component';

// Contexts
import {globalContext} from '../App';

// Var
const searchTime = 1000;

export default () => {
  const {address, posterRowSize, castRowSize, horizontalMargin, rowGap} =
    useContext(globalContext);
  const [titles, setTitles] = useState([]);
  const [people, setPeople] = useState([]);
  const [yifi, setYifi] = useState([]);
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
        `https://yts.mx/api/v2/list_movies.json?query_term=${query}&sort_by=rating&order_by=desc`,
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
      setYifi([]);
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
        <View style={styles.rows}>
          <MediaRowComponent
            items={titles}
            header="In Library"
            width={posterRowSize.itemWidth}
            gap={rowGap}
            margin={horizontalMargin}
          />

          <CastRowComponent
            items={people}
            header="People"
            width={castRowSize.itemWidth}
            gap={rowGap}
            margin={horizontalMargin}
          />

          <YifiRowComponent
            items={yifi}
            header="Available Downloads"
            width={posterRowSize.itemWidth}
            gap={rowGap}
            margin={horizontalMargin}
          />
        </View>
        <FooterComponent />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  rows: {
    marginTop: 20,
    gap: 20,
  },
  input: {
    fontSize: 15,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
});
