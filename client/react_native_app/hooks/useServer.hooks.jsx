import {useEffect, useState} from 'react';

export default () => {
  const [address, setAddress] = useState(null);
	const [port, setPort] = useState(2000);

  const init = async () => {
    // const valid = await check(lastAddress)
		// if(valid) {
			// setAddress(lastAddress);
		// } else {
			// searchAddress();	
		// }
		searchAddress();
  };

  const check = address =>
    new Promise(async (res) => {
      try {
        const response = await fetch(address + '/ciao');
        if (response.status === 200) {
          const text = await response.text();
          if (text === 'yellow') {
            setAddress(address);
						return res(true);
          }
        }
      } catch (err) {

			}
			res(false);
    });

  const searchAddress = async () => {
		setAddress(null);
		// const thisPort = port;
    // for (let d = 0; d <= 255; d++) {
    //   for (let i = 0; i <= 255; i++) {
		// 		check(`http://192.168.${x}.${i}:${thisPort}`)
    //     if (address || port !== thisPort) {
    //       break;
    //     }
    //   }
    // }
    setAddress('http://192.168.1.89:2000');
  };

  useEffect(() => {
    init();
  }, [port]);

  return {address, port, searchAddress};
};
