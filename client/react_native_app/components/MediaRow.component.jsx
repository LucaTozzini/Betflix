import {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Hooks
import { useItemWidth } from '../hooks/MediaRow.hook';

export default ({items, header}) => {
  const itemWidth = useItemWidth({gap: 5, margin: 10, items: 2});
  const Item = ({title, image}) => (
    <TouchableOpacity style={styles.item} activeOpacity={0.9}>
      <Image source={{uri: image}} style={[styles.image, {width: itemWidth, height: itemWidth * 0.5}]} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
  return (
		<View style={styles.container}> 
		<Text style={styles.header}>{header}</Text>
    <FlatList
      contentContainerStyle={styles.scroll}
      data={[...items, ...items]}
      renderItem={({item}) => <Item image={item.POSTER_W_S} title={item.TITLE}/>}
      horizontal
			showsHorizontalScrollIndicator={false}
    />
		</View>
  );
};

const styles = StyleSheet.create({
	container: {
		gap: 5
	},
	header: {
		paddingHorizontal: 10,
		fontSize: 18,
		fontWeight: "bold",
		color: "white"
	},
  scroll: {gap: 5, paddingHorizontal: 10},
  item: {
		gap: 3
	},
  image: {
    resizeMode: "cover"
  },
  title: {
		color: "white",
		fontSize: 12,
		maxWidth: "90%",
		alignSelf: "center"
	},
});
