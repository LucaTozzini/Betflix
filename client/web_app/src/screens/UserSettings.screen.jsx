import { useContext } from "react";

// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';

const UserSettings = () => {
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin } = useContext(currentUserContext);

    const handleDelete = async () => {
        const options = { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId, userPin}) }
        const response = await fetch(`${serverAddress}/user/delete`, options);
        if(response.status == 200) window.location.href = '/users';
    };

    return (
        <div>
            <button onClick={handleDelete}>Delete User</button>
        </div>
    )
};

export default UserSettings