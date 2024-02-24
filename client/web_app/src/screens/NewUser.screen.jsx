import { useEffect, useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AiFillEdit } from "react-icons/ai";

// CSS
import styles from '../styles/NewUser.screen.module.css';

// Contexts
import serverContext from '../contexts/server.context';

const NewUser = () => {
    const navigate = useNavigate();
    const { serverAddress } = useContext(serverContext);
    const [ userImages, setUserImages ] = useState([]);
    const [ selectedImage, setSelectedImage ] = useState();
    const [ showImgs, setShowImgs ] = useState(false);
    const [ confirm, setConfirm ] = useState(false);

    const [ userName, setUserName ] = useState(null);
    const [ adminAccount, setAdminAccount ] = useState(false);
    const [ childAccount, setChildAccount ] = useState(false);
    const [ pin1, setPin1 ] = useState(false);
    const [ pin2, setPin2 ] = useState(false);
    const [ pin3, setPin3 ] = useState(false);
    const [ pin4, setPin4 ] = useState(false);

    const FetchUserImages = async () => {
        const response = await fetch(`${serverAddress}/user/images`);
        const json = await response.json();
        setUserImages(json);
    };

    const handleNameChange = (e) => {
        const text = e.target.value;
        setUserName(text.length > 0 ? text : null);
    }

    const handleChildChange = (e) => {
        const checked = e.target.checked;
        setChildAccount(checked);
    };

    const handleAdminChange = (e) => {
        const checked = e.target.checked;
        setAdminAccount(checked);
    };

    const handlePinChange = (e, pin) => {
        if(!/^\d+$/.test(e.target.value)) {
            e.target.value = null;
            if(pin > 1) document.getElementById(`pin${pin-1}`).focus()
        }
        else {
            if(e.target.value.length > 1) {
                e.target.value = e.target.value.split('')[e.target.value.length - 1];
            }
            if(pin < 4) document.getElementById(`pin${pin+1}`).focus()
        }

        if(pin == 1) setPin1(e.target.value);
        else if(pin == 2) setPin2(e.target.value);
        else if(pin == 3) setPin3(e.target.value); 
        else if(pin == 4) setPin4(e.target.value);
    };

    const handleConfirm = async () => {
        const data = JSON.stringify({
            userName: document.getElementsByClassName(styles.userName)[0].value, 
            userImage: selectedImage, 
            childAccount,
            adminAccount,
            userPin: adminAccount ? parseInt(`${pin1}${pin2}${pin3}${pin4}`) : null
        });
        
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: data }
        const response = await fetch(`${serverAddress}/user/add`, options);
        if(response.status == 201) setConfirm(true);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    useEffect(() => {
        FetchUserImages();
    }, []);

    useEffect(() => {
        setSelectedImage(userImages[0]);
    }, [userImages])

    const Imgs = () => userImages.map(i => <img key={i} className={styles.selectImage} src={`${serverAddress}/${i}`} onClick={() => {setSelectedImage(i); setShowImgs(false)}}/> );

    if(confirm) return <Navigate to="/"/>;

    return (
        <div className={styles.container}>

            <div className={styles.userImage} style={{backgroundImage: `url(${serverAddress}/${selectedImage})`}} onClick={() => setShowImgs(true)}>
                <div className={styles.userImageOverlay}>
                    <AiFillEdit size='2rem' color='black'/>
                </div>
            </div>
            <input className={styles.userName} type="text" placeholder='User Name...' onChange={handleNameChange}/>
            
            
            <div className={styles.row}>
                <h3 className={styles.checkBoxName}>Child</h3>
                <input className={styles.checkBox} type="checkbox" id="child"/>

                <h3 className={styles.checkBoxName}>Admin</h3>
                <input className={styles.checkBox} type="checkbox" id="admin" onChange={handleAdminChange}/>
            </div>

            { adminAccount ?
                <div className={styles.userPin} >
                    <h3>User Pin</h3>
                    <div className={styles.pinSpan}>
                        <input className={styles.pinInput} id='pin1' type="numeric" onChange={(e) => handlePinChange(e, 1)}/>
                        <input className={styles.pinInput} id='pin2' type="numeric" onChange={(e) => handlePinChange(e, 2)}/>
                        <input className={styles.pinInput} id='pin3' type="numeric" onChange={(e) => handlePinChange(e, 3)}/>
                        <input className={styles.pinInput} id='pin4' type="numeric" onChange={(e) => handlePinChange(e, 4)}/>
                    </div>
                </div>
                : <></>
            }

            { showImgs && <div className={styles.images}> <Imgs/> </div> }

            
                <button 
                    className={styles.confirmButton} 
                    onClick={handleConfirm} 
                    style={userName && (!adminAccount || (pin1 && pin2 && pin3 && pin4)) ? {} : { pointerEvents: 'none', opacity: '0.3' }}
                >
                    Confirm
                </button>
                
                <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>

        </div>
    )
};

export default NewUser;