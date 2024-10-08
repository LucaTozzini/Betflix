import {useEffect, useState} from 'react';
import {useRemoteMediaClient} from 'react-native-google-cast';
import useTitlesHook from './useTitles-hook';

export default function useCast({navState}) {
  const client = useRemoteMediaClient();
  const [duration, setDuration] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [progress, setProgress] = useState(null);
  const useTitles = useTitlesHook();

  const handleChange = async route => {
    if (client) {
      if (route.name === 'Title') {
        const {title_id} = route.params;
        const {landscape, backdrop} = await useTitles.fetchItem(title_id);
        client.loadMedia({mediaInfo: {contentUrl: landscape ?? backdrop}});
      } else if (route.name !== 'Player') {
        client.loadMedia({
          mediaInfo: {
            contentUrl:
              'https://i0.wp.com/www.ourmovielife.com/wp-content/uploads/2020/08/ss.jpg?resize=800%2C500&ssl=1',
          },
        });
      }
    }
  };

  useEffect(() => {
    if (navState) {
      const route = navState.routes[navState.index];
      handleChange(route);
    }
  }, [navState, client]);

  useEffect(() => {
    if (client) {
      client.onMediaStatusUpdated(e => {
        setPlayerState(e?.playerState);
        setDuration(e?.mediaInfo?.streamDuration);
      });
      client.onMediaProgressUpdated(setProgress);
    }
  }, [client]);

  async function castVideo(url, start) {
    await client.loadMedia({
      autoplay: true,
      startTime: start,
      mediaInfo: {contentUrl: url, contentType: 'video/mp4'},
    });
  }

  function seek(position) {
    client.seek({position})
  }

  function togglePlay() {}

  return {client, castVideo, seek, togglePlay, playerState, progress, duration};
}
