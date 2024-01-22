import {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';


export default ({items, header, width, gap, margin}) => {
  const navigation = useNavigation();
  const Item = ({title, image, mediaId}) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.9} onPress={() => navigation.navigate("media", {mediaId})}>
      <Image source={{uri: image}} style={[styles.image, {width, height: width * 1.6, borderRadius: width * 0.05}]} />
      <Text numberOfLines={1} style={[styles.title, {maxWidth: width * 0.9}]}>{title}</Text>
    </TouchableOpacity>
  );
  if(items.length === 0) {
    return;
  }

  return (
		<View style={styles.container}> 
		<Text style={[styles.header, {paddingHorizontal: margin}]}>{header}</Text>
    <FlatList
      contentContainerStyle={{gap, paddingHorizontal: margin}}
      data={items}
      renderItem={({item}) => <Item key={item.MEDIA_ID} image={item.POSTER_S} title={item.TITLE} mediaId={item.MEDIA_ID}/>}
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
		fontWeight: "bold",
		color: "white"
	},
  item: {
		gap: 3,
    alignItems: "center"
	},
  image: {
    resizeMode: "cover"
  },
  title: {
		color: "rgb(200, 200, 200)",
		fontSize: 15,
	},
});
