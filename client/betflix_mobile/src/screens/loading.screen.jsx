import { ActivityIndicator, StyleSheet, View, Text } from "react-native";

export default function LoadingScreen({message}){
  return (
    <View style={styles.container}>
      <ActivityIndicator color={"white"} size={"large"}/>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    gap: 30,
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  }
})