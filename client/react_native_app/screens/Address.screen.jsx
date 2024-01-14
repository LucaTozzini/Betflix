import {Image, StyleSheet, Text, View} from 'react-native';

export default () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Searching...</Text>
      <Image
        style={styles.loading}
        source={{
          uri: 'https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif',
        }}
      />
    </View>
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
