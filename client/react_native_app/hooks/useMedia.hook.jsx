import {useContext, useEffect, useState} from 'react';
import {globalContext} from '../App';

export default ({mediaId}) => {
  const {address, userId, userPin} = useContext(globalContext);
  const [item, setItem] = useState(null);
  const [seasonNum, setSeasonNum] = useState(null);
  const [season, setSeason] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(null);

  const fetchItem = async () => {
    try {
      const response = await fetch(`${address}/browse/item?mediaId=${mediaId}&userId=${userId}`);
      const json = await response.json();
      setItem(json);
    } catch (err) {
      setItem(null);
    }
  };

  const fetchSeason = async () => {
    try {
      const response = await fetch(
        `${address}/browse/season?userId=${userId}&seasonNum=${seasonNum}&mediaId=${mediaId}`,
      );
      const json = await response.json();
      setSeason(json.EPISODES);
    } catch (err) {
      console.log(21345765, err.message);
    }
  };

  const addWatchlist = async () => {
    try {
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, userPin, mediaId}),
      };
      const response = await fetch(`${address}/user/watchlist/add`, options);
      if (response.status === 201) {
        setInWatchlist(true);
      }
    } catch (err) {}
  };

  const remWatchlist = async () => {
    try {
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, userPin, mediaId}),
      };
      const response = await fetch(`${address}/user/watchlist/remove`, options);
      if (response.status === 202) {
        setInWatchlist(false);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchItem();
  }, [userId, userPin, mediaId]);

  useEffect(() => {
    if (item) {
      setInWatchlist(item.IN_WATCHLIST === 1);
      if (item.TYPE === 2) {
        const seasonNum = item.AVAILABLE_SEASONS[0]?.SEASON_NUM;
        setSeasonNum(seasonNum ?? null);
      }
    }
  }, [item]);

  useEffect(() => {
    if (seasonNum !== null) {
      fetchSeason();
    }
  }, [seasonNum]);

  return {
    // states
    item,
    seasonNum,
    season,
    inWatchlist,

    // set states
    setSeasonNum,

    // functions
    addWatchlist,
    remWatchlist,
  };
};
