import {useContext, useState} from 'react';
import {globalContext} from '../App';
import { useNavigation } from '@react-navigation/native';
export default () => {
  const {address} = useContext(globalContext);
  const navigation = useNavigation();
  const [torrents, setTorrents] = useState([]);

  const addTorrent = async magnetURI => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({magnetURI}),
      };
      const response = await fetch(`${address}/torrents/add`, options);
      if (response.status == 200) {
        navigation.navigate('torrents');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchTorrents = async ({loop, time}) => {
    try {
      const response = await fetch(`${address}/torrents/active`);
      const json = await response.json();
      setTorrents(json);
    } catch (err) {
      console.error(err.message);
    }
    if (loop) {
      setTimeout(() => fetchTorrents({loop, time}), time);
    }
  };

  return {torrents, fetchTorrents, addTorrent};
};
