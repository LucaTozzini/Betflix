import {StyleSheet, View, Text} from 'react-native';

export default () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  header: {
    color: 'white',
    fontSize: 30,
  },
});
