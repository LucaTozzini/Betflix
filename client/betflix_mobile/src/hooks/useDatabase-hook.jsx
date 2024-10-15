import {useContext, useState} from 'react';
import {addressContext} from '../../App';
let WS = null;

export default function useDatabase() {
  const SERVER_ADDRESS = useContext(addressContext);
  const [status, setStatus] = useState(null);

  function openSocket() {
    if (!WS) {
      WS = new WebSocket('ws://' + SERVER_ADDRESS + '/database/task/status');
      WS.onmessage = e => {
        setStatus(e.data);
      };
      WS.onclose = () => {
        WS = null
      }
    }
  }

  function closeSocket() {
    if (WS) {
      WS.close(1000);
    }
  }

  async function postTask(task) {
    try {
      const response = await fetch(
        `http://${SERVER_ADDRESS}/database/task/${task}`,
        {
          method: 'POST',
        },
      );
      console.log(response.status);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function torAddFromDb() {
    try {
      const response = await fetch(`${SERVER_ADDRESS}/torrents/db`, {
        method: 'POST',
      });
      return response.ok;
    } catch (err) {
      console.error(err.message);
    }
  }

  return {status, postTask, torAddFromDb, openSocket, closeSocket};
}
