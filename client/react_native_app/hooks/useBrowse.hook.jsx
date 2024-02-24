import {useContext, useState} from 'react';
import {globalContext} from '../App';
export default () => {
  const {address, userId} = useContext(globalContext);
  const [topVoted, setTopVoted] = useState([]);
  const [latest, setLatest] = useState([]);

  const fetchLatest = async () => {
    try {
      const response = await fetch(
        `${address}/browse/latest/releases?limit=30`,
      );
      const json = await response.json();
      setLatest(json);
    } catch (err) {}
  };

  const fetchTopVoted = async () => {
    try {
      const response = await fetch(
        `${address}/browse/range/vote?minVote=0&maxVote=10&orderBy=vote&limit=30`,
      );
      const json = await response.json();
      setTopVoted(json);
    } catch (err) {}
  };

  return {
    // States
    topVoted,
    latest,

    // Functions
    fetchLatest,
    fetchTopVoted,
  }
};
