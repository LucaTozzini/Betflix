import {StyleSheet, View, Text, TextInput} from 'react-native';

export default () => {
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder='Search media, people, collection...'/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },
  input: {
    fontSize: 15,
    backgroundColor: "white",
    paddingHorizontal: 10
  }
});
