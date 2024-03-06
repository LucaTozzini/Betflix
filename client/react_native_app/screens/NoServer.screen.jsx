import {StyleSheet, View, Text} from 'react-native';

export default () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>No Server Found</Text>
      <Text style={styles.text}>
        Make sure both the server and this device are on the same network.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "black",
  },
  header: {
    color: 'white',
    fontSize: 30,
    fontWeight: "bold",
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: "center",
  },
});
