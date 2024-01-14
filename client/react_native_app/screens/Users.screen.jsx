import {useEffect, useState} from 'react';
import {
  Text,
  View,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

// Screens
import LoadingScreen from './Loading.screen';

export default ({login, address}) => {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userPin, setUserPin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${address}/users/list`);
      const json = await response.json();
      setUsers(json);
    } catch (err) {
      console.error(err.message);
    }
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const User = ({id, image, name, admin}) => (
    <TouchableOpacity
      style={{alignItems: 'center'}}
      activeOpacity={0.9}
      onPress={() => {
        if (admin) {
          setUserId(id);
          setShowModal(true);
        } else {
          tryLogin({userId: id, userPin: null});
        }
      }}>
      <Image style={styles.image} source={{uri: image}} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[1]}>
      <View style={{height: 100}} />
      <View style={{backgroundColor: 'black'}}>
        <Text style={styles.header}>Who's Watching</Text>
      </View>
      <View style={styles.users}>
        {users.map(i => (
          <User
            key={i.USER_ID}
            id={i.USER_ID}
            name={i.USER_NAME}
            image={`${address}/${i.USER_IMAGE}`}
            admin={i.ADMIN}
          />
        ))}
      </View>
      <Modal visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <TextInput
            keyboardType="numeric"
            style={[styles.input, wrongPin ? {borderColor: "red"} : {}]}
            onChangeText={value => setUserPin(value)}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              try {
                const {success} = await tryLogin({userId, userPin});
                if (!success) {
                  setWrongPin(true);
                }
              } catch (err) {}
            }}>
            <Text>Log In</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    padding: 10,
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
  },
  users: {
    gap: 20,
  },
  image: {
    height: 160,
    width: 160,
    borderRadius: 80,
    backgroundColor: 'grey',
  },
  name: {textAlign: 'center', color: 'white', fontSize: 20},
  modal: {
    backgroundColor: 'black',
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: "white"
  },
  button: {
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
    alignItems: 'center',
  },
});
