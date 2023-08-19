import { useContext, useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';

// Contexts
import currentUserContext from "../contexts/currentUser.context";
import serverContext from "../contexts/server.context";

const Authenticator = () => {
    const { serverAddress } = useContext(serverContext);
    const { userId, authenticated, setAuthenticated, userData } = useContext(currentUserContext);
    const [ requested, setRequested ] = useState(false);
    const navigation = useNavigation();

    const authenticateUser = async () => {
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId})}
        const response = await fetch(`${serverAddress}/users/data`, options);
        const auth = response.status == 200;
        if(auth) setAuthenticated(auth);
        console.log(options.body, auth);
        setRequested(true);
    };

    useEffect(() => {
        authenticateUser();
    }, []);

    useEffect(() => {
        if((requested && !authenticated) || (!userData || userData == -1)) navigation.replace("selectUser");
    }, [requested, authenticated, userData]);

};

export default Authenticator;