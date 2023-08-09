import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { IoAddCircle } from "react-icons/io5";

// CSS
import '../styles/SelectUser.screen.css';
import serverContext from "../contexts/server.context";

// Contexts
import currentUserContext from "../contexts/currentUser.context";

// Hooks
import Authenticator from "../hooks/Authenticator.hook";

const SelectUser = () => {
    const { serverAddress } = useContext(serverContext);
    const [ userList, setUserList ] = useState([]);

    const { setUserId, setUserData } = useContext(currentUserContext);

    const FetchUserList = async () => {
        try{
            const response = await fetch(`${serverAddress}/users/list`);
            const json = await response.json();
            setUserList(json);
        }
        catch(err){
        }
    };

    useEffect(() => {
        FetchUserList();
    }, []);

    const Select = async (userId, userName, userImage) => {
        setUserId(userId);
        setUserData({userName, userImage});
        window.location.href = '/';
    };

    const AddUser = () => {
        return (
            <Link to="../new">
                <div className="user">
                    <IoAddCircle className="user-image"/>
                    <h3 className="user-name">Add User</h3>
                </div>
            </Link>
        );
    };

    const User = ({userId, userImage, userName}) => {
        return (
            <div className="user" onClick={() => { Select(userId, userName, userImage)}}>
                <img className="user-image" src={`${serverAddress}/${userImage}`}/>
                <h3 className="user-name">{userName}</h3>
            </div>
        );
    };

    return (
        <div id="select-user">
            <Authenticator/>
            <h1>Who's Watching</h1>
            <div id="container">
                {userList.map(i => <User key={i.USER_ID} userId={i.USER_ID} userImage={i.USER_IMAGE} userName={i.USER_NAME}/>)}
                <AddUser/>
            </div>
        </div>
    );
};

export default SelectUser;