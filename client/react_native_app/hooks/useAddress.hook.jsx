import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Zeroconf from 'react-native-zeroconf'

const ENDPOINT = 'ciao';
const PORT = 2000;

export default () => {
  const [address, setAddress] = useState(null);
  const zeroconf = new Zeroconf();
  
  const handleFound = address => {
    console.log("FOUND:", address);
    setAddress(address);
    zeroconf.stop();
  }

  const testAddress = address => new Promise(async (res, rej) => {
    try {
      console.log("TEST:", address);
      const response = await fetch(address+"/ciao");
      const text = await response.text();
      res(text === "yellow");
    } catch(err) {
      rej(err);
    }
  });

  const handleResolved = async ({name, addresses, port}) => {
    try {
      const address = addresses.find(i => i.startsWith("192.168"));
      if(name === "Betflix Server" && address && port) {
        const fullAddress = `http://${address}:${port}`;
        const valid = await testAddress(fullAddress);
        if(valid) {
          handleFound(fullAddress);
        }
      }
    } catch(err) {
      console.error(err.message);
    }
  }

  const scanServices = () => {
    zeroconf.scan(type = 'http', protocol = 'tcp', domain = 'local.');
    zeroconf.on("found", service => console.log(service));
    zeroconf.on("resolved", handleResolved);
  }

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
          .catch(err => {
            console.error(err.message);
          });
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
    // init();
    scanServices();
  }, []);

  return address;
};