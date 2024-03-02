import {StyleSheet, View, Text, Image} from 'react-native';

export default ({header}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{header}</Text>
      <Image 
        source={require("../gifs/loading.gif")}  
        style={{width: 100, height:100 }} 
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    color: 'white',
    fontSize: 30,
  },
});
