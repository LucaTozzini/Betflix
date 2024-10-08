import {useContext, useState} from 'react';
import {addressContext} from '../../App';

export default function useUsers() {
  const SERVER_ADDRESS = useContext(addressContext);
  const [users, setUsers] = useState(null);
  const [images, setImages] = useState(null);
  const [current, setCurrent] = useState(null);

  async function fetchUsers() {
    try {
      const res = await fetch(`http://${SERVER_ADDRESS}/users`);
      const users = await res.json();
      setUsers(users);
    } catch (err) {
      console.error(err);
    }
  }
  async function fetchImages() {
    try {
      const res = await fetch(`http://${SERVER_ADDRESS}/users/images`);
      const images = await res.json();
      setImages(images);
    } catch (err) {
      console.error(err.message);
    }
  }

  return {users, images, current, setCurrent, fetchUsers, fetchImages};
}
