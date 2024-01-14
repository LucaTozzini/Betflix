import {useEffect, useState} from 'react';

export default ({address}) => {
  const [userId, setUserId] = useState(null);
  const [userPin, setUserPin] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [child, setChild] = useState(null);

  const login = ({userId, userPin}) =>
    new Promise(async res => {
      let success = false;
      try {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId, userPin}),
        };
        const response = await fetch(`${address}/users/data`, options);
        if (response.status === 200) {
          const {USER_IMAGE, USER_NAME, ADMIN, CHILD} = await response.json();
          setUserId(userId);
          setUserPin(userPin);
          setUserName(USER_NAME);
          setUserImage(`${address}/${USER_IMAGE}`);
          setAdmin(ADMIN);
          setChild(CHILD);
          success = true;
        }
      } catch (err) {
        console.error(err.message);
      }
      res({success});
    });

  logout = () => {
    setUserId(null);
    setUserPin(null);
    setUserName(null);
    setUserImage(null);
    setAdmin(null);
    setChild(null);
  };

  return {userId, userPin, userName, userImage, admin, child, login, logout};
};