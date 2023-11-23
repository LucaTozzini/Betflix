import { useState, useContext, useEffect } from "react";
import { ScrollView,  View, Text, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, Modal, useWindowDimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useRemoteMediaClient, useMediaStatus } from "react-native-google-cast";

// Icons
import IonIcons from "react-native-vector-icons/dist/Ionicons";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";
import themeContext from "../contexts/theme.context";

// Components
import Header from "../components/Header.component";
import Loading from "../components/Loading.component";
import CastRow from "../components/CastRow.component";
import MediaWide from "../components/MediaWide.component";

// Hooks
import Authenticator from "../hooks/Authenticator.hook";

const Item = ({ route }) => {
  // Check params
  const navigation = useNavigation();
  if(!route.params) return navigation.replace("home");

  // Then
  const { mediaId } = route.params;
  const { width } = useWindowDimensions();
  const mediaStatus = useMediaStatus();
  const client = useRemoteMediaClient();
  
  const { serverAddress } = useContext(serverContext);
  const { userId, userPin } = useContext(currentUserContext);
  const { sideMargin, backgroundColor, NAVIGATION_HEIGHT } = useContext(themeContext);

  const [ mediaData, setMediaData ] = useState(null);
  const [ seasonData, setSeasonData ] = useState(null);
  const [ currentSeason, setCurrentSeason ] = useState(null);
  const [ inWatchlist, setInWatchlist ] = useState(false);
  const [ transparentHeader, setTransparentHeader ] = useState(true);
  const [ showSeasons, setShowSeasons ] = useState(false);

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
      console.error(err.message);
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
        console.error(err.message);
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
  }, [mediaId]);

  useEffect(() => {
    if(mediaData && mediaData.TYPE == 2) {
      FetchCurrentEpisode();
    }
  }, [mediaData]);

  useEffect(() => {
    if(currentSeason) {
      FetchSeason(currentSeason);
    }
  }, [currentSeason, mediaId]);

  useEffect(() => {
    SetCastImage();
  }, [client, mediaData]);

  const Poster = () => {
    return (
      <ImageBackground style={[styles.backdrop, {marginTop: -40-15-StatusBar.currentHeight}]} source={{uri: width > 400 ? mediaData.BACKDROP_L : (mediaData.POSTER_NT_L || mediaData.BACKDROP_L)}}>
        <LinearGradient colors={['transparent', backgroundColor]} style={[styles.linearGradient, { paddingHorizontal: sideMargin }]}/>
      </ImageBackground>
    )
  }

  const PlayButton = () => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate('player', { mediaId })}>
        <IonIcons name="play-circle" color="white" size={100}/>
      </TouchableOpacity>
    )
  }

  const WatchlistButton = () => {
    return (
      <TouchableOpacity onPress={handleWatchlistPress}>
        <IonIcons name={inWatchlist ? "checkmark-circle-outline" : "add-circle-outline"} size={50} color="white"/>
      </TouchableOpacity>
    )
  }

  const InfoButton = () => {
    return (
      <TouchableOpacity>
        <IonIcons name="ellipsis-horizontal-circle" size={50} color="white"/>
      </TouchableOpacity>
    )
  }

  const MainButtons = () => {
    return (
      <View style={[styles.mainButtonsContainer, {marginHorizontal: sideMargin}]}>
        <WatchlistButton/>
        <PlayButton/>
        <InfoButton/>
      </View>
    )
  }

  const InfoContainer = () => {
    return (
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
    )
  }

  const SeasonSelect = ({seasonNum}) => {
    const handlePress = () => {
      setShowSeasons(false);
      setCurrentSeason(seasonNum);
    }

    return (
      <TouchableOpacity onPress={handlePress}>
        <Text style={{fontSize: 40, color: currentSeason == seasonNum ? "orange": "white"}}>Season {seasonNum}</Text>
      </TouchableOpacity>
    )
  }

  if(mediaData) return (
    <>
    <Authenticator/>
    <ScrollView contentContainerStyle={[styles.container, {paddingBottom: NAVIGATION_HEIGHT + 100}]} stickyHeaderIndices={[0]} onScroll={handleScroll}>
      
      <Header showHeader transparent={transparentHeader} backButton/>
      <Poster/>
      <MainButtons/>
      <InfoContainer/>     

      <View style={{gap: 25}}>
        {mediaData.TYPE == 2 ? <View style={{gap: 10}}>
          { mediaData.AVAILABLE_SEASONS && mediaData.AVAILABLE_SEASONS.length > 1 ?  
          <TouchableOpacity style={{marginHorizontal: sideMargin}} onPress={() => setShowSeasons(true)}>
            <View style={{flexDirection: "row", alignItems: "flex-end", gap: 7}}>
              <Text style={{color: "white", fontSize: 25}}>Season {currentSeason}</Text>
              <IonIcons name="caret-down-outline" color="white" size={25} style={{marginBottom: 1}} />
            </View>
          </TouchableOpacity> :
          <Text style={{color: "white", fontSize: 25, marginHorizontal: sideMargin}}>Episodes</Text>
          }
          { seasonData ? <MediaWide data={seasonData} autoPlay/> : <></> }
        </View> : <></>}
        <CastRow title={'Cast'} data={mediaData.CAST}/>
      </View>
    </ScrollView>

    { mediaData.AVAILABLE_SEASONS ? 
    <Modal 
      visible={showSeasons}
      onRequestClose={() => setShowSeasons(false)}
      transparent
    >
      <View style={{flex: 1, backgroundColor: "rgba(0,0,0,0.9)", flexDirection: "row", alignItems: "center"}}>
        <ScrollView contentContainerStyle={{alignItems: "center", paddingVertical: 100, gap: 20}}>
          {mediaData.AVAILABLE_SEASONS.map(i => <SeasonSelect key={i.SEASON_NUM + "_S"} seasonNum={i.SEASON_NUM}/>)}
        </ScrollView>
      </View>
    </Modal> : <></>}
    </>
  )
  else return (
    <Loading/>
  )
}

const styles = StyleSheet.create({
  container: {
    
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
    gap: 20, 
    marginTop: -180
  },
  infoContainer: {
    alignItems: 'center',
    alignSelf: "center",
    gap: 5,
    marginBottom: 40,
    width: "80%",
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
    fontSize: 20,
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