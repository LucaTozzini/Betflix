import {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
} from 'react-native';

// Hooks
import useTorrents from '../hooks/useTorrents.hook';
export default () => {
  const [modal, setModal] = useState(false);
  const {torrents, fetchTorrents} = useTorrents();

  const msToString = ms => {
    let seconds = ms / 1000;
    const hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.floor(seconds);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    fetchTorrents({loop: true, time: 2000});
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scroll} stickyHeaderIndices={[1]}>
      <View style={{height: 60}} />
      <View>
        <Text
          style={[styles.header, {paddingTop: StatusBar.currentHeight + 10}]}>
          Active Torrents
        </Text>
      </View>
      <View style={styles.torrents}>
        {torrents.length === 0 ? (
          <Text style={styles.noDownloads}>No Downloads</Text>
        ) : (
          torrents.map(i => (
            <TouchableOpacity
              style={styles.torrent}
              onPress={() => setModal(true)}>
              <Text style={styles.torrentText}>{i.name}</Text>
              <Text style={styles.torrentText}>
                {msToString(i.timeRemaining)}
              </Text>
              <View style={styles.torrentProgress}>
                <View
                  style={[
                    styles.torrentProgressFill,
                    {
                      width: i.progress * 100 + '%',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      <Modal visible={modal} onRequestClose={() => setModal(false)}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.modalOption}>
            <Text style={styles.modalText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    color: 'white',
    fontSize: 30,
    paddingVertical: 10,
    textAlign: 'center',
    backgroundColor: 'black',
  },
  torrents: {gap: 10},
  noDownloads: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    paddingVertical: 60,
  },
  torrent: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    gap: 5,
  },
  torrentProgress: {
    borderWidth: 1,
    height: 15,
    borderColor: 'white',
  },
  torrentProgressFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  torrentText: {
    color: 'white',
    fontSize: 15,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  modalOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 15,
  },
  modalText: {
    color: 'white',
    fontSize: 20,
  },
});
