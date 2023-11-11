import { useState, useContext, useEffect } from "react";
import { ScrollView,  View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import SelectDropdown from 'react-native-select-dropdown';
import { useNavigation } from "@react-navigation/native";
import { useRemoteMediaClient, useMediaStatus } from "react-native-google-cast";

// Icons
import Icon from 'react-native-vector-icons/dist/FontAwesome5';
import IonIcons from "react-native-vector-icons/dist/Ionicons";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";
import themeContext from "../contexts/theme.context";

// Components
import Header from "../components/Header.component";
import Loading from "../components/Loading.component";
import CastRow from "../components/CastRow.component";
import EpisodeRow from "../components/EpisodeRow.component";

// Hooks
import Authenticator from "../hooks/Authenticator.hook";

const Item = ({ route }) => {
  // Check params
  const navigation = useNavigation();
  if(!route.params) return navigation.replace("home");

  // Then
  const { mediaId } = route.params;
  const mediaStatus = useMediaStatus();
  const client = useRemoteMediaClient();
  
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  const { sideMargin } = useContext(themeContext);

  const [ mediaData, setMediaData ] = useState(null);
  const [ seasonData, setSeasonData ] = useState(null);
  const [ currentSeason, setCurrentSeason ] = useState(null);
  const [ inWatchlist, setInWatchlist ] = useState(false);
  const [ transparentHeader, setTransparentHeader ] = useState(true);

  const FetchItem = async () => {
    try{
      const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId, userPin}) };
      const response = await fetch(`${serverAddress}/browse/item`, options);
      if(response.status != 200) {
        throw new Error("FetchItem request error");
      }
      const json = await response.json();
      setInWatchlist(json.IN_WATCHLIST == 1);
      setMediaData(json);
    }
    catch(err){
      console.error(err.message);
    }
  };

  const FetchCurrentEpisode = async () => {
    try{
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({mediaId, userId, userPin})}
        const response = await fetch(`${serverAddress}/player/current-episode`, options);
        if(response.status !== 200) {
          throw new Error("FetchCurrentEpisode request error");
        }
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

  const handleWatchlistPress = async () => {
    try {
      if(inWatchlist) {
        const options = { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, userPin, mediaId }) };
        const response = await fetch(`${serverAddress}/watchlist/remove`, options);
        setInWatchlist(response.status != 202);
      }
      else {
        const options = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, userPin, mediaId }) };
        const response = await fetch(`${serverAddress}/watchlist/add`, options);
        setInWatchlist(response.status == 201);
      }
    }
    catch(err) {
      console.log(err.message);
    }
  };

  const handleScroll = (e) => {
    setTransparentHeader(e.nativeEvent.contentOffset.y < 200)
  }

  useEffect(() => {
    FetchItem();
  }, []);

  useEffect(() => {
    if(mediaData && mediaData.TYPE == 2) {
      FetchCurrentEpisode();
    }
  }, [mediaData]);

  useEffect(() => {
    if(currentSeason) {
      FetchSeason(currentSeason);
    }
  }, [currentSeason]);

  useEffect(() => {
    SetCastImage();
  }, [client, mediaData]);

  if(mediaData) return (
    <>
    <Authenticator/>
    <ScrollView contentContainerStyle={styles.container} stickyHeaderIndices={[0]} onScroll={handleScroll}>
      <Header showHeader transparent={transparentHeader} backButton/>
      <ImageBackground style={[styles.backdrop, {marginTop: -40-15-StatusBar.currentHeight}]} source={{uri: mediaData.POSTER_NT_L || mediaData.BACKDROP_L}}>
        <LinearGradient colors={['transparent', 'black']} style={[styles.linearGradient, { paddingHorizontal: sideMargin }]}/>
      </ImageBackground>
      <View style={[styles.mainButtonsContainer, {marginHorizontal: sideMargin}]}>

        <TouchableOpacity onPress={handleWatchlistPress}>
          <IonIcons name={inWatchlist ? "checkmark-circle-outline" : "add-circle-outline"} size={40} color="white"/>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('player', { mediaId })}>
          <IonIcons name="play-circle" color="white" size={70}/>
        </TouchableOpacity>

        <TouchableOpacity>
          <IonIcons name="ellipsis-horizontal-circle" size={40} color="white"/>
        </TouchableOpacity>

      </View>
      <View style={[styles.infoContainer, {marginHorizontal: sideMargin}]}>
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit={true}>{mediaData.TITLE}</Text>
        <View style={styles.infoBar}>
          <Text style={styles.genres} numberOfLines={1} adjustsFontSizeToFit={true}>
            { mediaData.GENRES.map(i => i.GENRE_NAME).join(',  ') }
          </Text>
        </View>
        <View style={styles.infoBar}>
          <Text style={styles.infoCard}>{mediaData.YEAR}</Text>
          <Text style={styles.infoCard}>{mediaData.CONTENT_RATING}</Text>
        </View>
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
    </>
  )
  else return (
    <Loading/>
  )
}

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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  mainButtonsContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 30, 
    marginTop: -150
  },
  infoContainer: {
    alignItems: 'center',
    gap: 5
  },
  infoCard: {
    backgroundColor: "rgb(200,200,200)", 
    padding: 5, 
    borderRadius: 5, 
    fontWeight: "bold", 
    color: "black", 
    fontSize: 15, 
    minWidth: 30, 
    textAlign: "center",
  },
  genres: {
    fontSize: 15,
    color: "rgb(190, 190, 190)",
    textTransform: "capitalize",
  },
  title: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overview: {
    fontSize: 17,
    fontWeight: '300',
    textAlign: 'justify',
    color: 'white'
  },
  seasons: {
    width: '100%',
    borderRadius: 6
  },
})

export default Item;