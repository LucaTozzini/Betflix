import { StyleSheet, View } from 'react-native'; 
import { useContext, useState, useEffect } from 'react';

// Contexts
import serverContext from '../contexts/server.context';

// Components
import Header from '../components/Header.component';
import MediaRow from '../components/MediaRow.component';

const Home = () => {
  const { serverAddress } = useContext(serverContext);
  const [ latestMedia, setLatestMedia ] = useState(null);

  const FetchLatestReleases = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/latest/releases?limit=30`);
      const json = await response.json();
      setLatestMedia(json);
    }
    catch(err) {
      
    }
  };

  useEffect(() => {
    FetchLatestReleases();
  }, []);

  return (
    <>
    <Header showHeader={true}/>
    <View style={styles.container}>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
    </View>
    </>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default Home;