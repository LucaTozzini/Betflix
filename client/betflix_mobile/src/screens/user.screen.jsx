import {
  View,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useContext, useEffect, useState} from 'react';
import {addressContext, globalContext} from '../../App';
import ScrollModal from '../components/scroll modal-comp';

export default function UserScreen() {
  const SERVER_ADDRESS = useContext(addressContext);
  const {useUsers} = useContext(globalContext);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    useUsers.fetchImages();
  }, []);

  const handleImageChange = async image => {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/users/user/image?user_id=${useUsers.current.user_id}&image=${image}`,
      {method: 'PUT'},
    );

    if (response.ok) {
      useUsers.current.image = image;
      setModalVisible(false);
    }
  };

  const handleDelete = async () => {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/users/user?user_id=${useUsers.current.user_id}`,
      {method: 'DELETE'},
    );
    if (response.ok) {
      useUsers.fetchUsers();
      useUsers.setCurrent(null);
    }
  };

  const {dark, colors} = useTheme();
  return (
    <>
      <View style={screenStyle.container}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <ImageBackground
            style={screenStyle.image}
            imageStyle={{borderRadius: 20}}
            source={{
              uri: `http://${SERVER_ADDRESS}/users/images/${useUsers.current.image}`,
            }}>
            <View style={screenStyle.imageEdit}>
              <Icon size={30} color="black" name="pencil" />
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete}>
          <Text
            style={[
              screenStyle.change,
              {
                color: dark ? 'black' : 'white',
                backgroundColor: dark ? 'white' : 'black',
              },
            ]}>
            Delete User
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => useUsers.setCurrent(null)}>
          <Text
            style={[
              screenStyle.change,
              {
                color: dark ? 'black' : 'white',
                backgroundColor: dark ? 'white' : 'black',
              },
            ]}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollModal
        visible={modalVisible}
        setVisible={setModalVisible}
        header={'Select A Profile Image'}>
        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            paddingVertical: 10,
            justifyContent: 'center',
          }}>
          {useUsers.images?.map(image => (
            <TouchableOpacity
              key={image}
              onPress={() => {
                handleImageChange(image);
              }}>
              <Image
                source={{uri: `${SERVER_ADDRESS}/users/images/${image}`}}
                style={{height: 120, width: 120}}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollModal>
    </>
  );
}

const screenStyle = StyleSheet.create({
  container: {marginHorizontal: 30, gap: 20, marginTop: 20},
  image: {
    height: 200,
    width: 200,
    alignSelf: 'center',
    borderRadius: 20,
    objectFit: 'cover',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  imageEdit: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  change: {
    fontSize: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: 'center',
    borderRadius: 10,
  },
});
