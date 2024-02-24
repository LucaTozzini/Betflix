import {useContext, useEffect, useState} from 'react';
import {globalContext} from '../App';
export default ({mediaId, episodeId}) => {
  const {address, userId} = useContext(globalContext);
  const [item, setItem] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [resume, setResume] = useState(null);

  const fetchItem = async () => {
    const response = await fetch(`${address}/browse/item?mediaId=${mediaId}`);
    const json = await response.json();
    setItem(json);
  };

  const fetchEpisode = async () => {
    try {
      const response = await fetch(
        `${address}/browse/episode?episodeId=${episodeId}`,
      );
      console.log(response.status);
      const json = await response.json();
      console.log(json);
      setEpisode(json);
    } catch (err) {
      console.error(err.message)
    }
  };

  const fetchResume = async () => {
    try {
      const response = await fetch(
        `${address}/player/resume?userId=${userId}&mediaId=${mediaId}&episodeId=${episodeId || -1}`,
      );
      const json = await response.json();
      console.log("RESUME", json);
      setResume(json);
    } catch (err) {
      console.log(err.message);
      setResume(0);
    }
  };

  const updateContinue = ({progressTime, endTime}) => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId, mediaId, mediaId, episodeId: episodeId || -1, progressTime, endTime}),
      };
      fetch(`${address}/user/update-continue`, options);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchItem();
    fetchEpisode();
    fetchResume();
  }, []);

  return {item, episode, updateContinue, resume};
};
