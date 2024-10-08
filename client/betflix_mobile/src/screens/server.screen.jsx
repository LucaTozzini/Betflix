import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useContext, useEffect, useRef} from 'react';
import IonIcon from 'react-native-vector-icons/Ionicons';
import useDatabase from '../hooks/useDatabase-hook';
import {globalContext} from '../../App';

export default function ServerScreen() {
  const database = useDatabase();
  database.statusSocket();

  const Actions = () => {
    return (
      <View style={styles.actions.container}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.actions.button}
          onPress={() => database.postTask(0)}>
          <IonIcon name="film-outline" size={40} color="white" />
          <Text style={styles.actions.buttonText}>Scan Movies</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.actions.button}
          onPress={() => database.postTask(1)}>
          <IonIcon name="tv-outline" size={40} color="white" />
          <Text style={styles.actions.buttonText}>Scan Shows</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.actions.button}
          onPress={() => database.torAddFromDb()}>
          <IonIcon name="reload-outline" size={40} color="white" />
          <Text style={styles.actions.buttonText}>Reload Torrents</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.actions.button}
          onPress={() => database.postTask(1)}>
          <IonIcon name="remove-circle-outline" size={40} color="white" />
          <Text style={styles.actions.buttonText}>Remove All Torrents</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const Status = () => {
    return (
      <View style={styles.status.container}>
        <Text style={styles.status.text}>
          {database.status?.ACTIVE_TASK ?? 'Inactive'}
        </Text>
        <View style={styles.status.progress}>
          <View
            style={[
              styles.status.progressFill,
              {
                width: `${
                  database.status?.TASK_PROGRESS
                    ? database.status?.TASK_PROGRESS * 100
                    : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const Torrents = () => {
    const {useTorrents} = useContext(globalContext);
    const t_poll = useRef(true);
    useEffect(() => {
      poll();
      return () => (t_poll.current = false);
    }, []);

    async function poll() {
      while (t_poll.current) {
        await useTorrents.fetchActive();
        await new Promise(res => setTimeout(res, 1000));
      }
    }

    const Item = ({name, progress, time}) => {
      const ms_to_string = ms => {
        const h = Math.floor(ms / 3_600_000);
        ms = ms % 3600000;
        const m = Math.floor(ms / 60_000);
        ms = ms % 60_000;
        const s = Math.floor(ms / 1_000);
        return `${h}h ${('0' + m).slice(-2)}m ${('0' + s).slice(-2)}s`;
      };
      return (
        <TouchableOpacity style={styles.torrents.item}>
          <Text style={styles.torrents.text}>{name}</Text>
          <Text style={styles.torrents.text}>{ms_to_string(time)}</Text>
          <View style={styles.torrents.progress}>
            <View
              style={[
                styles.torrents.progressFill,
                {width: progress * 100 + '%'},
              ]}
            />
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <ScrollView contentContainerStyle={styles.torrents.scroll}>
        {useTorrents.active?.map(i => (
          <Item
            key={i.magnetURI}
            progress={i.progress}
            name={i.name}
            time={i.timeRemaining}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Actions />
      <Status />
      <Torrents />
    </View>
  );
}

const padding = 10;
const pad_inner = 15;
const gap = 10;
const borderRadius = 10;
const borderWidth = 2;
const borderColor = 'white';

const styles = StyleSheet.create({
  container: {padding, gap, flex: 1},
  actions: {
    container: {
      flexDirection: 'row',
      gap: borderWidth,
      flexWrap: 'wrap',
      borderColor,
      borderWidth,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: borderColor,
    },
    button: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      backgroundColor: 'black',
    },
    buttonText: {color: 'white', textAlign: 'center'},
  },
  status: {
    container: {
      padding: pad_inner,
      borderWidth,
      borderColor,
      borderRadius,
      gap: 10,
    },
    text: {color: 'white', fontSize: 30},
    progress: {
      borderColor,
      borderWidth,
      borderRadius,
      height: 13,
      overflow: 'hidden',
    },
    progressFill: {backgroundColor: 'white', width: '30%', height: '100%'},
  },
  torrents: {
    scroll: { gap: pad_inner},
    item: {gap: 10, borderColor, borderWidth, padding: pad_inner, borderRadius},
    text: {color: 'white', fontSize: 18},
    progress: {height: 10, borderColor, borderWidth},
    progressFill: {height: '100%', backgroundColor: 'white'},
  },
});
