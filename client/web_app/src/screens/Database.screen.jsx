import { useContext, useEffect, useState } from 'react';
import '../styles/Database.screen.css';

// Contexts
import serverContext from '../contexts/server.context';

const Database = () => {
    const { serverAddress } = useContext(serverContext);
    const [ loaded, setLoaded ] = useState(false)
    const [ status, setStatus ] = useState({});
    const FetchStatus = async () => {
        try{
            const response = await fetch(`${serverAddress}/database/status`);
            const json = await response.json();
            setStatus(json);
        }
        catch(err){
            console.error(err.message);
        }
        setTimeout(FetchStatus, 1000);
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
                <button onClick={() => fetch(`${serverAddress}/database/run?action=1`)}>Scan Movies</button>
                <button onClick={() => fetch(`${serverAddress}/database/run?action=2`)}>Scan Shows</button>
                <button onClick={() => fetch(`${serverAddress}/database/run?action=3`)}>Update People</button>
            </div>
            <h2 id='action'>{status.ACTION || 'No Active Actions'}</h2>
            <div id="progress-bar">
                <div id="progress-bar-fill" style={{width: `${status.PROGRESS || 0}%`}}></div>
            </div>
        </div>
    );
};

export default Database;
