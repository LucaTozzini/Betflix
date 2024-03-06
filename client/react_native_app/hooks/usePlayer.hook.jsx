import {useContext, useEffect, useState} from 'react';
import {globalContext} from '../App';
export default ({mediaId, episodeId}) => {
  const {address, userId} = useContext(globalContext);
  const [item, setItem] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [resume, setResume] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [available, setAvailable] = useState(null);

  const fetchItem = async () => {
    try {
      const response = await fetch(`${address}/browse/item?mediaId=${mediaId}`);
      const json = await response.json();
      setItem(json);
    } catch(err) {
      console.error(err)
    }
  };

  const fetchEpisode = async () => {
    try {
      const response = await fetch(
        `${address}/browse/episode?episodeId=${episodeId}`,
      );
      const json = await response.json();
      setEpisode(json);
    } catch (err) {
      console.error(err)
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
      console.error(err)
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

  const checkAvailable = async() => {
    try {
      const response = await fetch(streamUrl);
      console.log(response.status);
      setAvailable(true);
    } catch(err) {
      console.error("CHECK ERROR", err.message)
      setAvailable(false);
    }
  }

  useEffect(() => {
    fetchItem();
  }, []);
  
  useEffect(() => {
    if(item) {
      if(item.TYPE === 2) {
        fetchEpisode();
      } else {
        fetchResume();
        setVideoUrl(`${address}/player/video?mediaId=${mediaId}&type=1`)
        setStreamUrl(`${address}/player/stream?mediaId=${mediaId}&type=1`)
      }
    }
  }, [item]);

  useEffect(() => {
    if(episode) {
      fetchResume();
      setVideoUrl(`${address}/player/video?mediaId=${mediaId}&type=2&episodeId=${episode.EPISODE_ID}`);
      setStreamUrl(`${address}/player/stream?mediaId=${mediaId}&type=2&episodeId=${episode.EPISODE_ID}`);
    }
  }, [episode]);

  useEffect(() => {
    if(streamUrl) {
      console.log(streamUrl);
      checkAvailable();
    }
  }, [streamUrl])

  return {item, episode, updateContinue, resume, videoUrl, available};
};
