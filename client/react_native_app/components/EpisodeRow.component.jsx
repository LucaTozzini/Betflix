import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export default ({items, header, width, gap, margin}) => {
  const navigation = useNavigation();
  const Item = ({episodeId, mediaId, image, seasonNum, episodeNum, title, overview}) => {
    
    return (
      <TouchableOpacity style={[styles.item, {width}]} activeOpacity={1} onPress={() => navigation.navigate('player', {episodeId, mediaId})}>
        <ImageBackground
          style={[styles.image, {width, height: width * 0.6}]}
          imageStyle={{borderRadius: width*0.02}}
          source={{uri: image}}>
          <LinearGradient
            style={styles.gradient}
            colors={['transparent', '#000000cc']}
            locations={[0.3, 1]}
            >
            <Text style={styles.nums}>
              S{seasonNum}:E{episodeNum}
            </Text>
            <Text numberOfLines={2} adjustsFontSizeToFit style={styles.title}>{title}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  if (items)
    return (
      <View style={styles.container}>
        {header && (
          <Text style={[styles.header, {marginHorizontal: margin}]}>
            {header}
          </Text>
        )}
        <FlatList
          contentContainerStyle={{paddingHorizontal: margin, gap}}
          data={items}
          renderItem={({item}) => (
            <Item
              key={item.EPISODE_ID}
              mediaId={item.MEDIA_ID}
              episodeId={item.EPISODE_ID}
              image={item.STILL_L}
              seasonNum={item.SEASON_NUM}
              episodeNum={item.EPISODE_NUM}
              title={item.TITLE}
              overview={item.OVERVIEW}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
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
  item: {gap: 6},
  image: {
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  nums: {color: 'white', fontSize: 18, fontWeight: "bold"},
  title: {color: 'white', fontSize: 25, fontWeight: "bold"},
  overview: {color: 'white', paddingHorizontal: 10, fontSize: 13,},
});
