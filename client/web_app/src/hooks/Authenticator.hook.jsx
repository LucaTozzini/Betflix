import { useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// Contexts
import currentUserContext from "../contexts/currentUser.context";
import serverContext from "../contexts/server.context";

const Authenticator = () => {
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin, authenticated, setAuthenticated } = useContext(currentUserContext);
    const [ requested, setRequested ] = useState(false);

    const authenticateUser = async () => {
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({userId, userPin})}
        const response = await fetch(`${serverAddress}/users/data`, options);
        const auth = response.status == 200;
        if(auth) setAuthenticated(auth);
        setRequested(true);
    };

    useEffect(() => {
        authenticateUser();
    }, []);

    if(requested && !authenticated) return <Navigate to="/users"/>;
};

export default Authenticator;