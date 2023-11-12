import { StyleSheet, View, ScrollView } from 'react-native'; 
import { useContext, useState, useEffect } from 'react';

// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';
import themeContext from '../contexts/theme.context';

// Components
import MediaWide from '../components/MediaWide.component';
import Header from '../components/Header.component';
import MediaRow from '../components/MediaRow.component';

const Home = () => {
  const { serverAddress } = useContext(serverContext);
  const { NAVIGATION_HEIGHT } = useContext(themeContext);
  const { userId, userPin } = useContext(currentUserContext);
  const [ latestMedia, setLatestMedia ] = useState(null);
  const [ continueMedia, setContinueMedia ] = useState(null); 

  const FetchLatestReleases = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/latest/releases?limit=30`);
      const json = await response.json();
      setLatestMedia(json);
    }
    catch(err) {
      
    }
  };

  const FetchContinue = async () => {
    try {
      const options = {method:'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin, limit: 30})};
      const response = await fetch(`${serverAddress}/users/continue`, options);
      const json = await response.json();
      setContinueMedia(json);
    }
    catch(err) {

    }
  }

  useEffect(() => {
    FetchLatestReleases();
    FetchContinue();
  }, []);

  return (
    <ScrollView contentContainerStyle={[styles.container, {paddingBottom: NAVIGATION_HEIGHT + 120}]} stickyHeaderIndices={[0]}>
      <Header showHeader={true}/>
      <MediaWide title={"Continue Watching"} data={continueMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
      <MediaRow title={"Latest Releases"} data={latestMedia}/>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 30
  }
})

export default Home;