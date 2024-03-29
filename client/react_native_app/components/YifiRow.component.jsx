import {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native';

// Hooks
import useTorrents from '../hooks/useTorrents.hook';

export default ({items, header, width, gap, margin}) => {
  const {addTorrent} = useTorrents();
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState(null);
  const [year, setYear] = useState(null);
  const [torrents, setTorrents] = useState([]);

  const Torrent = ({peers, seeds, quality, size, hash}) => {
    const magnetURI = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
      title,
    )}&tr=http://track.one:1234/announce&tr=udp://track.two:80`;
    return (
      <TouchableOpacity
        style={styles.torrent}
        onPress={() => addTorrent(magnetURI)}>
        <Text style={styles.torrentText}>{seeds} seeds</Text>
        <Text style={styles.torrentText}>{peers} peers</Text>
        <Text style={styles.torrentText}>{quality}</Text>
        <Text style={styles.torrentText}>{size}</Text>
      </TouchableOpacity>
    );
  };

  const Item = ({title, year, image, torrents}) => {
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.9}
        onPress={() => {
          setYear(year);
          setTitle(title);
          setTorrents(torrents);
          setModal(true);
        }}>
        <Image
          source={{uri: image}}
          style={[
            styles.image,
            {width, height: width * 1.6, borderRadius: width * 0.05},
          ]}
        />
      </TouchableOpacity>
    );
  };

  if (!items || !items.length) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={[styles.header, {paddingHorizontal: margin}]}>
          {header}
        </Text>
        <FlatList
          contentContainerStyle={{gap, paddingHorizontal: margin}}
          data={items}
          renderItem={({item}) => (
            <Item
              image={item.image}
              title={item.title}
              year={item.year}
              torrents={item.torrents}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <Modal
        animationType="slide"
        visible={modal}
        onRequestClose={() => setModal(false)}>
        <ScrollView style={styles.modal} stickyHeaderIndices={[1]}>
          <View style={{height: 100}} />
          <View>
            <Text
              style={styles.modalHeader}
              adjustsFontSizeToFit={true}
              numberOfLines={2}>
              {title} ({year})
            </Text>
          </View>
          <View style={styles.torrents}>
            {torrents.map((item, index) => (
              <Torrent
                key={"Torrent_"+index}
                peers={item.peers}
                seeds={item.seeds}
                quality={item.quality}
                size={item.size}
                hash={item.hash}
                title={title}
              />
            ))}
          </View>
        </ScrollView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  item: {
    gap: 3,
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  title: {
    color: 'rgb(200, 200, 200)',
    fontSize: 15,
  },
  modal: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
  },
  modalHeader: {
    color: 'white',
    fontSize: 30,
    backgroundColor: 'black',
    paddingVertical: 20,
  },
  torrents: {
    gap: 10,
  },
  torrent: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgb(30, 30, 30)',
    borderWidth: 1,
    borderColor: 'rgb(50, 50, 50)',
    padding: 15,
    flexWrap: 'wrap',
  },
  torrentText: {
    color: 'white',
    fontSize: 20,
  },
});
