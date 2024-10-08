import {useContext, useEffect, useState} from 'react';
import {addressContext} from '../../App';

export default function useWatchlist({current}) {
  const SERVER_ADDRESS = useContext(addressContext);
  const [watchlist, setWatchlist] = useState(null);

  useEffect(() => {
    if (current) {
      get();
    }
  }, [current]);

  async function get() {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/watchlist/${current?.user_id}`,
    );
    const json = await response.json();
    setWatchlist(json);
  }

  async function add(title_id) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/watchlist?user_id=${current?.user_id}&title_id=${title_id}`,
      {method: 'PUT'},
    );
    get();
    return response.ok;
  }

  async function rem(title_id) {
    const response = await fetch(
      `http://${SERVER_ADDRESS}/watchlist?user_id=${current?.user_id}&title_id=${title_id}`,
      {method: 'DELETE'},
    );
    get();
    return response.ok;
  }

  async function has(title_id) {
    return watchlist.map(i => i.title_id).includes(title_id);
  }

  return {watchlist, get, add, rem, has};
}
