import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export default ({items, header, width, gap, margin}) => {
  const navigation = useNavigation();
  const styles = StyleSheet.create({
    header: {
      marginHorizontal: margin,
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    scroll: {
      paddingHorizontal: margin,
      gap,
    },
    item: {
      width,
      gap: 3,
    },
    image: {
      borderWidth: .5,
      borderColor: "rgba(255,255,255, 0.2)",
      height: (width * 0.55),
      borderRadius: 10,
      overflow: 'hidden',
      justifyContent: "flex-end",
    },
    gradient: {
      height: "20%",
      justifyContent: "flex-end",
    },
    title: {
      color: 'white',
      fontSize: 15,
      textAlign: 'center',
    },
  });
  if(!items || items.length === 0) {
    return null;
  }
  const Item = ({image, title, mediaId, episodeId, progress}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('player', {mediaId, episodeId});
        }}
        style={styles.item}>
        <ImageBackground
          imageStyle={{resizeMode: 'cover'}}
          source={{uri: image}}
          style={styles.image}>
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={styles.gradient}>
            <View style={{width: progress * 100 + "%", height: 4, backgroundColor: "white"}}/>
            </LinearGradient>
          </ImageBackground>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <View>
      <Text style={styles.header}>{header}</Text>
      <FlatList
        contentContainerStyle={styles.scroll}
        horizontal
        data={items}
        renderItem={({item}) => (
          <Item
            key={item.MEDIA_ID}
            image={item.STILL_L || item.POSTER_W_L}
            title={item.TYPE === 1 ? item.TITLE : `S${item.SEASON_NUM}:E${item.EPISODE_NUM}-${item.EPISODE_TITLE}`}
            mediaId={item.MEDIA_ID}
            episodeId={item.EPISODE_ID}
            progress={item.PROGRESS_TIME / (item.EPISODE_DURATION || item.DURATION)}
          />
        )}
      />
    </View>
  );
};
