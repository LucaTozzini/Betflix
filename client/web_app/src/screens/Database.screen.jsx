import { useContext, useEffect, useState } from 'react';
import '../styles/Database.screen.css';

// Contexts
import serverContext from '../contexts/server.context';
import currentUserContext from '../contexts/currentUser.context';

const Database = () => {
    const { serverAddress } = useContext(serverContext);
    const { userId, userPin } = useContext(currentUserContext);
    const [ loaded, setLoaded ] = useState(false)
    const [ status, setStatus ] = useState({});
    const FetchStatus = async () => {
        try{
            const response = await fetch(`${serverAddress}/database/status`);
            const json = await response.json();
            setStatus(json);
        }
        catch(err){
            
        }
        setTimeout(FetchStatus, 1000);
    };
    
    const Run = async (action) => {
        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, userId, userPin }) };
        fetch(`${serverAddress}/database/run`, options);
    };

    useEffect(() => {
        if(!loaded) setLoaded(true);
        else FetchStatus()
    }, [loaded]);

    useEffect(() => {
        console.log(status);
    },[status]);

    return (
        <div id='database'>
            <div id="button-row" {...(status.ACTIVE && {className: 'ghost'})}>
                <button onClick={() => Run(1)}>Scan Movies</button>
                <button onClick={() => Run(2)}>Scan Shows</button>
                <button onClick={() => Run(3)}>Update People</button>
            </div>
            <h2 id='action'>{status.ACTION || 'No Active Actions'}</h2>
            <div id="progress-bar">
                <div id="progress-bar-fill" style={{width: `${status.PROGRESS || 0}%`}}></div>
            </div>
        </div>
    );
};

export default Database;
