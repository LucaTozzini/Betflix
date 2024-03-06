import {useContext, useEffect, useState} from 'react';
import {
  Text,
  View,
  Modal,
  Image,
  Switch,
  TextInput,
  ScrollView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

// 
import { globalContext } from '../App';

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default ({navigation}) => {
  const {login, address, fetchUsers, users} = useContext(globalContext);
  const [loading, setLoading] = useState(false);

  const tryLogin = ({userId, userPin}) =>
    new Promise(async (res, rej) => {
      setLoading(true);
      try {
        const {success} = await login({userId, userPin});
        res({success});
      } catch (err) {
        rej(err);
      }
      setLoading(false);
    });

  const User = ({userId, image, name}) => (
    <TouchableOpacity
      style={{alignItems: 'center', gap: 7}}
      activeOpacity={0.9}
      onPress={() => {
        tryLogin({userId});
      }}>
      <Image style={styles.image} source={{uri: image}} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );

  const Add = () => (
    <TouchableOpacity
      style={{alignItems: 'center', gap: 7}}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("new_user")}>
      <View
        style={[
          styles.image,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        <MaterialIcon name="person-add" size={60} color="white" />
      </View>
      <Text style={styles.name}>Add Profile</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={styles.scroll}>
      <View style={{height: 70}} />
      <View style={{backgroundColor: 'black'}}>
        <Text style={styles.header}>Who's Watching</Text>
      </View>

      <View style={{alignItems: 'center'}}>
        <View style={styles.users}>
          {users.map(i => (
            <User
              key={i.USER_ID}
              userId={i.USER_ID}
              name={i.USER_NAME}
              image={`${address}/${i.USER_IMAGE}`}
            />
          ))}
          <Add />
        </View>
      </View>
    </ScrollView>
  );
};

const userSize = 120;
const userGap = 25;

const styles = StyleSheet.create({
  scroll: {
    gap: 20
  },
  header: {
    marginHorizontal: 20,
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
  },
  users: {
    gap: userGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: userSize * 2 + userGap,
  },
  image: {
    height: userSize,
    width: userSize,
    borderRadius: userSize/2,
    backgroundColor: 'rgb(30, 30, 30)',
  },
  name: {textAlign: 'center', color: 'white', fontSize: 14},
});