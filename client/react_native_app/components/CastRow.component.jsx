import {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

export default ({items, header, width, gap, margin}) => {
  const Item = ({data, name, image, character}) => {
    return (
      <TouchableOpacity style={styles.item}>
        {image ? (
          <Image
            source={{uri: image}}
            style={[
              {width, height: width, borderRadius: width / 2},
              styles.image,
            ]}
          />
        ) : (
          <View
            style={[
              {width, height: width, borderRadius: width / 2},
              styles.image,
            ]}
          />
        )}
        <Text numberOfLines={2} style={[styles.name, {maxWidth: width * 0.9}]}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  if(items.length === 0) {
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
            key={item.PERSON_ID}
            name={item.NAME}
            character={item.CHARACTER}
            image={item.PROFILE_IMAGE}
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
		gap: 5
	},
  header: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white"
	},
  item: {},
  image: {
    backgroundColor: 'grey',
  },
  name: {
    color: 'white',
    textAlign: 'center',
		fontSize: 15,
		fontWeight: "400"
  },

});
