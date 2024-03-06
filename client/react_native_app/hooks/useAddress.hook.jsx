import {useEffect, useState, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Zeroconf from 'react-native-zeroconf';

const ENDPOINT = 'ciao';
const PORT = 2000;

export default () => {
  const zeroconf = new Zeroconf();
  const [address, setAddress] = useState(null);
  const addressRef = useRef(null);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  const handleFound = address => {
    setAddress(address);
    AsyncStorage.setItem('address', address);
    zeroconf.stop();
  };

  const testAddress = async address => {
    try {
      const timeout = 5000;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(`${address}/${ENDPOINT}`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      const text = await response.text();
      if (text === 'yellow') {
        handleFound(address);
      }
    } catch (err) {}
  };

  const handleResolved = ({name, addresses, port}) => {
    const address = addresses.find(i => i.startsWith('192.168'));
    if (name === 'Betflix Server' && address && port) {
      const fullAddress = `http://${address}:${port}`;
      testAddress(fullAddress);
    }
  };

  const scanServices = () => {
    zeroconf.scan((type = 'http'), (protocol = 'tcp'), (domain = 'local.'));
    zeroconf.on('resolved', handleResolved);
  };

  const bruteForce = async () => {
    for (let j = 0; j <= 255; j++) {
      for (let k = 0; k <= 255; k++) {
        if (addressRef.current) {
          return;
        }
        const ip = `http://192.168.${j}.${k}:${PORT}`;
        testAddress(ip);
        await sleep(20);
      }
    }
    if (addressRef.current === null) {
      setAddress(-1);
    }
  };

  const startUp = async () => {
    const lastKnown = await AsyncStorage.getItem('address');
    if (lastKnown) {
      testAddress(lastKnown);
      await sleep(500);
    }
    scanServices();
    await sleep(3000);
    bruteForce();
  };

  useEffect(() => {
    startUp();
  }, []);

  return address;
};
