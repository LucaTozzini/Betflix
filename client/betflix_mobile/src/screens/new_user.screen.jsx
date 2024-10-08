import {useContext, useEffect, useState} from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ScrollModal from '../components/scroll modal-comp';
import {addressContext, globalContext} from '../../App';

export default function NewUserScreen({navigation}) {
  const SERVER_ADDRESS = useContext(addressContext);
  const {useUsers} = useContext(globalContext);
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const {dark, colors} = useTheme();
  useEffect(() => {
    useUsers.fetchImages();
  }, []);

  useEffect(() => {
    if (useUsers.images) {
      setUserImage(useUsers.images[0]);
    }
  }, [useUsers.images]);

  const handleSubmit = async () => {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/users/user?name=${userName ?? ""}&image=${userImage ?? ""}`,
      {method: 'PUT'},
    );
    console.log(response);
    if (response.ok) {
      useUsers.fetchUsers();
      navigation.navigate('Users');
    } else if (response.status === 400) {
      const {message} = await response.json();
      Alert.alert('Information Error', message);
    } else {
      Alert.alert('500', 'Internal Server Error');
    }
  };

  return (
    <>
      <View style={screen.container}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {userImage && (
            <ImageBackground
              style={screen.image}
              imageStyle={{borderRadius: 20}}
              source={{uri: `http://${SERVER_ADDRESS}/users/images/${userImage}`}}>
              <View style={screen.imageEdit}>
                <Icon size={30} color="black" name="pencil" />
              </View>
            </ImageBackground>
          )}
        </TouchableOpacity>
        <TextInput
          style={[screen.input, {borderColor: colors.text, color: colors.text}]}
          placeholder="Your name..."
          placeholderTextColor={colors.text}
          onChangeText={setUserName}
        />
        <TouchableOpacity onPress={handleSubmit}>
          <Text
            style={[
              screen.create,
              {
                color: dark ? 'black' : 'white',
                backgroundColor: dark ? 'white' : 'black',
              },
            ]}>
            Create
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
                setUserImage(image);
                setModalVisible(false);
              }}>
              <Image
                source={{uri: `http://${SERVER_ADDRESS}/users/images/${image}`}}
                style={{height: 120, width: 120}}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollModal>
    </>
  );
}

const screen = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 25,
    paddingHorizontal: 20,
  },
  create: {
    fontSize: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    textAlign: 'center',
    borderRadius: 10,
  },
});
