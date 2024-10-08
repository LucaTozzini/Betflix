import {useContext, useState} from 'react';
import { addressContext } from '../../App';

export default function useDatabase() {
  const SERVER_ADDRESS = useContext(addressContext);
  const [status, setStatus] = useState(null);

  async function statusSocket() {
    const ws = new WebSocket("ws://"+SERVER_ADDRESS+"/database/task/status");
    ws.onmessage = e => {
      setStatus(e.data);
    }
  } 

  async function postTask(task) {
    try {
      const response = await fetch(`http://${SERVER_ADDRESS}/database/task/${task}`, {
        method: 'POST',
      });
      console.log(response.status);
    } catch(err) {
      console.error(err.message);
    }
    
  }

  async function torAddFromDb() {
    try {
      const response = await fetch(`${SERVER_ADDRESS}/torrents/db`, {
        method: 'POST',
      });
      return response.ok;
    } catch(err) {
      console.error(err.message);
    }
  }


  return {status, postTask, torAddFromDb, statusSocket};
}
