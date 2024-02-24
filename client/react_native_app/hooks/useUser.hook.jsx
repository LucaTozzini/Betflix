import {useState} from 'react';

export default ({address}) => {
  const [userId, setUserId] = useState(null);
  const [userPin, setUserPin] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [child, setChild] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [continueList, setContinueList] = useState([]);

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
        const response = await fetch(`${address}/user/data`, options);
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

  const logout = () => {
    setUserId(null);
    setUserPin(null);
    setUserName(null);
    setUserImage(null);
    setAdmin(null);
    setChild(null);
    setWatchlist([]);
    setContinueList([]);
  };

  const deleteUser = () => {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({userId, userPin}),
    };
    fetch(`${address}/user/delete`, options)
      .then(logout)
      .catch(err => console.error(err.message));
  };

  const fetchWatchlist = async () => {
    try {
      const response = await fetch(`${address}/user/watchlist?userId=${userId}`);
      const json = await response.json();
      setWatchlist(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchContinue = async () => {
    try {
      const response = await fetch(`${address}/user/continue?userId=${userId}&limit=50`);
      const json = await response.json();
      setContinueList(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  return {
    // User States
    userId,
    userPin,
    userName,
    userImage,
    admin,
    child,

    // MediaStates
    watchlist,
    continueList,

    //
    login,
    logout,
    deleteUser,
    fetchWatchlist,
    fetchContinue,
  };
};
