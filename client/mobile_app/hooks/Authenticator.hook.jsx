import { useContext, useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { getData } from "../helpers/asyncStorage.helper";

// Contexts
import currentUserContext from "../contexts/currentUser.context";
import serverContext from "../contexts/server.context";

const Authenticator = ({routeName}) => {
    const { userId, userPin, setUserName, setUserImage } = useContext(currentUserContext);
    const { serverAddress } = useContext(serverContext);
    const navigation = useNavigation();

    const auth = async () => {
        const options = {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId, userPin: isNaN(userPin) ? null : userPin}) 
        };

        const response = await fetch(`${serverAddress}/users/data`, options);
        if(response.status != 200) {
            try {
                navigation.navigate("selectUser", {replace: true});
            }
            catch(err) {
                console.error(err.message);
            }
        }
        else {
            const json = await response.json();
            setUserImage(json.USER_IMAGE);
            setUserName(json.USER_NAME);
        }
    }

    useEffect(() => {
        if(!['selectUser'].includes(routeName)) {
            auth();
        }
    }, [routeName]);
};  

export default Authenticator;