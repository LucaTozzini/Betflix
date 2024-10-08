import {useEffect, useState} from 'react';
import Zeroconf from 'react-native-zeroconf';
const zeroconf = new Zeroconf();

export default function useBonjourHook() {
  const [address, setAddress] = useState(null);

  const handleResolve = async service => {
    console.log("resolved", service, service.addresses)
    if (service.name.includes('Betflix Server')) {
      try {
        const address = service.addresses[0] + ':' + service.port;
        const response = await fetch('http://' + address + '/ciao');
        if (response.ok && (await response.text()) == 'yellow') {
          setAddress(address);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    zeroconf.scan((type = 'http'), (protocol = 'tcp'), (domain = 'local.'));
    zeroconf.on("found", service => console.log("found", service))
    zeroconf.on('resolved', handleResolve);
    return () => {
      zeroconf.stop();
    };
  }, []);

  return {address};
}
