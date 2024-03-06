import {useEffect, useState} from 'react';

export default ({address}) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [continueList, setContinueList] = useState([]);
  const [userImages, setUserImages] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${address}/user/list`);
      const json = await response.json();
      setUsers(json);
    } catch (err) {
      
    }
  };

  const login = ({userId}) =>
    new Promise(async res => {
      let success = false;
      try {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({userId}),
        };
        const response = await fetch(`${address}/user/data`, options);
        if (response.status === 200) {
          const {USER_IMAGE, USER_NAME} = await response.json();
          setUserId(userId);
          setUserName(USER_NAME);
          setUserImage(`${address}/${USER_IMAGE}`);
          success = true;
        }
      } catch (err) {
        console.error(err.message);
      }
      res({success});
    });

  const logout = () => {
    setUserId(null);
    setUserName(null);
    setUserImage(null);
    setWatchlist([]);
    setContinueList([]);
  };

  const fetchWatchlist = async () => {
    try {
      const response = await fetch(
        `${address}/user/watchlist?userId=${userId}`,
      );
      const json = await response.json();
      setWatchlist(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchContinue = async () => {
    try {
      const response = await fetch(
        `${address}/user/continue?userId=${userId}&limit=50`,
      );
      const json = await response.json();
      setContinueList(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(`${address}/user/images`);
      const json = await response.json();
      setUserImages(json);
    } catch (err) {}
  };

  const createUser = ({userName, userImage}) => new Promise(async (res, rej) => {
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({userName, userImage})
      }
      const response = await fetch(`${address}/user/add`, options);
      if(response.status === 201) {
        res(1);
        fetchUsers();
      } else {
        res(0);
      }
    } catch (err) {
      rej(err);
    }
  })

  const deleteUser = async () => {
    try {
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId}),
      };
      const response = await fetch(`${address}/user/delete`, options);
      if(response.status === 200) {
        logout();
        fetchUsers();
      }
    } catch(err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchUsers();
  }, [address]);

  return {
    // User States
    userId,
    userName,
    userImage,
    users,

    //
    userImages,

    // MediaStates
    watchlist,
    continueList,

    //
    login,
    logout,
    deleteUser,
    fetchWatchlist,
    fetchContinue,
    createUser,
  };
};
