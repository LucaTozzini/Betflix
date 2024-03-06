import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Hooks
import useServer from '../hooks/useServer.hook';

export default () => {
  const {active, action, progress, logs, update} = useServer();
  return (
    <ScrollView contentContainerStyle={[styles.container,{paddingTop: StatusBar.currentHeight + 80}]}>
      <Text numberOfLines={1} style={styles.action}>{action || "No Active Actions"}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {width: (progress || 0) + '%'}]} />
      </View>
      <View style={styles.terminal}>
        <ScrollView contentContainerStyle={styles.terminalScroll}>
          {logs?.map((value, index) => (
            <Text key={"Terminal_Text_"+index} style={styles.log}>{value}</Text>
          ))}
        </ScrollView>
      </View>
      {!active && (
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => update('movies')}>
            <Text style={styles.button}>Update Movies</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => update('shows')}>
            <Text style={styles.button}>Update Shows</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingHorizontal: 20,
  },
  action: {
    color: 'white',
    fontSize: 25,
  },
  progressBar: {
    height: 15,
    borderWidth: 1,
    borderColor: 'white',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  terminal: {
    height: 300,
    borderWidth: 1,
    borderColor: "white",
  },
  terminalScroll: {
    padding: 10
  },
  log: {
    color: 'white',
  },
  buttons: {
    gap: 10,
  },
  button: {
    color: 'white',
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
});
