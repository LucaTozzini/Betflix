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

    const FetchUserImages = async () => {
        const response = await fetch(`${serverAddress}/users/images`);
        const json = await response.json();
        setUserImages(json);
    };

    const handleConfirm = async () => {
        const data = JSON.stringify({
            userName: document.getElementById('user-name').value, 
            userImage: selectedImage, 
            childAccount: document.getElementById('child').checked
        });
        
        const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: data }
        const response = await fetch(`${serverAddress}/users/add`, options);
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

    if(confirm) return <Navigate to="../select"/>;

    return (
        <div className={styles.container}>

            <div className={styles.userImage} style={{backgroundImage: `url(${serverAddress}/${selectedImage})`}} onClick={() => setShowImgs(true)}>
                <div className={styles.userImageOverlay}>
                    <AiFillEdit size='2rem' color='black'/>
                </div>
            </div>
            <input className={styles.userName} type="text" placeholder='User Name...'/>
            
            
            <div className={styles.row}>
                <h3 className={styles.checkBoxName}>Child</h3>
                <input className={styles.checkBox} type="checkbox" id="child"/>

                <h3 className={styles.checkBoxName}>Admin</h3>
                <input className={styles.checkBox} type="checkbox" id="child"/>
            </div>

            { showImgs && <div className={styles.images}> <Imgs/> </div> }

            
                <button className={styles.confirmButton} onClick={handleConfirm}>Confirm</button>
                <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>

        </div>
    )
};

export default NewUser;