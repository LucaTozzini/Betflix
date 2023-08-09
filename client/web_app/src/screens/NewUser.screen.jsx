import { useEffect, useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom'; 
import '../styles/NewUser.screen.css';

// Contexts
import serverContext from '../contexts/server.context';

const NewUser = () => {
    const { serverAddress } = useContext(serverContext);
    const [ userImages, setUserImages ] = useState([]);
    const [ selectedImage, setSelectedImage ] = useState();
    const [ confirm, setConfirm ] = useState(false);

    const FetchUserImages = async () => {
        const response = await fetch(`${serverAddress}/users/images`);
        const json = await response.json();
        setUserImages(json);
    };

    useEffect(() => {
        FetchUserImages();
    }, []);

    useEffect(() => {
        setSelectedImage(userImages[0]);
    }, [userImages])

    if(confirm) return <Navigate to="../select"/>;

    return (
        <div id="new-user">
            <div className="row">
                <img id="user-image" src={`${serverAddress}/${selectedImage}`}/>
                <input type="text" id="user-name" placeholder='User Name...'/>
            </div>
            
            <div className="row">
                <h3>Child Account</h3>
                <input type="checkbox" id="child"/>
            </div>

            <div id="image-container">
                {userImages.map(i => <img key={i} className='select-img' src={`${serverAddress}/${i}`} onClick={() => setSelectedImage(i)}/> )}
            </div>

            <div className="row">
                <Link to='../select'><button className="main-button">Cancel</button></Link>
                <button className="main-button" onClick={ async () => {
                    const data = JSON.stringify({
                        userName: document.getElementById('user-name').value, 
                        userImage: selectedImage, 
                        childAccount: document.getElementById('child').checked
                    });
                    
                    const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: data }
                    const response = await fetch(`${serverAddress}/users/add`, options);
                    if(response.status == 201) setConfirm(true);

                }}>Confirm</button>
            </div>

        </div>
    )
};

export default NewUser;