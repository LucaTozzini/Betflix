import {useEffect, useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import MediaRowComponent from '../components/MediaRow.component';

export default () => {
  const [latest, setLatest] = useState([]);

  const fetchLatest = async () => {
    try {
      const response = await fetch(
        'http://192.168.1.89:2000/browse/latest/releases?limit=30',
      );
      const json = await response.json();
      setLatest(json);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <MediaRowComponent header={'Latest Releases'} items={latest} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20
  },
});
