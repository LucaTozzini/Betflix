import { useState, useContext, useEffect } from "react";
import { ScrollView,  View, Text, StyleSheet, ImageBackground, StatusBar, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import SelectDropdown from 'react-native-select-dropdown';
import { useNavigation } from "@react-navigation/native";
import { useRemoteMediaClient, useMediaStatus } from "react-native-google-cast";

// Icons
import Icon from 'react-native-vector-icons/dist/FontAwesome5';

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";
import themeContext from "../contexts/theme.context";

// Components
import CastRow from "../components/CastRow.component";
import EpisodeRow from "../components/EpisodeRow.component";

// Hooks
import Authenticator from "../hooks/Authenticator.hook";

const Item = ({ route }) => {
  // Check params
  const navigation = useNavigation();
  if(!route.params) return navigation.replace("browse");

  // Then
  const { mediaId } = route.params;
  const mediaStatus = useMediaStatus();
  const client = useRemoteMediaClient();
  
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  const { textColor, sideMargin } = useContext(themeContext);

  const [ mediaData, setMediaData ] = useState(null);
  const [ seasonData, setSeasonData ] = useState(null);
  const [ fullOverview, setFullOverview ] = useState(false);
  const [ currentSeason, setCurrentSeason ] = useState(null);

  const FetchItem = async () => {
    try{
      const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId, userPin}) };
      const response = await fetch(`${serverAddress}/browse/item`, options);
      const json = await response.json();
      setMediaData(json);
    }
    catch(err){
      console.error(err.message);
    }
  };

  const FetchCurrentEpisode = async () => {
    try{
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId})}
        const response = await fetch(`${serverAddress}/player/current-episode`, options);
        const json = await response.json();
        setCurrentSeason(json.SEASON_NUM);
    }
    catch(err){
        console.error(err.message);
    }
  };

  const FetchSeason = async (seasonNum) => {
    try{
      const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId, userPin, seasonNum}) };
      const response = await fetch(`${serverAddress}/browse/season`, options);
      const json = await response.json();
      setSeasonData(json.EPISODES);
    }
    catch(err){

    }
  };

  const SetCastImage = async () => {
    if(client && mediaData) {
      if(mediaStatus && mediaData.POSTER_W_L == mediaStatus.mediaInfo.contentUrl ) return;
      try {
        await client.loadMedia({
          mediaInfo: {
            contentUrl: mediaData.POSTER_W_L,
          }
        });
      }
      catch(err) {
        
      }
    };
  };

  useEffect(() => {
    FetchItem();
  }, []);

  useEffect(() => {
    if(mediaData && mediaData.TYPE == 2) FetchCurrentEpisode();
  }, [mediaData]);

  useEffect(() => {
    FetchSeason(currentSeason);
  }, [currentSeason]);

  useEffect(() => {
    SetCastImage();
  }, [client, mediaData]);

  if(mediaData) return (
    <ScrollView contentContainerStyle={styles.container}>
      <Authenticator/>
      <ImageBackground style={styles.backdrop} source={{uri: mediaData.POSTER_NT_L || mediaData.BACKDROP_L}}>
        <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.7)', 'black']} style={styles.linearGradient}>
          <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('player', { mediaId })}>
            <Icon name="play" style={styles.playButtonIcon}/>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
      <View style={[styles.infoContainer, {marginHorizontal: sideMargin}]}>
        <Text style={styles.genres} numberOfLines={1} adjustsFontSizeToFit={true}>
          { mediaData.GENRES.map(i => i.GENRE_NAME).join(',  ') }
        </Text>
        <Text style={[styles.title, {color: textColor}]} numberOfLines={mediaData.TITLE.length > 25 ? 2 : 1} adjustsFontSizeToFit={true}>{mediaData.TITLE}</Text>

        <View style={styles.infoBar}>
          <Text style={{color: 'orange', fontSize: 15}}>{mediaData.YEAR}</Text>
          <Text style={{color: 'orange', fontSize: 15}}>|</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Icon name="star" size={15} style={{color: 'orange'}}/>
            <Text style={{color: 'orange', fontSize: 15}}>{Math.floor(mediaData.VOTE * 10)}</Text>
          </View>
          <Text style={{color: 'orange', fontSize: 15}}>|</Text>
          <Text style={{color: 'orange', fontSize: 15}}>{mediaData.CONTENT_RATING}</Text>
        </View>

        <Text onPress={() => setFullOverview(!fullOverview)} numberOfLines={fullOverview ? 1000 : 3} style={[{color: textColor}, styles.overview]}>{mediaData.OVERVIEW}</Text>
      </View>
        {
          mediaData.TYPE == 2 && mediaData.AVAILABLE_SEASONS.length > 1 && currentSeason ? 
          <View style={{marginHorizontal: sideMargin}}>
            <SelectDropdown
            buttonStyle={styles.seasons}
            defaultValue={currentSeason}
            data={mediaData.AVAILABLE_SEASONS.map(i => i.SEASON_NUM)}
            buttonTextAfterSelection={(selectedItem, index) => `Season ${selectedItem}`}
            onSelect={(selectedItem, index) => setCurrentSeason(selectedItem)}
            />
          </View>
          : <></>
        }
        { seasonData ? <EpisodeRow data={seasonData}/> : <></> }
      <CastRow title={'Cast'} data={mediaData.CAST}/>
      <View style={{width:1, height: 60}}/>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  backdrop: {
    height: 500,
    objectFit: 'cover',
  },
  linearGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'

  },
  playButtonIcon: {
    color: 'black',
    fontSize: 33,
    marginLeft: 5
  },
  infoContainer: {
    marginTop: -120,
  },
  genres: {
    color: 'gray',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    // backgroundColor: 'red'
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overview: {
    fontSize: 15,
    fontWeight: '300',
  },
  seasons: {
    width: '100%',
    borderRadius: 6
  },
})

export default Item;