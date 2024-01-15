import { useEffect, useState } from 'react';
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

export default ({route}) => {
  const {address} = route.params;
  const [titles, setTitles] = useState([]);
  const numItems = 3, gap = 5, margin = 10
  const {itemWidth} = useMediaRowHook({gap, margin, numItems});
  const fetchTitle = async () => {
    try {
      const response = await fetch(`${address}/search/title?value=${"batman"}&limit=30`);
      const json = await response.json();
      setTitles(json);
    } catch(err) {

    }
  }

  useEffect(() => {
    fetchTitle();
  }, []);

  return (
    <>
      <ImageBackground
        style={{height: StatusBar.currentHeight + 50}}
        source={{
          uri: 'https://static.vecteezy.com/system/resources/previews/020/914/538/non_2x/long-gradient-backround-abstract-blurred-background-color-smooth-gradient-texture-shiny-bright-website-pattern-banner-header-or-sidebar-graphic-art-image-degarde-free-photo.jpg',
        }}>
        <LinearGradient colors={["rgba(0,0,0,0.6)", "black"]} style={{flex: 1}}/>
      </ImageBackground>
        <TextInput
          style={[styles.input]}
          placeholder="Search media, people, collection..."
        />

      <ScrollView contentContainerStyle={styles.container}>
        <MediaRowComponent items={titles} header="Matches" width={itemWidth} gap={gap} margin={margin}/>
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
