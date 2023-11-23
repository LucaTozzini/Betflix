import { StyleSheet, View, ScrollView } from 'react-native'; 
import { useContext, useState, useEffect } from 'react';

// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';
import themeContext from '../contexts/theme.context';

// Components
import Header from '../components/Header.component';
import MediaRow from '../components/MediaRow.component';
import MediaWide from '../components/MediaWide.component';

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
      console.error(err.message); 
    }
  };

  const FetchContinue = async () => {
    try {
      const options = {method:'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin, limit: 30})};
      const response = await fetch(`${serverAddress}/users/continue`, options);
      const json = await response.json();
      if(json.length > 0) {
        setContinueMedia(json);
      }
    }
    catch(err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    FetchLatestReleases();
    FetchContinue();
  }, [userId]);

  return (
    <ScrollView contentContainerStyle={[styles.container, {paddingBottom: NAVIGATION_HEIGHT + 120}]} stickyHeaderIndices={[0]}>
      <Header showHeader={true}/>
      {continueMedia ? <MediaWide title={"Continue Watching"} data={continueMedia} autoPlay/> : <></> }
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