import { useEffect, useState } from 'react';
import {ScrollView, Text} from 'react-native';

export default ({route}) => {
  const {address, userId, userPin} = route.params;
	const [torrents, setTorrents] = useState([]);
	const fetchTorrents = async () => {
		try {
			const response = await fetch(`${address}/torrents/active`);
			const json = await response.json();
			setTorrents(json);
		} catch(err) {
			console.error(err.message);
		}
	}

	useEffect(() => {
		fetchTorrents();
	}, []);

  const Torrent = ({name, progress, time}) => {
    return (
      <View>
        <Text></Text>
      </View>
    );
  };
  return (
    <ScrollView>
      <View style={{height: 30}} />
      <Text>Active Torrents</Text>
      <View style={StyleSheet.torrents}>
				{torrents.map(i => <Torrent/>)}
			</View>
    </ScrollView>
  );
};
