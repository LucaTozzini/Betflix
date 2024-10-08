import {View, FlatList, Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function PeopleRow({data, header, paddingHorizontal}) {
  const navigation = useNavigation();
  const Person = ({person_id, image, name}) => (
    <TouchableOpacity style={personStyle.container} onPress={() => navigation.push("Person", { person_id })}>
      {image && <Image style={personStyle.image} source={{uri: image}} />}
      {!image && <View style={personStyle.image}><IonIcon name="person" color="white" size={50}/></View>}
      <Text numberOfLines={2} style={personStyle.name}>{name}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.header}>{header}</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[screenStyles.scroll, {paddingHorizontal}]}
        horizontal
        data={data}
        keyExtractor={item => item.person_id + '_' + item.cast_order}
        renderItem={({item: {person_id, image, name}}) => <Person person_id={person_id} image={image} name={name} />}
      />
    </View>
  );
}

const screenStyles = StyleSheet.create({
  container: {gap: 4},
  scroll: {gap: 20},
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

const personStyle = StyleSheet.create({
  container: {width: 120, gap: 5},
  image: {
    height: 120,
    width: 120,
    borderRadius: 60,
    objectFit: 'cover',
    backgroundColor: 'grey',
    alignItems: "center",
    justifyContent: "center"
  },
  name: {color: "white", fontSize: 15, textAlign: "center"}
});
