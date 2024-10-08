import {useContext, useEffect} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@react-navigation/native';
import {globalContext, addressContext} from '../../App';

export default function UsersScreen({navigation}) {
  const SERVER_ADDRESS = useContext(addressContext);
  const {useUsers} = useContext(globalContext);
  const {colors} = useTheme();

  useEffect(() => {
    useUsers.fetchUsers();
  }, []);

  const UserAvatar = ({name, image, handlePress}) => (
    <TouchableOpacity style={avatar.container} onPress={handlePress}>
      <Image style={avatar.image} source={{uri: image}} />
      <Text style={[avatar.name, {color: colors.text}]}>{name}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={screen.container}>
      <Text
        style={[screen.header, {color: colors.text}]}
        numberOfLines={2}
        adjustsFontSizeToFit
        textBreakStrategy="simple">
        Who's Watching?
      </Text>
      <ScrollView contentContainerStyle={screen.scroll}>
        {useUsers.users?.map(({user_id, name, image}) => (
          <UserAvatar
            key={user_id}
            name={name}
            image={`http://${SERVER_ADDRESS}/users/images/${image}`}
            handlePress={() => useUsers.setCurrent({user_id, name, image})}
          />
        ))}
        <TouchableOpacity
          style={avatar.container}
          onPress={() => navigation.navigate('New User')}>
          <View style={avatar.newIconContainer}>
            <Icon name="add-circle" color={colors.text} size={100} />
          </View>
          <Text style={[avatar.name, {color: colors.text}]}/>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const screen = StyleSheet.create({
  container: {},
  header: {
    fontSize: 35,
    marginHorizontal: 10,
    marginVertical: 30,
    textAlign: "center",
  },
  scroll: {flexDirection: "row", flexWrap: "wrap", gap: 20, justifyContent: "center"},
});

const avatar = StyleSheet.create({
  container: {
    width: 130,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "blue"
  },
  image: {
    height: 130,
    aspectRatio: 1,
    borderRadius: 20,
    objectFit: 'cover',
    backgroundColor: 'grey',
  },
  newIconContainer: {
    height: 130,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {fontSize: 25, textAlign: 'center'},
});
