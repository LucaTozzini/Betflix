import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ENDPOINT = 'ciao';
const PORT = 2000;

export default () => {
  const [address, setAddress] = useState(null);
  
  const search = async () => {
    let kill = false;
    for (let i = 0; i < 256; i++) {
      if (kill) {
        break;
      }
      for (let x = 0; x < 256; x++) {
        if (kill) {
          break;
        }
        const a = `http://192.168.${i}.${x}:${PORT}`;
        fetch(`${a}/${ENDPOINT}`)
          .then(async res => {
            const text = await res.text();
            if (text === 'yellow') {
              setAddress(a);
              AsyncStorage.setItem('address', a);
              kill = true;
            }
          })
          .catch(err => {});
        await new Promise(res => setTimeout(res, 100));
      }
    }
  };

  const init = async () => {
    const value = await AsyncStorage.getItem('address');
    try {
      const response = await fetch(value+"/"+ENDPOINT);
      const text = await response.text();
      if(text === "yellow") {
        setAddress(value);
        return;
      }
    } catch(err) {
      console.log(err)
    }
    search();
  }

  useEffect(() => {
    init();
  }, []);

  return {address};
};
