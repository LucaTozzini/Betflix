import {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

export default ({items, header, width, gap, margin}) => {
  const navigation = useNavigation();
  const Item = ({image, title, mediaId}) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.9}
      onPress={() => navigation.push('item', {mediaId})}>
      {image ? (
        <Image
          source={{uri: image}}
          style={[
            styles.image,
            {width, height: width * 1.6, borderRadius: width * 0.05},
          ]}
        />
      ) : (
        <View
          style={[
            styles.noImage,
            {width, height: width * 1.6, borderRadius: width * 0.05},
          ]}>
            <Text style={styles.title}>{title}</Text>
          </View>
      )}
    </TouchableOpacity>
  );
  if (items.length === 0) {
    return;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.header, {paddingHorizontal: margin}]}>{header}</Text>
      <FlatList
        contentContainerStyle={{gap, paddingHorizontal: margin}}
        data={items}
        renderItem={({item}) => (
          <Item
            key={item.MEDIA_ID}
            image={item.POSTER_S}
            title={item.TITLE}
            mediaId={item.MEDIA_ID}
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
  item: {
    gap: 3,
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
    backgroundColor: "rgb(80, 80, 80)",
  },
  noImage: {backgroundColor: "rgb(80, 80, 80)", alignItems: "center", justifyContent: "center"},
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    color: 'rgb(200, 200, 200)',
    fontSize: 13,
    color: "lightgrey"
  },
});
