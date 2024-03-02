import {Image, StyleSheet, Text, View} from 'react-native';
import LoadingScreen from './Loading.screen';

export default () => {
  return (
    <LoadingScreen header={"Searching For Server"}/>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  header: {
    color: 'white',
    fontSize: 30,
  },
  loading: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
  },
});
