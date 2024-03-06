import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default ({items, header, width, gap, margin}) => {
  const navigation = useNavigation();

  if (!items || items.length === 0) {
    return null;
  }
  const Item = ({
    image,
    title,
    seasonNum,
    epsiodeNum,
    mediaId,
    episodeId,
    progress,
  }) => {
    const PlayButton = () => {
      return (
        <View style={styles.playContainer}>
          <MaterialIcon name="play-arrow" color="white" size={80} />
        </View>
      );
    };

    const Progress = () => {
      return (
        <View
          style={[
            styles.progressBar,
            {
              width: progress * 100 + '%',
            },
          ]}
        />
      );
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.push('player', {mediaId, episodeId});
        }}
        style={[styles.item, {width}]}>
        <ImageBackground
          imageStyle={{resizeMode: 'cover'}}
          source={{uri: image}}
          style={[styles.image, {height: width * 0.55}]}>
          <View style={styles.imageInside}>
            <PlayButton />
            <Progress />
          </View>
        </ImageBackground>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {episodeId && (
          <Text style={styles.nums}>
            S{seasonNum}:E{epsiodeNum}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.header, {marginHorizontal: margin}]}>{header}</Text>
      <FlatList
        contentContainerStyle={{paddingHorizontal: margin, gap}}
        horizontal
        data={items}
        renderItem={({item}) => (
          <Item
            key={item.MEDIA_ID}
            image={item.STILL_L || item.POSTER_W_L}
            title={item.TITLE}
            seasonNum={item.SEASON_NUM}
            epsiodeNum={item.EPISODE_NUM}
            mediaId={item.MEDIA_ID}
            episodeId={item.EPISODE_ID}
            progress={
              item.PROGRESS_TIME / (item.EPISODE_DURATION || item.DURATION)
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  item: {
    gap: 3,
  },
  image: {
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  imageInside: {
    flex: 1,
  },
  playContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'dodgerblue',
  },
  title: {
    marginTop: 5,
    width: "90%",
    alignSelf: "center",
    textAlign: "center",
    
    color: 'white',
    fontSize: 20,
  },
  nums: {
    color: "white",
    textAlign: 'center',
  },
});
