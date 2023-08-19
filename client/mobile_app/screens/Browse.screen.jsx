import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'; 

// Contexts
import currentUserContext from '../contexts/currentUser.context';
import serverContext from '../contexts/server.context';

// Components
import Hero from '../components/Hero.component';
import MediaRow from '../components/MediaRow.component';

// Hooks
import Authenticator from '../hooks/Authenticator.hook';

const Browse = () => {
  const { userId, userPin } = useContext(currentUserContext);

  const { serverAddress } = useContext(serverContext);
  const [ genreMedia, setGenreMedia ] = useState([]);
  const [ continueMedia, setContinueMedia ] = useState(null);

  const FetchGenres = async () => {
    try {
      const response = await fetch(`${serverAddress}/browse/genres`);
      const json = await response.json(); 
      setGenreMedia(json);
    }
    catch(err) {

    }
  };

  const FetchContinue = async () => {
    try {
      const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId, userPin, limit: 10})}
      const response = await fetch(`${serverAddress}/users/continue`, options);
      const json = await response.json();
      setContinueMedia(json);
    }
    catch(err) {

    }
  };

  useEffect(() => {
    if(userId) {
      FetchGenres();
      FetchContinue();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Authenticator/>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Hero title={'continue watching'} data = {continueMedia}/>
        { genreMedia.map(i => <MediaRow key={i.genre} title={i.genre} data={i.data} />) }
        <View style={{height: 100, width: 1}}/>
      </ScrollView>

    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    gap: 30
  }, 
});

export default Browse