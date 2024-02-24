import { useContext, useState } from 'react';
import {
  Text,
  View,
  Modal,
  Image,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Icons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// Contexts
import { globalContext } from '../App';

export default ({route}) => {
  const {userName, userImage, admin, logout, deleteUser} = useContext(globalContext);
  const [deleteModal, setDeleteModal] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);

  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {
      marginTop: StatusBar.currentHeight,
    },
    image: {
      height: 140,
      width: 140,
      borderRadius: 70,
      alignSelf: "center",
      marginTop: 50,
    },
    name: {
      color: "white",
      fontSize: 30,
      marginTop: 5,
      marginBottom: 40,
      marginHorizontal: 10,
      textAlign: "center",
    },
    options: {},
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomColor: 'rgb(50,50,50)',
      borderBottomWidth: 1.5,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    optionText: {
      color: 'white',
      fontSize: 25,
    },
  });

  const Option = ({text, handlePress}) => (
    <View style={styles.options}>
      <TouchableOpacity style={styles.option} onPress={handlePress}>
        <Text style={styles.optionText}>{text}</Text>
        <MaterialIcon
          name="arrow-forward-ios"
          color="rgb(100,100,100)"
          size={25}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image style={styles.image} source={{uri: userImage}}/>
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
        {userName}
      </Text>
      {/* <Option text="Change Image" handlePress={() => setImageModal(true)}/>
      <Option text="Edit Name" handlePress={() => setNameModal(true)}/> */}
      <Option text="Delete User" handlePress={() => setDeleteModal(true)}/>
      <Option text="Log Out" handlePress={logout}/>


      {/* Modals */}
      <Modal visible={nameModal} onRequestClose={() => setNameModal(false)}>

      </Modal>
      <Modal visible={imageModal} onRequestClose={() => setImageModal(false)}>

      </Modal>
      <Modal visible={deleteModal} onRequestClose={() => setDeleteModal(false)}>
        <Text>On god?</Text>
        <TouchableOpacity onPress={deleteUser}>
          <Text>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDeleteModal(false)}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};
