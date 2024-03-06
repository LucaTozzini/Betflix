import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import {globalContext} from '../App';

// Icons
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default ({navigation}) => {
  const {address, userImages, createUser} = useContext(globalContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [modal, setModal] = useState(false);

  const handleInput = (e) => {
    setNameError(false);
    setSelectedName(e.trim());
  }

  const handleCreate = async () => {
    try {
      if(selectedName.length === 0) {
        setNameError(true);
      } else {
        const success = await createUser({userName: selectedName, userImage: selectedImage})
        console.log(success);
        if(success) {
          navigation.navigate("users");
        }
      }
    } catch(err) {
      console.log(err.message)
    }
  }

  useEffect(() => {
    if (userImages.length) {
      setSelectedImage(userImages[0]);
      console.log(userImages[0]);
    }
  }, [userImages]);

  const SelectImage = () => {
    return (
      <Modal
        visible={modal}
        animationType="slide"
        onRequestClose={() => setModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalTop}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModal(false)}>
              <MaterialIcon name="arrow-back" color="white" size={40} />
            </TouchableOpacity>
            <Text style={styles.modalHeader}>Select Image</Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalImages}>
              {userImages.map(image => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={'IMAGE_' + image}
                  onPress={() => {
                    setSelectedImage(image);
                    setModal(false);
                  }}>
                  <Image
                    source={{uri: `${address}/${image}`}}
                    style={styles.modalImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <ScrollView
        stickyHeaderIndices={[1]}
        contentContainerStyle={styles.scroll}>
        <View style={{height: 70}} />
        <View style={{backgroundColor: 'black'}}>
          <Text style={styles.header}>Create User</Text>
        </View>
        <TouchableOpacity
          style={styles.selectImage}
          onPress={() => setModal(true)}>
          <Image
            style={styles.selectedImage}
            source={
              selectedImage
                ? {uri: `${address}/${selectedImage}`}
                : require('../gifs/loading.gif')
            }
          />
          <View style={styles.editIcon}>
            <MaterialIcon name="edit" color="black" size={30} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.label}>Username:</Text>
          <TextInput
            onChangeText={handleInput}
            style={nameError ? styles.nameError : styles.nameInput}
            placeholder="John Smith"
            placeholderTextColor={'rgb(160,160,160)'}
          />
        </View>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={styles.createButton}>Create</Text>
        </TouchableOpacity>
      </ScrollView>

      <SelectImage />
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    gap: 20,
    marginHorizontal: 20,
  },
  header: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
  },
  selectImage: {
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
  selectedImage: {
    height: 160,
    width: 160,
    borderRadius: 80,
    backgroundColor: 'grey',
  },
  editIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: -40,
    marginRight: 20,
  },
  label: {
    color: 'white',
    fontSize: 15,
    marginBottom: 2,
  },
  nameInput: {
    fontSize: 20,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },

  nameError: {
    fontSize: 20,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "red",
  },

  createButton: {
    fontSize: 22,
    color: 'black',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalTop: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  modalClose: {
    alignSelf: 'flex-start',
  },
  modalHeader: {
    color: 'white',
    fontSize: 25,
  },
  modalScroll: {},
  modalImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  modalImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: 'grey',
  },
});
