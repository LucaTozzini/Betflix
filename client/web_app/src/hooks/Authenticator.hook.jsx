import { useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

// Contexts
import currentUserContext from "../contexts/currentUser.context";
import serverContext from "../contexts/server.context";

const Authenticator = () => {
    const location = useLocation();
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin, setUserImage, setUserName, setIsAdmin, setIsChild, setAuthenticated } = useContext(currentUserContext);

    const authenticateUser = async () => {
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId, userPin})}
        const response = await fetch(`${serverAddress}/users/data`, options);
        const auth = response.status == 200;
        console.log('auth:', auth);
        if(auth) {
            const json = await response.json();
            setAuthenticated(true);
            setUserImage(json.USER_IMAGE);
            setUserName(json.USER_NAME);
            setIsAdmin(json.ADMIN == 1 ? true : false);
            setIsChild(json.CHILD == 1 ? true : false);
        }
        else {
            window.location.replace('/users');
        }
    };

    useEffect(() => {
        if(!['/users', '/users/', '/users/new', 'users/new/'].includes(location.pathname))
        authenticateUser();
    }, [location]);
};

export default Authenticator;