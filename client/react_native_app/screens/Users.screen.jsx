import {useEffect, useState} from 'react';
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

// Screens
import LoadingScreen from './Loading.screen';

// Icons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default ({login, address}) => {
  const [users, setUsers] = useState([]);

  const [userId, setUserId] = useState(null);
  const [userPin, setUserPin] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);

  const [pinModal, setPinModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  // Create Profile
  const [admin, setAdmin] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${address}/user/list`);
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
      style={{alignItems: 'center', gap: 7}}
      activeOpacity={0.9}
      onPress={() => {
        if (admin) {
          setUserId(id);
          setUserName(name);
          setUserImage(image);
          setPinModal(true);
        } else {
          tryLogin({userId: id, userPin: null});
        }
      }}>
      <Image style={styles.image} source={{uri: image}} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );

  const Add = () => (
    <TouchableOpacity
      style={{alignItems: 'center', gap: 7}}
      activeOpacity={0.9}
      onPress={() => setCreateModal(true)}>
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
    <ScrollView style={styles.container} stickyHeaderIndices={[1]}>
      <View style={{height: 70}} />
      <View style={{backgroundColor: 'black'}}>
        <Text style={styles.header}>Who's Watching</Text>
      </View>

      <View style={{alignItems: 'center'}}>
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
          <Add />
        </View>
      </View>

      {/* Modals */}
      <Modal
        visible={pinModal}
        onRequestClose={() => setPinModal(false)}
        animationType="fade">
        <View style={pinStyles.modal}>
          <Image style={pinStyles.image} source={{uri: userImage}}/>
          <Text style={pinStyles.name}>{userName}</Text>
          <TextInput
            textContentType='pin'
            keyboardType="numeric"
            style={[pinStyles.input, wrongPin ? {borderColor: 'red'} : {}]}
            onChangeText={value => setUserPin(value)}
          />
          <TouchableOpacity
            style={pinStyles.button}
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

      <Modal
        visible={createModal}
        onRequestClose={() => setCreateModal(false)}
        animationType="fade">
        <View style={createStyles.modal}>
          <ScrollView contentContainerStyle={createStyles.scroll}>
            <TouchableOpacity activeOpacity={0.8}>
              <ImageBackground style={createStyles.image}>
                <View style={createStyles.edit}>
                  <MaterialIcon name="edit" size={25} color="black" />
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <View style={{borderRadius: 5, overflow: 'hidden', width: '100%'}}>
              <Text style={createStyles.label}>Profile Name</Text>
              <TextInput style={createStyles.input} />
            </View>

            <View style={createStyles.options}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={createStyles.option}
                onPress={() => setAdmin(!admin)}>
                <Text style={createStyles.optionText}>Administrator</Text>
                <Switch
                  trackColor={{
                    false: 'rgb(100,100,100)',
                    true: 'rgb(100,100,100)',
                  }}
                  thumbColor={admin ? 'rgb(40, 100, 255)' : 'white'}
                  value={admin}
                  onValueChange={value => setAdmin(value)}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const userSize = 120;
const userGap = 25;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    padding: 10,
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
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
    borderRadius: 7,
    backgroundColor: 'rgb(30, 30, 30)',
  },
  name: {textAlign: 'center', color: 'white', fontSize: 14},
});

const pinStyles = StyleSheet.create({
  modal: {
    backgroundColor: 'black',
    flex: 1,
    // justifyContent: "center"
  },
  image: {
    marginTop: 40,
    height: 140,
    width: 140,
    borderRadius: 70,
    backgroundColor: 'grey',
    alignSelf: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  name: {
    color: "white",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 10,
    textAlign: "center",
    color: "white",
    fontSize: 20
  },
  button: {
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
    alignItems: 'center',
  },
});

const createStyles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 10,
  },
  scroll: {
    gap: 20,
    alignItems: 'center',
  },
  image: {
    height: 140,
    width: 140,
    borderRadius: 70,
    backgroundColor: 'grey',
    alignSelf: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  edit: {
    backgroundColor: 'white',
    marginBottom: 10,
    marginRight: 10,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'rgb(100,100,100)',
    fontSize: 15,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingTop: 0,
    paddingBottom: 10,
    paddingHorizontal: 8,
    fontSize: 18,
    color: 'white',
  },
  options: {},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(50,50,50)',
    width: '95%',
    paddingVertical: 20,
  },
  optionText: {
    color: 'white',
    fontSize: 20,
  },
});
