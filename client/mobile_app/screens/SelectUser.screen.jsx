import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, TextInput } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";

// Components
import Header from "../components/Header.component";
import Loading from "../components/Loading.component";

const SelectUser = () => {
  const { serverAddress } = useContext(serverContext);
  const { setUserId, setUserPin } = useContext(currentUserContext);
  const [ loading, setLoading ] = useState(false);
  const [ users, setUsers ] = useState(null);

  const navigation = useNavigation();

  const FetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverAddress}/users/list`);
      const json = await response.json();
      setUsers(json);
    }
    catch(err) {

    }
    setLoading(false);
  };

  useEffect(() => {
    FetchUsers();
  }, []);

  const setUser = (id, pin) => {
    setUserId(id);
    setUserPin(pin);
    navigation.replace("home");
  };

  const User = ({userId, userName, userImage, isAdmin}) => {
    const [ showModal, setShowModal ] = useState(false);
    return (
      <>
      <TouchableOpacity onPress={() => isAdmin == 1 ? setShowModal(true) : setUser(userId, "null")} style={styles.user}>
        <>
          <Image source={{uri: `${serverAddress}/${userImage}`}} style={styles.userImage}/>
          <Text style={{color:'white'}}>{userName}</Text>
        </>
      </TouchableOpacity>
      <Modal visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.pinContainer}>
          <TextInput autoFocus placeholder="Enter Pin" inputMode="numeric" style={styles.pin} secureTextEntry maxLength={4} onSubmitEditing={(e) => setUser(userId, parseInt(e.nativeEvent.text))}/>
        </View>
      </Modal>
      </>
    ) 
  }

  if(loading) return <Loading/>
  else return (
    <>
    <Header showHeader={false}/>
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit={true}>Who's You?</Text>
      <ScrollView>
        { users ? 
          users.map(i => <User key={i.USER_ID} userId={i.USER_ID} isAdmin={i.ADMIN} userName={i.USER_NAME} userImage={i.USER_IMAGE}/>)
          : <></> 
        }
      </ScrollView>
      
    </View>
    </>
  )
};

const userImageSize = 100;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 30
  },
  user: {
    alignItems: 'center'
  },
  userImage: {
    height: userImageSize,
    width: userImageSize,
    borderRadius: userImageSize / 2
  },
  pinContainer: {
    flex: 1,
    backgroundColor: 'black'
  },
  pin: {
    height: 100,
    fontSize: 40,
    backgroundColor: 'white'
  }
});

export default SelectUser;