import { useEffect, useState } from "react";
export default ({serverAddress}) => {
  const [userId, setUserId] = useState(() => window.localStorage.getItem("userId"));
  const [userPin, setUserPin] = useState(() => window.localStorage.getItem("userPin"));
  const [userName, setUserName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [child, setChild] = useState(null);

  useEffect(() => {
    if(userId) {
      window.localStorage.setItem("userId", userId);
    } else {
      window.localStorage.removeItem("userId");
    }
  }, [userId]);

  useEffect(() => {
    console.log(userPin);
    if(userPin) {
      window.localStorage.setItem("userPin", userPin);
    } else {
      window.localStorage.removeItem("userPin");
    }
  }, [userPin]);

  useEffect(() => {
    login({id: userId, pin: userPin});
  }, []);

  const login = ({ id, pin }) =>
    new Promise(async (res) => {
      try {
        const options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, userPin: pin }),
        };
        const response = await fetch(`${serverAddress}/user/data`, options);
        if (response.status !== 200) {
          throw new Error("login Fetch Error");
        }
        const { USER_NAME, USER_IMAGE, ADMIN, CHILD } = await response.json();
        setUserId(id);
        setUserPin(pin);
        setUserName(USER_NAME);
        setUserImage(USER_IMAGE);
        setAdmin(ADMIN === 1);
        setChild(CHILD === 1);
        res(true);
      } catch (err) {
        res(false);
        logout();
      }
    });

  const logout = () => {
    setUserId(null);
    setUserPin(null);
    setUserName(null);
    setUserImage(null);
    setAdmin(null);
    setChild(null);
  };

  return {
    // Functions
    login,
    logout,

    // States
    userId,
    userPin,
    userName,
    userImage,
    admin,
    child,
  };
};
