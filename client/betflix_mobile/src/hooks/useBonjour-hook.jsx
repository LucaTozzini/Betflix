import {useEffect, useState} from 'react';
import Zeroconf from 'react-native-zeroconf';
const zeroconf = new Zeroconf();

export default function useBonjourHook() {
  const [address, setAddress] = useState(null);

  const handleResolve = service => {
    if (service.name.includes('Betflix_Server')) {
      service.addresses.forEach(async element => {
        try {
          const address = element + ':' + service.port;
          const response = await fetch('http://' + address + '/ciao');
          if (response.ok && (await response.text()) == 'yellow') {
            setAddress(address);
          }
        } catch (err) {
          console.error(err.message);
        }
      });
    }
  };

  useEffect(() => {
    zeroconf.scan((type = 'http'), (protocol = 'tcp'), (domain = 'local.'));
    // zeroconf.on('found', service => console.log('found', service));
    zeroconf.on('resolved', handleResolve);
    return () => {
      zeroconf.stop();
    };
  }, []);

  return {address};
}
