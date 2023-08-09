import { SafeAreaView, Text, TouchableHighlight, Image, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";
import themeContext from "../contexts/theme.context";

const SelectUser = () => {
  const { serverAddress } = useContext(serverContext);
  const { textColor } = useContext(themeContext);
  const { setUserId, setUserPin, setUserData } = useContext(currentUserContext);

  const [ users, setUsers ] = useState(null);

  const navigation = useNavigation();

  const FetchUsers = async () => {
    const response = await fetch(`${serverAddress}/users/list`);
    const json = await response.json();
    setUsers(json);
  };

  useEffect(() => {
    FetchUsers();
  }, []);

  const setUser = (userData) => {
    setUserId(userData.USER_ID);
    setUserData(userData);
    navigation.replace("browse");
  };

  const User = ({userName, userImage, userData}) => (
    <TouchableHighlight onPress={() => setUser(userData)} style={styles.user}>
      <>
        <Image source={{uri: `${serverAddress}/${userImage}`}} style={styles.userImage}/>
        <Text>{userName}</Text>
      </>
    </TouchableHighlight>
  ) 

  return (
    <SafeAreaView style={styles.container}>
      { users ? 
        users.map(i => <User key={i.USER_ID} userData = {i} userName={i.USER_NAME} userImage={i.USER_IMAGE}/>)
        : <></> 
      }

    </SafeAreaView>
  )
};

const userImageSize = 100;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  user: {
    alignItems: 'center'
  },
  userImage: {
    height: userImageSize,
    width: userImageSize,
    borderRadius: userImageSize / 2
  }
});

export default SelectUser;