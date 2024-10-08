import {useEffect, useRef, useState} from 'react';
import {SERVER_ADDRESS} from '../../App';

export default function useTorrentsHook() {
  const [active, setActive] = useState(null);

  async function addFromDB() {
    const response = await fetch(`http://${SERVER_ADDRESS}/torrents/db`, {
      method: 'POST',
    });
    if (!response.ok) {
      //
    }
  }

  async function fetchActive() {
    const response = await fetch(`http://${SERVER_ADDRESS}/torrents`);
    if (response.ok) {
      const json = await response.json();
      setActive(json);
    } else {
      //
    }
  }

  async function add(uri) {
    const response = await fetch(`http://${SERVER_ADDRESS}/torrents`, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({uri}),
    });
    if (!response.ok) {
      //
      console.log(response.status)
    }
  }

  async function rem(uri) {
    const response = await fetch(`http://${SERVER_ADDRESS}/torrents`, {
      method: 'DELETE',
      body: JSON.stringify(uri),
    });
    if (!response.ok) {
      //
    }
  }

  return {active, fetchActive, add, rem, addFromDB};
}
