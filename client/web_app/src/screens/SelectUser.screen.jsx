import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { IoAdd } from "react-icons/io5";

// CSS
import styles from '../styles/SelectUser.screen.module.css';

// Contexts
import serverContext from "../contexts/server.context";
import currentUserContext from "../contexts/currentUser.context";
import { globalContext } from "../App";

const SelectUser = () => {
    const {useUser} = useContext(globalContext);
    
    const { serverAddress } = useContext(serverContext);
    const [ userList, setUserList ] = useState([]);

    const [ showModal, setShowModal ] = useState(false);
    const [ targetData, setTargetData ] = useState(null);


    const [ pin1, setPin1 ] = useState(null);
    const [ pin2, setPin2 ] = useState(null);
    const [ pin3, setPin3 ] = useState(null);
    const [ pin4, setPin4 ] = useState(null);


    const FetchUserList = async () => {
        try{
            const response = await fetch(`${serverAddress}/user/list`);
            const json = await response.json();
            setUserList(json);
        }
        catch(err){
        }
    };

    const handleSelect = async (data, pin) => {
        const auth = await useUser.login({id: data.USER_ID, pin});
        if(!auth) {
            
        }
    };

    const handleUserClick = (data) => {
        if(data.ADMIN == 1) {
            setTargetData(data);
            setShowModal(true);
        }
        else {
            handleSelect(data, null);
        }
    }

    const handlePinChange = (e, pin) => {
        if(!/^\d+$/.test(e.target.value)) {
            e.target.value = null;
            if(pin > 1) document.getElementById(`pin${pin-1}`).focus()
        }
        else {
            if(e.target.value.length > 1) {
                e.target.value = e.target.value.split('')[e.target.value.length - 1];
            }
            if(pin < 4) document.getElementById(`pin${pin+1}`).focus();
            else document.getElementsByClassName(styles.modalButton)[0].focus();
        }

        if(pin == 1) setPin1(e.target.value);
        else if(pin == 2) setPin2(e.target.value);
        else if(pin == 3) setPin3(e.target.value); 
        else if(pin == 4) setPin4(e.target.value);
    };

    useEffect(() => {
        FetchUserList();
    }, []);

    const AddUser = () => {
        return (
            <Link to="new">
                <div className={styles.user}>
                    <div className={styles.userAddImage}>
                        <IoAdd/>
                    </div>
                    <h3 className={styles.userName}>Add User</h3>
                </div>
            </Link>
        );
    };

    const User = ({data}) => {
        return (
            <div className={styles.user} onClick={ () => handleUserClick(data) }>
                <img className={styles.userImage} src={`${serverAddress}/${data.USER_IMAGE}`}/>
                <h3 className={styles.userName}>{data.USER_NAME}</h3>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            { showModal ? 
                <div className={styles.modalDock} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Enter Pin</h3>
                        <div className={styles.pinSpan}>
                            <input className={styles.pinInput} id='pin1' type="password" autoComplete="off" onChange={(e) => handlePinChange(e, 1)}/>
                            <input className={styles.pinInput} id='pin2' type="password" autoComplete="off" onChange={(e) => handlePinChange(e, 2)}/>
                            <input className={styles.pinInput} id='pin3' type="password" autoComplete="off" onChange={(e) => handlePinChange(e, 3)}/>
                            <input className={styles.pinInput} id='pin4' type="password" autoComplete="off" onChange={(e) => handlePinChange(e, 4)}/>
                        </div>
                        <button className={styles.modalButton} onClick={() => handleSelect(targetData, parseInt(`${pin1}${pin2}${pin3}${pin4}`))}>
                            Authenticate
                        </button>
                    </div>
                </div> 
                : <></> 
            }
            <div className={styles.top}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Disney_Plus_logo.svg/1280px-Disney_Plus_logo.svg.png" className={styles.logo}/>
            </div>
            <h1 className={styles.title}>Who's You?</h1>
            <div className={styles.users}>
                {userList.map(i => <User key={i.USER_ID} data={i}/>)}
                <AddUser/>
            </div>
        </div>
    );
};

export default SelectUser;