import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  View
} from 'react-native';

export default ({route}) => {
  const {userName, userImage, admin} = route.params;

  const Admin = () => {
    return (
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button}>
          <Text style={{fontSize: 20}}>Database</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={{fontSize: 20}}>Torrents</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{uri: userImage}} style={styles.image} />
      <Text style={styles.name}>{userName}</Text>
      {admin ? <Admin/> : <></> }
      <TouchableOpacity style={[styles.button, {marginHorizontal: 10,}]} onPress={route.params.logout}>
        <Text style={{fontSize: 20}}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    gap: 10
  },
  image: {
    alignSelf: 'center',
    height: 140,
    width: 140,
    borderRadius: 70,
  },
  name: {
    textAlign: 'center',
    color: 'white',
    fontSize: 30,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 10
  },
  button: {
    backgroundColor: 'white',
    padding: 20,
    flex: 1,
    alignItems: 'center',
  },
});
