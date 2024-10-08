import {useTheme} from '@react-navigation/native';
import {StyleSheet, Text, TextInput, ScrollView} from 'react-native';
import MediaRow, {YifiRow} from '../components/media row-comp';
import {useState, useEffect, useRef, useContext} from 'react';
import useYifiHook from '../hooks/useYifi-hook';
import { addressContext } from '../../App';

export default function SearchScreen() {
  const SERVER_ADDRESS = useContext(addressContext);
  const {colors} = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [available, setAvailable] = useState(null);
  const useYifi = useYifiHook({limit: 50});

  const fetchData = async () => {
    if(!searchTerm?.length) return
    try {
      const response = await fetch(
        `http://${SERVER_ADDRESS}/titles/search?title=${searchTerm}`,
      );
      const titles = await response.json();
      setAvailable(titles);
      useYifi.search(searchTerm);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(fetchData, 500);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [searchTerm]);

  return (
    <ScrollView contentContainerStyle={screenStyles.container}>
      <TextInput
        onChangeText={setSearchTerm} // Attach the onChangeText handler
        placeholder="Search movies, tv, actors..."
        style={[
          screenStyles.searchBar,
          {color: colors.text, backgroundColor: colors.card},
        ]}
        placeholderTextColor={'white'}
      />
      <Text color={colors.text}>Search</Text>
      {available && <MediaRow header={'Available'} data={available} />}
      {useYifi.results && <YifiRow data={useYifi.results}/>}
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  searchBar: {
    fontSize: 22,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 80,
  },
});
